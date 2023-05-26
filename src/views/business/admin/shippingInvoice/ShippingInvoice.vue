<template>
  <PageWrapper :title="t('data.invoice.shippingInvoice')">
    <!-- to render these buttons in the BasicForm, we can declared fields in FormSchema and a slot. Then use templates with the slots. look AppendForm.vue for exemple -->
    <div class="invoice-buttons">
      <a-button class="mr-2" type="primary" preIcon="ant-design:download-outlined" @click="makeInvoice" :loading="buttonLoading" :disabled="makeInvoiceDisabled">
        {{ t("data.invoice.generateInvoice") }}
      </a-button>
      <a-button class="mr-2" type="error" preIcon="ant-design:download-outlined" @click="makeCompletePostInvoice" :loading="buttonLoading" :disabled="completeInvoiceDisabled">
        {{ t("data.invoice.generateInvoice7post") }}
      </a-button>
      <a-button class="mr-2" type="warning" preIcon="ant-design:clear-outlined" @click="clearField('all')">
        {{ t("common.operation.clear") }}
      </a-button>
    </div>
    <BasicForm @register="register" ref="basicFormRef" style="height: 500px"/>
  </PageWrapper>
</template>
<script setup lang="ts">
import {BasicForm, FormActionType, FormSchema, useForm} from '/@/components/Form/index';
import {PageWrapper} from "/@/components/Page";
import {onMounted, ref} from "vue";
import {defHttp} from "/@/utils/http/axios";
import {useMessage} from "/@/hooks/web/useMessage";
import {useI18n} from "/@/hooks/web/useI18n";
import dayjs, {Dayjs} from "dayjs";
import {downloadFile} from "/@/api/common/api";
import center from "/@/views/demo/page/account/center/index.vue";

const { t } = useI18n();
const { createMessage } = useMessage();

onMounted (()=> {
  loadCustomerList();
});

const Api = {
  getClientList: "/client/client/all",
  getShopsByCustomerId: "/shippingInvoice/shopsByClient",
  getValidPeriod: "/shippingInvoice/period",
  checkOrdersBetweenDate: '/shippingInvoice/postShipping/ordersBetweenDates',
  makeInvoice: "/shippingInvoice/make",
  makeCompleteInvoice: '/shippingInvoice/makeComplete',
  downloadInvoice: "/shippingInvoice/download",
  downloadInvoiceDetail: "/shippingInvoice/downloadInvoiceDetail",
  listOrders: '/shippingInvoice/orders',
  checkSkuPrices: '/shippingInvoice/checkSkuPrices',
}

const buttonLoading = ref<boolean>(false);

const basicFormRef = ref<Nullable<FormActionType>>(null);
const customerId = ref<string>();
const customerInfo = ref<string>();
const customerSelectList = ref([]);
const customerList = ref([]);

const shopList = ref([]);
const shopIDs = ref([]);
const shopDisabled = ref(true);

const startDate = ref<Dayjs>();
const endDate =ref<Dayjs>();
const selectedStartDate = ref<string>();
const selectedEndDate = ref<string>()
const dateDisabled = ref(true);

const orderList = ref([]);
const pagination = ref({
  current: 1,
  pageSize: 50,
  pageSizeOptions: ['10', '25', '50', '100', '200', '500'],
  showTotal: (total, range) => {
    return range[0] + '-' + range[1] + ' / ' + total
  },
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0
});
const isorter = ref({
  column: 'order_time',
  order: 'desc'
});

const completeInvoiceDisabled = ref(true);
const makeInvoiceDisabled = ref(true);
const purchasePricesAvailable = ref(false);

