import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';

const { createConfirm } = useMessage();
const { t } = useI18n();

enum Api {
  // inquiry (status = 0)
  inquiryList = '/quotation/inquiry/list',
  inquiryAdd = '/quotation/inquiry/add',
  inquiryEdit = '/quotation/inquiry/edit',
  inquiryQueryById = '/quotation/inquiry/queryById',
  getCurrentClient = '/userClient/getClient',
  popularCountryList = '/country/popularList',
  logisticChannelListByCountry = '/business/logisticChannel/listByCountry',

  inquiryDeleteOne = '/quotation/inquiry/delete',
  inquiryDeleteBatch = '/quotation/inquiry/deleteBatch',

  // quote (status = 1)
  quoteList = '/quotation/quote/list',
  quoteAdd = '/quotation/quote/add',
  quoteEdit = '/quotation/quote/edit',
  quoteRevoke = '/quotation/quote/revoke',
  quoteExportCustomerQuotes = '/quotation/quote/exportCustomerQuotes',
  quoteEstimate = '/quotation/quote/estimate',
}
export const inquiryList = (params) => defHttp.get({ url: Api.inquiryList, params });
export const getCurrentClient = () => defHttp.get({ url: Api.getCurrentClient });
function unwrapList(resp: any) {
  const result = resp?.result ?? resp;
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.records)) return result.records;
  return [];
}
function countryToOption(item: any) {
  const value = item?.id ?? item?.value;
  const label = item?.nameEn ?? item?.name_en ?? item?.text ?? item?.label ?? item?.nameZh ?? item?.code ?? value;
  return value ? { label, value: String(value) } : null;
}
function channelToOption(item: any) {
  const value = item?.id ?? item?.value;
  const name = item?.zhName ?? item?.zh_name ?? item?.internalName ?? item?.internal_name ?? item?.enName ?? item?.name ?? item?.label ?? value;
  if (!value) return null;
  const priceFromReference = item?.priceFromReference === true || item?.priceFromReference === 'true' || item?.price_from_reference === true || item?.price_from_reference === 'true';
  const priceReferenceChannelName = item?.priceReferenceChannelName ?? item?.price_reference_channel_name;
  const priceNote = item?.priceNote ?? item?.price_note;
  const title = priceNote || (priceReferenceChannelName ? `Uses reference price from ${priceReferenceChannelName}` : undefined);
  return {
    label: priceFromReference ? `${name} (ref)` : name,
    value: String(value),
    title,
    priceFromReference,
    priceReferenceChannelName,
    priceNote,
  };
}
export const getPopularCountryOptions = async () => {
  const resp = await defHttp.get({ url: Api.popularCountryList });
  return unwrapList(resp).map(countryToOption).filter(Boolean);
};
export const getAllCountryOptions = async () => {
  const resp = await defHttp.get({ url: '/sys/dict/getDictItems/country,name_en,id' });
  return unwrapList(resp).map(countryToOption).filter(Boolean);
};
export const getMergedCountryOptions = async () => {
  const [popular, all] = await Promise.all([getPopularCountryOptions(), getAllCountryOptions()]);
  const used = new Set<string>();
  return [...popular, ...all].filter((item: any) => {
    if (!item?.value || used.has(item.value)) return false;
    used.add(item.value);
    return true;
  });
};
export const getLogisticChannelOptionsByCountry = async (country: string) => {
  if (!country) return [];
  const resp = await defHttp.get({ url: Api.logisticChannelListByCountry, params: { country } });
  return unwrapList(resp).map(channelToOption).filter(Boolean);
};
export const inquiryAdd = (data) => defHttp.post({ url: Api.inquiryAdd, data });
export const inquiryEdit = (data) => defHttp.post({ url: Api.inquiryEdit, data });
export const inquiryDeleteOne = (params, handleSuccess) => {
  return defHttp.delete({ url: Api.inquiryDeleteOne, params }, { joinParamsToUrl: true }).then(() => {
    handleSuccess?.();
  });
};
export const inquiryBatchDelete = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: t('data.quotation.confirm.deleteTitle'),
    content: t('data.quotation.confirm.batchDelete'),
    okText: t('common.okText'),
    cancelText: t('common.operation.cancel'),
    onOk: () => {
      return defHttp
        .delete({ url: Api.inquiryDeleteBatch, data: params }, { joinParamsToUrl: true })
        .then(() => handleSuccess?.());
    },
  });
};

// quote (status = 1)
export const quoteList = (params) => defHttp.get({ url: Api.quoteList, params });
export const quoteAdd = (data) => defHttp.post({ url: Api.quoteAdd, data });
export const quoteEdit = (data) => defHttp.post({ url: Api.quoteEdit, data });
export const quoteRevoke = (params, handleSuccess) => {
  return defHttp.post({ url: Api.quoteRevoke, params }, { joinParamsToUrl: true }).then(() => {
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

