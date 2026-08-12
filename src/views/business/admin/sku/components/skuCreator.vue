<template>
  <section class="bg-white p-4">
    <header>
      <h2>4. SKU {{ t('data.sku.commonInformation') }}</h2>
      <nav class="mb-4 flex gap-2">
        <a-button preIcon='ic:baseline-content-paste-go' type="primary" @click="handleImport">
          {{ t('common.operation.import') }}
        </a-button>
        <a-button preIcon="ic:round-restart-alt" @click="handleReset">
          {{ t('common.operation.reset') }}
        </a-button>
      </nav>
    </header>
    <a-form
      ref="formRef"
      :rules="validatorRules"
      :label-col="labelCol"
      :model="formState"
      layout="vertical"
    >
      <a-row>
        <a-col :span="8">
          <a-card class="border-white">
            <a-form-item
              v-bind="validateInfos.name"
              name="weight"
            >
              <template #label>
                {{ t('data.sku.weight') }}
              </template>
              <a-input-number
                v-model:value="formState.weight"
                :addon-after="t('data.shipping.gram')"
                class="w-full"
                :min="0"
                allow-clear
              />
            </a-form-item>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="border-white">
            <a-form-item
              v-bind="validateInfos.name"
              name="skuPrice"
            >
              <template #label>
                {{ t('data.sku.skuPrice') }}
              </template>
              <a-input-number
                v-model:value="formState.skuPrice"
                addon-after="€"
                class="w-full"
                :min="0"
                allow-clear
              />
            </a-form-item>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="border-white">
            <a-form-item
              v-bind="validateInfos.name"
              name="declaredValue"
            >
              <template #label>
                {{ t('data.sku.declaredValue') }}
              </template>
              <a-input-number
                v-model:value="formState.declaredValue"
                addon-after="€"
                class="w-full"
                :min="0"
                allow-clear
              />
            </a-form-item>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="border-white">
            <a-form-item
              v-bind="validateInfos.name"
              name="shippingDiscount"
            >
              <template #label>
                {{ t('data.sku.shippingDiscount') }}
              </template>
              <a-input-number
                v-model:value="formState.shippingDiscount"
                addon-after="%"
                class="w-full"
                :min="0"
                allow-clear
              />
            </a-form-item>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="border-white">
            <a-form-item
              v-bind="validateInfos.name"
              name="serviceFee"
            >
              <template #label>
                {{ t('data.sku.serviceFee') }}
              </template>
              <a-input-number
                v-model:value="formState.serviceFee"
                addon-after="€"
                :min="0"
                class="w-full"
                allow-clear
              />
            </a-form-item>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="border-white">
            <a-form-item
              v-bind="validateInfos.name"
              name="sensitiveAttribute"
            >
              <template #label>
                {{ t('data.sku.sensitiveAttribute') }}
              </template>
              <JSelectInput
                :placeholder="t('data.sku.sensitiveAttribute')"
                v-model:value="formState.sensitiveAttribute"
                :options=sensitiveAttributeOptions
                class="w-full"
                allow-clear
              />
            </a-form-item>
          </a-card>
        </a-col>
        <a-col :span="6">
          <a-card class="border-white">
            <a-form-item
              v-bind="validateInfos.name"
              name="isGift"
            >
              <template #label>
                {{ t('data.sku.isGift') }}
              </template>
              <JSelectInput
                :placeholder="t('data.sku.isGift')"
                :options="[
                { label: t('common.yes'), value: 1 },
                { label: t('common.no'), value: 2 },
              ]"
                v-model:value="formState.isGift"
                allowClear
              />
            </a-form-item>
          </a-card>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="24">
          <a-button type="primary" @click="handleSubmit">
            {{ t('common.operation.save') }}
          </a-button>
        </a-col>
      </a-row>
    </a-form>
  </section>
</template>
<script setup lang="ts">
import { Rule } from "@/components/Form";
import { Form } from "ant-design-vue";
import {inject, onBeforeMount, reactive, Ref, ref} from "vue";
import { useI18n } from "@/hooks/web/useI18n";
import JSelectInput from "@/components/Form/src/jeecg/components/JSelectInput.vue";
import {useMessage} from "@/hooks/web/useMessage";
import {filterObj} from "@/utils/common/compUtils";

