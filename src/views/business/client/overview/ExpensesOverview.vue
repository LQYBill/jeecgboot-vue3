<template>
  <Exception v-if="!access" :status="status" />
  <PageWrapper title='Expenses Overview'>
    <a-card>
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
      <a-tabs defaultActiveKey="1" style="margin: 10px" v-if="client">
        <a-tab-pane tab="EUR" key="1">
          <BasicTable @register="registerTable">
            <template #tableTitle>
              <div style="padding: 0 1em; width: 100%">
                <h1>{{ t('data.transaction.accountTransactions') }} (EUR) <br/>
                  <span style='font-weight: 200'>{{ fullName }} ( {{ invoiceEntity }} )</span>
                </h1>
                <a-row type="flex" justify='space-between' style="align-items:baseline">
                  <h2>
                    {{ t('data.client.accountBalance') }} :
                    <Tag
                      :color="balanceEur >= 0 ? 'geekblue' : 'volcano'"
                    >
                      {{ balanceEur }} €
                    </Tag>
                  </h2>
                  <h3>{{ t("data.client.preferredCurrency") }} : {{ currency }} / {{ currencySymbol }}</h3>
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
                    {{ t("data.invoice.generateShippingInvoice") }}
                  </PopConfirmButton>
                </a-row>
              </div>
            </template>

            <template v-slot:transactionType="record">
              <Tag
                :color="record.record.type === 'Credit' ? 'success' : 'purple'"
              >
                {{ record.record.type }}
              </Tag>
            </template>
            <template v-slot:invoiceNumber="record">
              <a-button
                v-if="!!record.record.invoiceNumber"
                type="primary"
                preIcon="ant-design:eye-outlined"
                @click="openInvoice(record.record)"
                shape="round"
              >
                {{ record.record.invoiceNumber }}
              </a-button>
            </template>
            <template v-slot:amount="record">
              <Tag
                v-if="record.record.type == 'Credit'"
                color="success"
              >
                +{{ record.record.amount }}
              </Tag>
              <span v-else>
          -{{ record.record.amount }}
        </span>
            </template>
            <template v-slot:shippingFee="record">
        <span v-if="!!record.record.shippingFee">
          -{{ record.record.shippingFee }}
        </span>
            </template>
            <template v-slot:purchaseFee="record">
        <span v-if="!!record.record.purchaseFee">
          -{{ record.record.purchaseFee }}
        </span>
            </template>
            <template #imgs="{ text }">
              <TableImg
                v-if="!!text"
                :size="60"
                :imgList="[imgHost+imgPath+text]"
              />
            </template>
          </BasicTable>
        </a-tab-pane>
        <a-tab-pane tab="USD" key="2" forceRender>
          <BasicTable @register="registerUSDTable">
            <template #tableTitle>
              <div style="padding: 0 1em; width: 100%;">
                <h1>{{ t('data.transaction.accountTransactions') }} (USD) <br/>
                  <span style='font-weight: 200'>{{ fullName }} ( {{ invoiceEntity }} )</span>
                </h1>
                <a-row type="flex" justify='space-between' style="align-items:baseline">
                  <h2 >
                    {{ t('data.client.accountBalance') }} :
                    <Tag
                      :color="balanceUsd >= 0 ? 'geekblue' : 'volcano'"
                    >
                      {{ balanceUsd }} $
                    </Tag>
                  </h2>
                  <h3>{{ t("data.client.preferredCurrency") }} : {{ currency }} / {{ currencySymbol }}</h3>
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
                    {{ t("data.invoice.generateShippingInvoice") }}
                  </PopConfirmButton>
                </a-row>
              </div>
            </template>
            <template v-slot:transactionType="record">
              <Tag
                :color="record.record.type === 'Credit' ? 'success' : 'purple'"
              >
                {{ record.record.type }}
              </Tag>
            </template>
            <template v-slot:invoiceNumber="record">
              <a-button
                v-if="!!record.record.invoiceNumber"
                type="primary"
                preIcon="ant-design:eye-outlined"
                @click="openInvoice(record.record)"
                shape="round"
              >
                {{ record.record.invoiceNumber }}
              </a-button>
            </template>
            <template v-slot:amount="record">
              <Tag
                v-if="record.record.type == 'Credit'"
                color="success"
              >
                +{{ record.record.amount }}
              </Tag>
              <span v-else>
          -{{ record.record.amount }}
        </span>
            </template>
            <template v-slot:shippingFee="record">
        <span v-if="!!record.record.shippingFee">
          -{{ record.record.shippingFee }}
        </span>
            </template>
            <template v-slot:purchaseFee="record">
        <span v-if="!!record.record.purchaseFee">
          -{{ record.record.purchaseFee }}
        </span>
            </template>
            <template #imgs="{ text }">
              <TableImg
                v-if="!!text"
                :size="60"
                :imgList="[imgHost+imgPath+text]"
              />
            </template>
          </BasicTable>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </PageWrapper>
