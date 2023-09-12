<template>
  <PageWrapper title="Invoicing Page">
    <a-card>
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="validatorRules">
        <a-row>
          <a-col :span="5">
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
                :placeholder="t('component.searchForm.shopInputSearch')"
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
          <a-card
            :bordered='false'
            :title='t("data.invoice.shippingFeesEstimationForSelectedOrders")'
            :loading='!estimatesReady'
            style="width: 100%">
            <div class="cardGridContainer">
              <p class="mt-4" style="width: 100%" v-if='shippingFeesEstimates.length === 0'>{{t("data.invoice.noOrdersSelected")}}</p>
              <template v-for='item in shippingFeesEstimates' style='width:20%;text-align:center'>
                <div class="fee-card">
                  <div class="flex flex-col items-center head-info">
                    <span class="text-md mt-2">{{item.shop}}</span>
                    <p class="text-md mt-2">{{item.dueForProcessedOrders}} €</p>
                  </div>
                </div>
              </template>
            </div>
          </a-card>
        </a-row>
      </a-form>
      <BasicTable @register="registerTable">
        <template #tableTitle>
          <PopConfirmButton
            type="warning"
            title="Confirm making invoice ?"
            preIcon="ant-design:edit-outlined"
            @confirm="makeManualInvoice"
            :disabled="makeManualInvoiceDisabled"
            okText="ok" :loading="makeManualInvoiceLoading"
            cancelText="Cancel"
          >
            {{ t("data.invoice.generateInvoice") }}
          </PopConfirmButton>
        </template>
        <template v-slot:productAvailability="record">
          <Tag
            :color="record.record.productAvailable === '1' ? 'green' : 'volcano'"
          >
            {{ record.record.productAvailable=== '1' ? t("data.order.inStock") : t("data.order.outOfStock") }}
          </Tag>
        </template>
      </BasicTable>
    </a-card>
  </PageWrapper>
</template>
<script lang="ts" setup>

import {defineComponent, onMounted, reactive, ref} from "vue";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {useI18n} from "/@/hooks/web/useI18n";
import {useMessage} from "/@/hooks/web/useMessage";
import {useTable} from "/@/components/Table";
import PageWrapper from "/@/components/Page/src/PageWrapper.vue";
import {getColumns} from "/@/views/business/client/invoicing/data";
import {defHttp} from "/@/utils/http/axios";
import JSelectMultiple from "/@/components/Form/src/jeecg/components/JSelectMultiple.vue";
import {Card, Col, Form, Row, Tag} from "ant-design-vue";
import dayjs from "dayjs";
import {downloadFile} from "/@/api/common/api";
import {PopConfirmButton} from "/@/components/Button";

const { t } = useI18n();
const { createMessage } = useMessage();

