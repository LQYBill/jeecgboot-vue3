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
        <p>{{ t("data.client.preferredCurrency") }} : {{ currency }} / {{ currencySymbol }}</p>
      </a-card>
      <a-tabs defaultActiveKey="1" v-model:activeKey="activeTab" style="margin: 10px" v-if="client">
        <a-tab-pane tab="EUR" key="1">
          <BasicTable @register="registerTable">
            <template #tableTitle>
              <div style="width: 100%" v-if="client.category != 'self-service'">
                <a-row class="balance-row">
                  <p>
                    {{ t('data.client.accountBalance') }} :
                  </p>
                  <h1>
                    {{ balanceEur }} €
                  </h1>
                  <p>
                    {{ t('data.client.estimatedBalance') }} :
                    <Tag
                      :color="estimatedBalanceEur >= 0 ? 'geekblue' : 'volcano'" class="num-tag balance-estimated"
                    >
                      {{ estimatedBalanceEur }} €
                    </Tag>
                  </p>
                </a-row>
                <a-row class="invoiceToolbar">
                  <div>
                    <a-select
                      v-model:value="selectedYearEur"
                      @change="handleYearChange"
                      :options="yearOptionsEur"
                    ></a-select>
                  </div>
                  <div>
                    <a-switch :checked="editMode" @change="handleEditModeChange">
                      <template #checkedChildren>
                        <EditOutlined/>
                      </template>
                      <template #unCheckedChildren>
                        <EditOutlined/>
                      </template>
                    </a-switch>
                  </div>
                </a-row>
              </div>
            </template>
            <template #date="{ record }">
              <span :class="record.status === 0 ? 'line-through' : ''">
                {{ dayjs(record.createTime).isValid() ? dayjs(record.createTime).format('DD/MM').toString() : record.createTime }}
              </span>
            </template>
            <template #transactionType="{ record }">
              <Tag
                :color="record.type === TransactionType.CREDIT ? 'green' : 'purple'"
                :class="record.status === 0 ? 'line-through' : ''"
              >
                {{ record.type }}
              </Tag>
            </template>
            <template #invoiceNumber="{ record }">
              <template v-if="(record.type == TransactionType.DEBIT || record.type == TransactionType.CREDIT) && !!record.invoiceNumber">
                <a-button
                  v-if="record.status !== 0"
                  type="primary"
                  preIcon="ant-design:eye-outlined"
                  @click="openInvoice(record)"
                  shape="round"
                >
                  {{ record.invoiceNumber }}
                </a-button>
                <span v-else class="line-through text-error">
                  {{ record.invoiceNumber }}
                </span>
              </template>
            </template>
            <template #amount="{ record }">
              <span v-if="record.type == TransactionType.CREDIT" class="positive-balance">
                +{{ record.amount }}
              </span>
              <template v-else>
                <span v-if="record.createTime == 'Estimation' && estimationLoading">
                  <loading :loading="estimationLoading" :absolute="true" :size="SizeEnum.SMALL"></loading>
                </span>
                <span v-else :class="record.status === 0 ? 'line-through' : ''">
                  - {{ record.amount }}
                </span>
              </template>
            </template>
            <template #shippingFee="{ record }">
              <template v-if="record.createTime == 'Estimation' && estimationLoading">
                <loading :loading="estimationLoading" :absolute="true" :size="SizeEnum.SMALL"></loading>
              </template>
              <span v-else-if="!!record.shippingFee" :class="record.status === 0 ? 'line-through' : ''">
                - {{ record.shippingFee }}
              </span>
            </template>
            <template #purchaseFee="{ record }">
              <template v-if="record.createTime == 'Estimation' && estimationLoading">
                <loading :loading="estimationLoading" :absolute="true" :size="SizeEnum.SMALL"></loading>
              </template>
              <span v-else-if="!!record.purchaseFee" :class="record.status === 0 ? 'line-through' : ''">
                - {{ record.purchaseFee }}
              </span>
            </template>
            <template #img="{ text, record }">
              <TableImg
                v-if="record.type == TransactionType.CREDIT && !!record.paymentProofString"
                :size="60"
                :imgList="[uploadUrl+record.paymentProofString]"
              />
              <template v-else-if="record.type == TransactionType.DEBIT && !!record.invoiceNumber">
                <template v-if="['1', '2', '7'].includes(record.invoiceNumber?.split('-')[2]?.charAt(0))">
                <template v-if="text">
                  <div style="display: inline-flex; align-items: center;">
                    <TableImg :imgList="[uploadUrl + text]" :size="40" />
                    <JImageUpload
                      :text="t('component.upload.reUpload')"
                      :fileMax="1"
                      listType="picture"
                      bizPath="purchase_order/screenshots"
                      @change="e => handleUploadChange(e, record)"
                    />
                  </div>
                </template>
                <template v-else>
                  <JImageUpload
                    :text="t('component.upload.upload')"
                    :fileMax="1"
                    listType="picture"
                    bizPath="purchase_order/screenshots"
                    @change="e => handleUploadChange(e, record)"
                  />
                </template>
              </template>
              <template v-else>
                <span>-</span>
              </template>
            </template>
            </template>
            <template #action="{ record }">
              <TableAction
                :actions="[
                  {
                    label: t('common.operation.cancel'),
                    icon: 'ic:outline-delete-outline',
                    popConfirm: {
                      title: t('common.operation.cancelConfirmation'),
                      confirm: handleDelete.bind(null, record),
                    },
                    disabled: record.createTime === 'Estimation'
                        || record.type === TransactionType.CREDIT
                        || (record.createBy !== client?.internalCode && record.createBy !== fullName)
                        || record.createTime < dayjs().subtract(2, 'week').format('YYYY-MM-DD')
                        || record.status === 0
                        || record.ordered === 1,
                  },
                ]"
              />
            </template>
          </BasicTable>
        </a-tab-pane>
        <a-tab-pane tab="USD" key="2" forceRender>
          <BasicTable @register="registerUSDTable">
            <template #tableTitle>
              <div style="width: 100%;" v-if="client.category != 'self-service'">
                <a-row class="balance-row">
                  <p>
                    {{ t('data.client.accountBalance') }} :
                  </p>
                  <h1>
                    {{ balanceUsd }} $
                  </h1>
                  <p>
                    {{ t('data.client.estimatedBalance') }} :
                    <Tag
                      :color="estimatedBalanceUsd >= 0 ? 'geekblue' : 'volcano'" class="num-tag balance-estimated"
                    >
                      {{ estimatedBalanceUsd }} $
                    </Tag>
                  </p>
                </a-row>
                <a-row class="invoiceToolbar">
                  <div>
                    <a-select
                      v-model:value="selectedYearUsd"
                      @change="handleYearChange"
                      :options="yearOptionsUsd"
                    ></a-select>
                  </div>
                  <div>
                    <a-switch :checked="editMode" @change="handleEditModeChange">
                      <template #checkedChildren>
                        <EditOutlined/>
                      </template>
                      <template #unCheckedChildren>
                        <EditOutlined/>
                      </template>
                    </a-switch>
                  </div>
                </a-row>
              </div>
            </template>
            <template #date="{ record }">
              <span :class="record.status === 0 ? 'line-through' : ''">
                {{ dayjs(record.createTime).isValid() ? dayjs(record.createTime).format('DD/MM').toString() : record.createTime }}
              </span>
            </template>
            <template #transactionType="{ record }">
              <Tag
                :color="record.type === TransactionType.CREDIT ? 'green' : 'purple'"
                :class="record.status === 0 ? 'line-through' : ''"
              >
                {{ record.type }}
              </Tag>
            </template>
            <template #invoiceNumber="{ record }">
              <template v-if="(record.type == TransactionType.DEBIT || record.type == TransactionType.CREDIT) && !!record.invoiceNumber">
                <a-button
                  v-if="record.status !== 0"
                  type="primary"
                  preIcon="ant-design:eye-outlined"
                  @click="openInvoice(record)"
                  shape="round"
                >
                  {{ record.invoiceNumber }}
                </a-button>
                <span v-else class="line-through text-error">
                  {{ record.invoiceNumber }}
                </span>
              </template>
            </template>
            <template #amount="{ record }">
              <span v-if="record.type == TransactionType.CREDIT" class="positive-balance">
                +{{ record.amount }}
              </span>
              <template v-else>
                <span v-if="record.createTime == 'Estimation' && estimationLoading">
                  <loading :loading="estimationLoading" :absolute="true" :size="SizeEnum.SMALL"></loading>
                </span>
                <span v-else :class="record.status === 0 ? 'line-through' : ''">
                  - {{ record.amount }}
                </span>
              </template>
            </template>
            <template #shippingFee="{ record }">
              <template v-if="record.createTime == 'Estimation' && estimationLoading">
                <loading :loading="estimationLoading" :absolute="true" :size="SizeEnum.SMALL"></loading>
              </template>
              <template v-else-if="!!record.shippingFee" :class="record.status === 0 ? 'line-through' : ''">
                - {{ record.shippingFee }}
              </template>
            </template>
            <template #purchaseFee="{ record }">
              <template v-if="record.createTime == 'Estimation' && estimationLoading">
                <loading :loading="estimationLoading" :absolute="true" :size="SizeEnum.SMALL"></loading>
              </template>
              <template v-else-if="!!record.purchaseFee" :class="record.status === 0 ? 'line-through' : ''">
                - {{ record.purchaseFee }}
              </template>
            </template>
            <template #img="{ text, record }">
              <TableImg
                v-if="record.type==TransactionType.CREDIT && !!record.paymentProofString"
                :size="60"
                :imgList="[uploadUrl+record.paymentProofString]"
              />
              <template v-else-if="record.type == TransactionType.DEBIT && !!record.invoiceNumber">
              <template v-if="['1', '2', '7'].includes(record.invoiceNumber?.split('-')[2]?.charAt(0))">
                <template v-if="text">
                  <div style="display: inline-flex; align-items: center;">
                    <TableImg :imgList="[uploadUrl + text]" :size="40" />
                    <JImageUpload
                      :text="t('component.upload.reUpload')"
                      :fileMax="1"
                      listType="picture"
                      bizPath="purchase_order/screenshots"
                      @change="e => handleUploadChange(e, record)"
                    />
                  </div>
                </template>
                <template v-else>
                  <JImageUpload
                    :text="t('component.upload.upload')"
                    :fileMax="1"
                    listType="picture"
                    bizPath="purchase_order/screenshots"
                    @change="e => handleUploadChange(e, record)"
                  />
                </template>
              </template>
              <template v-else>
                <span>-</span>
              </template>
            </template>
            </template>
            <template #imgs="{ text }">
              <TableImg
                v-if="!!text"
                :size="60"
                :imgList="[uploadUrl+text]"
              />
            </template>
            <template #action="{ record }">
              <TableAction
                :actions="[
                  {
                    label: t('common.operation.cancel'),
                    icon: 'ic:outline-delete-outline',
                    popConfirm: {
                      title: t('common.operation.cancelConfirmation'),
                      confirm: handleDelete.bind(null, record),
                    },
                    disabled: record.createTime === 'Estimation'
                        || record.type === TransactionType.CREDIT
                        || (record.createBy !== client?.internalCode && record.createBy !== fullName)
                        || record.createTime < dayjs().subtract(2, 'week').format('YYYY-MM-DD')
                        || record.status === 0
                        || record.ordered === 1,
                  },
                ]"
              />
            </template>
          </BasicTable>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </PageWrapper>
