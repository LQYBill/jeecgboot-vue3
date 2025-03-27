import {defHttp} from '/@/utils/http/axios';
import {downloadFile} from "@/api/common/api";

enum Api {
  list = '/credit/list',
  save='/credit/add',
  edit='/credit/edit',
  cancelOne = '/credit/cancel',
  deleteBatch = '/credit/deleteBatch',
  importExcel = '/credit/importExcel',
  exportXls = '/credit/exportXls',
  downloadInvoice = '/credit/downloadInvoice',
  getClient = "/credit/getClient",
}
/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * list credits
 * @param params page number, size, search params
 */
export const list = (params: Record<string,string>) =>
  defHttp.get({url: Api.list, params});

/**
 * 删除单个
 */
export const cancelOne = async (params,handleSuccess:Function) => {
  return await defHttp.put({url: Api.cancelOne, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
}
/**
 * 保存或者更新
 * @param params
 * @param isUpdate
 */
export const saveOrUpdate = (params, isUpdate: boolean) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({url: url, params});
}
export const downloadInvoice = (filename: string, invoiceNumber: string, handleSuccess: Function) => {
  const param = {invoiceNumber};
  downloadFile(Api.downloadInvoice, filename, param).then(() => {
    handleSuccess();
  }).catch(e => {
    console.error(`Download invoice fail : ${e}`);
  });
}
export const getInvoiceClient = (invoiceNumber: string) => {
  return defHttp.get({url: Api.getClient, params: {invoiceNumber}});
}
