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
      <a-tabs defaultActiveKey="1" style="margin: 10px" v-if="client">
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
                  <PopConfirmButton
                    type="warning"
                    shape="round"
                    title="Confirm making invoice ?"
                    preIcon="ant-design:download-outlined"
                    @confirm="makeInvoice"
                    :disabled="invoiceDisabled"
                    okText="ok" :loading="invoiceLoading"
                    cancelText="Cancel"
                  >
                    {{ t("data.invoice.generateShippingInvoice") }}
                  </PopConfirmButton>
                  <PopConfirmButton
                    type="warning"
                    shape="round"
                    title="Confirm making invoice ?"
                    preIcon="ant-design:download-outlined"
                    @confirm="makeCompleteInvoice"
                    :disabled="completeInvoiceDisabled"
                    okText="ok" :loading="completeInvoiceLoading"
                    cancelText="Cancel"
                  >
                    {{ t("data.invoice.generateInvoice7pre") }}
                  </PopConfirmButton>
                </a-row>
              </div>
            </template>
            <template #date="{ record }">
              {{ dayjs(record.createTime).isValid() ? dayjs(record.createTime).format('DD/MM').toString() : record.createTime }}
            </template>
            <template #transactionType="{ record }">
              <Tag
                :color="record.type === 'Credit' ? 'green' : 'purple'"
              >
                {{ record.type }}
              </Tag>
            </template>
            <template #attachments="{ record }">
              <TableImg
                v-if="record.type=='Credit' && !!record.paymentProofString"
                :size="60"
                :imgList="[uploadUrl+record.paymentProofString]"
              />
              <a-button
                v-else-if="record.type=='Debit' && !!record.invoiceNumber"
                type="primary"
                preIcon="ant-design:eye-outlined"
                @click="openInvoice(record)"
                shape="round"
              >
                {{ record.invoiceNumber }}
              </a-button>
            </template>
            <template #amount="{ record }">
              <span v-if="record.type == 'Credit'" class="positive-balance">
                +{{ record.amount }}
              </span>
              <span v-else>
                - {{ record.amount }}
              </span>
            </template>
            <template #shippingFee="{ record }">
              <span v-if="!!record.shippingFee">
                - {{ record.shippingFee }}
              </span>
            </template>
            <template #purchaseFee="{ record }">
              <span v-if="!!record.purchaseFee">
                - {{ record.purchaseFee }}
              </span>
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
                  <PopConfirmButton
                    type="warning"
                    shape="round"
                    title="Confirm making invoice ?"
                    preIcon="ant-design:download-outlined"
                    @confirm="makeInvoice"
                    :disabled="invoiceDisabled"
                    okText="ok" :loading="invoiceLoading"
                    cancelText="Cancel"
                  >
                    {{ t("data.invoice.generateShippingInvoice") }}
                  </PopConfirmButton>
                  <PopConfirmButton
                    type="warning"
                    shape="round"
                    title="Confirm making invoice ?"
                    preIcon="ant-design:download-outlined"
                    @confirm="makeCompleteInvoice"
                    :disabled="completeInvoiceDisabled"
                    okText="ok" :loading="completeInvoiceLoading"
                    cancelText="Cancel"
                  >
                    {{ t("data.invoice.generateInvoice7pre") }}
                  </PopConfirmButton>
                </a-row>
              </div>
            </template>
            <template #date="{ record }">
              {{ dayjs(record.createTime).isValid() ? dayjs(record.createTime).format('DD/MM').toString() : record.createTime }}
            </template>
            <template #transactionType="{ record }">
              <Tag
                :color="record.type === 'Credit' ? 'green' : 'purple'"
              >
                {{ record.type }}
              </Tag>
            </template>
            <template #attachments="{ record }">
              <TableImg
                v-if="record.type=='Credit' && !!record.paymentProofString"
                :size="60"
                :imgList="[uploadUrl+record.paymentProofString]"
              />
              <a-button
                v-else-if="record.type=='Debit' && !!record.invoiceNumber"
                type="primary"
                preIcon="ant-design:eye-outlined"
                @click="openInvoice(record)"
                shape="round"
              >
                {{ record.invoiceNumber }}
              </a-button>
            </template>
            <template #amount="{ record }">
              <span v-if="record.type == 'Credit'" class="positive-balance">
                +{{ record.amount }}
              </span>
              <span v-else>
          -{{ record.amount }}
        </span>
            </template>
            <template #shippingFee="{ record }">
        <span v-if="!!record.shippingFee">
          -{{ record.shippingFee }}
        </span>
            </template>
            <template #purchaseFee="{ record }">
        <span v-if="!!record.purchaseFee">
          -{{ record.purchaseFee }}
        </span>
            </template>
            <template #imgs="{ text }">
              <TableImg
                v-if="!!text"
                :size="60"
                :imgList="[uploadUrl+text]"
              />
            </template>
          </BasicTable>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </PageWrapper>