</template>
<script lang="ts" setup>

import {onBeforeMount, onUnmounted, reactive, ref} from "vue";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {TableAction, TableImg, useTable} from "/@/components/Table";
import {PageWrapper} from '/@/components/Page';
import {Form, Tag} from "ant-design-vue";
import {actionColumn, getColumns} from "/@/views/business/client/overview/data";
import { EditOutlined } from '@ant-design/icons-vue';

import {useI18n} from "/@/hooks/web/useI18n";
import {defHttp} from "/@/utils/http/axios";
import {useMessage} from "/@/hooks/web/useMessage";

import JSearchSelect from "/@/components/Form/src/jeecg/components/JSearchSelect.vue";
import JImageUpload from '/@/components/Form/src/jeecg/components/JImageUpload.vue';
import dayjs from "dayjs";
import {useGlobSetting} from "/@/hooks/setting";
import {useRouter} from 'vue-router';
import {Currency} from "@/views/business/dto/currency.dto";
import {Loading} from "@/components/Loading";
import {SizeEnum} from "@/enums/sizeEnum";

import { Api } from "../client.api";
import {JSelectMultipleOptions} from "@/views/business/dto";

const { t } = useI18n();
const { createMessage } = useMessage();
const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
const uploadUrl = `${baseUploadUrl}/sys/common/static/`;
const {resolve}=useRouter();
const ac = new AbortController();
const {signal} = ac;