import {
  discountDecimalToPercentage,
  sensitiveAttributeListApi
} from "@/views/business/admin/sku/data";

const { t } = useI18n();
const { createMessage, createConfirm } = useMessage();

const emits = defineEmits(["submit"]);

onBeforeMount(async () => {
  await sensitiveAttributeListApi().then((res) => {
    sensitiveAttributeOptions.value = res.records.map((item) => {
      return {
        label: item.zhName,
        value: item.id,
      };
    });
  });
});

const useForm = Form.useForm;
const formRef = ref();
const formState = reactive<Record<string, any>>({
  weight: '',
  shippingDiscount: 0,
  serviceFee: 0,
  isGift: 2,
  skuPrice: '',
  declaredValue: '',
});
const validatorRules =  reactive<Record<string, Rule[]>> ({
  erpCode: [{required: true, message: 'Please select erpCode', trigger: 'blur',},],
  enName: [{required: true, message: t('component.searchForm.enNameInput'), trigger: 'blur',},],
  zhName: [{required: true, message: t('component.searchForm.zhNameInput'), trigger: 'blur',},],
  declareCode: [{required: true, message: t('component.searchForm.declareCodeInput'), trigger: 'blur',},],
  weight: [{required: false,}],
  shippingDiscount: [{required: true, message: t('component.searchForm.shippingDiscountInput'), trigger: 'blur',}],
  serviceFee: [{required: true, message: t('component.searchForm.serviceFeeInput'), trigger: 'blur',},],
  sensitiveAttribute: [{required: true, message: t('component.searchForm.sensitiveAttributeInput'), trigger: 'blur',},],
  isGift: [{required: true, message: t('component.searchForm.isGiftInput'), trigger: 'blur',},],
  skuPrice: [{required: false, }],
  declaredValue: [{required: false,}],
});
const { validateInfos } = useForm(formState, validatorRules, { immediate: true });

const copiedRecord:Ref<any> | undefined = inject('copiedRecord');

const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 24 } });

const sensitiveAttributeOptions: Record<string, any> = ref([]);

function handleImport() {
  createConfirm({
    iconType: 'warning',
    title: t('common.operation.import'),
    content: 'Are you sure to import from clipboard? This will overwrite the current form data.',
    okText: t('common.okText'),
    cancelText: t('common.operation.cancel'),
    onOk: () => {
      importFromClipboard();
    },
    onCancel: () => {
      return;
    }
  });
}
function importFromClipboard() {
  if(copiedRecord === undefined || !copiedRecord.value) {
    createMessage.warning('Nothing to import from clipboard');
    return;
  }
  createMessage.success('Imported from clipboard');
  const {
    weight,
    skuPrice,
    declaredValue,
    sensitiveAttribute, shippingDiscount, isGift, serviceFee,
  } = copiedRecord.value.value;
  const sensitiveAttributeId = sensitiveAttributeOptions.value.find((item:{label:string, value:any}) => item.label === sensitiveAttribute).value;
  formState.weight = weight;
  formState.skuPrice = skuPrice;
  formState.declaredValue = declaredValue;
  formState.sensitiveAttribute = sensitiveAttributeId;
  formState.shippingDiscount = discountDecimalToPercentage(shippingDiscount);
  formState.isGift = isGift;
  formState.serviceFee = serviceFee;
}
function handleReset() {
  formRef.value.resetFields();
}
function getParam(): Record<string, string | number> {
  const param:Record<string, string | number> = {
    weight: formState.weight,
    skuPrice: formState.skuPrice,
    declaredValue: formState.declaredValue,
    sensitiveAttribute: formState.sensitiveAttribute,
    shippingDiscount: formState.shippingDiscount,
    isGift: formState.isGift,
    serviceFee: formState.serviceFee,
    availableAmount: 0,
    purchasingAmount: 0,
    status: 3,
  }
  return filterObj(param);
}
async function handleSubmit() {
  formRef.value.validate().then(() => {
    createMessage.success('Info saved successfully');
    emits('submit', getParam());
  }).catch(() => {
    createMessage.error('Please fill in the required fields');
  });
}

</script>