onMounted(() => {
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
const { resetFields, validate, validateInfos } = useForm(formState, validatorRules, { immediate: false });

const Api = {
  getClient: "/userClient/getClient",
  getShops: "/shippingInvoice/shopsByClient",
  getOrders: "/shippingInvoice/preShipping/orderByShops",
  estimateShippingFees: '/shippingInvoice/estimate',
  makeManualInvoice: "/shippingInvoice/makeManualInvoice",
  downloadInvoice: "/shippingInvoice/download",
  downloadInvoiceDetail: "/shippingInvoice/downloadInvoiceDetail",
}

const client = ref();

const orderList = ref<any[]>([]);
const shopList = ref<any[]>([]);

const selectedShopIds = ref<any[]>([]);

const searchDisabled = ref<boolean>(true);
const shopDisabled = ref<boolean>(false);
const makeManualInvoiceDisabled = ref<boolean>(true);
const makeManualInvoiceLoading = ref<boolean>(false);

const estimatesReady = ref<boolean>(true);
const shippingFeesEstimates = ref<any[]>([]);

const expandedRowKeys = ref<any[]>([]);
const iSorter = ref({
  column: 'shopId',
  order: 'desc'
});
let ipagination = ref({
  current: 1,
  defaultPageSize: 100,
  pageSize: 100,
  pageSizeOptions: ['50', '100', '200', '500'],
  showTotal: (total, range) => {
    return range[0] + '-' + range[1] + ' / ' + total
  },
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
});
const [registerTable, { reload, clearSelectedRowKeys, getSelectRows, getSelectRowKeys, collapseAll, setLoading }] = useTable({
  columns: getColumns(),
  dataSource: orderList,
  // isTreeTable: true,
  // expandIconColumnIndex: 1,
  rowSelection: {
    type: 'checkbox',
    onChange: onSelectChange,
    getCheckboxProps: getCheckboxProps
  },
  pagination: ipagination,
  defSort: iSorter.value,
  bordered: false,
  striped: true,
  clickToRowSelect: true,
  showIndexColumn: true,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  canResize: false,
  rowKey: 'id',
});

function checkUser() {
  setLoading(true);
  shopDisabled.value = true;
  defHttp.get({url: Api.getClient})
    .then(res => {
      console.log(res);
      if(res === 'admin') {
        console.log('admin');
      }
      else {
        client.value = res;
        loadShopList(res.id);
      }
      shopDisabled.value = false;
    })
    .catch(e => {
      console.error(e);
    })
    .finally(()=> {
      setLoading(false);
    });
}
function loadShopList(clientId) {
  defHttp.get({url : Api.getShops, params: {clientID: clientId}})
    .then(res => {

      shopList.value = res.map(
        shop => ({
          label: shop.erpCode,
          value: shop.id,
        })
      );
    })
    .catch(e => {
      console.error(e);
    });
}
function handleShopChange(shops) {
  // value returned is array of shop
  selectedShopIds.value = shops;
  console.log(shops);
  if (selectedShopIds.value.length === 0) {
    makeManualInvoiceDisabled.value = true;
    searchDisabled.value = true;
    orderList.value = [];
  }
  else {
    searchDisabled.value = false;
  }
}
function loadOrders() {
  setLoading(true);
  defHttp.get({url : Api.getOrders, params: {shopIds: selectedShopIds.value}})
    .then(res => {
      console.log(res);
      orderList.value = res.records;
    })
    .catch(e => {
      console.error(e);
    })
    .finally(() => {
      setLoading(false)
    });
}
function makeManualInvoice() {
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
  console.log(`START : ${start} -->${JSON.stringify(tmpStart)}`);
  console.log(`END : ${end} --> ${JSON.stringify(tmpEnd)}`);
  const period = start + ',' + dayjs(end).add(1, 'days').format('YYYY-MM-DD').toString();

  const params = {
    clientID: client.value.id,
    orderIds: getSelectRowKeys(),
    type: "pre-shipping",
    period: [period],
  };
  console.log(`params : ${JSON.stringify(params)}`);
  shopDisabled.value = true;
  searchDisabled.value = true;
  makeManualInvoiceDisabled.value = true;
  setLoading(true);
  makeManualInvoiceLoading.value = true;
  defHttp.post({url: Api.makeManualInvoice, params})
    .then(res => {
      createMessage.success("Orders have been invoiced successfully");
      console.log(`res : ${JSON.stringify(res)}`);

      let filename = res.filename;
      let code = res.invoiceCode;
      downloadInvoice(filename);
      downloadDetailFile(code);
    })
    .catch(e => {
      console.error(e);
    })
    .finally(() => {
      clearSelectedRowKeys();
      shopDisabled.value = true;
      searchDisabled.value = true;
      loadOrders();
      makeManualInvoiceLoading.value = false;
    });
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
  let detailFilename = client.value?.internalCode + "_(" + client.value.invoiceEntity + ")_" + invoiceNumber + '_Détail_calcul_de_facture_' + now + '.xlsx';
  downloadFile(Api.downloadInvoiceDetail, detailFilename, param).then(() => {
    createMessage.info("Download successful.")
  }).catch(e => {
    console.error(`Download invoice detail fail : ${e}`);
  });
}
function onSelectChange(selectedRowKeys: (string | number)[], selectionRows) {
  estimatesReady.value = false;
  if(selectedRowKeys.length == 0) {
    makeManualInvoiceDisabled.value = true;
  }
  else {
    // deactivate undesired checked keys
    let uncheckableRowKeys:any[] = [];
    for(let row of selectionRows){
      if(!(!!row.logisticChannelName || !!row.invoiceLogisticChannelName)) {
        // console.log(row.id);
        uncheckableRowKeys.push(row.id);
      }
    }
    for(let idx of uncheckableRowKeys) {
      let index = selectedRowKeys.indexOf(idx);
      selectedRowKeys.splice(index, 1);
    }
    // let param = {
    //   clientID: client.value.id,
    //   orderIds: getSelectRowKeys(),
    //   type: "preshipping",
    // };
    // defHttp.post({url: Api.estimateShippingFees, params: param})
    //   .then(
    //     res => {
    //       shippingFeesEstimates.value = res;
    //       estimatesReady.value = true;
    //       makeManualInvoiceDisabled.value = false;
    //     }
    //   ).catch(e => {
    //   console.error(e);
    // });
    makeManualInvoiceDisabled.value = false;
  }
}
function getCheckboxProps(record: Recordable) {
  if (!!record.logisticChannelName || !!record.invoiceLogisticChannelName) {
    return { disabled: false };
  } else {
    return { disabled: true };
  }
}

</script>
<style>
.ant-checkbox-disabled .ant-checkbox-inner{
  background-color: #fff2e8;
  border-color: #ffbb96!important;
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
  .fee-card {
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
</style>