</template>
<script lang="ts">

import {defineComponent, onBeforeMount, onUnmounted, reactive, ref} from "vue";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {TableImg, useTable} from "/@/components/Table";
import { PageWrapper } from '/@/components/Page';
import {PopConfirmButton} from "/@/components/Button";
import {Form, Tag} from "ant-design-vue";
import {getColumns} from "/@/views/business/client/overview/data";

import {useI18n} from "/@/hooks/web/useI18n";
import {defHttp} from "/@/utils/http/axios";
import {useMessage} from "/@/hooks/web/useMessage";

import JSearchSelect from "/@/components/Form/src/jeecg/components/JSearchSelect.vue";
import dayjs from "dayjs";
import {downloadFile} from "/@/api/common/api";
import {useGlobSetting} from "/@/hooks/setting";
import {useRouter} from 'vue-router';

export default defineComponent({
  methods: {dayjs},
  components: {
    JSearchSelect,
    TableImg, Tag, PopConfirmButton, PageWrapper, BasicTable
  },
  setup() {
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

    const Api = {
      getClient: '/userClient/getClient',
      getBalance: '/balance/getBalanceByClientIdAndCurrency',
      list: '/transaction/listByClientAndCurrency',
      debit: '/transaction/debit',
      purchase: '/transaction/purchase',
      makeShippingInvoice: '/shippingInvoice/make',
      makeCompleteShippingInvoice: '/shippingInvoice/makeComplete',
      downloadInvoice: '/shippingInvoice/download',
      downloadInvoiceDetail: '/shippingInvoice/downloadInvoiceDetail',
    };
    const customerList = ref<any[]>([]);
    const customerSelectList = ref<any[]>([]);
    const customerListDisabled = ref<boolean>(false);

    const imgHost = "http://localhost:8080";
    const imgPath = "/jeecg-boot/sys/common/static/";
    const client = ref();
    const currency = ref();
    const fullName = ref();
    const invoiceEntity = ref();
    const currencySymbol = ref();
    const balanceEur = ref(0);
    const balanceUsd = ref(0);
    const estimatedBalanceEur = ref(0);
    const estimatedBalanceUsd = ref(0);

    const invoiceDisabled = ref<boolean>(true);
    const invoiceLoading = ref<boolean>(false);
    const completeInvoiceDisabled = ref<boolean>(true);
    const completeInvoiceLoading = ref<boolean>(false);

    const eurTableLoading = ref<boolean>(true);
    const usdTableLoading = ref<boolean>(true);

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
      showTotal: (total, range) => {
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
      showTotal: (total, range) => {
        return range[0] + '-' + range[1] + ' of ' + total + ' items';
      },
    });
    const [registerTable] = useTable({
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
    });
    async function checkUser() {
      defHttp.get({url: Api.getClient})
        .then(res => {
          if(res.internal) {
            customerList.value = res.internal;
            customerSelectList.value = res.internal.map(
              client => ({
                text: `${client.firstName} ${client.surname} (${client.internalCode})`,
                value: client.id,
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
      client.value = [];
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
      if(id) {
        let index = customerList.value.map(i => i.id).indexOf(id);
        loadClient(customerList.value[index]);
      }
    }
    function loadClient(clientParam: any) {
      client.value = clientParam;
      client.value["category"] = client.value.clientCategoryId;
      delete client.value['clientCategoryId'];
      currency.value = client.value.currency;
      fullName.value = `${client.value.firstName} ${client.value.surname}`
      invoiceEntity.value = client.value.invoiceEntity;
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
      defHttp.get({url: Api.getBalance, params: {clientId: client.value.id, currency: "EUR"}, signal: signal})
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
      defHttp.get({url: Api.getBalance, params: {clientId: client.value.id, currency: "USD"}, signal: signal})
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
    // TODO : implémenter l'affichage des factures d'achat manuels
    function loadTransactions(currency) {
      const params = {
        clientId: client.value.id,
        currency: currency
      }
      defHttp.get({ url: Api.list, params, signal: signal })
        .then(res => {
          //TODO : add condition client type 1,2,3
          if(currency === "EUR") {
            transactionsEur.value = res;
            loadTransactions("USD");
          }
          else {
            transactionsUsd.value = res;
            if(client.value.category != 'self-service')
              loadDebit(client.value.currency);
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
        });
    }
    function loadDebit(currency) {
      defHttp.get({url: Api.debit, params: { clientId: client.value.id, currency: currency }, signal: signal})
        .then(res => {
          debit.value = {
            id: '0',
            createTime: 'Estimation',
            type: 'Debit',
            clientId: `${client.value.id}`,
            paymentProofString: '',
            invoiceNumber: '',
            shippingFee: res.shippingFeesEstimation,
            purchaseFee: res.purchaseEstimation,
            amount: res.totalEstimation,
            currency: currency
          };
          // ajout de la ligne de début au début du tableau
          if(currency === "EUR") {
            transactionsEur.value.unshift(debit.value);
            estimatedBalanceEur.value = balanceEur.value - debit.value.amount;
            estimatedBalanceUsd.value = balanceUsd.value;
          }
          else {
            transactionsUsd.value.unshift(debit.value);
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
          colorizeRows();
        });
    }
    function makeInvoice() {
      invoiceDisabled.value = true;
      invoiceLoading.value = true;
      let start = startDate.value.slice(0, -9);
      let end = endDate.value.slice(0, -9);
      end = dayjs(end).add(1, 'days').format('YYYY-MM-DD').toString();
      let params = {
        clientID: client.value.id,
        shopIDs: shopIds.value,
        type: "pre-shipping",
        start: start,
        end : end,
        erpStatuses : ['1', '2'],
        warehouses: ['0', '1']
      }
      defHttp.post({url: Api.makeShippingInvoice, params })
        .then(res => {
          let invoiceFilename = res.filename;
          let invoiceNumber = res.invoiceCode;
          downloadInvoice(invoiceFilename);
          downloadDetailFile(invoiceNumber);
          invoiceLoading.value = false;
          shopIds.value = [];
          startDate.value = '';
          endDate.value = '';
          loadTransactions("EUR");
        })
        .catch(e => {
          console.error(e);
        });
    }
    function makeCompleteInvoice() {let start = startDate.value.slice(0, -9);
      completeInvoiceLoading.value = true;
      completeInvoiceDisabled.value = true;

      let end = endDate.value.slice(0, -9);
      end = dayjs(end).add(1, 'days').format('YYYY-MM-DD').toString();
      let params = {
        clientID: client.value.id,
        shopIDs: shopIds.value,
        type: "pre-shipping",
        start: start,
        end : end,
        erpStatuses : ['1', '2'],
        warehouses: ['0', '1']
      }
      defHttp.post({url: Api.makeCompleteShippingInvoice, params})
        .then(res => {
          let invoiceFilename = res.filename;
          let invoiceNumber = res.invoiceCode;
          downloadInvoice(invoiceFilename);
          downloadDetailFile(invoiceNumber);
          completeInvoiceLoading.value = false;
          shopIds.value = [];
          startDate.value = '';
          endDate.value = '';
          loadTransactions("EUR");
        })
        .catch(e => {
          console.error(e);
        })
    }
    function downloadInvoice(invoiceFilename) {
      const param = {filename: invoiceFilename};
      downloadFile(Api.downloadInvoice, invoiceFilename, param).then(() => {
        createMessage.info("Download successful.")
      }).catch(e => {
        console.error(`Download invoice fail : ${e}`);
      });
    }
    function downloadDetailFile(invoiceNumber) {
      const param =
        {
          invoiceNumber: invoiceNumber,
          invoiceEntity: client.value.invoiceEntity,
          internalCode: client.value.internalCode
        }
      let now = dayjs().format("YYYYMMDD");
      let detailFilename = client.value.internalCode + "_(" + client.value.invoiceEntity + ")_" + invoiceNumber + '_Détail_calcul_de_facture_' + now + '.xlsx';
      downloadFile(Api.downloadInvoiceDetail, detailFilename, param).then(() => {
        createMessage.info("Download successful.")
      }).catch(e => {
        console.error(`Download invoice detail fail : ${e}`);
      });
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
        if(children[1].textContent == 'Debit') {
          children[0].style.borderLeftStyle = "solid";
          children[0].style.borderLeftColor = debitColor;
          children[0].style.borderLeftWidth = "5px";
        }
        if(children[1].textContent == 'Credit') {
          children[0].style.borderLeftStyle = "solid";
          children[0].style.borderLeftColor = creditColor;
          children[0].style.borderLeftWidth = "5px";
        }
      });
      eurTableLoading.value = false;
      usdTableLoading.value = false;
    }
    return {
      handleClientChange,
      registerTable,
      registerUSDTable,
      makeInvoice,
      makeCompleteInvoice,
      openInvoice,
      t,
      createMessage,
      internalUse,
      formRef,
      labelCol,
      wrapperCol,
      validatorRules,
      formState,
      validateInfos,
      invoiceDisabled,
      invoiceLoading,
      completeInvoiceDisabled,
      completeInvoiceLoading,
      customerSelectList,
      customerListDisabled,
      uploadUrl,
      client,
      fullName,
      invoiceEntity,
      currency,
      currencySymbol,
      balanceEur,
      balanceUsd,
      estimatedBalanceEur,
      estimatedBalanceUsd,
    }
  }
})
</script>

<style lang="less">
@geekBlue: #1d39c4;
@geekBlueBg : #F0F5FF;
@lightGeekBlue : lighten(@geekBlue, 15%);
@balancePositive : #5cc290;
@volcano: #c73333;

.jeecg-basic-table {
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
.ant-card.card-header {
  margin: 10px;
  border-radius: 1em;
  h1 {
    font-size: 2em;
  }
}
.ant-tabs-top > .ant-tabs-nav{
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
.jeecg-basic-table-header__tableTitle {
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
    gap: 1em;
    padding: 1em;
  }
  & > * {
    margin-right: 0;
  }
}
.jeecg-basic-table-header__toolbar {
  display: none;
}
.ant-tag {
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
.ant-btn-primary,.ant-pagination.mini .ant-pagination-item-active {
  border-color: @geekBlue !important;
  background-color: @geekBlue !important;
  color: @geekBlueBg !important;
  &:hover {
    background-color: @lightGeekBlue !important;
    border-color: @lightGeekBlue !important;
  }
}
.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn ,
.ant-tabs-tab-btn:focus, .ant-tabs-tab-remove:focus, .ant-tabs-tab-btn:active, .ant-tabs-tab-remove:active,.ant-tabs-tab:hover,
.ant-pagination.mini .ant-pagination-prev:hover a, .ant-pagination.mini .ant-pagination-next:hover a, .ant-pagination.mini .ant-pagination-item:focus a, .ant-pagination.mini .ant-pagination-item:hover a{
  color: @geekBlue;
}
.ant-tabs-ink-bar {
  background: @geekBlue;
}
</style>