const getSchemas = (): FormSchema[] => {
  return [
    {
      field: 'setp-1-divider',
      component: 'Divider',
      label: '',
    },
    {///////////// customer//////////////
      field: 'customer',
      component: 'JSearchSelect',
      label: t('data.invoice.customer'),
      helpMessage: ['Client'],
      disabledLabelWidth:true,
      itemProps: {
        labelCol: {
          span: 8
        },
        wrapperCol: {
          span: 18
        }
      },
      colProps: {
        span: 5,
      },
      componentProps: {
        placeholder: t('component.searchForm.clientInputSearch'),
        dictOptions: customerSelectList,
        onChange: (e: any) => {
          console.log("client selected : " + e);
          handleClientChange(e);
        },
      },
      rules: [
        {
          required: true,
          message: 'customer is required',
          type: 'string',
        },
      ],
    },
    {//////////// shop ///////////
      field: "shop",
      component: 'JSelectMultiple',
      label: t('data.invoice.shop'),
      helpMessage: ['shop list'],
      disabledLabelWidth:true,
      itemProps: {
        labelCol: {
          span: 8
        },
        wrapperCol: {
          span: 18
        },
      },
      colProps: {
        span: 5,
      },
      componentProps: {
        placeholder: t('component.searchForm.shopInputSearch'),
        options: shopList,
        disabled: shopDisabled,
        onChange: (e: any) => {
          console.log("selected shops : " + e);
          handleShopChange(e);
        },
      },
      rules: [
        {
          required: true,
          message: t('component.searchForm.shopInputSearch'),
          type: 'string',
        },
      ],
    },
    {////////// Date ///////////
      field: 'date',
      component: 'RangeDate',
      label: t('data.invoice.date'),
      helpMessage: ['date range for orders'],
      disabledLabelWidth:true,
      itemProps: {
        labelCol: {
          span: 8
        },
        wrapperCol: {
          span: 18
        }
      },
      colProps: {
        span: 5,
      },
      componentProps: {
        disabledDate: (current: Dayjs) => {
          // Can not select days before today and today
          return current < dayjs(startDate.value) || current > dayjs(endDate.value);
        },
        disabled: dateDisabled,
        onChange: (e: any) => {
          onDateChange(e);
        },
      },
      rules: [
        {
          required: true,
          message: t("component.searchForm.dateInputSearch"),
          type: 'string',
        },
      ],
    },
  ]
}
const [register] = useForm({
  schemas: getSchemas(),
  showActionButtonGroup: false,
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
  console.log(`selected ${id}`);
  let index = customerList.value.map(i => i.id).indexOf(id);
  customerId.value = id;
  customerInfo.value = customerList.value[index];
  console.log(customerInfo.value);
  //clear selected shops
  shopIDs.value = [];
  shopDisabled.value = true;
  clearField("shop");
  // if we previously checked the "checkAll" button, we uncheck it as it doesn't trigger the checkbox event
  const checkbox = document.getElementById('checkAll') as HTMLInputElement | null;
  if(checkbox != null) {
    checkbox.checked = false;
    checkbox.parentElement?.classList.remove("ant-checkbox-checked");
  }
  if(id !== undefined) {
    loadShopList(customerId.value)
      .then(() => {
          shopDisabled.value = false;
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
  clearField("");
  if (shopIDs.value.length !== 0) {
    dateDisabled.value = false;
    loadAvailableDate();
  } else {
    dateDisabled.value = true;
    completeInvoiceDisabled.value = true;
    makeInvoiceDisabled.value = true;
  }
}
/**
 * load available date from API,
 * return promise for synchronizing operation
 * @returns {Promise<void>}
 */
function loadAvailableDate() {
  let param:any = [];
  param = shopIDs.value.toString().split(",");

  return defHttp.post({url: Api.getValidPeriod, params: param})
    .then(res => {
      console.log("-- LoadAvailableDate : " + JSON.stringify(res));
      let start = new Date(res['start']);
      let end = new Date(res['end']);
      console.log(`start : ${start}`);
      console.log(`end : ${end}`);
      let startDateString = start.getFullYear()+'-'+(start.getMonth()+1<10?'0':'')+(start.getMonth()+1)+'-'+(start.getDate()<10?'0':'')+start.getDate();
      let endDateString = end.getFullYear()+'-'+(end.getMonth()+1<10?'0':'')+(end.getMonth()+1)+'-'+(end.getDate()<10?'0':'')+end.getDate();
      startDate.value = dayjs(startDateString).startOf("day");
      endDate.value = dayjs(endDateString).endOf("day");
      console.log(startDate.value);
      dateDisabled.value = false;
    }).catch(error => {
        console.error(error);
        dateDisabled.value = true;
    });
}
function onDateChange(dateRange) {
  const dateString = dateRange.split(',');
  selectedStartDate.value = dateString[0];
  selectedEndDate.value = dateString[1];
  console.log("date range : " + selectedStartDate.value + ", " + selectedEndDate.value);
  if(dateRange.length !== 0) {
    checkSkuBetweenDate();
  }
  else {
    selectedStartDate.value = "";
    selectedEndDate.value = "";
    completeInvoiceDisabled.value = true;
    makeInvoiceDisabled.value = true;
  }
}
function checkSkuBetweenDate() {
  if(!customerId.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    dateDisabled.value = true;
    shopDisabled.value = true;
    completeInvoiceDisabled.value = true;
    makeInvoiceDisabled.value = true;
    basicFormRef.value?.setFieldsValue({shop: "", date: ""});
    return
  }
  else if(!selectedStartDate.value || !selectedEndDate.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    shopDisabled.value = true;
    completeInvoiceDisabled.value = true;
    makeInvoiceDisabled.value = true;
    basicFormRef.value?.setFieldsValue({shop: "", date: ""});
    return
  }
  makeInvoiceDisabled.value = false;
  const param = {
    clientID: customerId.value.toString(),
    shopIDs: shopIDs.value.toString().split(','),
    start: selectedStartDate.value.toString(),
    end: dayjs(selectedEndDate.value).add(1, 'days').format('YYYY-MM-DD').toString(),
  }
  defHttp.post({url: Api.checkOrdersBetweenDate, params: param})
    .then(res => {
      purchasePricesAvailable.value = true;
      completeInvoiceDisabled.value = false;
    }).catch(e => {
      purchasePricesAvailable.value = false;
      console.error(e);
  })
}
function makeInvoice() {
  if (!customerId.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    return
  } else if (!selectedStartDate.value || !selectedEndDate.value) {
    createMessage.warning(t("component.searchForm.dateInputSearch"));
    return
  }
  const param = {
    clientID: customerId.value,
    shopIDs: shopIDs.value.toString().split(','),
    start: selectedStartDate.value.toString(),
    end: dayjs(selectedEndDate.value).add(1, 'days').format('YYYY-MM-DD').toString(),
  }
  buttonLoading.value = true;
  defHttp.post({url: Api.makeInvoice, params :param})
    .then(
      res => {
        buttonLoading.value = false;
        let invoiceFilename = res.filename;
        let invoiceNumber = res.invoiceCode;
        downloadInvoice(invoiceFilename);
        downloadDetailFile(invoiceNumber);
        makeInvoiceDisabled.value = true;
        completeInvoiceDisabled.value = true;
      }
    ).catch(e => {
      console.error(e);
    })
}//end of makeInvoice()
function makeCompletePostInvoice() {
  console.log("Post Shipping");
  if (!customerId.value) {
    createMessage.warning(t('component.searchForm.clientInputSearch'));
    return;
  }
  let param = {
    clientID: customerId.value.toString(),
    shopIDs: shopIDs.value.toString().split(','),
    start: selectedStartDate.value,
    end: dayjs(selectedEndDate.value).add(1, 'days').format('YYYY-MM-DD').toString(),
  }
  shopDisabled.value = true;
  dateDisabled.value = true;
  buttonLoading.value = true;
  makeInvoiceDisabled.value = true;
  completeInvoiceDisabled.value = true;

  defHttp.post({url: Api.makeCompleteInvoice, params: param})
    .then(
      res => {
        console.log(`makeCompleteInvoice res : ${res}`)
        let filename = res.filename;
        let code = res.invoiceCode;
        downloadInvoice(filename);
        downloadDetailFile(code);
        shopDisabled.value = false;
        completeInvoiceDisabled.value = true;
      }
    ).catch(e => {
      console.error(e);
    }).finally(() => {
      buttonLoading.value = false;
      loadAvailableDate();
    })
} // end of makeCompleteInvoice()
function downloadInvoice(invoiceFilename) {
  const param = {filename: invoiceFilename};
  console.log(`filename : ${invoiceFilename}`);
  downloadFile(Api.downloadInvoice, invoiceFilename, param).then(() => {
    createMessage.info("Download succeed.")
    loadAvailableDate();
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
 *   Clears the BasicForm fields
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
    case "shop" :
      fields.shop = "";
      shopIDs.value = [];
      shopList.value = [];
      dateDisabled.value = true;
    default :
      fields.date = "";
      startDate.value = undefined;
      endDate.value = undefined;
      selectedStartDate.value = undefined;
      selectedEndDate.value = undefined;
      break;
  }
  basicFormRef.value?.setFieldsValue(fields);
}
</script>
<style scoped>
</style>
