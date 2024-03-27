import {defHttp} from "/@/utils/http/axios";

export enum Api {
  cancelInvoice = '/invoice/cancelInvoice',
  cancelBatchInvoice = '/invoice/cancelBatchInvoice',
  exportXls = '/generated/shippingInvoice/exportXls',
  list = "/invoice/list",
  getClient = "/generated/shippingInvoice/getClient",
  downloadCompleteInvoiceExcel = "/generated/shippingInvoice/downloadCompleteInvoiceExcel",
  downloadInvoiceDetail = "/shippingInvoice/downloadInvoiceDetail",
  setPaid = "/generated/shippingInvoice/setPaid",
}

export const list = (params) => {
  return defHttp.get({ url: Api.list, params });
}

export const setPaid = (rows:any[], handleSuccess) => {
  let shippingInvoiceNumbers = rows.map(row => row.type === 'Shipping Invoice' ? row.invoiceNumber : null);
  let purchaseInvoiceNumbers = rows.map(row => row.type === 'Purchase Invoice' ? row.invoiceNumber : null);
  let data = {
    shipping : shippingInvoiceNumbers.filter(Boolean),
    purchase : purchaseInvoiceNumbers.filter(Boolean)
  }
  defHttp.post({url: Api.setPaid, data: data},{ joinParamsToUrl: true }).then(() => {
    handleSuccess();
  });
}
