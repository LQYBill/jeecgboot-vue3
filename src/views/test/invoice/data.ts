import {defHttp} from "@/utils/http/axios";

export const API = {
  SHIPPING_INVOICE: '/shippingInvoice/makeShippingTest',
  PURCHASE_INVOICE: '/shippingInvoice/makePurchaseTest',
  COMPLETE_INVOICE: '/shippingInvoice/makeCompleteTest',
  EDIT_ORDER: '/shippingInvoice/editOrderTest',
}
export const makeShippingTest = (qty: number) => {
  return defHttp.post({url: API.SHIPPING_INVOICE, params: qty}, { joinParamsToUrl: true });
}
export const makePurchaseTest = (qty: number) => {
  return defHttp.post({url: API.PURCHASE_INVOICE, params: qty}, { joinParamsToUrl: true });
}
export const makeCompleteTest = (qty: number) => {
  return defHttp.post({url: API.COMPLETE_INVOICE, params: qty}, { joinParamsToUrl: true });
}
export const editOrderTest = (id: string) => {
  return defHttp.post({url: API.EDIT_ORDER, params: {orderId: id}});
}
