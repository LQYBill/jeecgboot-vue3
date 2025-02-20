import {defHttp} from "@/utils/http/axios";

export const API = {
  PURCHASE_INVOICE: '/shippingInvoice/makePurchaseTest',
}
export const makePurchaseTest = (qty: number) => {
  return defHttp.post({url: API.PURCHASE_INVOICE, params: qty}, { joinParamsToUrl: true });
}
