import {defHttp} from "@/utils/http/axios";
import {useI18n} from "@/hooks/web/useI18n";
import {BasicColumn} from "@/components/Table";
import {JSearchSelectOption} from "@/views/business/dto/JSearchSelectOption.dto";
import {downloadFile} from "@/api/common/api";

const { t } = useI18n();
const FILE_NAME = 'Détail_de_facture_';
const FILE_EXTENSION = '.xlsx';
export const Api = {
  CLIENT_LIST: '/client/client/all',
  SHOP_LIST: '/shippingInvoice/shopsByClient',
  INVOICE_DETAILS: '/shippingInvoice/downloadInvoiceDetailByClientAndPeriod',
}

export const fetchClientList = async (handler: Function) => {
  return defHttp.get({url: Api.CLIENT_LIST}).then((res) => {
    handler(res);
  })
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
export const downloadInvoiceDetails = async (params: Recordable, handler: Function) => {
  const filename = FILE_NAME + params.startDate + '-' + params.endDate + FILE_EXTENSION;
  return downloadFile(Api.INVOICE_DETAILS,filename, params).then(() => {
    handler();
  });
}

export const columns: BasicColumn[] = [
  {
    title: t('data.invoice.invoiceNumber'),
    dataIndex: 'invoiceNumber',
    width: 100,
    align: 'center',
  },
  {
    title: t('data.Client'),
    dataIndex: 'clientName',
    width: 100,
    align: 'center',
  },
  {
    title: t('data.invoice.date'),
    dataIndex: 'invoiceDate',
    width: 100,
    align: 'center',
  },
  {
    title: t('data.transaction.amount'),
    dataIndex: 'invoiceAmount',
    width: 100,
    align: 'center',
  },
  {
    title: t('common.operation.action'),
    dataIndex: 'action',
    width: 100,
    align: 'center',
  },
];
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
