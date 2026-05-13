import {defHttp} from "@/utils/http/axios";
import {useI18n} from "@/hooks/web/useI18n";
import {JSearchSelectOption} from "@/views/business/dto";
import {downloadFile} from "@/api/common/api";
import {ref} from "vue";

const { t } = useI18n();
const FILE_NAME = 'Invoice_details_';
const FILE_EXTENSION = '.xlsx';
export const Api = {
  CLIENT_LIST: '/client/client/all',
  USER_OR_CLIENT: '/userClient/getClient',
  SHOP_LIST: '/shippingInvoice/shopsByClient',
  INVOICE_DETAILS: '/shippingInvoice/downloadInvoiceDetailByClientAndPeriod',
}

export const checkUser = async () => {
  return defHttp.get({url: Api.USER_OR_CLIENT});
}
export const fetchClientList = async () => {
  return defHttp.get({url: Api.CLIENT_LIST});
}
export const fetchShopList = async (clientID: string, handler: Function) => {
  return defHttp.get({url: Api.SHOP_LIST , params: {clientID}}).then((res) => {
    handler(res);
  });
}
export const fetchInvoicePeriod = async (shopIds: string, handler: Function)  => {
  return defHttp.get({url: '/shippingInvoice/invoicePeriod', params: {shopIds}}).then((res) => {
    handler(res);
  });
}
export const downloadInvoiceDetails = async (params: Recordable) => {
  const filename = FILE_NAME + params.startDate + '-' + params.endDate + FILE_EXTENSION;
  return downloadFile(Api.INVOICE_DETAILS,filename, params);
}

export const typeOptions: JSearchSelectOption[] = [
  {
    text: t('data.invoice.shippingInvoice'),
    value: '2',
  },
  {
    text: t('data.invoice.completeInvoice'),
    value: '7',
  }
]


const clientOptions = ref<JSearchSelectOption[]>([]);
const internalUse = ref(false);

async function initialize() {
  const res = await checkUser();
  if (res.internal) {
    internalUse.value = true;
    const clients = await fetchClientList();
    clientOptions.value = clients.map((client: Recordable) => ({
      text: `${client.firstName} ${client.surname} (${client.internalCode})`,
      value: client.id,
    }));
  } else {
    const client = res.client;
    clientOptions.value = [{
      text: `${client.firstName} ${client.surname} (${client.internalCode})`,
      value: client.id,
    }];
  }
}

export function useClient() {
  return {
    clientOptions,
    internalUse,
    initialize,
  }
}
