import { defHttp } from '/@/utils/http/axios';

export {
  getClientOptions,
  getLogisticChannelOptionsByCountry,
  getMergedCountryOptions,
  getSalespersons,
} from './Inquiry.api';

enum Api {
  quoteList = '/quotation/list',
  quoteQueryById = '/quotation/queryById',
  quoteAdd = '/quotation/add',
  quoteEdit = '/quotation/edit',
  quoteDeleteOne = '/quotation/delete',
  quoteDeleteBatch = '/quotation/deleteBatch',
  quoteExportCustomerQuotes = '/quotation/exportCustomerQuotes',
  quoteEstimate = '/quotation/estimate',
  quoteDirectAdd = '/quotation/directAdd',
}

export const quoteList = (params) => defHttp.get({ url: Api.quoteList, params });
export const quoteQueryById = (params) => defHttp.get({ url: Api.quoteQueryById, params });
export const quoteAdd = (data) => defHttp.post({ url: Api.quoteAdd, data });
export const quoteEdit = (data) => defHttp.post({ url: Api.quoteEdit, data });
export const quoteDirectAdd = (data) =>
  defHttp.post({ url: Api.quoteDirectAdd, data }, { errorMessageMode: 'none' });
export const quoteDeleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.quoteDeleteOne, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess?.();
  });
};
export const quoteDeleteBatch = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.quoteDeleteBatch, data: params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess?.();
  });
};
export const quoteEstimate = (data) => defHttp.post({ url: Api.quoteEstimate, data });
export const exportCustomerQuotes = (params: Record<string, any>) => {
  return defHttp.get(
    {
      url: Api.quoteExportCustomerQuotes,
      params,
      responseType: 'blob',
      timeout: 60000,
    },
    {
      isReturnNativeResponse: true,
    }
  );
};

