import {defHttp} from "/@/utils/http/axios";

export enum Api {
  cancelInvoice = '/generated/shippingInvoice/cancelInvoice',
  cancelBatchInvoice = '/generated/shippingInvoice/cancelBatchInvoice',
  exportXls = '/generated/shippingInvoice/exportXls',
  // list = "/generated/shippingInvoice/list",
  list = "/invoice/list",
  getClient = "/generated/shippingInvoice/getClient",
  downloadCompleteInvoiceExcel = "/generated/shippingInvoice/downloadCompleteInvoiceExcel",
  setPaid = "/generated/shippingInvoice/setPaid",
}

export const list = (params) => {
  return defHttp.get({ url: Api.list, params });
}

export const setPaid = (ids:any[], handleSuccess) => {
  console.log(`ids : ${JSON.stringify(ids)}`);
  defHttp.post({url: Api.setPaid, data: ids},{ joinParamsToUrl: true }).then((res) => {
    console.log(res);
    handleSuccess();
  });
}
