<template>
  <PageWrapper title="Invoicing Page">
    <a-card>
      <a-form v-if="internalUse" ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="validatorRules">
        <a-row>
          <a-col :span="6">
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
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="validatorRules">
        <a-row id="shop-search">
          <a-col :span="6">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              v-bind="validateInfos.name"
              name="shop"
            >
              <template #label>
                <span title="Shop">{{ t('data.invoice.shop') }}</span>
              </template>
              <JSelectMultiple
                :placeholder="t('component.searchForm.shopsInputSearch')"
                @change="handleShopChange"
                v-model:value="formState.shop"
                :options="shopList"
                allowClear
                :disabled="shopDisabled"
              />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-button type="primary" preIcon="ant-design:search-outlined" @click="loadOrders" :disabled="searchDisabled">{{ t('common.operation.search') }}</a-button>
          </a-col>
        </a-row>
        <a-row>
          <estimation-by-shop-card :estimates-ready="estimatesReady" :estimation="estimation"/>
        </a-row>
      </a-form>
      <BasicTable @register="registerTable" id="orders-list-table">
        <template #tableTitle>
          <PopConfirmButton
            type="primary"
            title="Confirm making shipping invoice ?"
            preIcon="ant-design:rocket-outlined"
            @confirm="makeManualShippingInvoice"
            :disabled="makeShippingDisabled"
            okText="ok" :loading="makeShippingLoading"
            cancelText="Cancel"
          >
            {{ t("data.invoice.generateShippingInvoice") }}
          </PopConfirmButton>
          <PopConfirmButton
            type="success"
            title="Confirm making purchase invoice ?"
            preIcon="ant-design:shopping-outlined"
            @confirm="makeManualPurchaseInvoice"
            :disabled="makePurchaseDisabled"
            okText="ok" :loading="makePurchaseLoading"
            cancelText="Cancel"
          >
            {{ t("data.invoice.generatePurchaseInvoice") }}
          </PopConfirmButton>
          <PopConfirmButton
            type="default"
            title="Confirm making purchase and shipping invoice ?"
            preIcon="ant-design:calculator-outlined"
            @confirm="makeCompleteManualInvoice"
            :disabled="makeCompleteDisabled"
            okText="ok" :loading="makeCompleteLoading"
            cancelText="Cancel"
          >
            {{ t("data.invoice.generateInvoice7pre") }}
          </PopConfirmButton>
          <a-button @click="openHelpModal" type="warning">Help</a-button>
        </template>
        <template #productAvailability="{record}">
          <Badge
            :status="record?.productAvailable === '1' ? 'success' : record?.productAvailable === '2' ? 'processing' : 'error'"
            :text="record?.productAvailable === '1' ? t('data.order.inStock') : record?.productAvailable === '2' ? t('data.order.ordered') : t('data.order.outOfStock')"
          />
        </template>
        <template #shippingAvailability="{record}">
          <Tag
            :color="record?.shippingAvailable === '0' ? 'green' : record?.shippingAvailable === '1' ? 'yellow' : record?.shippingAvailable === '2' ? 'blue' : 'volcano'"
          >
            {{ record?.shippingAvailable === '0' ? t("common.available") : record?.shippingAvailable === '1' ? t('data.invoice.invoiced') : record?.shippingAvailable === '2' ? t("data.invoice.paid") : t("common.unavailable") }}
          </Tag>
        </template>
        <template #purchaseAvailability="{record}">
          <Tag
            :color="record?.purchaseAvailable === '0' ? 'green' : record?.purchaseAvailable === '1' ? 'yellow' : record?.purchaseAvailable === '2' ? 'blue' : 'volcano'"
          >
            {{ record?.purchaseAvailable === '0' ? t("common.available") : record?.purchaseAvailable === '1' ? t('data.invoice.invoiced') : record?.purchaseAvailable === '2' ? t("data.invoice.paid") : t("common.unavailable") }}
          </Tag>
        </template>
      </BasicTable>
    </a-card>
    <InvoicingHelpModal @register="registerModal" @success="" @guide="startGuide"/>
  </PageWrapper>
</template>
<script lang="ts" setup>

