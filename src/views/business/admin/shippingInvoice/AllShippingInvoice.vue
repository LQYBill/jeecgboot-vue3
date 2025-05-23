<template>
  <PageWrapper :title="t('data.pageTitle.invoicingPage')">
    <Helper @clearField="clearField" />
    <a-card>
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="validatorRules">
        <a-row :class="[step == 0 ? 'focus' : '']">
          <a-col :span="24">
            <a-form-item
              :labelCol="{span: 2}"
              :wrapperCol="{span: 22}"
              v-bind="validateInfos.name"
              name="invoiceMode"
              style="margin-bottom: 0"
            >
              <template #label>
                <span title="invoiceMode">{{t('data.form.invoiceMode')}}</span>
                <BasicHelp text="erp status : shipping = 3, pre-shipping = 1, 2, all = 1, 2, 3"/>
              </template>
              <template #extra>
                {{ t('data.tips.shippingInvoiceModeTip') }}<br/>
                {{ t('data.tips.preShippingInvoiceModeTip') }}<br/>
                {{ t('data.tips.allShippingInvoiceModeTip') }}
              </template>
              <a-radio-group
                v-model:value="formState.invoiceMode"
                @change="handleInvoiceModeChange"
                :disabled="invoiceModeDisabled"
                buttonStyle="solid"
                class="invoice-type-radio-group"
              >
                <a-radio-button value="3">{{ t('data.invoice.shippingInvoice') }}</a-radio-button>
                <a-radio-button value="1,2">{{ t('data.invoice.preShippingInvoice') }}</a-radio-button>
                <a-radio-button value="1,2,3">{{ t('data.invoice.allShippingInvoice') }}</a-radio-button>
              </a-radio-group>
            </a-form-item>
          </a-col>
        </a-row>
        <Divider v-if="erpStatus !== undefined && erpStatus !== ''" orientation="left"></Divider>
        <a-row v-if="erpStatus !== undefined && erpStatus !== ''" type="flex" justify='flex-start' :class="[step == 1 || step == 2 || step == 8 ? 'focus' : '']">
          <a-col :span="5">
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
                :disabled="customerDisabled"
              />
            </a-form-item>
          </a-col>
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
              <template #help>{{ t('data.form.defaultAllShopSelected') }}</template>
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
            <a-form-item
              :labelCol="{span: 8}"
              :wrapperCol="{span: 18}"
              v-bind="validateInfos.name"
              name="date"
              style="margin-left: 1em;"
            >
              <template #label>
                <span title="Date" v-if="erpStatus === '3'">{{ t('data.invoice.shippingTime') }}</span>
                <span title="Date" v-else >{{ t('data.invoice.orderTime') }}</span>
              </template>
              <JRangeDate
                @change="handleDateChange"
                v-model:value="formState.date"
                :disabledDate="disabledDate"
                allowClear
                :disabled="dateDisabled"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item
              :label="t('data.invoice.warehouse')"
              :labelCol='{span: 4}'
              :wrapperCol='{span: 20}'
              name="warehouse"
              style="margin-left: 1em;"
            >
            <!-- TODO : -->
              <a-checkbox-group
                v-model:value="warehouseInChina"
                :options="warehouseOptions"
                @change="onWarehouseChange"
                :disabled="warehouseDisabled"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <Divider v-if="step >= 3 && formState.date !== ''" orientation="left"></Divider>
        <a-row v-if="step >= 3 && formState.date !== ''" :class="[step == 3 ? 'focus' : '']">
          <a-col :span="24">
            <a-spin :spinning="!isSkuCompareReady" :tip="t('guide.verifyingSkus')">
              <a-form-item
                :labelCol="{span: 12}"
                :wrapperCol="{span: 12}"
                v-bind="validateInfos.name"
                name="orderSelectMode"
                style="margin-bottom: 0; width: 100%"
                class="orderSelectFormItem"
              >
                <template #label>
                  <span title="orderSelectMode">{{t('data.form.orderSelectMode')}}</span>
                  <BasicHelp :text="t('data.tips.orderSelectModeTip')"/>
                </template>
                <a-radio-group
                  v-model:value="formState.orderSelectMode"
                  @change="handleOrderSelectMode"
                  buttonStyle="solid"
                  class="invoice-type-radio-group"
                  :disabled="orderSelectModeDisabled || !isSkuCompareReady"
                >
                  <a-radio-button value="0" >{{ t('data.form.manualSelect') }}</a-radio-button>
                  <a-radio-button value="1" >{{ t('component.table.selectAll') }}</a-radio-button>
                </a-radio-group>
              </a-form-item>
            </a-spin>
          </a-col>
        </a-row>
        <Divider v-if="step >= 4" orientation="left"></Divider>
        <a-row v-if="orderSelectMode == 0 && step >= 4" :class="[(step == 4 || step == 7) && orderSelectMode == 0 ? 'focus' : '']">
          <a-spin :spinning="makeManualInvoiceSpinning || !isSkuCompareReady">
            <a-button class="ml-2 mr-2" type="primary" preIcon="ant-design:search-outlined" @click="loadOrders" :loading="findOrdersLoading" :disabled="searchDisabled">
              {{ t("common.operation.search") }}
            </a-button>
            <a-button class="mr-2" type="success" preIcon="ant-design:sync-outlined" @click="syncOrders" :disabled="syncDisabled">
              {{ t("common.operation.syncPageOrders") }}
            </a-button>
            <a-button class="mr-2" type="default" preIcon="ant-design:sync-outlined" @click="syncSkus">
              {{ t("common.operation.compareSkus") }}
              <BasicHelp :text="t('data.tips.compareSkus')"/>
            </a-button>
            <a-button class="mr-2" type="primary" preIcon="ant-design:download-outlined" @click="makeManualInvoice" :loading="makeManualInvoiceLoading" :disabled="makeManualInvoiceDisabled || !isSkuCompareReady">
              {{ t("data.invoice.generateShippingInvoice") }}
            </a-button>
            <a-button class="mr-2" type="error" color="error" preIcon="ant-design:download-outlined" @click="makeManualCompleteInvoice" :loading="manualCompleteInvoiceLoading" :disabled="manualCompleteInvoiceDisabled || !isSkuCompareReady">
              {{ t("data.invoice.generateCompleteInvoice") }}
            </a-button>
          </a-spin>
        </a-row>
        <a-row v-if="orderSelectMode == 1 && step == 7" :class="[step == 7 && orderSelectMode == 1 ? 'focus' : '']">
          <a-spin :spinning="makeInvoiceSpinning || !isSkuCompareReady">
            <a-button class="ml-1 mr-2" type="primary" preIcon="ant-design:download-outlined" @click="makeInvoice" :loading="makeInvoiceLoading && !isSkuCompareReady" :disabled="makeInvoiceDisabled || !isSkuCompareReady">
              {{ t("data.invoice.generateShippingInvoice") }}
            </a-button>
            <a-button class="mr-2" type="error" color="error" preIcon="ant-design:download-outlined" @click="makeCompleteInvoice" :loading="completeInvoiceLoading && !isSkuCompareReady" :disabled="completeInvoiceDisabled || !isSkuCompareReady">
              {{ t("data.invoice.generateCompleteInvoice") }}
            </a-button>
          </a-spin>
        </a-row>
        <a-row v-if="orderSelectMode == 0 && step >= 4">
          <estimation-by-shop-card :estimates-ready="estimatesReady" :estimation="estimation"/>
        </a-row>
      </a-form>
      <div v-if="orderSelectMode == 0 && step >= 4" :class="[step == 5 && orderSelectMode == 0 ? 'focus' : '']">
        <BasicTable
          @register="registerTable"
          :expandedRowKeys="expandedRowKeys"
          :loading="orderListLoading"
          :pagination="ipagination"
          @expand="handleExpand"
          @change="handleTableChange"
          ref="tableRef"
        >
          <!-- Expanded Sub Table -->
          <template v-slot:expandedRowRender="record">
            <platform-order-content-sub-table :record='record' />
          </template>

          <template #logisticChannelName="{record}">
            <span class="emptyCell"
                  v-if="record?.logisticChannelName==='' ||
                  record?.logisticChannelName===null ||
                  record?.logisticChannelName===undefined"
            ><span class="emptyCellText">---</span></span>
            <template v-else>{{record?.logisticChannelName}}</template>
          </template>
          <template #erpStatus="{record}">
            <Tag :color="record?.erpStatus === '1' ? 'volcano' : 'green'">
              {{ record?.erpStatus === '1' ? t("data.erpStatus.pending") : t("data.erpStatus.preparing") }}
            </Tag>
          </template>

          <template #productAvailability="{record}">
            <Tag :color="record?.productAvailable === '1' ? 'green' : 'volcano'">
              {{ record?.productAvailable=== '1' ? t("data.order.inStock") : t("data.order.outOfStock") }}
            </Tag>
          </template>

          <template #toReview="{record}">
            <Tag :color="record?.canSend === '2' ? 'volcano' : 'green'">
              {{ record?.canSend === '2' ? t("data.order.abnormalOrder") : t("data.order.normalOrder")}}
            </Tag>
          </template>

          <template #hasDesyncedSku="{text}">
            <Tag :color="text === 0 ? 'green' : 'volcano'">
              {{ text === 0 ? t("common.no") : t("common.yes") }}
            </Tag>
          </template>
        </BasicTable>
      </div>
    </a-card>
  </PageWrapper>
