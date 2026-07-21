<template>
  <PageWrapper title='Expenses Overview'>
    <a-card class="main-card">
      <a-form v-if="internalUse" ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="validatorRules">
        <a-row>
          <a-col>
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              v-bind="validateInfos.name"
              name="customer"
            >
              <template #label>
                <span title="Customer">{{ t('data.invoice.customer') }}</span>
              </template>
              <JSearchSelect
                :placeholder="t('component.searchForm.clientInputSearch')"
                :dictOptions="customerSelectList"
                @change="handleClientChange"
                v-model:value="formState.customer"
                allowClear
                :disabled="customerListDisabled"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <a-card class="card-header" v-if="client">
        <h1>{{ fullName }} <span style="font-weight: 200">( {{ invoiceEntity }} )</span></h1>
        <p>{{ t("data.client.preferredCurrency") }} : {{ currency }} / {{ CurrencyToken[currency] }}</p>
      </a-card>
      <a-tabs v-if="client && currencyList.length > 0"
              :defaultActiveKey="1"
              v-model:activeKey="activeTab"
              style="margin: 10px"
              @change="handleTabChange"
      >
        <template #rightExtra>
          <div class="mr-2">
            <a-switch :checked="editMode" @change="handleEditModeChange">
              <template #checkedChildren>
                <EditOutlined/>
              </template>
              <template #unCheckedChildren>
                <EditOutlined/>
              </template>
            </a-switch>
          </div>
        </template>
        <a-tab-pane v-for="(curr, index) in currencyList" :tab="curr" :key="index+1" forceRender>
          <ExpensesTable
            :client="client"
            :currency="curr"
            @colorize="colorizeEmit"
            :isEdit="editMode"
          />
        </a-tab-pane>
      </a-tabs>
      <a-skeleton v-else active/>
    </a-card>
  </PageWrapper>
</template>
<script lang="ts" setup>

import {onBeforeMount, reactive, ref} from "vue";
import {PageWrapper} from '/@/components/Page';
import {Form} from "ant-design-vue";

import {useI18n} from "/@/hooks/web/useI18n";
import {defHttp} from "/@/utils/http/axios";

import JSearchSelect from "/@/components/Form/src/jeecg/components/JSearchSelect.vue";
import type {Client, Currency} from "@/views/business/dto";
import {CurrencyEnum, CurrencyToken, TransactionType} from "@/views/business/enum";

import {Api} from "../client.api";
import ExpensesTable from "@/views/business/client/overview/components/ExpensesTable.vue";
import {EditOutlined} from "@ant-design/icons-vue";

const { t } = useI18n();

const internalUse = ref<boolean>(false);

const debitColor = "#EAE5FF";
const creditColor = "#E6F6EF";
const estimationColor = "#F0F5FF";

onBeforeMount(()=> {
  checkUser();
});
// Form config
const useForm = Form.useForm;
const formRef = ref();
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 2 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 12 } });
const validatorRules = ref({
  customer: [{ required: true, message: t('component.searchForm.clientInputSearch'), trigger: 'blur' }],
});
const formState = reactive<Record<string, any>>({
  customer: '',
});
const { validateInfos } = useForm(formState, validatorRules, { immediate: false });

const customerList = ref<Client[]>([]);
const customerSelectList = ref<any[]>([]);
const customerListDisabled = ref<boolean>(false);

const client = ref<Client>();

const currency = ref<string>();
const fullName = ref<string>();
const invoiceEntity = ref<string>();
const currencyList = ref<CurrencyEnum[]>([]);

const activeTab = ref(1);
const editMode = ref(false);
async function checkUser() {
  defHttp.get({url: Api.getClient})
    .then(res => {
      if(res.internal) {
        customerList.value = res.internal;
        customerSelectList.value = res.internal.map(
          (customer: Recordable) => ({
            text: `${customer.firstName} ${customer.surname} (${customer.internalCode})`,
            value: customer.id,
          })
        );
        internalUse.value = true;
      }
      else {
        loadClient(res.client);
      }
    })
    .catch(e => {
      console.error(e);
    })
}
function handleClientChange(id?: string) {
  client.value = undefined;
  currencyList.value = [];
  currency.value = '';
  fullName.value = '';
  invoiceEntity.value = '';
  activeTab.value = 1;
  const customer = customerList.value.find(c => c.id === id);
  if(!customer) {
    return;
  }
  loadClient(customer);
}
async function loadClient(clientParam: Client) {
  client.value = clientParam;
  currency.value = client.value.currency as string;
  fullName.value = `${client.value.firstName} ${client.value.surname}`
  invoiceEntity.value = client.value.invoiceEntity as string;
  await loadAllTransactionCurrencies();
}
async function loadAllTransactionCurrencies() {
  const params = {
    clientId: client.value?.id as string,
  };
  await defHttp.get({url: Api.getClientTransactionCurrencies, params: params})
    .then( (res: Currency[]) => {
      const currencies = res.map(c => c.code as CurrencyEnum);
      const sortedCurrencies = [currencies.find(c => c === currency.value as CurrencyEnum) as CurrencyEnum].concat(
        currencies.filter(c => c !== currency.value)
      );
      currencyList.value = sortedCurrencies;
    });
}
/**
 * colorize debit and credit rows for better visibility
 */
