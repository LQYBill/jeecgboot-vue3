<template>
  <PageWrapper :title="t('data.invoice.preShippingInvoice')">
    <a-card>
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="validatorRules">
        <a-row type="flex" justify='space-between'>
          <a-col :span="5">
            <a-form-item
              :label="t('data.invoice.customer')"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              v-bind="validateInfos.name"
              name="customer"
            >
              <JSearchSelect
                :placeholder="t('component.searchForm.clientInputSearch')"
                :dictOptions="customerSelectList"
                @change="handleClientChange"
                v-model:value="formState.customer"
                allowClear
                :disabled="customerDisabled"
              />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item
              :label="t('data.invoice.shop')"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              v-bind="validateInfos.name"
              name="shop"
            >
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
          <a-button type="primary" preIcon="ant-design:search-outlined" @click="loadOrders" :loading="findOrdersLoading" :disabled="searchDisabled">
            {{ t("common.operation.search") }}
          </a-button>
          <a-button type="success" preIcon="ant-design:sync-outlined" @click="syncOrders" :disabled="syncDisabled">
            {{ t("common.operation.syncAllOrders") }}
          </a-button>
          <a-button type="warning" preIcon="ant-design:clear-outlined" @click="clearField('all')">
            {{ t("common.operation.clear") }}
          </a-button>
          <a-button type="primary" preIcon="ant-design:download-outlined" @click="makeInvoice" :loading="makeInvoiceLoading" :disabled="makeInvoiceDisabled">
            {{ t("data.invoice.generateInvoice") }}
          </a-button>
          <a-button type="error" preIcon="ant-design:download-outlined" @click="makeCompleteInvoice" :loading="completeInvoiceLoading" :disabled="completeInvoiceDisabled">
            {{ t("data.invoice.generateInvoice7pre") }}
          </a-button>
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
      <div>
        <BasicTable
          @register="registerTable"
          :dataSource="orderList"
          :expandedRowKeys="expandedRowKeys"
          :rowSelection="rowSelection"
          :loading="orderListLoading"
          :pagination="ipagination"
          @expand="handleExpand"
          @change="handleTableChange"
        >
          <!-- Expanded Sub Table -->
          <template v-slot:expandedRowRender="record">
            <platform-order-content-sub-table :record='record' />
          </template>

          <template v-slot:logisticChannelName="record">
            <span class="emptyCell"
                  v-if="record.record.logisticChannelName==='' ||
                  record.record.logisticChannelName===null ||
                  record.record.logisticChannelName===undefined"
            ><span class="emptyCellText">---</span></span>
            <template v-else>{{record.record.logisticChannelName}}</template>
          </template>
          <template v-slot:erpStatus="record">
            <Tag
              :color="record.record.erpStatus === '1' ? 'volcano' : 'green'"
            >
              {{ record.record.erpStatus === '1' ? t("data.order.pending") : t("data.order.preparing") }}
            </Tag>
          </template>

          <template v-slot:productAvailability="record">
            <Tag
              :color="record.record.productAvailable === '1' ? 'green' : 'volcano'"
            >
              {{ record.record.productAvailable=== '1' ? t("data.order.inStock") : t("data.order.outOfStock") }}
            </Tag>
          </template>

          <template v-slot:toReview="record">
            <Tag
              :color="record.record.canSend === '2' ? 'volcano' : 'green'"
            >
              {{ record.record.canSend === '2' ? t("data.order.abnormalOrder") : t("data.order.normalOrder")}}
            </Tag>
          </template>
        </BasicTable>
      </div>
    </a-card>
  </PageWrapper>
</template>
<script setup lang="ts">
// TODO : add date, country and shop search filter
import {PageWrapper} from "/@/components/Page";
import {onMounted, reactive, ref} from "vue";
import {defHttp} from "/@/utils/http/axios";
import {useMessage} from "/@/hooks/web/useMessage";
import {useI18n} from "/@/hooks/web/useI18n";
import {downloadFile} from "/@/api/common/api";
import JSearchSelect from "/@/components/Form/src/jeecg/components/JSearchSelect.vue";
import JSelectMultiple from "/@/components/Form/src/jeecg/components/JSelectMultiple.vue";
import {Tag, Card, Form} from "ant-design-vue";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {BasicColumn, useTable} from "/@/components/Table";
import Icon from "/@/components/Icon";
import dayjs from "dayjs";
import PlatformOrderContentSubTable
  from "/@/views/business/admin/platformOrder/subTables/PlatformOrderContentSubTable.vue";