const internalUse = ref<boolean>(false);

const debitColor = "#EAE5FF";
const creditColor = "#E6F6EF";
const estimationColor = "#F0F5FF";

onBeforeMount(()=> {
  checkUser();
});
onUnmounted(() => {
  ac.abort(t('sys.api.abortController.onUnmount'));
})
const TransactionType = {
  CREDIT: 'Credit',
  DEBIT: 'Debit',
};
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

const customerList = ref<Record<string, string | number>[]>([]);
const customerSelectList = ref<any[]>([]);
const customerListDisabled = ref<boolean>(false);

const selectedYearEur = ref<string>(dayjs().year().toString());
const selectedYearUsd = ref<string>(dayjs().year().toString());
const yearOptionsEur = ref<JSelectMultipleOptions[]>([]);
const yearOptionsUsd = ref<JSelectMultipleOptions[]>([]);

const client = ref<Record<string, string | number>>();
const currency = ref<string>();
const fullName = ref<string>();
const invoiceEntity = ref<string>();
const currencySymbol = ref<string>();
const balanceEur = ref(0);
const balanceUsd = ref(0);
const estimatedBalanceEur = ref(0);
const estimatedBalanceUsd = ref(0);

const invoiceDisabled = ref<boolean>(true);
const invoiceLoading = ref<boolean>(false);
const completeInvoiceDisabled = ref<boolean>(true);
const completeInvoiceLoading = ref<boolean>(false);