function colorizeEmit() {
  colorizeRows();
}
function colorizeRows() {
  let rows = Array.from(document.getElementsByClassName('ant-table-row-level-0') as HTMLCollectionOf<HTMLElement>);
  [].forEach.call(rows, function(row: HTMLElement) {
    let children = Array.from(row.children as HTMLCollectionOf<HTMLElement>);
    if(children[0].textContent == 'Estimation') {
      for(let cell of children) {
        cell.style.backgroundColor = estimationColor;
      }
    }
    if(children[1].textContent == TransactionType.DEBIT) {
      children[0].style.borderLeftStyle = "solid";
      children[0].style.borderLeftColor = debitColor;
      children[0].style.borderLeftWidth = "5px";
    }
    if(children[1].textContent == TransactionType.CREDIT) {
      children[0].style.borderLeftStyle = "solid";
      children[0].style.borderLeftColor = creditColor;
      children[0].style.borderLeftWidth = "5px";
    }
  });
}
function handleEditModeChange(checked: boolean) {
  editMode.value = checked;
  if(checked)
    colorizeRows();
}
function handleTabChange(key: number) {
  activeTab.value = key;
}
</script>

<style lang="less">
@geekBlue: #1d39c4;
@geekBlueBg : #F0F5FF;
@lightGeekBlue : lighten(@geekBlue, 15%);
@balancePositive : #5cc290;
@volcano: #c73333;

.main-card .jeecg-basic-table {
  border-radius: 1em;
  .ant-table-wrapper {
    padding: 0 0 1em 0 !important;
    border-radius: 1em;
  }
  .ant-pagination {
    padding: 0 1em;
  }
  .ant-table-tbody {
    height: auto !important;
  }
}
.ant-card.main-card {
  background-color: transparent;
  & > .ant-card-body {
    min-height: 50vh;
  }
}
.main-card .ant-card.card-header {
  margin: 10px;
  border-radius: 1em;
  h1 {
    font-size: 2em;
  }
}
.main-card .ant-tabs-top > .ant-tabs-nav{
  margin: 0;
  .ant-tabs-tab {
    padding: 12px 20px;
    margin: 0;
    background-color: rgba(0,0,0,0.1);
    border-color: #f0f0f0;
    &.ant-tabs-tab-active {
      background-color: white;
    }
    &:hover {
      background-color: rgba(0,0,0,0.05);
    }
    &:nth-child(1) {
      border-radius: 5px 0 0 0;
    }
    &:nth-last-child(2) {
      border-radius: 0 5px 0 0;
    }
  }
}
.main-card .jeecg-basic-table-header__tableTitle {
  h1 {
    font-size: 2rem;
  }
  h2 {
    font-size: 1.5rem;
  }
  .ant-tag {
    padding: 0.3em;
  }
  .invoiceToolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1em;
  }
  & > * {
    margin-right: 0;
  }
}
.main-card .jeecg-basic-table-header__toolbar {
  display: none;
}
.main-card .ant-tag {
  border-radius: 1em;
  &.num-tag {
    font-size: 1em;
  }
}
.balance-row {
  display: flex;
  justify-content: center;
  align-items:center;
  flex-direction: column;
  background-color: @geekBlueBg;
  padding: 1em 0;
  border-radius: 0 0 10em 10em;
  border-width: 0 1px 1px 1px;
  margin-bottom: 1em;
  p {
    margin: 0;
  }
  h1 {
    color: @geekBlue;
  }
  .balance-estimated {
    &.ant-tag-geekblue {
    background: @geekBlue;
    color: @geekBlueBg;
    }
    &.ant-tag-volcano {
      background-color: @volcano;
      border-color: @volcano;
      color: #fff;
    }
  }
}
.positive-balance {
  color: @balancePositive;
  font-weight: 600;
}
//.main-card .ant-btn-primary,.ant-pagination.mini .ant-pagination-item-active {
//  border-color: @geekBlue !important;
//  background-color: @geekBlue !important;
//  color: @geekBlueBg !important;
//  &:hover {
//    background-color: @lightGeekBlue !important;
//    border-color: @lightGeekBlue !important;
//  }
//}
.main-card .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn ,
.main-card .ant-tabs-tab-btn:focus, .main-card .ant-tabs-tab-remove:focus, .main-card .ant-tabs-tab-btn:active, .main-card .ant-tabs-tab-remove:active,.main-card .ant-tabs-tab:hover,
.main-card .ant-pagination.mini .ant-pagination-prev:hover a, .main-card .ant-pagination.mini .ant-pagination-next:hover a, .main-card .ant-pagination.mini .ant-pagination-item:focus a, .main-card .ant-pagination.mini .ant-pagination-item:hover a{
  color: @geekBlue;
}
.main-card .ant-tabs-ink-bar {
  background: @geekBlue;
}
</style>
