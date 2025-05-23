<template>
  <a-form ref="formRef"
          :model="searchState"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :rules="validatorRules"
          class="bg-white rounded-md pt-8 p-4 mb-6 "
  >
    <a-row :gutter =8>
      <a-col :span="8">
        <a-form-item
          :labelCol="labelCol"
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
            v-model:value="searchState.clientId"
            allowClear
          />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          v-bind="validateInfos.name"
          name="createBy"
        >
          <template #label>
            {{ t('data.invoice.createBy') }}
          </template>
          <JSearchSelect
            :placeholder="t('component.searchForm.userSelect')"
            v-model:value="searchState.createBy"
            :dict-options="userOptions"
            allowClear
          />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item
          :labelCol="largeLabelCol"
          :wrapperCol="largeWrapperCol"
          v-bind="validateInfos.name"
          name="type"
        >
          <template #label>
            {{ t('data.invoice.invoiceType') }}
          </template>
          <JSearchSelect
            :placeholder="t('component.searchForm.invoiceTypeInputSearch')"
            v-model:value="searchState.type"
            :dict-options="typeOptions"
            allowClear
          />
        </a-form-item>
      </a-col>
      <a-col :span="6">
        <a-form-item
          :labelCol="largeLabelCol"
          :wrapperCol="wrapperCol"
          v-bind="validateInfos.name"
          name="invoiceNumbers"
        >
          <template #label>
            {{ t('data.invoice.invoiceNumber') }}
          </template>
          <a-textarea
            v-model:value="searchState.invoiceNumbers"
            :placeholder="t('component.searchForm.enterInvoiceNumbers')"
            :rows="5"
            allowClear
          />
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <a-form-item>
          <a-button type="primary" preIcon="ant-design:search-outlined" @click="handleSearch">{{ t('common.operation.search') }}</a-button>
        </a-form-item>
      </a-col>
      <a-col :span="2">
        <a-form-item>
          <a-button type="default" preIcon="ant-design:reload-outlined" @click="handleReset">{{ t('common.operation.reset') }}</a-button>
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>
</template>
<script setup lang="ts">
import {JSearchSelect} from "@/components/Form";
import {Form} from "ant-design-vue";
import {onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {fetchUserList} from "@/views/business/admin/invoiceManagement/data/InvoiceList.data";
import {getUserList} from "@/api/common/api";
import {filterObj} from "@/utils/common/compUtils";

const { t } = useI18n();
const emit = defineEmits(['search']);

const useForm = Form.useForm;
const formRef = ref();

onMounted(() => {
  loadClientOptions();
  loadUserOptions();
})

const clientOptions = ref([]);
const userOptions = ref([]);
const typeOptions = ref([
  {text: t('data.invoice.shippingInvoice'), value: 'shipping'},
  {text: t('data.invoice.purchaseInvoice'), value: 'purchase'},
  {text: t('data.invoice.completeInvoice'), value: 'complete'},
]);

const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 4 } });
const largeLabelCol = ref<any>({ xs: { span: 24 }, sm: { span: 8 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 20 } });
const largeWrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 16 } });
const validatorRules = ref({
  createBy: [{ required: false }],
  clientId: [{ required: false }],
  invoiceNumbers: [{ required: false }],
  type: [{ required: false }],
});
const searchState = reactive<Record<string, string>>({
  createBy: '',
  clientId: '',
  invoiceNumbers: '',
  type: '',
});
const { validateInfos } = useForm(searchState, validatorRules, { immediate: false });


function loadClientOptions(): void {
  const param = {
    pageNo: 1,
    pageSize: 50
  };
  fetchUserList(param).then(res => {
    userOptions.value = res.records.map(
      user => ({
        text: user.username,
        value: user.username,
      })
    );
    if (res.pages > 1) {
      for (let i = 2; i <= res.pages; i++) {
        getUserList({pageNo: i, pageSize: 50}).then(r => {
          const oldUserList = userOptions.value;
          let newUserList = r.records.map(
            user => ({
              text: user.username,
              value: user.username,
            })
          );
          for(let item of oldUserList) {
            newUserList.push(item);
          }
          userOptions.value = newUserList;
        });
      }
    }
  });
}
function loadUserOptions(): void {
  const param = {
    pageNo: 1,
    pageSize: 50
  };
  fetchUserList(param).then(res => {
    clientOptions.value = res.records.map(
      user => ({
        text: user.username,
        value: user.username,
      })
    );
    if (res.pages > 1) {
      for (let i = 2; i <= res.pages; i++) {
        getUserList({pageNo: i, pageSize: 50}).then(r => {
          const oldUserList = clientOptions.value;
          let newUserList = r.records.map(
            user => ({
              text: user.username,
              value: user.username,
            })
          );
          for(let item of oldUserList) {
            newUserList.push(item);
          }
          clientOptions.value = newUserList;
        });
      }
    }
  });
}
function getSearchParams() {
  const invoiceNumbers: string[] = searchState.invoiceNumbers.split('\n').filter(item => item.trim() !== '');
  const params = {
    clientId: searchState.clientId,
    createBy: searchState.createBy,
    invoiceNumbers: invoiceNumbers,
    type: searchState.type,
  };
  return filterObj(params);
}
function handleSearch() {
  emit('search', getSearchParams());
}
function handleReset() {
  searchState.createBy = '';
  searchState.clientId = '';
  searchState.invoiceNumbers = '';
  searchState.type = '';
  emit('search', getSearchParams());
}
</script>
