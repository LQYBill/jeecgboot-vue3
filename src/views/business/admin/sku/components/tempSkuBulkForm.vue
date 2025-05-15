<template>
  <temp-sku-common-form v-if="source.length > 0" @update="handleCommonFieldUpdate"/>
  <a-form ref="formRef"
          :model="formState"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :rules="validatorRules"
          v-if="source.length > 0"
          label-align="left"
  >
    <a-row v-for="(row, index) in source" :key="index" class="bg-white p-4 rounded-2 shadow mb-4">
      <a-col :span="24">
        <div class="flex justify-between items-center mb-4">
          <p class="text-xl mb-0"><span class="font-semibold">{{ row.id }}</span><span v-if="!!row.specifics" class="text-gray-500"> - {{ row.specifics }}</span></p>
          <a v-if="!!row.saleUrl" :href="row.saleUrl" target="_blank">{{ t('data.sku.saleUrl') }} <Icon icon="ic:baseline-link"/></a>
        </div>
        <ImagePreview :imageList="[{src:row.imageSource}]" :size="30"/>
      </a-col>
      <template v-for="(value, fieldName) in row">
        <a-col :span="8" class="pr-4" v-if="fieldName !== 'id' && fieldName !== 'status'">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            v-bind="validateInfos.name"
            :name="fieldName + '_' + index"
          >
            <template #label>
              {{ t('data.sku.' + fieldName) }}
            </template>
            <JSearchSelect
              v-if="fieldName === 'sensitiveAttribute'"
              dict="sensitive_attribute, zh_name, zh_name"
              allowclear
              v-model:value="formState[index][fieldName]"
            />
            <JSelectMultiple
              v-else-if="fieldName === 'labelData'"
              dictCode="label_data,name,name"
              allowclear
              v-model:value="formState[index][fieldName]"
            />
            <a-radio-group v-else-if="fieldName === 'isGift'" v-model:value="formState[index][fieldName]">
              <a-radio :value="1">{{ t('common.yes') }}</a-radio>
              <a-radio :value="2">{{ t('common.no') }}</a-radio>
            </a-radio-group>
            <a-input v-else-if="fieldName === 'imageSource'"
                     :default-value="value"
                     v-model:value="formState[index][fieldName]"
                     allow-clear
            />
            <a-input v-else
                     :default-value="value"
                     v-model:value="formState[index][fieldName]"
                     allow-clear
                     :addon-after="fieldName === 'serviceFee' ||
                                  fieldName === 'skuPrice' ||
                                  fieldName === 'declaredValue' ? '€' :
                                  fieldName === 'shippingDiscount' ? '%' :
                                  fieldName === 'weight' ? t('data.shipping.gram') : ''"
            >
            </a-input>
          </a-form-item>
        </a-col>
      </template>
    </a-row>
    <a-row>
      <a-col :span="24">
        <div class="flex justify-center items-center gap-4">
          <a-button type="primary" @click="handleSubmit">
            {{ t('common.operation.save') }}
          </a-button>
          <a-button type="primary" @click="handleAddMore" :disabled="addMoreDisabled">
            {{ t('common.operation.addMore') }}
          </a-button>
        </div>
      </a-col>
    </a-row>
  </a-form>
</template>
<script setup lang="ts">
import {Ref, inject, ref, watch} from 'vue';
import {Form} from "ant-design-vue";
import { useI18n } from 'vue-i18n';
import {Sku} from "@/views/business/dto/sku.dto";
import {JSearchSelect, JSelectMultiple} from "@/components/Form";
import {ImagePreview} from "@/components/Preview";
import {numberColumns} from "@/views/business/admin/sku/data";
import TempSkuCommonForm from "@/views/business/admin/sku/components/tempSkuCommonForm.vue";
import {Icon} from "@/components/Icon";

const { t } = useI18n();

const emit = defineEmits(['submit', 'error', 'addMore']);

const addMoreDisabled = ref(true);

const useForm = Form.useForm;
const formRef = ref();
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 6 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 18 } });
const validatorRules = ref({});
let formState = ref<Sku[]>([]);
const { validateInfos } = useForm(formState, validatorRules, { immediate: true });

const unpairedSkuList = inject('currentFormSkuList', ref<Sku[]>([])) as Ref<Sku[]>;
const source = ref<Sku[]>([]);

watch(
  unpairedSkuList,
  () => {
      initializeForm();
  },
  { deep: true, immediate: true } // Ensures it runs immediately if values are already present
);
function initializeForm() {
  source.value = unpairedSkuList.value;
  formState.value = [];
  for(let i = 0; i < source.value.length; i++) {
    for(const key in source.value[i]) {
      if (!formState.value[i]) {
        formState.value[i] = {} as Sku;
      }
      if(key === 'shippingDiscount' || key === 'serviceFee' ) {
        formState.value[i][key] = 0.0;
      } else if(key === 'supplier') {
        formState.value[i][key] = '临时供货商';
      }
      else
        formState.value[i][key] = source.value[i][key];

      if(key === 'id' || key === 'status' || key === 'imageSource' || key === 'supplierLink') {
        validatorRules.value[key + '_' + i] = [{ type: 'string', required: false, trigger: 'blur'}];
        continue;
      }
      if(numberColumns.includes(key)) {
        validatorRules.value[key + '_' + i] = [{ type: 'number', required: true, message: 'empty or wrong format', trigger: 'none'}];
        continue;
      }
      validatorRules.value[key + '_' + i] = [{ type: 'string', required: true, message: 'empty or wrong format', trigger: 'none'}];
    }
  }
}
async function handleSubmit() {
  const fieldNames = Object.keys(formState.value[0]);
  let isValid = true;
  for(let index in formState.value) {
    for(let fieldName of fieldNames) {
      const fieldValue = formState.value[index][fieldName];
      if(fieldName === 'id' || fieldName === 'status' || fieldName === 'imageSource' || fieldName === 'supplierLink') {
        continue;
      }
      if(fieldValue !== null && fieldValue !== '') {
        if (validatorRules.value[fieldName + '_' + index][0].type !== 'number')
          continue;
        const numberValue = Number(fieldValue);
        if (!isNaN(numberValue)) {
          continue;
        }
      }
      formRef.value.validateFields([fieldName + '_' + index]);
      isValid = false;
    }
  }
  if(!isValid) {
    emit('error');
    return;
  }
  addMoreDisabled.value = false;
  emit('submit', formState.value);
}
function handleAddMore() {
  emit('addMore');
}
function handleCommonFieldUpdate({field, value}) {
  for(let i = 0; i < formState.value.length; i++) {
    formState.value[i][field] = value;
  }
}
</script>