</template>
<script setup lang="ts">
import {PageWrapper} from "/@/components/Page";
import {onMounted, onUnmounted, provide, reactive, ref, h} from "vue";
import {useMessage} from "/@/hooks/web/useMessage";
import {useI18n} from "/@/hooks/web/useI18n";
import {downloadFile} from "/@/api/common/api";
import JSearchSelect from "/@/components/Form/src/jeecg/components/JSearchSelect.vue";
import JSelectMultiple from "/@/components/Form/src/jeecg/components/JSelectMultiple.vue";
import {Divider, Form, Tag} from "ant-design-vue";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {useTable} from "/@/components/Table";
import dayjs, {Dayjs} from "dayjs";
import PlatformOrderContentSubTable
  from "/@/views/business/admin/platformOrder/subTables/PlatformOrderContentSubTable.vue";
import JRangeDate from "/@/components/Form/src/jeecg/components/JRangeDate.vue";
import BasicHelp from "/@/components/Basic/src/BasicHelp.vue";
import {shippingInvoiceParam} from "@/views/business/dto/shippingInvoiceParam.dto";
import {estimation as estimationDTO} from "@/views/business/dto/estimation.dto";
import EstimationByShopCard from "@/views/business/components/EstimationByShopCard.vue";
import Helper from "@/views/business/admin/shippingInvoice/modules/Helper.vue";
import {
  Api,
  checkOrdersBetweenDate,
  checkSkuPrices,
  compareSku,
  editOrdersRemark,
  fetchClientList,
  fetchCompleteFeesEstimation,
  fetchOrders,
  fetchShopsByCustomerId,
  fetchValidOrderTimePeriod,
  fetchValidPeriod,
  makeCompleteInvoiceRequest,
  makeManualCompleteInvoiceRequest,
  makeManualInvoiceRequest,
  makeShippingInvoiceRequest,
  syncOrdersRequest
} from "./api";
import {columns} from "./data";
import {InvoicingMethod} from "@/views/business/enum/InvoicingMethodEnum";
import {offWebSocket, onWebSocket} from "@/hooks/web/useWebSocket";
import {HttpStatusCode} from "axios";