import {onBeforeMount, reactive, ref} from "vue";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {useI18n} from "/@/hooks/web/useI18n";
import {useMessage} from "/@/hooks/web/useMessage";
import {useTable} from "/@/components/Table";
import { PageWrapper } from '/@/components/Page';
import {getColumns} from "/@/views/business/client/invoicing/data";
import {defHttp} from "/@/utils/http/axios";
import JSelectMultiple from "/@/components/Form/src/jeecg/components/JSelectMultiple.vue";
import {Badge, Form, Tag} from "ant-design-vue";
import dayjs from "dayjs";
import {downloadFile} from "/@/api/common/api";
import {PopConfirmButton} from "/@/components/Button";
import JSearchSelect from "/@/components/Form/src/jeecg/components/JSearchSelect.vue";
import intro from "intro.js";
import {useModal} from "@/components/Modal";
import InvoicingHelpModal from "@/views/business/client/_components/InvoicingHelpModal.vue";
import {estimation as estimationDTO} from "@/views/business/dto/estimation.dto";
import EstimationByShopCard from "@/views/business/components/EstimationByShopCard.vue";

const { t } = useI18n();
const { createMessage } = useMessage();

onBeforeMount(() => {
  checkUser();
});

const useForm = Form.useForm;
const formRef = ref();
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 6 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 18 } });
const validatorRules = ref({
  shop: [{required: true, message: t('component.searchForm.countryInputSearch'), trigger: 'change'}],
});
const formState = reactive<Record<string, any>>({
  shop: '',
});
const { validateInfos } = useForm(formState, validatorRules, { immediate: false });

const Api = {
  getClient: "/userClient/getClient",
  getSelfServiceClients: "/userClient/getSelfServiceClients",
  getShops: "/shippingInvoice/shopsByClient",
  getOrders: "/shippingInvoice/preShipping/ordersStatusByShops",
  completeFeesEstimation: '/shippingInvoice/completeFeesEstimation',
  makeManualShippingInvoice: "/shippingInvoice/makeManualInvoice",
  makeManualPurchaseInvoice: "/shippingInvoice/makeManualPurchaseInvoice",
  makeCompleteManualInvoice: "/shippingInvoice/makeManualComplete",
  downloadInvoice: "/shippingInvoice/download",
  downloadInvoiceDetail: "/shippingInvoice/downloadInvoiceDetail",
}

const internalUse = ref<boolean>(false);

const customerList = ref<any[]>([]);
const customerSelectList = ref<any[]>([]);
const customerListDisabled = ref<boolean>(false);

const client = ref();

const orderList = ref<any[]>([]);
const ordersAndStatusList = ref<any[]>([]);
const shopList = ref<any[]>([]);

const selectedShopIds = ref<any[]>([]);

const searchDisabled = ref<boolean>(true);
const shopDisabled = ref<boolean>(false);
const makeShippingDisabled = ref<boolean>(true);
const makeShippingLoading = ref<boolean>(false);
const makePurchaseDisabled = ref<boolean>(true);
const makePurchaseLoading = ref<boolean>(false);
const makeCompleteDisabled = ref<boolean>(true);
const makeCompleteLoading = ref<boolean>(false);

const estimatesReady = ref<boolean>(true);
const estimation = ref<any[]>([]);

const iSorter = ref({
  field: 'shopId',
  order: 'ascend'
});
let ipagination = ref({
  current: 1,
  defaultPageSize: 50,
  pageSize: 50,
  pageSizeOptions: ['50', '100', '200', '500'],
  showTotal: (total, range) => {
    return range[0] + '-' + range[1] + ' / ' + total
  },
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
});

const [registerModal, {openModal}] = useModal();
const [registerTable, { clearSelectedRowKeys, getSelectRows, getSelectRowKeys, setLoading }] = useTable({
  columns: getColumns(),
  dataSource: orderList,
  rowSelection: {
    type: 'checkbox',
    onChange: onSelectChange,
    getCheckboxProps: getCheckboxProps
  },
  pagination: ipagination,
  defSort: iSorter,
  bordered: false,
  striped: true,
  clickToRowSelect: true,
  showIndexColumn: true,
  ellipsis: false,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  canResize: false,
  rowKey: 'id',
});