const activeTab = ref('1');
const eurTableLoading = ref<boolean>(true);
const usdTableLoading = ref<boolean>(true);
const estimationLoading = ref<boolean>(true);

const editMode = ref(false);

const transactionsEur = ref<any[]>([]);
const transactionsUsd = ref<any[]>([]);
const debit = ref();
const shopIds = ref<any[]>([]);
const startDate = ref();
const endDate = ref();

const ipagination = reactive({
  current: 1,
  pageSize: 100,
  pageSizeOptions: ['50', '100'],
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  showTotal: (total:number, range: number[]) => {
    return range[0] + '-' + range[1] + ' of ' + total + ' items';
  },
});
const usdIpagination = reactive({
  current: 1,
  pageSize: 100,
  pageSizeOptions: ['50', '100'],
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  showTotal: (total: number, range: number[]) => {
    return range[0] + '-' + range[1] + ' of ' + total + ' items';
  },
});
const [registerTable, ] = useTable({
  dataSource: transactionsEur,
  columns: getColumns(),
  pagination: ipagination,
  bordered: false,
  striped: true,
  showIndexColumn: false,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  rowKey: 'id',
  loading: eurTableLoading,
  scroll: {y: false},
  actionColumn,
  showActionColumn: editMode,
});
const [registerUSDTable] = useTable({
  dataSource: transactionsUsd,
  columns: getColumns(),
  pagination: usdIpagination,
  bordered: false,
  striped: true,
  showIndexColumn: false,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  rowKey: 'id',
  loading: usdTableLoading,
  scroll: {y: false},
  actionColumn,
  showActionColumn: editMode,
});
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
function handleClientChange(id: any) {
  if(!!client.value && client.value.length > 0) {
    ac.abort(t('sys.api.abortController.userCancel'));
  }
  client.value = undefined;
  shopIds.value = [];
  startDate.value = '';
  endDate.value = '';
  currency.value = '';
  currencySymbol.value = '';
  fullName.value = '';
  balanceEur.value = 0;
  balanceUsd.value = 0;
  estimatedBalanceEur.value = 0;
  estimatedBalanceUsd.value = 0;
  invoiceEntity.value = '';
  transactionsEur.value = [];
  transactionsUsd.value = [];
  debit.value = [];
  eurTableLoading.value = true;
  usdTableLoading.value = true;
  invoiceDisabled.value = true;
  invoiceLoading.value = false;
  completeInvoiceDisabled.value = true;
  completeInvoiceLoading.value = false;
  const customer = customerList.value.find(c => c.id === id);
  if(!customer) {
    createMessage.error(t('data.client.clientNotFound'));
    return;
  }
  loadClient(customer);
}
function loadClient(clientParam: Record<string, string | number>) {
  client.value = clientParam;
  client.value["category"] = client.value.clientCategoryId;
  delete client.value['clientCategoryId'];
  currency.value = client.value.currency as string;
  fullName.value = `${client.value.firstName} ${client.value.surname}`
  invoiceEntity.value = client.value.invoiceEntity as string;
  if(currency.value === 'EUR') {
    currencySymbol.value = "€";
  }
  if(currency.value === 'USD') {
    currencySymbol.value = "$";
  }
  if(currency.value === 'RMB') {
    currencySymbol.value = "¥";
  }
  if(client.value.category != 'self-service')
    loadBalance();
  loadTransactions("EUR");
}
function loadBalance() {
  defHttp.get({url: Api.getBalance, params: {clientId: client.value?.id, currency: "EUR"}, signal: signal})
    .then(res => {
      balanceEur.value = res;
    })
    .catch(e => {
      if(signal.aborted) {
        const {reason} = signal;
        console.warn(`Http request aborted : ${reason}`);
        createMessage.warn(reason);
      }
      else {
        console.error(e);
      }
    })
  defHttp.get({url: Api.getBalance, params: {clientId: client.value?.id, currency: "USD"}, signal: signal})
    .then(res => {
      balanceUsd.value = res;
    })
    .catch(e => {
      if(signal.aborted) {
        const {reason} = signal;
        console.warn(`Http request aborted : ${reason}`);
        createMessage.warn(reason);
      }
      else {
        console.error(e);
      }
    })
}
function loadTransactions(currency: Currency) {
  const params = {
    clientId: client.value?.id as string,
    currency: currency,
    year: currency === "EUR" ? selectedYearEur.value : selectedYearUsd.value,
  }
  if(currency === "EUR") {
    eurTableLoading.value = true;
  } else {
    usdTableLoading.value = true;
  }
  loadAvailableYears(params);
  defHttp.get({ url: Api.listTransactions, params, signal: signal })
    .then(res => {
      //TODO : add condition client type 1,2,3
      if(currency === "EUR") {
        transactionsEur.value = res;
        loadTransactions("USD");
      }
      else {
        transactionsUsd.value = res;
        if(client.value?.category != 'self-service')
          loadDebit(client.value?.currency as Currency);
        else {
          colorizeRows();
        }
      }
    })
    .catch(e => {
      if(signal.aborted) {
        const {reason} = signal;
        console.warn(`Http request aborted : ${reason}`);
        createMessage.warn(reason);
      }
      else {
        console.error(e);
      }
    })
    .finally(() => {
      if(currency === "EUR") {
        eurTableLoading.value = false;
      } else {
        usdTableLoading.value = false;
      }
    });
}
function loadAvailableYears(params: {clientId: string, currency: Currency}) {
  defHttp.get({url: Api.findEarliestInvoiceYear, params: params, signal: signal})
    .then((res: number) => {
      if(params.currency === "EUR") {
        yearOptionsEur.value = [];
        for(let year = dayjs().year(); year >= res; year--) {
            yearOptionsEur.value.push({label: year.toString(), value: year.toString()});
        }
      }
      else {
        yearOptionsUsd.value = [];
        for(let year = dayjs().year(); year >= res ; year--) {
            yearOptionsUsd.value.push({label: year.toString(), value: year.toString()});
        }
      }
    })
    .catch(e => {
      console.error(e);
    });

}
function loadDebit(currency: Currency) {
  estimationLoading.value = true;
  debit.value = {
    id: '0',
    createTime: 'Estimation',
    type: TransactionType.DEBIT,
    clientId: `${client.value?.id}`,
    paymentProofString: '',
    invoiceNumber: '',
    shippingFee: 0,
    purchaseFee: 0,
    amount: 0,
    currency: currency
  }
  if(currency === "EUR") {
    transactionsEur.value.unshift(debit.value);
  } else {
    transactionsUsd.value.unshift(debit.value);
  }
  colorizeRows();
  defHttp.get({url: Api.debit, params: { clientId: client.value?.id, currency: currency }, signal: signal})
    .then(res => {
      debit.value = {
        id: '0',
        createTime: 'Estimation',
        type: TransactionType.DEBIT,
        clientId: `${client.value?.id}`,
        paymentProofString: '',
        invoiceNumber: '',
        shippingFee: res.shippingFeesEstimation,
        purchaseFee: res.purchaseEstimation,
        amount: res.totalEstimation,
        currency: currency
      };
      // ajout de la ligne de début au début du tableau
      if(currency === "EUR") {
        transactionsEur.value[0] = debit.value;
        estimatedBalanceEur.value = balanceEur.value - debit.value.amount;
        estimatedBalanceUsd.value = balanceUsd.value;
      }
      else {
        transactionsUsd.value[0] = debit.value;
        estimatedBalanceUsd.value = balanceUsd.value - debit.value.amount;
        estimatedBalanceEur.value = balanceUsd.value;
      }
      estimatedBalanceEur.value = Number(estimatedBalanceEur.value.toFixed(2));
      estimatedBalanceUsd.value = Number(estimatedBalanceUsd.value.toFixed(2));

      shopIds.value = res.shopIds;
      startDate.value = res.startDate;
      endDate.value = res.endDate;
      invoiceDisabled.value = false;
      completeInvoiceDisabled.value = !res.isCompleteInvoiceReady;
    })
    .catch(e=> {
      if(signal.aborted) {
        const {reason} = signal;
        console.warn(`Http request aborted : ${reason}`);
        createMessage.warn(reason);
      }
      else {
        console.error(e);
      }
    })
    .finally(() => {
      estimationLoading.value = false;
      colorizeRows();
    });
}