const { t } = useI18n();
const { createMessage, notification } = useMessage();

onMounted (async ()=> {
  offWebSocket(handleWsMsg);
  onWebSocket(handleWsMsg);
  await loadCustomerList();
  step.value = 0;
});
onUnmounted(() => {
  controller.abort();
});
let controller = new AbortController();
const useForm = Form.useForm;
const formRef = ref();
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 6 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 18 } });
const validatorRules = ref({
  customer: [{ required: true, message: t('component.searchForm.clientInputSearch'), trigger: 'blur' }],
  date: [{ required: true, message: t('component.searchForm.dateInputSearch'), trigger: 'blur' }],
  invoiceMode: [{ required: true, message: t('component.searchForm.invoiceModeInputSearch'), trigger: 'blur' }],
  orderSelectMode: [{ required: true, message: t('component.searchForm.orderSelectModeInputSearch'), trigger: 'blur' }],
  warehouse: [{ required: true, message: "At least one required", trigger: 'click' }]
});
const formState = reactive<Record<string, any>>({
  customer: '',
  shop: '',
  date: '',
  invoiceMode: '',
  orderSelectMode: '',
  warehouse: '',
});
const {validateInfos } = useForm(formState, validatorRules, { immediate: false });

const erpStatus = ref<string>();
const invoiceModeDisabled = ref<boolean>(false);

const customerId = ref<string>();
const customerInfo = ref<any>();
const customerSelectList = ref<any[]>([]);
const customerList = ref<any[]>([]);
const customerDisabled = ref<boolean>(true);

const shopList = ref<any[]>([]);
const shopIDs = ref<string>();
const shopDisabled = ref(true);

const startDate = ref<Dayjs>(dayjs('2023-01-01').startOf("day"));
const endDate = ref<Dayjs>(dayjs().endOf("day"));
const selectedStartDate = ref<string>();
const selectedEndDate = ref<string>();
const dateDisabled = ref<boolean>(true);

const warehouseDisabled = ref<boolean>(false);
const warehouseInChina = ref([0,1]);
const warehouseOptions =  ref([
  { label: t('data.invoice.warehouseAbroad'), value: 0 },
  { label: t('data.invoice.warehouseInChina'), value: 1 }
]);

const orderSelectMode = ref<number>();
const orderSelectModeDisabled = ref<boolean>(true);

const purchasePricesAvailable = ref<boolean>(false);

const isSkuCompareReady = ref<boolean>(false);

const syncDisabled = ref<boolean>(true);
const searchDisabled = ref<boolean>(true);
const findOrdersLoading = ref<boolean>(false);
const orderListLoading = ref<boolean>(false);
const estimatesReady = ref<boolean>(true);
const estimation = ref<estimationDTO[]>([]);

const makeManualInvoiceSpinning = ref<boolean>(false);
const makeManualInvoiceDisabled = ref<boolean>(true);
const manualCompleteInvoiceDisabled = ref<boolean>(true);
const makeManualInvoiceLoading = ref<boolean>(false);
const manualCompleteInvoiceLoading = ref<boolean>(false);

const makeInvoiceSpinning = ref<boolean>(false);
const makeInvoiceDisabled = ref<boolean>(true);
const completeInvoiceDisabled = ref<boolean>(true);
const makeInvoiceLoading = ref<boolean>(false);
const completeInvoiceLoading = ref<boolean>(false);

const orderList = ref<any[]>([]);

const tableRef = ref();
const expandedRowKeys = ref<any[]>([]);
const checkedKeys = ref<Array<string | number>>([]);
const rowSelection = {
  type: 'checkbox',
  columnWidth: 30,
  selectedRowKeys: checkedKeys,
  onChange: onSelectChange,
  getCheckboxProps: getCheckboxProps
};
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
const iSorter = ref({
  column: 'shopId',
  order: 'desc'
});
const iFilters = ref<any>({});

