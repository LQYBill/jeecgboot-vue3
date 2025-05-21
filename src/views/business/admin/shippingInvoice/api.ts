import {defHttp} from "@/utils/http/axios";

export const Api = {
  getClientList: "/client/client/all",
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
  completeFeesEstimation: '/shippingInvoice/completeFeesEstimation',
  syncOrders: '/shippingInvoice/syncByIds',
  compareClientSku: '/sku/compare',
  editOrdersRemark: '/business/platformOrder/editOrdersRemark'
}

export const fetchClientList = async () => {
  return await defHttp.get({url: Api.getClientList});
}
export const fetchShopsByCustomerId = async (params) => {
  return await defHttp.get({url: Api.getShopsByCustomerId, params})
}
export const fetchValidPeriod = async (params) => {
  return await defHttp.post({url: Api.getValidPeriod, params});
}
export const fetchValidOrderTimePeriod = async (params) => {
  return await defHttp.get({url: Api.getValidOrderTimePeriod, params});
}
export const fetchOrders = async (params) => {
  return await defHttp.get({url: Api.listOrders, params})
}
export const syncOrdersRequest = async (params) => {
  return await  defHttp.get({url: Api.syncOrders, params })
}
export const checkOrdersBetweenDate = async (params) => {
  return await defHttp.post({url: Api.checkOrdersBetweenDate, params})
}
export const makeManualInvoiceRequest = async (params) => {
  return await defHttp.post({url: Api.makeManualInvoice, params})
}
export const makeManualCompleteInvoiceRequest = async (params) => {
  return await defHttp.post({url: Api.makeManualCompleteInvoice, params})
}
export const makeShippingInvoiceRequest = async (params) => {
  return await defHttp.post({url: Api.makeShippingInvoice, params})
}
export const makeCompleteInvoiceRequest = async (params) => {
  return await defHttp.post({url: Api.makeCompleteInvoice, params})
}
export const fetchCompleteFeesEstimation = async (params, signal: AbortSignal) => {
  return await defHttp.post({url: Api.completeFeesEstimation, params, signal})
}
export const checkSkuPrices = async (params: Recordable) => {
  return await defHttp.post({url: Api.checkSkuPrices, params})
}
export const compareSku = async (params: Record<string, string | string[]>) => {
  return defHttp.get({url: Api.compareClientSku, params});
}
export const editOrdersRemark = async (params) => {
  return defHttp.post({url: Api.editOrdersRemark, params});
}