function handleYearChange(year: string) {
  if(activeTab.value === '1') {
    selectedYearEur.value = year;
    loadTransactions('EUR');
  } else {
    selectedYearUsd.value = year;
    loadTransactions('USD');
  }
}
function openInvoice(record) {
  const invoicePreviewRoute = resolve({name: 'invoice-preview', query: {invoice: record.invoiceNumber}});
  window.open(invoicePreviewRoute.href, '_blank');
}

/**
 * colorize debit and credit rows for better visibility
 */
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
  eurTableLoading.value = false;
  usdTableLoading.value = false;
}
function handleDelete(record: Recordable) {
  if(activeTab.value === '1')
    eurTableLoading.value = true;
  else
    usdTableLoading.value = true;
  defHttp.delete({ url: Api.cancelInvoice, data: { id: record.id, invoiceNumber: record.invoiceNumber, clientId: record.clientId } }, { joinParamsToUrl: true }).then(()=> {

  }).catch(e =>{
    console.error(e);
  }).finally(() => {
    if(activeTab.value === '1') {
      loadTransactions('EUR')
      eurTableLoading.value = false;
    }
    else {
      loadTransactions('USD');
      usdTableLoading.value = false;
    }
  });
}
function handleEditModeChange(checked: boolean) {
  editMode.value = checked;
  if(checked)
    colorizeRows();
}
function handleUploadChange(imgPath, record) {
  if (!imgPath) {
    createMessage.error('Upload failed, no valid path returned');
    return;
  }
  const params = {
    invoiceNumber: record.invoiceNumber,
    paymentProofString: imgPath,
  };
  defHttp.post({
    url: Api.uploadPaymentProofAndNotify,
    data: params,
    headers: { 'Content-Type': 'application/json' },
  })
    .then(() => {
      record.paymentProofString = imgPath;
      loadTransactions('EUR');
    })
    .catch(() => {
      createMessage.error('Save failed, please try again');
    });
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