const { t } = useI18n();
const { createMessage } = useMessage();
const CardGrid = Card.Grid;

onMounted (()=> {
  loadCustomerList();
});
const useForm = Form.useForm;
const formRef = ref();
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 6 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 18 } });
const validatorRules = ref({
  customer: [{ required: true, message: t('component.searchForm.clientInputSearch'), trigger: 'blur' }],
  shop: [{ required: true, message: t('component.searchForm.shopInputSearch'), trigger: 'blur' }],
});
const formState = reactive<Record<string, any>>({
  customer: '',
  shop: '',
});
const { resetFields, validate, validateInfos } = useForm(formState, validatorRules, { immediate: false });

const Api = {
  getClientList: "/client/client/all",
  getShopsByCustomerId: "/shippingInvoice/shopsByClient",
  checkOrdersBetweenDate: '/shippingInvoice/postShipping/ordersBetweenDates',
  makeInvoice: "/shippingInvoice/makeManualInvoice",
  makeCompleteInvoice: '/shippingInvoice/preShipping/makeComplete',
  downloadInvoice: "/shippingInvoice/download",
  downloadInvoiceDetail: "/shippingInvoice/downloadInvoiceDetail",
  listOrders: '/shippingInvoice/orders',
  checkSkuPrices: '/shippingInvoice/checkSkuPrices',
  estimateShippingFees: '/shippingInvoice/estimate',
  syncOrders: '/shippingInvoice/syncByIds',
}

const makeInvoiceLoading = ref<boolean>(false);
const completeInvoiceLoading = ref<boolean>(false);
const findOrdersLoading = ref<boolean>(false);
const orderListLoading = ref<boolean>(false);

const customerId = ref<string>();
const customerInfo = ref<string>();
const customerSelectList = ref([]);
const customerList = ref([]);
const customerDisabled = ref<boolean>(false);

const shopList = ref([]);
const shopIDs = ref([]);
const shopDisabled = ref(true);

const estimatesReady = ref<boolean>(true);
const shippingFeesEstimates = ref([]);
const purchasePricesAvailable = ref<boolean>(false);

const syncDisabled = ref<boolean>(true);
const searchDisabled = ref<boolean>(true);
const completeInvoiceDisabled = ref<boolean>(true);
const makeInvoiceDisabled = ref<boolean>(true);

const orderList = ref<any[]>([]);

const expandedRowKeys = ref<any[]>([]);
const checkedKeys = ref<Array<string | number>>([]);
const rowSelection = {
  type: 'checkbox',
  columnWidth: 30,
  selectedRowKeys: checkedKeys,
  onChange: onSelectChange,
  getCheckboxProps: getCheckboxProps
};
const ipagination = ref({
  current: 1,
  pageSize: 100,
  pageSizeOptions: ['50', '100', '200'],
  showTotal: (total, range) => {
    return range[0] + '-' + range[1] + ' / ' + total
  },
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
});
const iSorter = ref({
  column: 'shopId',
  order: 'desc'
});
const iFilters = ref<any>({});

