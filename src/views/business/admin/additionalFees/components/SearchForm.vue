<template>
  <div class="bg-white rounded-5 pt-8 p-4 mb-6">
    <a-form ref="formRef"
            :model="searchState"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="validatorRules"
    >
      <a-row :gutter =8>
        <a-col :span="10">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            v-bind="validateInfos.name"
            name="shop"
          >
            <template #label>
              {{ t('data.invoice.shop') }}
            </template>
            <JSelectInput
              :placeholder="t('component.searchForm.shopInputSearch')"
              :options="shopOptionList"
              @change="handleShopChange"
              v-model:value="searchState.shop"
              allowClear
            />
          </a-form-item>
        </a-col>
        <a-col :span="10">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            v-bind="validateInfos.name"
            name="status"
          >
            <template #label>
              Status
            </template>
            <JSelectMultiple
              placeholder="Select status"
              @change="handleStatusChange"
              v-model:value="searchState.status"
              :options="statusOptions"
              allowClear
            />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item>
            <a-button type="primary" preIcon="ant-design:search-outlined" @click="handleSearch"></a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import {type FormActionType, JSelectMultiple} from "@/components/Form";
import {inject, reactive, Ref, ref} from "vue";
import {Form, SelectProps} from "ant-design-vue";
import {ShopByClient} from "@/views/business/dto/shop.dto";
import JSelectInput from "@/components/Form/src/jeecg/components/JSelectInput.vue";
import {useI18n} from "vue-i18n";
import {statusOptions} from "@/views/business/admin/additionalFees/data";

const { t } = useI18n();
const emit = defineEmits(['search']);

const shopMappedByClient: Ref<Record<string, ShopByClient>> = inject('shopMappedByClient');
const shopOptionList: Ref<SelectProps['options']> = inject('shopOptionList');

const useForm = Form.useForm;
const formRef = ref<Nullable<FormActionType>>(null);
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 4 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 20 } });
const validatorRules = ref({
  shop: [{ required: false}],
  status: [{ required: false}],
});
const searchState = reactive<Record<string, string>>({
  shop: '',
  status: '',
});
const { validateInfos } = useForm(searchState, validatorRules, { immediate: false });

function handleShopChange(event: Event) {
  searchState.shop = (event.target as HTMLInputElement).value;
}
function handleStatusChange(value: string) {
  searchState.status = value;
}
function handleSearch() {
  emit('search', searchState);
}
</script>
