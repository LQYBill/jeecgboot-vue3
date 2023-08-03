<template>
  <PageWrapper :title="t('data.invoice.invoicingPage')">
    <div style="display:flex;justify-content: space-between;align-items: center">
      <div style="display:flex; justify-content: flex-start; align-items: flex-start;">
        <div style="border-radius: 100%;overflow: hidden;width: 80px;height: 80px;">
          <img src="/src/assets/images/logo.png" alt="instructor">
        </div>
        <div class="instructionMessageBubble">
          <div class="instructionMainText">
            <Icon v-if="instructionMessageList[step].type ==='error'" icon="ant-design:warning-twotone"></Icon>
            <p v-html="instructionMessageList[step].text" :class="[instructionMessageList[step].type ==='error' ? 'instructionErrorText' : '']"></p>
          </div>
          <p class="instructionOptionalText" v-if="typeof instructionMessageList[step].option !== 'undefined'" v-html="instructionMessageList[step].option"></p>

          <div class="instructionTipText" v-if="typeof instructionMessageList[step].tip !== 'undefined'">
            <Icon icon="ant-design:bulb-twotone"></Icon>
            <p v-html="instructionMessageList[step].tip" preIcon="ant-design:bulb-outlined"></p>
          </div>
        </div>
      </div>

      <a-col :span="2">
        <a-button class="mr-2" type="warning" preIcon="ant-design:clear-outlined" @click="clearField('all')">
          <a-tooltip title="reset all fields">{{ t("common.operation.clear") }}</a-tooltip>
        </a-button>
      </a-col>
    </div>
    <a-card>
      <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="validatorRules">
        <a-row :class="[step == 0 ? 'focus' : '']">
          <a-col :span="9">
            <a-form-item
              :labelCol="{span: 5}"
              :wrapperCol="{span: 24}"
              v-bind="validateInfos.name"
              name="invoiceMode"
              style="margin-bottom: 0"
            >
              <template #label>
                <span title="invoiceMode">{{t('data.form.invoiceMode')}}</span>
                <BasicHelp text="erp status : shipping = 3, pre-shipping = 1, 2, all = 1, 2, 3"/>
              </template>
              <template #extra>
                <span v-html="t('data.tips.invoiceModeTip')"></span>
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
                :placeholder="t('component.searchForm.shopInputSearch')"
                @change="handleShopChange"
                v-model:value="formState.shop"
                :options="shopList"
                allowClear
                :disabled="shopDisabled"
              />
            </a-form-item>
          </a-col>