const columns: BasicColumn[] = [
  {
    title: t("data.invoice.shopID"),
    align:"center",
    sorter: true,
    dataIndex: 'shopId_dictText',
  },
  {
    title: t("data.invoice.logisticChannel"),
    align:"center",
    sorter: true,
    dataIndex: 'logisticChannelName_dictText',
    slots: {customRender: 'logisticChannelName'}
  },
  {
    title: t("data.invoice.platformOrderID"),
    align:"center",
    sorter: true,
    dataIndex: 'platformOrderId'
  },
  {
    title: t("data.invoice.platformOrderNumber"),
    align:"center",
    sorter: true,
    dataIndex: 'platformOrderNumber'
  },
  {
    title: t("data.invoice.trackingNumber"),
    align:"center",
    sorter: true,
    dataIndex: 'trackingNumber'
  },
  {
    title: t("data.invoice.orderTime"),
    align:"center",
    sorter: true,
    dataIndex: 'orderTime'
  },
  {
    title: t("data.invoice.recipient"),
    align: "center",
    sorter: true,
    dataIndex: 'recipient'
  },
  {
    title: t("data.invoice.country"),
    align:"center",
    sorter: true,
    dataIndex: 'country'
  },
  {
    title: t("data.invoice.erpStatus"),
    align:"center",
    sorter: true,
    dataIndex: 'erpStatus',
    slots: {customRender: 'erpStatus'},
  },
  {
    title: t("data.order.inStock"),
    align:"center",
    sorter: true,
    dataIndex: 'productAvailable',
    slots: {customRender: 'productAvailability'},
  },
  {
    title: t("data.invoice.toReview"),
    align:"center",
    sorter: true,
    dataIndex: 'canSend',
    slots: {customRender: 'toReview'},
  },
];
const [registerTable, { reload }] = useTable({
  title: 'Order List',
  columns,
  //自定义默认排序
  defSort: iSorter.value,
  bordered: true,
  striped: true,
  showTableSetting: true,
  showSummary: true,
  clickToRowSelect: true,
  showIndexColumn: true,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  tableSetting: { fullScreen: true },
  canResize: false,
  rowKey: 'id',
});
function loadCustomerList() {
  defHttp.get({url: Api.getClientList}).then(res => {
    customerSelectList.value = res.map(
      customer => ({
        text: `${customer.firstName} ${customer.surname} (${customer.internalCode})`,
        value: customer.id,
      })
    );
    customerList.value = res.map(
      customer => {
        let list = {};
        list["id"] = `${customer.id}`;
        list["info"] = `${customer.firstName},${customer.surname},${customer.internalCode}`;
        return list;
      }
    );
  }).catch(error => {
    console.error(error);
  })
}
function handleClientChange(id) {
  // console.log(`fields value : customer : ${formState["customer"]}, shop : ${formState["shop"]}`)
  console.log(`client selected ${id}`);
  let index = customerList.value.map(i => i.id).indexOf(id);
  customerId.value = id;
  customerInfo.value = customerList.value[index];
  //clear selected shops
  shopIDs.value = [];
  shopDisabled.value = true;
  searchDisabled.value = true;
  shippingFeesEstimates.value = [];
  checkedKeys.value = [];
  ipagination.value.current = 1
  ipagination.value.pageSize = 100
  ipagination.value.total = 0
  clearField("shop");
  // if we previously checked the "checkAll" button, we uncheck it
  const checkbox = document.getElementById('checkAll') as HTMLInputElement | null;
  if(checkbox != null) {
    checkbox.checked = false;
    checkbox.parentElement?.classList.remove("ant-checkbox-checked");
  }
  if(id !== undefined) {
    loadShopList(customerId.value)
      .then(() => {
          shopDisabled.value = false;
          searchDisabled.value = false;
        }
      );
  }
}
function loadShopList (clientID) {
  const param = { clientID: clientID };
  return defHttp.get({url: Api.getShopsByCustomerId, params: param})
    .then(res => {
      if (res.length === 0) {
        createMessage.warning(t("data.invoice.error.noShopFoundForClient"));
      }
      shopList.value = res.map(
        shop => ({
          label: shop.erpCode,
          value: shop.id,
        })
      );

    }).catch(error => {
      console.error(error);
      createMessage.error("Error occured while loading shop list : " + error);
    });
}
function handleShopChange(shops) {
  // value returned is array of shop
  shopIDs.value = shops;
  if (shopIDs.value.length === 0) {
    completeInvoiceDisabled.value = true;
    makeInvoiceDisabled.value = true;
  }
}
function loadOrders() {
  let requestParam = {
    clientId: customerId.value,
    shopIds: shopIDs.value.toString().split(','),
    pageNo: ipagination.value.current,
    pageSize: ipagination.value.pageSize,
    type: "pre-shipping",
    order: iSorter.value.order.toString(),
    column: iSorter.value.column.toString()
  }
  if (Object.keys(iSorter.value).length > 0) {
    requestParam.order = iSorter.value.order
    requestParam.column = iSorter.value.column
  }

  findOrdersLoading.value = true;
  orderListLoading.value = true;

  defHttp.get({url: Api.listOrders, params: requestParam})
    .then(res => {
      orderList.value = res.records;

      if (res.total) {
        ipagination.value.total = res.total;
      } else {
        ipagination.value.total = 0;
      }
      if (orderList.value.length > 0) {
        let orderIdList:any[] = [];
        orderList.value.map(order => {
          orderIdList.push(order.id);
        })
        syncDisabled.value = false;
        let param = {
          clientID: customerId.value,
          orderIds: orderIdList,
          type: "pre-shipping"
        }
        defHttp.post({url: Api.checkSkuPrices, params: param})
          .then(res => {
            purchasePricesAvailable.value = true;
          }).catch(e => {
            console.error(`checkSkuPrices error : ${e}`);
        })
      } else {
        syncDisabled.value =true;
      }
      findOrdersLoading.value = false;
      orderListLoading.value = false;
    }).catch(e => {
      console.error(`listOrders error : ${e}`);
  })
}
function syncOrders() {
  let platformOrderIds:any[] = [];
  orderList.value.map(order =>{
    platformOrderIds.push(order.platformOrderId)
  });
  defHttp.get({url: Api.syncOrders, params: {orderIds: platformOrderIds}})
    .then(res => {
      syncDisabled.value = true;
    });
}
function makeInvoice() {
  if (!customerId.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    return;
  }
  let param = {
    clientID: customerId.value,
    orderIds: checkedKeys.value,
    type: "pre-shipping"
  };
  makeInvoiceDisabled.value = true
  findOrdersLoading.value = true;
  orderListLoading.value = true;
  shopDisabled.value = true;
  customerDisabled.value = true;
  defHttp.post({url: Api.makeInvoice, params: param})
    .then(
      res => {
        console.log(`make invoice ${res}`);
        checkedKeys.value = [];
        let filename = res.filename;
        let code = res.invoiceCode;
        downloadInvoice(filename);
        downloadDetailFile(code);
        ipagination.value.current = 1;
        loadOrders();

        customerDisabled.value = false;
        shopDisabled.value = false;
        makeInvoiceDisabled.value = false;
        findOrdersLoading.value = false;
        orderListLoading.value = false;
      }
    ).catch(e => {
      console.error(`make invoice error : ${e}`);
  });
}
function makeCompleteInvoice() {
  if (!customerId.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    return;
  }
  let param = {
    clientID: customerId.value,
    orderIds: checkedKeys.value,
    type: "pre-shipping"
  };
  makeInvoiceDisabled.value = true
  findOrdersLoading.value = true
  orderListLoading.value = true
  shopDisabled.value = true
  customerDisabled.value = true
  defHttp.post({url: Api.makeCompleteInvoice, params: param})
    .then(
      res => {
        console.log(`make complete invoice res : ${res}`);
        checkedKeys.value = [];
        let filename = res.filename;
        let code = res.invoiceCode;
        downloadInvoice(filename);
        downloadDetailFile(code);
        ipagination.value.current = 1;
        loadOrders();

        customerDisabled.value = false;
        shopDisabled.value = false;
        completeInvoiceDisabled.value = true;
        findOrdersLoading.value = false;
        orderListLoading.value = false;
      }
    );
}
function downloadInvoice(invoiceFilename) {
  const param = {filename: invoiceFilename};
  console.log(`filename : ${invoiceFilename}`);
  downloadFile(Api.downloadInvoice, invoiceFilename, param).then(() => {
    createMessage.info("Download succeed.")
  }).catch(e => {
    console.error(`Download invoice fail : ${e}`);
  });
}
function downloadDetailFile(invoiceNumber) {
  const param = {invoiceNumber: invoiceNumber}
  let now = dayjs().format("YYYYMMDD");
  let internalCode = customerInfo.value?.info.split(',')[2];
  console.log(`internalCode : ${internalCode}`);

  let detailFilename = internalCode + "_" + invoiceNumber + '_Détail_calcul_de_facture_' + now + '.xlsx';
  console.log(`detail filename : ${detailFilename}`);
  downloadFile(Api.downloadInvoiceDetail, detailFilename, param)
    .catch(e => {
      console.error(`Download invoice detail fail : ${e}`);
    });
}
/**
 *   Clears the formRef fields
 *   方式1
 *   setFieldsValue({
 *     field2: data.data,
 *     field1: data.info,
 *   });
 *
 *   方式2
 *   modelRef.value = { field2: data.data, field1: data.info };
 *
 *   方式3
 *   setProps({
 *     model:{ field2: data.data, field1: data.info }
 *   })
 * @param field
 */
