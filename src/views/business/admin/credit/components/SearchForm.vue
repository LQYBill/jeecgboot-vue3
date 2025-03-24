<template>
  <div class="bg-white rounded-5 pt-8 p-4 mb-6">
    <a-form ref="formRef"
            :model="searchState"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="validatorRules"
    >
      <a-row :gutter =8>
        <a-col :span="6">
          <a-form-item
            :labelCol="{ xs: { span: 24 }, sm: { span: 4 }}"
            :wrapperCol="wrapperCol"
            v-bind="validateInfos.name"
            name="clientId"
          >
            <template #label>
              {{ t('data.Client') }}
            </template>
            <JSearchSelect
              :placeholder="t('component.searchForm.clientInputSearch')"
              dict="client WHERE active = '1',internal_code,id"
              @change="handleClientChange"
              v-model:value="searchState.clientId"
              allowClear
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            :labelCol="{ xs: { span: 24 }, sm: { span: 8 }}"
            :wrapperCol="wrapperCol"
            v-bind="validateInfos.name"
            name="invoiceNumber"
          >
            <template #label>
              {{ t('data.invoice.invoiceNumber') }}
            </template>
            <a-input
              :placeholder="t('component.searchForm.enterInvoiceNumber')"
              v-model:value="searchState.invoiceNumber"
              @change="handleInvoiceNumberChange"
              allowClear
            />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item
            :labelCol="{ xs: { span: 24 }, sm: { span: 6 }}"
            :wrapperCol="wrapperCol"
            v-bind="validateInfos.name"
            name="currencyId"
          >
            <template #label>
              {{ t('data.client.currency') }}
            </template>
            <JSearchSelect
              :placeholder="t('component.searchForm.currencyInputSearch')"
              dict="currency WHERE code != 'RMB',code,id"
              @change="handleCurrencyChange"
              v-model:value="searchState.currencyId"
              allowClear
            />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item>
            <nav class="flex gap-2">
              <a-button type="primary" preIcon="ic:outline-search" @click="handleSearch" class="flex-1"></a-button>
              <a-button preIcon="ic:baseline-restart-alt" @click="handleReset"></a-button>
            </nav>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import {type FormActionType, JSearchSelect} from "@/components/Form";
import { reactive, ref} from "vue";
import { Form } from "ant-design-vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits(['search', 'reset']);

const useForm = Form.useForm;
const formRef = ref<Nullable<FormActionType>>(null);
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 6 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 20 } });
const validatorRules = ref({
  clientId: [{ required: false}],
  invoiceNumber: [{ required: false}],
  currencyId: [{ required: false}],
});
const searchState = reactive<Record<string, string>>({
  clientId: '',
  invoiceNumber: '',
  currencyId: '',
});
const { validateInfos } = useForm(searchState, validatorRules, { immediate: false });

function handleClientChange(clientId: string) {
  searchState.clientId = clientId;
}
function handleInvoiceNumberChange(event: Event) {
  console.log(event);
  searchState.invoiceNumber = (event.target as HTMLInputElement).value;
}
function handleCurrencyChange(value: string) {
  console.log(value);
  searchState.currencyId = value;
}
function handleSearch() {
  emit('search', searchState);
}
function handleReset() {
  formRef.value?.resetFields();
  emit('reset');
}
</script>