<!--          <a-col :span="5">-->
<!--            <a-form-item-->
<!--              :labelCol="labelCol"-->
<!--              :wrapperCol="wrapperCol"-->
<!--              v-bind="validateInfos.name"-->
<!--              name="country"-->
<!--            >-->
<!--              <template #label>-->
<!--                <span title="Country">{{ t('data.invoice.country') }}</span>-->
<!--              </template>-->
<!--              <JSelectMultiple-->
<!--                :placeholder="t('component.searchForm.countryInputSearch')"-->
<!--                @change="handleCountryChange"-->
<!--                v-model:value="formState.country"-->
<!--                :options="countryList"-->
<!--                allowClear-->
<!--                :disabled="countryDisabled"-->
<!--              />-->
<!--            </a-form-item>-->
<!--          </a-col>-->
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
        <a-row v-if="step >= 3 && formState.date !== ''" style="width: 100%" :class="[step == 3 ? 'focus' : '']">
          <a-form-item
            :labelCol="{span: 4}"
            :wrapperCol="{span: 18}"
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
              :disabled="orderSelectModeDisabled"
            >
              <a-radio-button value="0" >{{ t('data.form.manualSelect') }}</a-radio-button>
              <a-radio-button value="1" >{{ t('component.table.selectAll') }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
        </a-row>
        <Divider v-if="step >= 4" orientation="left"></Divider>
        <a-row v-if="orderSelectMode == 0 && step >= 4" :class="[(step == 4 || step == 7) && orderSelectMode == 0 ? 'focus' : '']">
          <a-spin :spinning="makeManualInvoiceSpinning">
            <a-button class="ml-2 mr-2" type="primary" preIcon="ant-design:search-outlined" @click="loadOrders" :loading="findOrdersLoading" :disabled="searchDisabled">
              {{ t("common.operation.search") }}
            </a-button>
            <a-button class="mr-2" type="success" preIcon="ant-design:sync-outlined" @click="syncOrders" :disabled="syncDisabled">
              {{ t("common.operation.syncPageOrders") }}
            </a-button>
            <a-button class="mr-2" type="primary" preIcon="ant-design:download-outlined" @click="makeManualInvoice" :loading="makeManualInvoiceLoading" :disabled="makeManualInvoiceDisabled">
              {{ t("data.invoice.generateShippingInvoice") }}
            </a-button>
            <a-button class="mr-2" type="error" preIcon="ant-design:download-outlined" @click="makeManualCompleteInvoice" :loading="manualCompleteInvoiceLoading" :disabled="manualCompleteInvoiceDisabled">
              {{ t("data.invoice.generateCompleteInvoice") }}
            </a-button>
          </a-spin>
        </a-row>
        <a-row v-if="orderSelectMode == 1 && step == 7" :class="[step == 7 && orderSelectMode == 1 ? 'focus' : '']">
          <a-spin :spinning="makeInvoiceSpinning">
            <a-button class="ml-1 mr-2" type="primary" preIcon="ant-design:download-outlined" @click="makeInvoice" :loading="makeInvoiceLoading" :disabled="makeInvoiceDisabled">
              {{ t("data.invoice.generateShippingInvoice") }}
            </a-button>
            <a-button class="mr-2" type="error" preIcon="ant-design:download-outlined" @click="makeCompleteInvoice" :loading="completeInvoiceLoading" :disabled="completeInvoiceDisabled">
              {{ t("data.invoice.generateCompleteInvoice") }}
            </a-button>
          </a-spin>
        </a-row>
        <a-row v-if="orderSelectMode == 0 && step >= 4">
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
import {PageWrapper} from "/@/components/Page";
import {onMounted, reactive, ref} from "vue";
import {defHttp} from "/@/utils/http/axios";
import {useMessage} from "/@/hooks/web/useMessage";
import {useI18n} from "/@/hooks/web/useI18n";
import {downloadFile} from "/@/api/common/api";
import JSearchSelect from "/@/components/Form/src/jeecg/components/JSearchSelect.vue";
import JSelectMultiple from "/@/components/Form/src/jeecg/components/JSelectMultiple.vue";
import {Tag, Form, Divider} from "ant-design-vue";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {BasicColumn, useTable} from "/@/components/Table";
import dayjs, {Dayjs} from "dayjs";
import PlatformOrderContentSubTable
  from "/@/views/business/admin/platformOrder/subTables/PlatformOrderContentSubTable.vue";
import JRangeDate from "/@/components/Form/src/jeecg/components/JRangeDate.vue";
import BasicHelp from "/@/components/Basic/src/BasicHelp.vue";
import Icon from "/@/components/Icon/src/Icon.vue";

const { t } = useI18n();
const { createMessage } = useMessage();

onMounted (()=> {
  loadCustomerList();
  // loadCountryList();
  step.value = 0;
});
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
  // country: '',
  invoiceMode: '',
  orderSelectMode: '',
  warehouse: '',
});
const { resetFields, validate, validateInfos } = useForm(formState, validatorRules, { immediate: false });

const Api = {
  getClientList: "/client/client/all",
  // getCountryList: "/country/activeList",
  getShopsByCustomerId: "/shippingInvoice/shopsByClient",
  getValidPeriod: "/shippingInvoice/period",
  getValidOrderTimePeriod: "/shippingInvoice/preShipping/orderTime",
  checkOrdersBetweenDate: '/shippingInvoice/postShipping/ordersBetweenDates',
  checkOrdersBetweenOrderDate: "/shippingInvoice/preShipping/ordersBetweenOrderDates",
  makeShippingInvoice: "/shippingInvoice/make",
  makeCompleteInvoice: '/shippingInvoice/makeComplete',
  makeManualInvoice: "/shippingInvoice/makeManualInvoice",
  makeManualCompleteInvoice: '/shippingInvoice/makeManualComplete',
  downloadInvoice: "/shippingInvoice/download",
  downloadInvoiceDetail: "/shippingInvoice/downloadInvoiceDetail",
  listOrders: '/shippingInvoice/orders',
  checkSkuPrices: '/shippingInvoice/checkSkuPrices',
  estimateShippingFees: '/shippingInvoice/estimate',
  syncOrders: '/shippingInvoice/syncByIds',
}