function clearField(field) {
  let fields = {};
  switch (field) {
    case "all" :
    case "client" :
      fields.customer = "";
      customerInfo.value = undefined;
      customerId.value = undefined;
      shopDisabled.value = true;
      searchDisabled.value = true;
    case "shop" :
      fields.shop = "";
      shopIDs.value = [];
      shopList.value = [];
      syncDisabled.value = true;
    default :
      makeInvoiceDisabled.value = true;
      completeInvoiceDisabled.value = true;
      estimatesReady.value = true;
      shippingFeesEstimates.value = [];
      purchasePricesAvailable.value = false;
      orderList.value = [];
      ipagination.value.current = 1;
      ipagination.value.total = 0;
      break;
  }
  Object.keys(fields).map((key) => {
    formState[key] = fields[key];
  });
}
function onSelectChange(selectedRowKeys: (string | number)[], selectionRows) {
  estimatesReady.value = false;
  console.log("checkedKeys------>", checkedKeys);
  checkedKeys.value = selectedRowKeys;
  makeInvoiceDisabled.value = checkedKeys.value.length === 0;
  completeInvoiceDisabled.value = checkedKeys.value.length === 0 || !purchasePricesAvailable.value;
  if(checkedKeys.value.length > 0) {
    let param = {
      clientID: customerId.value,
      orderIds: selectedRowKeys,
      type: "pre-shipping"
    };
    defHttp.post({url: Api.estimateShippingFees, params: param})
      .then(
        res => {
          // if (res.message !== "[]") {
          //   createMessage.info(res.message, 10)
          // }
          console.log(`estimate res : ${JSON.stringify(res)}`)
          shippingFeesEstimates.value = res;
          estimatesReady.value = true;
        }

      ).catch(e => {
        console.error(e);
    })
  } else {
    shippingFeesEstimates.value = [];
    estimatesReady.value = true;
  }
}
function handleTableChange(pagination, filters, sorter) {
  if (Object.keys(sorter).length > 0) {
    iSorter.value.column = sorter.field
    iSorter.value.order = 'ascend' === sorter.order ? 'asc' : 'desc'
  }
  ipagination.value = pagination;
  iFilters.value = { ...filters };
  loadOrders();
}
function getCheckboxProps(record: Recordable) {
  if ((record.logisticChannelName === '' || record.logisticChannelName === null) && record.invoiceLogisticChannelName === null) {
    return { disabled: true };
  } else {
    return { disabled: false };
  }
}
function handleExpand(expanded, record) {
  expandedRowKeys.value = [];
  if (expanded === true) {
    expandedRowKeys.value.push(record.id);
  }
}
</script>
<style lang="less">
.head-info {
  span {
    color: rgba(0, 0, 0, 0.45);
    display: inline-block;
    font-size: 14px;
    line-height: 22px;
    margin-bottom: 4px;
  }

  p {
    color: rgba(0, 0, 0, 0.85);
    font-size: 24px;
    line-height: 32px;
    margin: 0;
  }
}
.ant-checkbox-disabled .ant-checkbox-inner{
  background-color: fade(@error-color, 10%);
  border-color: @error-color!important;
}
.emptyCell {
  display:flex;
  height: 100%;
  width: 100%;
  background-color: #fff2e8;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid #ffbb96;
  .emptyCellText {
    color: #d4380d;
    align-self: center;
    margin: 0;
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