const [registerTable] = useTable({
  title: t('data.invoice.orderList'),
  isTreeTable: true,
  expandIconColumnIndex: 1,
  rowSelection: rowSelection,
  dataSource: orderList,
  columns,
  ellipsis: false,
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
const step = ref<number>(0);
async function loadCustomerList() {
  await fetchClientList().then(res => {
    customerSelectList.value = res.map(
      (customer: Recordable) => ({
        text: `${customer.firstName} ${customer.surname} (${customer.internalCode})`,
        value: customer.id,
      })
    );
    customerList.value = res.map(
      (customer: Recordable) => {
        let list = {};
        list["id"] = `${customer.id}`;
        list["firstname"] = `${customer.firstName}`;
        list["lastname"] = `${customer.surname}`;
        list["internalCode"] = `${customer.internalCode}`;
        list["invoiceEntity"] = `${customer.invoiceEntity}`;
        return list;
      }
    );
  }).catch(error => {
    console.error(error);
  })
}
function handleInvoiceModeChange(e: Event) {
  erpStatus.value = (e.target as HTMLInputElement).value;
  customerDisabled.value = false;
  clearField('client');
  step.value = 1;
}
function handleClientChange(id: string) {
  isSkuCompareReady.value = false;
  const index = customerList.value.map(i => i.id).indexOf(id);
  customerId.value = id;
  customerInfo.value = customerList.value[index];
  //clear selected shops
  shopDisabled.value = true;
  searchDisabled.value = true;
  clearField("shop");
  if(id !== undefined) {
    loadShopList(customerId.value);
    syncSkus();
  }
  else {
    step.value = 1;
  }
}
async function loadShopList (clientID: string) {
 await fetchShopsByCustomerId( { clientID })
    .then(res => {
      if (res.length === 0) {
        createMessage.warning(t("data.invoice.error.noShopFoundForClient"));
      }
      else {
        shopList.value = res.map(
          shop => ({
            label: shop.erpCode,
            value: shop.id,
          })
        );
        step.value = erpStatus.value === "3" ? 2 : 8;
        shopDisabled.value = false;
        dateDisabled.value = false;
        shopIDs.value = shopList.value.map(
          shop => {
            return shop.value;
          }
        ).toString();
        loadAvailableDate();
      }

    }).catch(error => {
      console.error(error);
      createMessage.error("Error occured while loading shop list : " + error);
    });
}
async function loadAvailableDate() {
  if(erpStatus.value === "3") {
    const params = shopIDs.value!.split(",");
    await fetchValidPeriod(params)
      .then(res => {
        let start = new Date(res['start']);
        let end = new Date(res['end']);
        let startDateString = start.getFullYear() + '-' + (start.getMonth() + 1 < 10 ? '0' : '') + (start.getMonth() + 1) + '-' + (start.getDate() < 10 ? '0' : '') + start.getDate();
        let endDateString = end.getFullYear() + '-' + (end.getMonth() + 1 < 10 ? '0' : '') + (end.getMonth() + 1) + '-' + (end.getDate() < 10 ? '0' : '') + end.getDate();
        startDate.value = dayjs(startDateString).startOf("day");
        endDate.value = dayjs(endDateString).endOf("day");
        dateDisabled.value = false;
      }).catch(error => {
        console.error("Error while loading available date : " + error);
        dateDisabled.value = true;
        step.value = 6;
      });
  }
  else { // (1,2) & (1,2,3)
    const params = {
      shopIds: shopIDs.value!.split(","),
      erpStatuses: erpStatus.value!.toString().split(","),
    };
    await fetchValidOrderTimePeriod(params)
      .then(
        res => {
          let start = new Date(res['start']);
          let end = new Date(res['end']);
          let startDateString = start.getFullYear() + '-' + (start.getMonth() + 1 < 10 ? '0' : '') + (start.getMonth() + 1) + '-' + (start.getDate() < 10 ? '0' : '') + start.getDate();
          let endDateString = end.getFullYear() + '-' + (end.getMonth() + 1 < 10 ? '0' : '') + (end.getMonth() + 1) + '-' + (end.getDate() < 10 ? '0' : '') + end.getDate();
          startDate.value = dayjs(startDateString).startOf("day");
          endDate.value = dayjs(endDateString).endOf("day");
          dateDisabled.value = false;
        }
      ).catch(e => {
        console.error("Error while loading available order date : " + e);
        dateDisabled.value = true;
        step.value = 6;
      })
  }
}
function handleShopChange(shops: string) {
  // value returned is array of shop
  clearField("date");
  shopIDs.value = shops;
  if (shopIDs.value.length === 0) {
    completeInvoiceDisabled.value = true;
    makeInvoiceDisabled.value = true;

    makeManualInvoiceDisabled.value = true;
    manualCompleteInvoiceDisabled.value = true;
  }
  else {
    dateDisabled.value = false;
    loadAvailableDate();
  }
}
function handleDateChange(dateRange) {
  clearField("orderSelectMode");
  const dateString = dateRange.split(',');
  selectedStartDate.value = dateString[0];
  selectedEndDate.value = dateString[1];
  if(dateRange.length !== 0) {
    if (warehouseInChina.value.length === 0) {
      createMessage.warning(t('component.searchForm.warehouseSelect'))
      return;
    }
    step.value = 3;
    orderSelectModeDisabled.value = false;
  }
  else {
    clearField("date");
    step.value = erpStatus.value === "3" ? 2 : 8;
  }
}
function onWarehouseChange(checkedValues) {
  warehouseInChina.value = checkedValues;
  clearField("orderSelectMode");
  if(warehouseInChina.value.length === 0) {
    createMessage.warning(t('component.searchForm.warehouseSelect'));
    orderSelectModeDisabled.value = false;
    if(step.value === 3)
    {
      step.value = erpStatus.value === "3" ? 2 : 8;
    }
  }
  else {
    // !! returns if false empty (""), null or undefined
    if(!!selectedStartDate.value && !!selectedEndDate.value) {
      step.value = 3;
      orderSelectModeDisabled.value = false;
    }
  }
}
function disabledDate(current: Dayjs) {
  return current < dayjs(startDate.value) || current > dayjs(endDate.value);
}
function handleOrderSelectMode(e) {
  if(e.target.value === "0") {
    orderSelectMode.value = 0;
    clearField("selectAll");
    step.value = 4;
    searchDisabled.value = false;
    loadOrders();
  }
  else {
    orderSelectMode.value = 1;
    clearField("manualSelection");
    step.value = 7;
    makeInvoiceSpinning.value = true;
    checkSkuBetweenDate();
  }
}
async function loadOrders() {
  orderList.value = [];
  if(searchDisabled.value === true) {
    return;
  }
  if(!customerId.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    clearField("shop");
    return;
  }
  if(!selectedStartDate.value || !selectedEndDate.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    clearField("date");
    return;
  }
  if (warehouseInChina.value.length === 0) {
    createMessage.warning(t('component.searchForm.warehouseSelect'));
    return;
  }
  const type = getInvoiceMethod();
  let params = {
    clientId: customerId.value,
    shopIds: shopIDs.value!.split(','),
    start: selectedStartDate.value.toString(),
    end: dayjs(selectedEndDate.value).add(1, 'days').format('YYYY-MM-DD').toString(),
    pageNo: ipagination.value.current,
    pageSize: ipagination.value.pageSize,
    type: type,
    order: iSorter.value.order.toString(),
    column: iSorter.value.column.toString(),
    warehouses: warehouseInChina.value.toString().split(','),
  };

  if (Object.keys(iSorter.value).length > 0) {
    params.order = iSorter.value.order;
    params.column = iSorter.value.column;
  }
  findOrdersLoading.value = true;
  orderListLoading.value = true;

  await fetchOrders(params)
    .then(res => {
      orderList.value = res.records;
      if (res.total) {
        ipagination.value.total = res.total;
      } else {
        ipagination.value.total = 0;
      }
      if (orderList.value.length > 0) {
        step.value = 5;
        syncDisabled.value = false;
      } else {
        step.value = 6;
        syncDisabled.value = true;
      }
    }).catch(e => {
      console.error(`listOrders error : ${e}`);
    }).finally(()=> {
      findOrdersLoading.value = false;
      orderListLoading.value = false;
    });
} // end of loadOrders
async function syncOrders() {
  let platformOrderIds:any[] = [];
  orderList.value.map(order =>{
    platformOrderIds.push(order.platformOrderId)
  });
  const params = {orderIds: platformOrderIds}
  await syncOrdersRequest(params).then(() => {
      syncDisabled.value = true;
    });
}
async function syncSkus() {
  isSkuCompareReady.value = false;
  const params = {
    clientId: customerId.value!,
    erpStatuses: erpStatus.value!.split(","),
  };
  await compareSku(params).then(() => {
    isSkuCompareReady.value = true;
  });
}
async function checkSkuBetweenDate() {
  if(!customerId.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    clearField("shop");
    return;
  }
  if(!selectedStartDate.value || !selectedEndDate.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    clearField("date");
    return;
  }
  if (warehouseInChina.value.length === 0) {
    createMessage.warning(t('component.searchForm.warehouseSelect'))
    return;
  }
  let params: shippingInvoiceParam = {
    clientID: customerId.value.toString(),
    shopIDs: shopIDs.value!.split(','),
    start: selectedStartDate.value.toString(),
    end: dayjs(selectedEndDate.value).add(1, 'days').format('YYYY-MM-DD').toString(),
    warehouses: warehouseInChina.value.toString().split(','),
  };
  if(erpStatus.value === '3') {
    await checkOrdersBetweenDate(params)
      .then(() => {
        purchasePricesAvailable.value = true;
        // if user changes select mode too fast, before the check is finished, the buttons will enable themselves
        // so we make sure we are using the correct mode and a mode is selected
        completeInvoiceDisabled.value = orderSelectMode.value !== 1;
      }).catch(e => {
        purchasePricesAvailable.value = false;
        console.error(e);
      }).finally(() => {
        if(orderSelectMode.value !== 1)
          clearField("selectAll");
        else {
          makeInvoiceDisabled.value = orderSelectMode.value !== 1;
          makeInvoiceSpinning.value = false;
        }
      });
  }
  else {
    // check sku but not it's order time between and erp_status IN (???)
    params.erpStatuses = erpStatus.value?.toString().split(',');
    await checkOrdersBetweenDate(params)
      .then(() => {
        purchasePricesAvailable.value = true;
        completeInvoiceDisabled.value = orderSelectMode.value !== 1;
      }).catch(e => {
        purchasePricesAvailable.value = false;
        console.error(e);
      }).finally(() => {
        if(orderSelectMode.value !== 1)
          clearField("selectAll");
        else {
          makeInvoiceDisabled.value = orderSelectMode.value !== 1;
          makeInvoiceSpinning.value = false;
        }
      });
  }
} // end of checkSkuBetweenDate
async function makeManualInvoice() {
  if (!customerId.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    return;
  }
  if (!selectedStartDate.value || !selectedEndDate.value) {
    createMessage.warning(t("component.searchForm.dateInputSearch"));
    return;
  }
  if (warehouseInChina.value.length === 0) {
    createMessage.warning(t('component.searchForm.warehouseSelect'))
    return;
  }
  const period = selectedStartDate.value.toString()+ "," + dayjs(selectedEndDate.value).add(1, 'days').format('YYYY-MM-DD').toString();
  const type = getInvoiceMethod();

  const params = {
    clientID: customerId.value,
    orderIds: checkedKeys.value,
    type: type,
    period: [period],
  };
  invoiceModeDisabled.value = true;
  shopDisabled.value = true;
  customerDisabled.value = true;
  dateDisabled.value = true;
  warehouseDisabled.value = true;
  orderSelectModeDisabled.value = true;
  searchDisabled.value = true;
  syncDisabled.value = true;
  orderListLoading.value = true;
  makeManualInvoiceLoading.value = true;
  makeManualInvoiceDisabled.value = true;
  manualCompleteInvoiceDisabled.value = true;
  await makeManualInvoiceRequest(params).then(
      res => {
        checkedKeys.value = [];
        let filename = res.filename;
        let code = res.invoiceCode;
        downloadInvoice(filename);
        downloadDetailFile(code);
        ipagination.value.current = 1;
        findOrdersLoading.value = true;
        loadOrders();

        invoiceModeDisabled.value = false;
        shopDisabled.value = false;
        customerDisabled.value = false;
        dateDisabled.value = false;
        warehouseDisabled.value = false;
        orderSelectModeDisabled.value = false;
        findOrdersLoading.value = false;
        orderListLoading.value = false;
        searchDisabled.value = false;
        makeManualInvoiceLoading.value = false;
      }
    ).catch(e => {
      console.error(`make invoice error : ${e}`);
  });
} // end of makeManualInvoice
async function makeManualCompleteInvoice() {
  if (!customerId.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    return;
  }
  if (!selectedStartDate.value || !selectedEndDate.value) {
    createMessage.warning(t("component.searchForm.dateInputSearch"));
    return;
  }
  if(erpStatus.value !== '3' && erpStatus.value !== '1,2' && erpStatus.value !== '1,2,3') {
    createMessage.error("Error 400 : bad request.");
    return;
  }
  if (warehouseInChina.value.length === 0) {
    createMessage.warning(t('component.searchForm.warehouseSelect'))
    return;
  }
  const type = getInvoiceMethod();
  const period = selectedStartDate.value.toString()+ "," + dayjs(selectedEndDate.value).add(1, 'days').format('YYYY-MM-DD').toString();

  let params = {
    clientID: customerId.value,
    orderIds: checkedKeys.value,
    type: type,
    period: [period],
  };
  invoiceModeDisabled.value = true;
  shopDisabled.value = true;
  customerDisabled.value = true;
  dateDisabled.value = true;
  warehouseDisabled.value = true;
  orderSelectModeDisabled.value = true;
  searchDisabled.value = true;
  syncDisabled.value = true;
  orderListLoading.value = true;
  makeManualInvoiceDisabled.value = true;
  manualCompleteInvoiceDisabled.value = true;
  manualCompleteInvoiceLoading.value = true;
  await makeManualCompleteInvoiceRequest(params)
    .then(
      res => {
        checkedKeys.value = [];
        const filename = res.filename;
        const code = res.invoiceCode;
        downloadInvoice(filename);
        downloadDetailFile(code);
        if(getInvoiceMethod() === InvoicingMethod.PRESHIPPING)
          editInvoiceOrdersRemark(code, getInvoiceMethod());
      }
    ).catch(e => {
      console.error(e);
      step.value = 6;
    }).finally(() => {
      ipagination.value.current = 1;
      findOrdersLoading.value = true;
      invoiceModeDisabled.value = false;
      shopDisabled.value = false;
      customerDisabled.value = false;
      dateDisabled.value = false;
      warehouseDisabled.value = true;
      orderSelectModeDisabled.value = false;
      searchDisabled.value = false;
      findOrdersLoading.value = false;
      orderListLoading.value = false;
      makeManualInvoiceLoading.value = false;
      manualCompleteInvoiceLoading.value = false;
      loadOrders();
    });
}// end of makeManualCompleteInvoice
async function makeInvoice() {
  if (!customerId.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    return;
  }
  if (!selectedStartDate.value || !selectedEndDate.value) {
    createMessage.warning(t("component.searchForm.dateInputSearch"));
    return;
  }
  if(erpStatus.value !== '3' && erpStatus.value !== '1,2' && erpStatus.value !== '1,2,3') {
    createMessage.error("Error 400 : bad request.");
    return;
  }
  if (warehouseInChina.value.length === 0) {
    createMessage.warning(t('component.searchForm.warehouseSelect'))
    return;
  }
  invoiceModeDisabled.value = true;
  shopDisabled.value = true;
  customerDisabled.value = true;
  dateDisabled.value = true;
  warehouseDisabled.value = true;
  orderSelectModeDisabled.value = true;
  makeInvoiceLoading.value = true;
  makeInvoiceDisabled.value = true;
  completeInvoiceDisabled.value = true;
  const param = {
    clientID: customerId.value,
    shopIDs: shopIDs.value!.split(','),
    start: selectedStartDate.value.toString(),
    end: dayjs(selectedEndDate.value).add(1, 'days').format('YYYY-MM-DD').toString(),
    erpStatuses: erpStatus.value.toString().split(","),
    warehouses: warehouseInChina.value.toString().split(','),
  }
  await makeShippingInvoiceRequest(param)
    .then(
      res => {
        const invoiceFilename = res.filename;
        const invoiceNumber = res.invoiceCode;
        downloadInvoice(invoiceFilename);
        downloadDetailFile(invoiceNumber);
        step.value = erpStatus.value === "3" ? 2 : 8;
      }
    ).catch(e => {
      console.error(e);
      step.value = 6;
    }).finally(() => {
      clearField("date");
      loadAvailableDate();
      invoiceModeDisabled.value = false;
      shopDisabled.value = false;
      customerDisabled.value = false;
      dateDisabled.value = false;
      warehouseDisabled.value = false;
    });
  makeInvoiceLoading.value = false;
}//end of makeInvoice
async function makeCompleteInvoice() {
  if (!customerId.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    return;
  }
  if (!selectedStartDate.value || !selectedEndDate.value) {
    createMessage.warning(t("component.searchForm.dateInputSearch"));
    return;
  }
  if(erpStatus.value !== '3' && erpStatus.value !== '1,2' && erpStatus.value !== '1,2,3') {
    createMessage.error("Error 400 : bad request.");
    return;
  }
  if (warehouseInChina.value.length === 0) {
    createMessage.warning(t('component.searchForm.warehouseSelect'));
    return;
  }
  const param = {
    clientID: customerId.value.toString(),
    shopIDs: shopIDs.value!.split(','),
    start: selectedStartDate.value,
    end: dayjs(selectedEndDate.value).add(1, 'days').format('YYYY-MM-DD').toString(),
    erpStatuses: erpStatus.value.toString().split(","),
    warehouses: warehouseInChina.value.toString().split(','),
  }
  invoiceModeDisabled.value = true;
  shopDisabled.value = true;
  customerDisabled.value = true;
  dateDisabled.value = true;
  warehouseDisabled.value = true;
  orderSelectModeDisabled.value = true;
  makeInvoiceDisabled.value = true;
  completeInvoiceDisabled.value = true;
  completeInvoiceLoading.value = true;
  await makeCompleteInvoiceRequest(param)
    .then(
      res => {
        const filename:string = res.filename;
        const code:string = res.invoiceCode;
        downloadInvoice(filename);
        downloadDetailFile(code);
        if(getInvoiceMethod() === InvoicingMethod.PRESHIPPING)
          editInvoiceOrdersRemark(code, getInvoiceMethod());
        step.value = erpStatus.value === "3" ? 2 : 8;
      }
    ).catch(e => {
      console.error(e);
      step.value = 6;
    }).finally(() => {
      clearField("date");
      completeInvoiceLoading.value = false;
      loadAvailableDate();
      invoiceModeDisabled.value = false;
      shopDisabled.value = false;
      customerDisabled.value = false;
      dateDisabled.value = false;
      warehouseDisabled.value = false;
    });
} // end of makeCompleteInvoice()
function downloadInvoice(invoiceFilename: string) {
  const param = {filename: invoiceFilename};
  downloadFile(Api.downloadInvoice, invoiceFilename, param).then(() => {
    createMessage.info("Download successful.")
  }).catch(e => {
    console.error(`Download invoice fail : ${e}`);
  });
}
function downloadDetailFile(invoiceNumber: string) {
  const param =
    {
      invoiceNumber: invoiceNumber,
      invoiceEntity: customerInfo.value?.invoiceEntity,
      internalCode: customerInfo.value?.internalCode
    }
  let now = dayjs().format("YYYYMMDD");
  let detailFilename = customerInfo.value?.internalCode + "_(" + customerInfo.value?.invoiceEntity + ")_" + invoiceNumber + '_Détail_calcul_de_facture_' + now + '.xlsx';
  downloadFile(Api.downloadInvoiceDetail, detailFilename, param).then(() => {
    createMessage.info("Download successful.")
  }).catch(e => {
      console.error(`Download invoice detail fail : ${e}`);
  });
}
function editInvoiceOrdersRemark(invoiceNumber:string, invoicingMethod: InvoicingMethod) {
  editOrdersRemark({invoiceNumber, invoicingMethod}).then((res) => {
    if(Object.keys(res.failures).length > 0) {
      createMessage.error(`Error while writing invoice number in orders on Mabang: ${res.failures}`);
    }
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
function clearField(field:any) {
  let fields:any = {};
  switch (field) {
    case "manualSelection":
      ipagination.value.current = 1;
      ipagination.value.total = 1;
      ipagination.value.pageSize = 50;
      ipagination.value.defaultPageSize = 50;
      orderList.value = [];
      searchDisabled.value = true;
      findOrdersLoading.value = false;
      syncDisabled.value = true;
      makeManualInvoiceDisabled.value = true;
      manualCompleteInvoiceDisabled.value = true;
      makeManualInvoiceLoading.value = false;
      manualCompleteInvoiceLoading.value = false;
      checkedKeys.value = [];
      estimatesReady.value = true;
      estimation.value = [];
      purchasePricesAvailable.value = false;
      break;
    case "selectAll":
      makeInvoiceDisabled.value = true;
      completeInvoiceDisabled.value = true;
      makeInvoiceLoading.value = false;
      completeInvoiceLoading.value = false;
      makeInvoiceSpinning.value = false;
      break;
    case "all" :
      step.value = 0;
    case "erpStatus":
      fields.invoiceMode = "";
      erpStatus.value = undefined;
      customerDisabled.value = true;

    case "client" :
      fields.customer = "";
      customerInfo.value = undefined;
      customerId.value = undefined;
      shopDisabled.value = true;
      warehouseDisabled.value = false;
      isSkuCompareReady.value = false;
    case "shop" :
      fields.shop = "";
      startDate.value = dayjs(undefined);
      endDate.value = dayjs(undefined);
      shopIDs.value = "";
      shopList.value = [];
      dateDisabled.value = true;
      try{
        let shopCheckbox = <HTMLInputElement> document.querySelectorAll("label[for='form_item_shop']")[0].parentElement?.nextElementSibling?.getElementsByClassName("ant-checkbox-input")[0];
        if(typeof shopCheckbox !== 'undefined') {
          shopCheckbox.checked = false;
          shopCheckbox.parentElement?.classList.remove("ant-checkbox-checked");
        }
      }catch (e) {

      }
    case "date":
      fields.date = "";
      selectedStartDate.value = "";
      selectedEndDate.value = "";
      orderSelectModeDisabled.value = true;
    case "orderSelectMode" :
      orderSelectMode.value = undefined;
      fields.orderSelectMode = "";
    default :
      clearField("manualSelection");
      clearField("selectAll");
      controller.abort();
      break;
  }
  Object.keys(fields).map((key) => {
    formState[key] = fields[key];
  });
}
async function onSelectChange(selectedRowKeys: (string | number)[], selectionRows) {
  // controller.abort();
  estimatesReady.value = false;
  makeManualInvoiceSpinning.value = true;
  if (selectedRowKeys.length > 0) {
    // deactivate undesired checked keys
    let uncheckableRowKeys: any[] = [];
    for (let row of selectionRows) {
      if (!(!!row.logisticChannelName || !!row.invoiceLogisticChannelName)) {
        uncheckableRowKeys.push(row.id);
      }
    }
    for (let idx of uncheckableRowKeys) {
      let index = selectedRowKeys.indexOf(idx);
      selectedRowKeys.splice(index, 1);
    }

    checkedKeys.value = selectedRowKeys;
    step.value = 7;
    const params = {
      clientID: customerId.value,
      orderIds: checkedKeys.value,
      type: getInvoiceMethod(),
    };
    controller = new AbortController();
    const {signal} = controller;
    await fetchCompleteFeesEstimation(params, signal)
      .then(
        res => {
          estimation.value = [];
          for (let shop in res) {
            // let shopName = getShopName(shop);
            const shopEstimation = res[shop];
            // shopEstimation.shop = shopName;
            estimation.value.push(shopEstimation);
          }
          estimatesReady.value = true;
        }
      ).catch(e => {
        console.error(e);
      });
    await checkSkuPrices(params)
      .then(
        () => {
          purchasePricesAvailable.value = true;
        }
      ).catch(e => {
      console.error(e);
      purchasePricesAvailable.value = false;
    }).finally(() => {
      manualCompleteInvoiceDisabled.value = checkedKeys.value.length === 0 || !purchasePricesAvailable.value;
      makeManualInvoiceDisabled.value = false;
    });
  } else {
    checkedKeys.value = selectedRowKeys;
    estimation.value = [];
    estimatesReady.value = true;
    manualCompleteInvoiceDisabled.value = true;
    makeManualInvoiceDisabled.value = true;
  }
  makeManualInvoiceSpinning.value = false;
}
function handleTableChange(pagination, filters, sorter) {
  if (Object.keys(sorter).length > 0) {
    iSorter.value.column = sorter.field
    iSorter.value.order = 'ascend' === sorter.order ? 'asc' : 'desc'
  }
  ipagination.value.current = pagination.current;
  ipagination.value.total = pagination.total;
  ipagination.value.pageSize = pagination.pageSize;
  iFilters.value = { ...filters };
  loadOrders();
}
function getCheckboxProps(record: Recordable) {
  if ((!!record.logisticChannelName || !!record.invoiceLogisticChannelName) && record.canSend !== '2') {
    return { disabled: false };
  } else {
    return { disabled: true };
  }
}
function handleExpand(expanded, record) {
  expandedRowKeys.value = [];
  if (expanded === true) {
    expandedRowKeys.value.push(record.id);
  }
}
function getInvoiceMethod(): InvoicingMethod {
  return erpStatus.value === "3" ? InvoicingMethod.POSTSHIPPING : erpStatus.value === "1,2" ? InvoicingMethod.PRESHIPPING : InvoicingMethod.ALL
}
function handleWsMsg(data: any) {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    if (parsed?.task !== 'editOrdersRemark') return;
    const { msgTxt, code, data: msgData } = parsed;
    let content = `<p>${t(msgTxt)}</p>`;
    if(!!msgData) {
      content += `<ul>`;
      for(const key in msgData) {
        content += `<li>${key}: ${msgData[key]}</li>`;
      }
      content += `</ul>`;
    }
    const vnodeContent = h('div', {
      innerHTML: content
    });
    if (code === HttpStatusCode.Ok)
      notification.success({
        message: 'Order remark edit status',
        description: vnodeContent,
        duration: null,
        placement: 'bottomRight',
      });
    else
      notification.error({
        message: 'Order remark edit status',
        description: vnodeContent,
        duration: null,
        placement: 'bottomRight',
      });
    return;

  } catch (e) {
    console.error('[WebSocket] 消息解析失败：', e);
  }
}
provide('step', step);
</script>
<style lang="less">
.invoice-type-radio-group {

}
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
  background-color: fade(@error-color, 10%);
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  border: 1px solid @error-color;
  & .emptyCellText {
    color: @error-color;
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
.instructionMessageBubble {
  background-color: fade(@primary-color, 10%);
  position: relative;
  border-radius: 5px;
  padding: 1em;
  margin-left: 10px;
  transition: all 0.5s ease;
  &:before {
    content: "";
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    left: -20px;
    top: 5px;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 10px solid transparent;
    border-right: 10px solid fade(@primary-color,10%);
  }
  p {
    margin: 0;
  }
  .instructionMainText {
    display: flex;
    justify-content: space-between;
    align-items: center;
    svg path:nth-child(2) {
      fill: orange;
      fill-opacity: 0.5;
    }
    .instructionErrorText {
      color: #c78d24;
    }
  }
  .instructionOptionalText {
    color: rgba(0, 0, 0, 0.45);
    font-size: 0.9em;
  }
  .instructionTipText {
    background-color: #ffe4bf;
    border-radius: 5px;
    padding: 1em;
    svg path:nth-child(1) {
      fill: yellow;
      fill-opacity: 0.5 ;
    }
  }
}
.focus {
  //border-left: 2px solid #1890ff55;
  border-left: 2px solid #ffad1842;
}
.orderSelectFormItem {
  width:100%;
  .ant-form-item-label {
    flex: none;
    width: fit-content;
  }
}
</style>