</template>
<script lang="ts">

import {defineComponent, onBeforeMount, onMounted, reactive, ref, unref} from "vue";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {TableImg, useTable} from "/@/components/Table";
import PageWrapper from "/@/components/Page/src/PageWrapper.vue";
import {PopConfirmButton} from "/@/components/Button";
import {Form, Tag} from "ant-design-vue";
import {getColumns} from "/@/views/business/client/overview/data";

import {useI18n} from "/@/hooks/web/useI18n";
import {defHttp} from "/@/utils/http/axios";
import {useMessage} from "/@/hooks/web/useMessage";
import { useGo } from '/@/hooks/web/usePage';
import { useUserStore } from "/@/store/modules/user";

import {Exception} from "/@/views/sys/exception";
import { ExceptionEnum } from '/@/enums/exceptionEnum';
import JSearchSelect from "/@/components/Form/src/jeecg/components/JSearchSelect.vue";

export default defineComponent({
  methods: {unref},
  components: {
    JSearchSelect,
    Exception,
    TableImg, Tag, PopConfirmButton, PageWrapper, BasicTable},
  setup() {
    const userStore = useUserStore();
    const { t } = useI18n();
    const { createMessage } = useMessage();

    const internalUse = ref<boolean>(false);
    const status = ref();
    const access = ref(true);
    const go = useGo();

    const debitColor = "rgba(45, 0, 255, 0.1)";
    const creditColor = "rgba(11, 166, 101, 0.1)";

    onBeforeMount(()=> {
      checkUser();
    });

    // Form config
    const useForm = Form.useForm;
    const formRef = ref();
    const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 6 } });
    const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 18 } });
    const validatorRules = ref({
      customer: [{ required: true, message: t('component.searchForm.clientInputSearch'), trigger: 'blur' }],
    });
    const formState = reactive<Record<string, any>>({
      customer: '',
    });
    const { resetFields, validate, validateInfos } = useForm(formState, validatorRules, { immediate: false });

    const Api = {
      getClient: '/userClient/getClient',
      list: '/transaction/listByClientAndCurrency',
      debit: '/transaction/debit',
      purchase: '/transaction/purchase',
      makeShippingInvoice: '',
      makeCompleteShippingInvoice: '',
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
    const balanceEur = ref(-300);
    const balanceUsd = ref(987654);

    const invoiceDisabled = ref<boolean>(true);
    const invoiceLoading = ref<boolean>(false);
    const completeInvoiceDisabled = ref<boolean>(true);
    const completeInvoiceLoading = ref<boolean>(false);

    const eurTableLoading = ref<boolean>(true);
    const usdTableLoading = ref<boolean>(true);

    const transactionsEur = ref<any[]>([]);
    const transactionsUsd = ref<any[]>([]);
    const debit = ref();

    const checkedKeys = ref<Array<string | number>>([]);
    const selectRows = ref<any[]>([]);
    const ipagination = reactive({
      current: 1,
      pageSize: 100,
      pageSizeOptions: ['50', '100'],
      showQuickJumper: true,
      showSizeChanger: true,
      total: 0
    });
    const rowSelection = {
      type: 'checkbox',
      columnWidth: 30,
      selectedRowKeys: checkedKeys,
      onChange: onSelectChange,
      getCheckboxProps: getCheckboxProps,
    };
    const [registerTable] = useTable({
      dataSource: transactionsEur,
      columns: getColumns(),
      pagination: ipagination,
      bordered: true,
      striped: true,
      rowSelection: rowSelection,
      clickToRowSelect: false,
      showIndexColumn: true,
      indexColumnProps: {
        width: 60,
        title: "#"
      },
      rowKey: 'id',
      loading: eurTableLoading,
      scroll: {y: false}
    });
    const [registerUSDTable] = useTable({
      dataSource: transactionsUsd,
      columns: getColumns(),
      bordered: true,
      striped: true,
      rowSelection: rowSelection,
      clickToRowSelect: false,
      showIndexColumn: true,
      indexColumnProps: {
        width: 60,
        title: "#"
      },
      rowKey: 'id',
      loading: usdTableLoading,
    });
    // TODO : if user is admin, make a drop menu with all clients
    async function checkUser() {
      defHttp.get({url: Api.getClient})
        .then(res => {
          console.log(res);
          if(res.internal) {
            console.log('internal use');
            console.log(res.internal);
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
            console.log("ien-cli");
            loadClient(res.client);
          }
        })
        .catch(e => {
          console.error(e);
          status.value = ExceptionEnum.PAGE_NOT_ACCESS
          access.value = false;
        })
    }
    function handleClientChange(id: any) {
      let index = customerList.value.map(i => i.id).indexOf(id);
      loadClient(customerList.value[index]);
    }
    function loadClient(clientParam: any) {
      console.log(clientParam);
      client.value = clientParam;
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
      loadTransactions("EUR");
    }
    function loadTransactions(currency) {
      // TODO change
      const params = {
        clientId: client.value.id,
        currency: currency
      }
      defHttp.get({ url: Api.list, params })
        .then(res => {
          //TODO : add condition client type 1,2,3
          if(currency === "EUR") {
            transactionsEur.value = res;
            loadTransactions("USD");
          }
          else {
            transactionsUsd.value = res;
            loadDebit(client.value.currency);
          }
        })
        .catch(e => {
          status.value = ExceptionEnum.PAGE_NOT_ACCESS;
          access.value = false;
          console.error(e);
        });
    }
    function loadDebit(currency) {
      defHttp.get({url: Api.debit, params: { clientId: client.value.id, currency: currency }})
        .then(res => {
          console.log(`estimations : ${JSON.stringify(res)}`);
          console.log(`debit amount : ${res.totalEstimation}`);

          debit.value = {
            id: '0',
            createTime: '',
            type: 'Debit',
            clientId: `${client.value.id}`,
            paymentProofString: '',
            invoiceNumber: '',
            shippingFee: res.shippingFeesEstimation,
            purchaseFee: res.purchaseEstimation,
            amount: res.totalEstimation,
            currency: currency
          };
          if(currency === "EUR") {
            console.log("ajout debit euro");
            transactionsEur.value.push(debit.value);
          }
          else {
            console.log("ajout debit usd");
            transactionsUsd.value.push(debit.value);
          }
          createMessage.error(res.errorMessages);
        })
        .catch(e=> {
          console.error(e);
        })
        .finally(() => {
          colorizeRows();
        });
    }
    function makeInvoice() {
      defHttp.get({url: Api.makeShippingInvoice})
    }
    function makeCompleteInvoice() {
      defHttp.get({url: Api.makeCompleteShippingInvoice})
    }
    function openInvoice(record) {
      go(`/business/admin/shippingInvoice/Invoice?invoice=${record.invoiceNumber}`);
    }
    function onSelectChange(selectedRowKeys: (string | number)[], selectRow) {
      console.log(`---> selected row keys : ${selectedRowKeys}`)
      invoiceDisabled.value = selectedRowKeys.length <= 0;
      checkedKeys.value = selectedRowKeys;
      selectRows.value = selectRow;
    }
    function getCheckboxProps(record: Recordable) {
      return { disabled: record.id !== '0' };
    }

    /**
     * colorize debit and credit rows for better visibility
     * here we decided to only colorize type and amount column
     */
    function colorizeRows() {
      let rows = document.getElementsByClassName('ant-table-row-level-0');
      [].forEach.call(rows, function(row) {
        if(row.children[3].textContent == 'Debit') {
          // row.children[3].style.backgroundColor = "rgba(255, 114, 0, 0.1)";
          // row.children[8].style.backgroundColor = "rgba(255, 114, 0, 0.1)";
          row.children[3].style.backgroundColor = debitColor;
          row.children[8].style.backgroundColor = debitColor;
        }
        if(row.children[3].textContent == 'Credit') {
          row.children[3].style.backgroundColor = creditColor;
          row.children[8].style.backgroundColor = creditColor;
        }
        // for(let cell of row.children) {
        //   console.log(row.children[3].textContent);
        //   if(row.children[3].textContent == 'Debit') {
        //     cell.style.backgroundColor = "rgba(255, 114, 0, 0.3)";
        //   }
        //   if(row.children[3].textContent == 'Credit') {
        //     cell.style.backgroundColor = "rgba(11, 166, 101, 0.3)";
        //   }
        // }
      });
      eurTableLoading.value = false;
      usdTableLoading.value = false;
      console.log("Colorization finished.");
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
      access,
      status,
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
      imgHost,
      imgPath,
      client,
      fullName,
      invoiceEntity,
      currency,
      currencySymbol,
      balanceEur,
      balanceUsd,
    }
  }
})
</script>

<style>
.ant-card {
  background-color: transparent;
  .ant-card-body {
    min-height: 50vh;
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
    font-size: 1em;
    padding: 0.3em;
  }
  .invoiceToolbar {
    display: flex;
    gap: 1em;
  }
}
.jeecg-basic-table-header__toolbar {
  display: none;
}
</style>
