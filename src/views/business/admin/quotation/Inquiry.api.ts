import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';

const { createConfirm } = useMessage();
const { t } = useI18n();

enum Api {
  inquiryList = '/inquiry/list',
  inquiryAdd = '/inquiry/add',
  inquiryEdit = '/inquiry/edit',
  inquiryQueryById = '/inquiry/queryById',
  clientQueryById = '/client/client/queryById',
  inquiryDeleteOne = '/inquiry/delete',
  inquiryDeleteBatch = '/inquiry/deleteBatch',
  importExcel = '/inquiry/importExcel',
  exportXls = '/inquiry/exportXls',

  salespersons = '/sys/user/salespersons',
  clientList = '/client/client/all',
  getCurrentClient = '/userClient/getClient',
  popularCountryList = '/country/popularList',
  logisticChannelListByCountry = '/business/logisticChannel/listByCountry',
}

function firstNonEmpty(...values: any[]) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return undefined;
}

function normalizeMultiValue(value: any): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeInquiryRecord(record: any) {
  if (!record || typeof record !== 'object') return record;
  const normalized = { ...record } as any;

  normalized.inquiryClient = firstNonEmpty(normalized.inquiryClient, normalized.clientId);
  normalized.inquirySales = normalizeMultiValue(
    firstNonEmpty(normalized.inquirySalesList, normalized.inquirySales, normalized.salesId)
  );
  normalized.inquiryCountry = normalizeMultiValue(
    firstNonEmpty(normalized.inquiryCountry, normalized.countryId)
  );
  normalized.inquiryLink = firstNonEmpty(normalized.inquiryLink, normalized.inquiryUrl, normalized.link, '');
  normalized.inquiryUrl = normalized.inquiryLink;
  normalized.inquiryPhoto = firstNonEmpty(normalized.inquiryPhoto, normalized.photo, '');
  normalized.inquirySpec = firstNonEmpty(normalized.inquirySpec, normalized.specification, '');
  normalized.inquiryColor = firstNonEmpty(normalized.inquiryColor, normalized.color, '');
  normalized.inquiryRemark = firstNonEmpty(normalized.inquiryRemark, normalized.remark, '');
  normalized.inquiryClient_dictText = firstNonEmpty(
    normalized.inquiryClient_dictText,
    normalized.clientName,
    normalized.clientInternalCode,
    ''
  );
  normalized.inquirySales_dictText = firstNonEmpty(
    normalized.inquirySales_dictText,
    normalized.salespersonNames,
    normalized.salesName,
    ''
  );
  normalized.inquiryCountry_dictText = firstNonEmpty(
    normalized.inquiryCountry_dictText,
    normalized.countryName,
    normalized.countryNameEn,
    ''
  );
  return normalized;
}

function normalizeInquiryResponse(resp: any) {
  if (Array.isArray(resp)) {
    return resp.map(normalizeInquiryRecord);
  }

  if (!resp || typeof resp !== 'object') return resp;

  const next = { ...resp } as any;
  if (Array.isArray(next.result)) {
    next.result = next.result.map(normalizeInquiryRecord);
    return next;
  }

  if (Array.isArray(next.records)) {
    next.records = next.records.map(normalizeInquiryRecord);
    return next;
  }

  if (next.result && Array.isArray(next.result.records)) {
    next.result = {
      ...next.result,
      records: next.result.records.map(normalizeInquiryRecord),
    };
    return next;
  }

  if (next.result && typeof next.result === 'object') {
    next.result = normalizeInquiryRecord(next.result);
    return next;
  }

  return normalizeInquiryRecord(next);
}

function unwrapList(resp: any) {
  const result = resp?.result ?? resp;
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.records)) return result.records;
  return [];
}

function salespersonToOption(item: any) {
  const value = item?.value ?? item?.id;
  const label = item?.label ?? item?.text ?? item?.username ?? value;
  return value ? { label: String(label), value: String(value) } : null;
}

function clientToOption(item: any) {
  const value = item?.id ?? item?.value;
  const label = item?.internalCode ?? item?.internal_code ?? item?.label ?? item?.text ?? value;
  return value ? { label: String(label), value: String(value) } : null;
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
  const priceFromReference =
    item?.priceFromReference === true ||
    item?.priceFromReference === 'true' ||
    item?.price_from_reference === true ||
    item?.price_from_reference === 'true';
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

export const inquiryList = async (params) => {
  const resp = await defHttp.get({ url: Api.inquiryList, params });
  return normalizeInquiryResponse(resp);
};
export const inquiryAdd = (data) => defHttp.post({ url: Api.inquiryAdd, data });
export const inquiryEdit = (data) => defHttp.post({ url: Api.inquiryEdit, data });
export const inquiryQueryById = async (params) => {
  const resp = await defHttp.get({ url: Api.inquiryQueryById, params }, { errorMessageMode: 'none' });
  return normalizeInquiryResponse(resp);
};
export const getInquiryClientSalespersons = async (clientId: string) => {
  if (!clientId) return [];
  const resp = await defHttp.get({ url: Api.clientQueryById, params: { id: clientId } });
  const result = resp?.result ?? resp;
  const salespersonIds = result?.salespersonIds;
  if (Array.isArray(salespersonIds)) return salespersonIds.map(String).filter(Boolean);
  if (typeof salespersonIds === 'string') {
    return salespersonIds
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};
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

export const getImportUrl = Api.importExcel;
export const getExportUrl = Api.exportXls;

export const getCurrentClient = () => defHttp.get({ url: Api.getCurrentClient });
export const getSalespersons = async () => {
  const resp = await defHttp.get({ url: Api.salespersons });
  return unwrapList(resp).map(salespersonToOption).filter(Boolean);
};
export const getClientOptions = async () => {
  const resp = await defHttp.get({ url: Api.clientList });
  return unwrapList(resp).map(clientToOption).filter(Boolean);
};
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