function checkUser() {
  shopDisabled.value = true;
  defHttp.get({url: Api.getClient})
    .then(res => {
      if(res.internal) {
        internalUse.value = true;
        loadClientList();
      }
      else {
        client.value = res.client;
        loadShopList(client.value.id);
      }
      shopDisabled.value = false;
    })
    .catch(e => {
      console.error(e);
    });
}
function loadClientList() {
  defHttp.get({url: Api.getSelfServiceClients})
    .then(res => {
      customerList.value = res;
      customerSelectList.value = res.map(
        client => ({
          text: `${client.firstName} ${client.surname} (${client.internalCode})`,
          value: client.id,
        })
      );
    })
    .catch(e => {
      console.error(e);
    })
}
async function handleClientChange(id: any) {
  client.value = [];
  if (id) {
    let index = customerList.value.map(i => i.id).indexOf(id);
    client.value = customerList.value[index];
    await new Promise(resolve => {
      setTimeout(resolve, 100)
    });
    loadShopList(id);
  }
}
function loadShopList(clientId) {
  clearSelectedRowKeys();
  defHttp.get({url : Api.getShops, params: {clientID: clientId}})
    .then(res => {
      shopList.value = res.map(
        shop => ({
          label: shop.name,
          value: shop.id,
        })
      );
      shopDisabled.value = false;
    })
    .catch(e => {
      console.error(e);
    })
    .finally(() => {
      if(localStorage.clientInvoicingGuideWatched !== 'true')
        startGuide();
    });
}
function handleShopChange(shops) {
  // value returned is array of shop
  clearSelectedRowKeys();
  orderList.value = [];
  ordersAndStatusList.value = [];
  selectedShopIds.value = shops;
  makeShippingDisabled.value = true;
  makeShippingLoading.value = false;
  makePurchaseDisabled.value = true;
  makePurchaseLoading.value = false;
  makeCompleteDisabled.value = true;
  makeCompleteLoading.value = false;
  searchDisabled.value = selectedShopIds.value.length === 0;
}
function loadOrders() {
  orderList.value = [];
  ordersAndStatusList.value = [];
  makeShippingDisabled.value = true;
  makeShippingLoading.value = false;
  makePurchaseDisabled.value = true;
  makePurchaseLoading.value = false;
  makeCompleteDisabled.value = true;
  makeCompleteLoading.value = false;
  clearSelectedRowKeys();
  setLoading(true);
  defHttp.get({url : Api.getOrders, params: {shopIds: selectedShopIds.value}})
    .then(res => {
      ordersAndStatusList.value = res.records;
      orderList.value = res.records;
    })
    .catch(e => {
      console.error(e);
    })
    .finally(() => {
      setLoading(false)
    });
}
function onSelectChange(selectedRowKeys: (string | number)[], selectionRows) {
  makeShippingDisabled.value = true;
  makePurchaseDisabled.value = true;
  makeCompleteDisabled.value = true;
  if(selectedRowKeys.length == 0) {
    estimation.value = [];
    return;
  }
  estimatesReady.value = false;
  // deactivate undesired checked keys and buttons
  let uncheckableRowKeys:any[] = [];
  let shippingInvoiceAvailable = true;
  let purchaseInvoiceAvailable = true;
  for(let row of selectionRows){
    if(['-1','1','2'].indexOf(row.shippingAvailable) > -1 && ['-1', '1', '2'].indexOf(row.purchaseAvailable) > -1) {
      uncheckableRowKeys.push(row.id);
    }
    if(['-1','1','2'].indexOf(row.shippingAvailable) > -1)
      shippingInvoiceAvailable = false;
    if(['-1', '1', '2'].indexOf(row.purchaseAvailable) > -1)
      purchaseInvoiceAvailable = false;
    if(row.productAvailable == '1') // product already in stock
      purchaseInvoiceAvailable = false;
  }
  makeShippingDisabled.value = !shippingInvoiceAvailable;
  makePurchaseDisabled.value = !purchaseInvoiceAvailable;
  makeCompleteDisabled.value = !(shippingInvoiceAvailable && purchaseInvoiceAvailable);

  for(let idx of uncheckableRowKeys) {
    let index = selectedRowKeys.indexOf(idx);
    selectedRowKeys.splice(index, 1);
  }
  let param = {
    clientID: client.value.id,
    orderIds: getSelectRowKeys(),
    type: "preshipping",
  };
  defHttp.post({url: Api.completeFeesEstimation, params: param})
    .then(
      (res:{[key: string]: estimationDTO}) => {
        estimation.value = [];
        for(let shop in res) {
          // let shopName = getShopName(shop);
          let shopEstimation = res[shop];
          // shopEstimation.shop = shopName;
          estimation.value.push(shopEstimation);
        }
        estimatesReady.value = true;
      }
    ).catch(e => {
      console.error(e);
    });
}
function getShopName(shopId: string) {
  for(let shopDict of shopList.value) {
    if(shopDict.value == shopId) {
      return shopDict.label;
    }
  }
}
function getCheckboxProps(record: Recordable) {
  // -1 : unavailable, 0 : available, 1 : invoiced, 2 : paid
  if (['-1','1','2'].indexOf(record.shippingAvailable) > -1 && ['-1', '1', '2'].indexOf(record.purchaseAvailable) > -1) {
    return { disabled: true };
  } else {
    return { disabled: false };
  }
}
function getPeriod() {
  let tmpStart = dayjs(getSelectRows()[0].orderTime);
  let start = getSelectRows()[0].orderTime.slice(0, -9);
  let tmpEnd = dayjs(getSelectRows()[0].orderTime);
  let end = getSelectRows()[0].orderTime.slice(0, -9);
  for(let order of getSelectRows()) {
    if(dayjs(order.orderTime).isBefore(tmpStart)) {
      tmpStart = dayjs(order.orderTime);
      start = order.orderTime.slice(0, -9);
    }
    if(dayjs(order.orderTime).isAfter(tmpEnd)) {
      tmpEnd = dayjs(order.orderTime);
      end = order.orderTime.slice(0, -9);
    }
  }
  end = dayjs(end).add(1, 'days').format('YYYY-MM-DD').toString();
  return {
    start: start,
    end: end,
  }
}
function makeManualShippingInvoice() {
  let period = getPeriod();
  const params = {
    clientID: client.value.id,
    orderIds: getSelectRowKeys(),
    type: "pre-shipping",
    start: period.start,
    end: period.end,
  };
  shopDisabled.value = true;
  searchDisabled.value = true;
  makeShippingDisabled.value = true;
  makePurchaseDisabled.value = true;
  makeCompleteDisabled.value = true;
  setLoading(true);
  makeShippingLoading.value = true;
  defHttp.post({url: Api.makeManualShippingInvoice, params})
    .then(res => {
      createMessage.success(t('sys.invoice.success'));

      let filename = res.filename;
      let code = res.invoiceCode;
      downloadInvoice(filename, 'shipping');
      downloadDetailFile(code);
    })
    .catch(e => {
      console.error(e);
    })
    .finally(() => {
      clearSelectedRowKeys();
      shopDisabled.value = false;
      searchDisabled.value = false;
      loadOrders();
      makeShippingLoading.value = false;
    });
}
function makeManualPurchaseInvoice() {
  let period = getPeriod();
  const params = {
    clientID: client.value.id,
    orderIds: getSelectRowKeys(),
    type: "pre-shipping",
    start: period.start,
    end: period.end,
  };
  shopDisabled.value = true;
  searchDisabled.value = true;
  makeShippingDisabled.value = true;
  makePurchaseDisabled.value = true;
  makeCompleteDisabled.value = true;
  setLoading(true);
  makePurchaseLoading.value = true;
  defHttp.post({url: Api.makeManualPurchaseInvoice, params})
    .then(res => {
      createMessage.success("Orders have been invoiced successfully");

      let filename = res.filename;
      let code = res.invoiceCode;
      downloadInvoice(filename, 'purchase');
    })
    .catch(e => {
      console.error(e);
    })
    .finally(() => {
      clearSelectedRowKeys();
      shopDisabled.value = false;
      searchDisabled.value = false;
      loadOrders();
      makePurchaseLoading.value = false;
    });
}
function makeCompleteManualInvoice() {
  let period = getPeriod();
  const params = {
    clientID: client.value.id,
    orderIds: getSelectRowKeys(),
    type: "pre-shipping",
    start: period.start,
    end: period.end,
  };
  shopDisabled.value = true;
  searchDisabled.value = true;
  makeShippingDisabled.value = true;
  makePurchaseDisabled.value = true;
  makeCompleteDisabled.value = true;
  setLoading(true);
  makeCompleteLoading.value = true;
  defHttp.post({url: Api.makeCompleteManualInvoice, params})
    .then(res => {
      createMessage.success("Orders have been invoiced successfully");

      let filename = res.filename;
      let code = res.invoiceCode;
      downloadInvoice(filename, 'shipping');
      downloadDetailFile(code);
    })
    .catch(e => {
      console.error(e);
    })
    .finally(() => {
      clearSelectedRowKeys();
      shopDisabled.value = false;
      searchDisabled.value = false;
      loadOrders();
      makeCompleteLoading.value = false;
    });
}
function downloadInvoice(invoiceFilename, invoiceType) {
  const param = {filename: invoiceFilename, type: invoiceType};
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
  let detailFilename = client.value?.internalCode + "_(" + client.value.invoiceEntity + ")_" + invoiceNumber + '_Détail_calcul_de_facture_' + now + '.xlsx';
  downloadFile(Api.downloadInvoiceDetail, detailFilename, param).then(() => {
    createMessage.info("Download successful.")
  }).catch(e => {
    console.error(`Download invoice detail fail : ${e}`);
  });
}
function startGuide() {
  intro().
  setOptions({
    steps: [
      {
        title: 'Invoicing guide',
        intro: `Hello <b>${client.value.firstName}</b>!👋<br/> Here is a guide to help you invoice your orders.`,
      },
      {
        title: 'First step',
        element: document.querySelector(`#shop-search`)!,
        intro: 'First select the shop(s) you want to invoice.',
      },
      {
        title: 'List of orders to invoice',
        element: document.querySelector(`#orders-list-table`)!,
        intro: 'Orders that are available to be invoiced will be listed here.<br/> It may take a few seconds to load the orders, so be patient ;).',
      },
      {
        title: 'Estimation of fees',
        element: document.querySelector(`.cardGridContainer`)!,
        intro: 'Fees estimation for the selected orders will be displayed here.',
      },
    ],
  })
    .start();
  localStorage.clientInvoicingGuideWatched = 'true';
}
function openHelpModal() {
  openModal(true, { })
}
</script>
<style lang="less">
@geekBlue: #1d39c4;
@geekBlueBg : #F0F5FF;
@lightGeekBlue : lighten(@geekBlue, 15%);
@balancePositive : #5cc290;
@volcano: #c73333;

.ant-btn-primary,.ant-pagination.mini .ant-pagination-item-active {
  border-color: @geekBlue !important;
  background-color: @geekBlue !important;
  color: @geekBlueBg !important;
  &:hover {
    background-color: @lightGeekBlue !important;
    border-color: @lightGeekBlue !important;
  }
}
.ant-checkbox-disabled .ant-checkbox-inner{
  background-color: fade(@error-color, 10%);
  border-color: @error-color!important;
}
.ant-tag {
  border-radius: 1em;
  &.num-tag {
    font-size: 1em;
  }
}
.cardGridContainer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  background: #fff;
  border: 1px #f0f0f0 solid;
  border-radius: 5px;
  text-align: center;
  min-height: 170px;
  .fee-card {
    min-height: 170px;
    width: 20%;
    padding: 1.2rem;
    border-width: 1px;
    border-style: solid;
    border-color: #ffffff00;
    transition: all 0.5s cubic-bezier(0.46, 0.03, 0.52, 0.96);
    &:hover {
      background-color: #f5f5f5;
      border-radius: 5px;
    }
  }
}
.ant-card-loading-content {
  min-height: 170px;
}
</style>
