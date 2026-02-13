import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';

const { createConfirm } = useMessage();

enum Api {
  // inquiry（status=0）
  inquiryList = '/quotation/inquiry/list',
  inquiryAdd = '/quotation/inquiry/add',
  inquiryEdit = '/quotation/inquiry/edit',
  inquiryQueryById = '/quotation/inquiry/queryById',

  inquiryDeleteOne = '/quotation/inquiry/delete',
  inquiryDeleteBatch = '/quotation/inquiry/deleteBatch',
  inquiryImportExcel = '/quotation/inquiry/importExcel',
  inquiryExportXls = '/quotation/inquiry/exportXls',

  // ===== quote（status=1）
  quoteList = '/quotation/quote/list',
  quoteAdd = '/quotation/quote/add',
  quoteEdit = '/quotation/quote/edit',
  quoteQueryById = '/quotation/quote/queryById',
  quoteRevoke = '/quotation/quote/revoke',
  quoteImportExcel = '/quotation/quote/importExcel',
  quoteExportXls = '/quotation/quote/exportXls',
  quoteEstimate = '/quotation/quote/estimate',
}
export const inquiryExportXlsUrl = Api.inquiryExportXls;
export const inquiryImportExcelUrl = Api.inquiryImportExcel;
export const quoteExportXlsUrl = Api.quoteExportXls;
export const quoteImportExcelUrl = Api.quoteImportExcel;
export const inquiryList = (params) => defHttp.get({ url: Api.inquiryList, params });
export const inquiryQueryById = (id: string) =>
  defHttp.get({ url: Api.inquiryQueryById, params: { id } }, { joinParamsToUrl: true });
export const inquiryAdd = (data) => defHttp.post({ url: Api.inquiryAdd, data });
export const inquiryEdit = (data) => defHttp.post({ url: Api.inquiryEdit, data });
export const inquirySaveOrUpdate = (data, isUpdate) => {
  const url = isUpdate ? Api.inquiryEdit : Api.inquiryAdd;
  return defHttp.post({ url, data });
};
export const inquiryDeleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.inquiryDeleteOne, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess?.();
  });
};
export const inquiryBatchDelete = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      return defHttp
        .delete({ url: Api.inquiryDeleteBatch, data: params }, { joinParamsToUrl: true })
        .then(() => handleSuccess?.());
    },
  });
};

// quotation（status=1）
export const quoteList = (params) => defHttp.get({ url: Api.quoteList, params });
export const quoteQueryById = (id: string) =>
  defHttp.get({ url: Api.quoteQueryById, params: { id } }, { joinParamsToUrl: true });
export const quoteAdd = (data) => defHttp.post({ url: Api.quoteAdd, data });
export const quoteEdit = (data) => defHttp.post({ url: Api.quoteEdit, data });
export const quoteSaveOrUpdate = (data, isUpdate) => {
  const url = isUpdate ? Api.quoteEdit : Api.quoteAdd;
  return defHttp.post({ url, data });
};
export const quoteRevoke = (params, handleSuccess) => {
  return defHttp.post({ url: Api.quoteRevoke, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess?.();
  });
};
export const quoteEstimate = (data) => defHttp.post({ url: Api.quoteEstimate, data });