const erpStatus = ref<string>();
const invoiceModeDisabled = ref<boolean>(false);

const customerId = ref<string>();
const customerInfo = ref<string>();
const customerSelectList = ref<any[]>([]);
const customerList = ref<any[]>([]);
const customerDisabled = ref<boolean>(true);

const shopList = ref<any[]>([]);
const shopIDs = ref<any[]>([]);
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
// const countryList = ref<any[]>([]);
// const countryDisabled = ref<boolean>(true);
// const selectedCountries = ref<any[]>([]);

const orderSelectMode = ref<number>();
const orderSelectModeDisabled = ref<boolean>(true);

const purchasePricesAvailable = ref<boolean>(false);

const syncDisabled = ref<boolean>(true);
const searchDisabled = ref<boolean>(true);
const findOrdersLoading = ref<boolean>(false);
const orderListLoading = ref<boolean>(false);
const estimatesReady = ref<boolean>(true);
const shippingFeesEstimates = ref([]);

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
const [registerTable, { reload, expandAll, collapseAll }] = useTable({
  title: t('data.invoice.orderList'),
  isTreeTable: true,
  expandIconColumnIndex: 1,
  rowSelection: rowSelection,
  dataSource: orderList,
  columns,
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
const instructionMessageList = [
  {
    text: t('guide.invoice.step0'),
    step: 0,
  },
  {
    text: t('guide.invoice.step1'),
    step: 1,
  },
  {
    option: t('guide.invoice.option2'),
    text: t('guide.invoice.step2'),
    step: 2,
  },
  {
    text: t('guide.invoice.step3'),
    tip: t('guide.invoice.tip3'),
    step: 3,

  },
  {
    text: t('guide.invoice.step4'),
    step: 4,
  },
  {
    option: t('guide.invoice.option5'),
    text: t('guide.invoice.step5'),
    step: 5,
  },
  {
    text: t('guide.invoice.step6'),
    type: "error",
    step: 6,
  },
  {
    text: t('guide.invoice.step7'),
    tip: t('guide.invoice.tip7'),
    step: 7,
  },
  {
    option: t('guide.invoice.option2_1'),
    text: t('guide.invoice.step2_1'),
    step: 8,
  },
];
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
// function loadCountryList() {
//   defHttp.get({url: Api.getCountryList}).then(
//     res => {
//       countryList.value = res.map(
//         country => ({
//           text: `(${country.code}) ${country.nameEn} : ${country.nameZh}`,
//           value: country.nameEn
//         })
//       );
//     }
//   ).catch(e => {
//     console.error(e);
//   });
// }
function handleInvoiceModeChange(e) {
  erpStatus.value = e.target.value;
  customerDisabled.value = false;
  clearField('client');
  step.value = 1;
}
function handleClientChange(id) {
  let index = customerList.value.map(i => i.id).indexOf(id);
  customerId.value = id;
  customerInfo.value = customerList.value[index];
  //clear selected shops
  shopDisabled.value = true;
  searchDisabled.value = true;
  clearField("shop");
  if(id !== undefined) {
    loadShopList(customerId.value);
  }
  else {
    step.value = 1;
  }
}
function loadShopList (clientID) {
  const param = { clientID: clientID };
  return defHttp.get({url: Api.getShopsByCustomerId, params: param})
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
        // countryDisabled.value = false;
        dateDisabled.value = false;
        shopIDs.value = shopList.value.map(
          shop => {
            return shop.value;
          }
        );
        loadAvailableDate();
      }

    }).catch(error => {
      console.error(error);
      createMessage.error("Error occured while loading shop list : " + error);
    });
}
function loadAvailableDate() {
  if(erpStatus.value === "3") {
    let param:any = [];
    param = shopIDs.value.toString().split(",");
    return defHttp.post({url: Api.getValidPeriod, params: param})
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
    let param = {
      shopIds: shopIDs.value.toString().split(","),
      erpStatuses: erpStatus.value.toString().split(","),
    };
    return defHttp.get({url: Api.getValidOrderTimePeriod, params: param})
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
function handleShopChange(shops) {
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
// function handleCountryChange(countries) {
//   selectedCountries.value = countries;
//   loadAvailableDate();
// }
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
function loadOrders() {
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
  const type = erpStatus.value === "3" ? "shipping" : erpStatus.value === "1,2" ? "pre-shipping" : "all";
  let requestParam = {
    clientId: customerId.value,
    shopIds: shopIDs.value.toString().split(','),
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
    requestParam.order = iSorter.value.order;
    requestParam.column = iSorter.value.column;
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
function checkSkuBetweenDate() {
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
  let param = {
    clientID: customerId.value.toString(),
    shopIDs: shopIDs.value.toString().split(','),
    start: selectedStartDate.value.toString(),
    end: dayjs(selectedEndDate.value).add(1, 'days').format('YYYY-MM-DD').toString(),
    warehouses: warehouseInChina.value.toString().split(','),
  };
  if(erpStatus.value === '3') {
    defHttp.post({url: Api.checkOrdersBetweenDate, params: param})
      .then(res => {
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
    param.erpStatuses = erpStatus.value?.toString().split(',');
    defHttp.post({url: Api.checkOrdersBetweenOrderDate, params: param})
      .then(res => {
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
function makeManualInvoice() {
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
  const type = erpStatus.value === "3" ? "shipping" : erpStatus.value === "1,2" ? "pre-shipping" : "all";

  const param = {
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
  // countryDisabled.value = true;
  orderSelectModeDisabled.value = true;
  searchDisabled.value = true;
  syncDisabled.value = true;
  orderListLoading.value = true;
  makeManualInvoiceLoading.value = true;
  makeManualInvoiceDisabled.value = true;
  manualCompleteInvoiceDisabled.value = true;
  defHttp.post({url: Api.makeManualInvoice, params: param})
    .then(
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
        // countryDisabled.value = false;
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
function makeManualCompleteInvoice() {
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
  const type = erpStatus.value === "3" ? "shipping" : erpStatus.value === "1,2" ? "pre-shipping" : "all";
  const period = selectedStartDate.value.toString()+ "," + dayjs(selectedEndDate.value).add(1, 'days').format('YYYY-MM-DD').toString();

  let param = {
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
  // countryDisabled.value = true;
  orderSelectModeDisabled.value = true;
  searchDisabled.value = true;
  syncDisabled.value = true;
  orderListLoading.value = true;
  makeManualInvoiceDisabled.value = true;
  manualCompleteInvoiceDisabled.value = true;
  manualCompleteInvoiceLoading.value = true;
  defHttp.post({url: Api.makeManualCompleteInvoice, params: param})
    .then(
      res => {
        checkedKeys.value = [];
        let filename = res.filename;
        let code = res.invoiceCode;
        downloadInvoice(filename);
        downloadDetailFile(code);
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
      // countryDisabled.value = false;
      orderSelectModeDisabled.value = false;
      searchDisabled.value = false;
      findOrdersLoading.value = false;
      orderListLoading.value = false;
      makeManualInvoiceLoading.value = false;
      manualCompleteInvoiceLoading.value = false;
      loadOrders();
    });
}// end of makeManualCompleteInvoice
function makeInvoice() {
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
  // countryDisabled.value = true;
  orderSelectModeDisabled.value = true;
  makeInvoiceLoading.value = true;
  makeInvoiceDisabled.value = true;
  completeInvoiceDisabled.value = true;
  const param = {
    clientID: customerId.value,
    shopIDs: shopIDs.value.toString().split(','),
    start: selectedStartDate.value.toString(),
    end: dayjs(selectedEndDate.value).add(1, 'days').format('YYYY-MM-DD').toString(),
    erpStatuses: erpStatus.value.toString().split(","),
    warehouses: warehouseInChina.value.toString().split(','),
  }
  defHttp.post({url: Api.makeShippingInvoice, params: param})
    .then(
      res => {
        let invoiceFilename = res.filename;
        let invoiceNumber = res.invoiceCode;
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
function makeCompleteInvoice() {
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
  let param = {
    clientID: customerId.value.toString(),
    shopIDs: shopIDs.value.toString().split(','),
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
  // countryDisabled.value = true;
  orderSelectModeDisabled.value = true;
  makeInvoiceDisabled.value = true;
  completeInvoiceDisabled.value = true;
  completeInvoiceLoading.value = true;
  defHttp.post({url: Api.makeCompleteInvoice, params: param})
    .then(
      res => {
        let filename = res.filename;
        let code = res.invoiceCode;
        downloadInvoice(filename);
        downloadDetailFile(code);
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
function downloadInvoice(invoiceFilename) {
  const param = {filename: invoiceFilename};
  downloadFile(Api.downloadInvoice, invoiceFilename, param).then(() => {
    createMessage.info("Download successful.")
  }).catch(e => {
    console.error(`Download invoice fail : ${e}`);
  });
}
function downloadDetailFile(invoiceNumber) {
  const param = {invoiceNumber: invoiceNumber, invoiceEntity: customerInfo.value?.invoiceEntity}
  let now = dayjs().format("YYYYMMDD");
  let detailFilename = customerInfo.value?.internalCode + "_(" + customerInfo.value?.invoiceEntity + ")_" + invoiceNumber + '_Détail_calcul_de_facture_' + now + '.xlsx';
  downloadFile(Api.downloadInvoiceDetail, detailFilename, param).then(() => {
    createMessage.info("Download successful.")
  }).catch(e => {
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
    // case "country":
    //   selectedCountries.value = [];
    //   fields.country = "";
    //   let countryCheckbox = document.querySelectorAll("label[for='form_item_country']")[0].parentElement?.nextElementSibling?.getElementsByClassName("ant-checkbox-input")[0];
    //   if(typeof countryCheckbox !== 'undefined') {
    //     countryCheckbox.checked = false;
    //     countryCheckbox.parentElement?.classList.remove("ant-checkbox-checked");
    //   }
    //   break;
    case "manualSelection":
      ipagination.value.current = 1;
      ipagination.value.total = 1;
      ipagination.value.pageSize = 100;
      ipagination.value.defaultPageSize = 100;
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
      shippingFeesEstimates.value = [];
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
      // countryDisabled.value = true;
    case "shop" :
      // clearField("country");
      fields.shop = "";
      startDate.value = dayjs(undefined);
      endDate.value = dayjs(undefined);
      shopIDs.value = [];
      shopList.value = [];
      dateDisabled.value = true;
      try{
        let shopCheckbox = document.querySelectorAll("label[for='form_item_shop']")[0].parentElement?.nextElementSibling?.getElementsByClassName("ant-checkbox-input")[0];
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
      break;
  }
  Object.keys(fields).map((key) => {
    formState[key] = fields[key];
  });
}
function onSelectChange(selectedRowKeys: (string | number)[], selectionRows) {
  estimatesReady.value = false;
  makeManualInvoiceSpinning.value = true;
  if(selectedRowKeys.length > 0) {
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

    checkedKeys.value = selectedRowKeys;
    step.value = 7;
    let param = {
      clientID: customerId.value,
      orderIds: checkedKeys.value,
      type: erpStatus.value === "3" ? "shipping" : erpStatus.value === "1,2" ? "preshipping" : "all",
    };
    defHttp.post({url: Api.estimateShippingFees, params: param})
      .then(
        res => {
          shippingFeesEstimates.value = res;
          estimatesReady.value = true;
        }

      ).catch(e => {
        console.error(e);
      });
    defHttp.post({url: Api.checkSkuPrices, params: param})
      .then(
        res => {
          purchasePricesAvailable.value = true;
        }
      ).catch(e => {
        console.error(e);
        purchasePricesAvailable.value = false;
      }).finally(()=> {
        manualCompleteInvoiceDisabled.value = checkedKeys.value.length === 0 || !purchasePricesAvailable.value;
        makeManualInvoiceDisabled.value = false;
      });
  } else {
    checkedKeys.value = selectedRowKeys;
    shippingFeesEstimates.value = [];
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
  if (!!record.logisticChannelName || !!record.invoiceLogisticChannelName) {
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
</script>
<style>
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
  background-color: #fff2e8;
  border-color: #ffbb96!important;
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
.instructionMessageBubble {
  background-color: #e0f4ff;
  position: relative;
  border: 2px solid #1890ff ;
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
    border-right: 10px solid #1890ff;
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
  .ant-form-item-label {
    flex: none;
    width: fit-content;
  }
}
</style>
