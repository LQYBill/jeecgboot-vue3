import type { FormSchema } from '/@/components/Form';
import {h} from "vue";
import {Tooltip} from "ant-design-vue";
import { useI18n } from '/@/hooks/web/useI18n';
import { render } from '/@/utils/common/renderUtils';

const { t } = useI18n();

const headerWrap = () => ({
  style: { whiteSpace: 'normal', lineHeight: '1.2' },
});

const priorityModeOptions = [
  { label: t('data.quotation.priorityMode.dropShipping'), value: 'dropShipping' },
  { label: t('data.quotation.priorityMode.stockMode'), value: 'stockMode' },
];

const legacyPriorityMode = {
  dropShipping: '一件代发',
  stockMode: '库存模式',
};

const inquiryDisplayMaps = {
  client: new Map<string, string>(),
  salesperson: new Map<string, string>(),
  country: new Map<string, string>(),
};

export function setInquiryDisplayOptions(type: 'client' | 'salesperson' | 'country', options: any[] = []) {
  const target = inquiryDisplayMaps[type];
  target.clear();
  options.forEach((item) => {
    const value = item?.value ?? item?.id;
    const label = item?.label ?? item?.text ?? item?.name ?? value;
    if (value !== null && value !== undefined && value !== '') {
      target.set(String(value), String(label ?? ''));
    }
  });
}

function renderPriorityMode(value?: string) {
  if (value === 'dropShipping' || value === legacyPriorityMode.dropShipping) {
    return t('data.quotation.priorityMode.dropShipping');
  }
  if (value === 'stockMode' || value === legacyPriorityMode.stockMode) {
    return t('data.quotation.priorityMode.stockMode');
  }
  return value || '';
}

function firstNonEmpty(...values: any[]) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return '';
}

function normalizeDisplayValue(value: any) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value.includes(',')) {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return value;
}

function mapValueWithOptions(value: any, type: 'client' | 'salesperson' | 'country') {
  const normalized = normalizeDisplayValue(value);
  if (Array.isArray(normalized)) {
    return normalized
      .map((item) => inquiryDisplayMaps[type].get(String(item)) || String(item))
      .filter(Boolean)
      .join(', ');
  }
  if (normalized === null || normalized === undefined || normalized === '') return '';
  return inquiryDisplayMaps[type].get(String(normalized)) || normalized;
}

function showRecordText(record: any, ...keys: string[]) {
  return firstNonEmpty(...keys.map((key) => record?.[key]));
}

function renderImageSafe(text?: string) {
  const value = String(text || '').trim();
  if (!value) return '';
  return render.renderImage({ text: value } as any);
}

export interface InquiryLinkEntry {
  title: string;
  url: string;
}

function normalizeLinkArray(arr: any[]): InquiryLinkEntry[] {
  return arr
    .map((item) =>
      typeof item === 'string' ? { title: '', url: item } : { title: String(item?.title || ''), url: String(item?.url || '') }
    )
    .filter((item) => item.url.trim());
}

export function parseInquiryLinks(raw: any): InquiryLinkEntry[] {
  if (Array.isArray(raw)) return normalizeLinkArray(raw);
  const value = String(raw ?? '').trim();
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return normalizeLinkArray(parsed);
  } catch {
    // not JSON, fall through to legacy plain-text handling
  }
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url) => ({ title: '', url }));
}

export function serializeInquiryLinks(rows: InquiryLinkEntry[]): string {
  const cleaned = (rows || [])
    .map((row) => ({ title: (row.title || '').trim(), url: (row.url || '').trim() }))
    .filter((row) => row.url);
  return cleaned.length ? JSON.stringify(cleaned) : '';
}

// Shared read-only renderer for a list of inquiry links, used by both the inquiry
// and quotation tables so the two stay visually consistent.
export function renderInquiryLinksCell(raw: any) {
  const links = parseInquiryLinks(raw);
  if (!links.length) return '';
  const open = (url: string) => (e?: Event) => {
    e?.stopPropagation?.();
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
    links.map((link, index) =>
      h(
        Tooltip,
        { key: index, title: link.url },
        {
          default: () =>
            h(
              'a',
              {
                onClick: open(link.url),
                style: {
                  display: 'block',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              },
              link.title ? `${link.title}: ${link.url}` : link.url
            ),
        }
      )
    )
  );
}

export const inquiryColumns = [
  {
    title: t('data.quotation.col.inquiryClient'),
    dataIndex: 'inquiryClient_dictText',
    width: 140,
    customRender: ({ record }) =>
      firstNonEmpty(
        showRecordText(record, 'inquiryClient_dictText', 'clientName'),
        mapValueWithOptions(firstNonEmpty(record?.inquiryClient, record?.clientId), 'client')
      ),
  },
  {
    title:t('data.quotation.col.inquirySales'),
    dataIndex: 'inquirySales_dictText',
    width: 120,
    customRender: ({ record }) =>
      firstNonEmpty(
        showRecordText(record, 'inquirySales_dictText', 'salespersonNames'),
        mapValueWithOptions(firstNonEmpty(record?.inquirySales, record?.salesId), 'salesperson')
      ),
  },
  { title: t('data.quotation.col.inquiryLink'), dataIndex: 'inquiryLink', width: 260,
    customRender: ({ record }) => renderInquiryLinksCell(showRecordText(record, 'inquiryLink', 'inquiryUrl', 'link')),
  },
  {
    title: t('data.quotation.col.inquiryCountry'),
    dataIndex: 'inquiryCountry_dictText',
    width: 110,
    ellipsis: true,
    customHeaderCell: headerWrap,
    customRender: ({ record }) =>
      firstNonEmpty(
        showRecordText(record, 'inquiryCountry_dictText', 'countryName'),
        mapValueWithOptions(firstNonEmpty(record?.inquiryCountry, record?.countryId), 'country')
      ),
  },
  { title: t('data.quotation.col.expectedSales'), dataIndex: 'expectedSales', width: 90,customHeaderCell: headerWrap, },
  {
    title: t('data.quotation.col.inquiryPhoto'),
    dataIndex: 'inquiryPhoto',
    width: 90,
    customHeaderCell: headerWrap,
    customRender: ({ record }) => renderImageSafe(showRecordText(record, 'inquiryPhoto', 'photo')),
  },
  { title: t('data.quotation.col.inquirySpec'), dataIndex: 'inquirySpec', width: 160, customRender: ({ record }) => showRecordText(record, 'inquirySpec', 'specification') },
  { title: t('data.quotation.col.inquiryColor'), dataIndex: 'inquiryColor', width: 120, customRender: ({ record }) => showRecordText(record, 'inquiryColor', 'color') },
  { title: t('data.quotation.col.priorityMode'), dataIndex: 'priorityMode', width: 120, customRender: ({ text }) => renderPriorityMode(text) },
  { title: t('data.quotation.col.attachments'), dataIndex: 'attachments', width: 140,customHeaderCell: headerWrap, },
  { title: t('data.quotation.col.inquiryRemark'), dataIndex: 'inquiryRemark', width: 180, ellipsis: true, customRender: ({ record }) => showRecordText(record, 'inquiryRemark', 'remark') },
];

export const inquirySearchFormSchema: FormSchema[] = [
  { label: t('data.quotation.col.inquiryClient'), field: 'clientId', component: 'JDictSelectTag', colProps: { span: 8 },componentProps: { options: [], showSearch: true, allowClear: true, placeholder: t('common.chooseText') }, },
  { label: t('data.quotation.col.inquirySales'), field: 'salesId', component: 'JDictSelectTag', colProps: { span: 8 },componentProps: { options: [], showSearch: true, mode: 'multiple', maxTagCount: 'responsive', allowClear: true, placeholder: t('common.chooseText') }, },
  { label: t('data.quotation.col.inquiryCountry'), field: 'countryId', component: 'JDictSelectTag', colProps: { span: 8 },componentProps: { options: [], showSearch: true, placeholder: t('common.chooseText')}, },
];

export const inquiryFormSchema: FormSchema[] = [
  {
    label: t('data.quotation.col.inquiryClientUnregistered'),
    field: 'inquiryClientUnregistered',
    component: 'Switch',
    required: false,
    defaultValue: false,
  },
  {
    label: t('data.quotation.col.inquiryClient'),
    field: 'inquiryClient',
    component: 'JDictSelectTag',
    required: false,
    componentProps: { options: [], showSearch: true, allowClear: true },
    ifShow: ({ values }) => !values.inquiryClientUnregistered,
  },
  {
    label: t('data.quotation.col.inquiryClient'),
    field: 'inquiryClientText',
    component: 'Input',
    required: false,
    ifShow: ({ values }) => !!values.inquiryClientUnregistered,
  },
  {
    label: t('data.quotation.col.inquirySales'),
    field: 'inquirySales',
    component: 'JDictSelectTag',
    required: false,
    componentProps: { options: [],
      showSearch: true,
      mode: 'multiple',
      maxTagCount: 'responsive',
      allowClear: true,
    },
  },
  {
    label: t('data.quotation.col.inquiryCountry'),
    field: 'inquiryCountry',
    component: 'JDictSelectTag',
    required: true,
    defaultValue: [],
    componentProps: {
      options: [],
      showSearch: true,
      mode: 'multiple',
      maxTagCount: 'responsive',
      allowClear: true,
    },
  },
  {
    label: t('data.quotation.col.inquiryLink'),
    field: 'inquiryLink',
    component: 'InputTextArea',
    required: true,
    slot: 'inquiryLinks',
  },
  {
    label: t('data.quotation.col.expectedSales'),
    field: 'expectedSales',
    component: 'InputNumber',
    required: true,
    componentProps: { min: 0, precision: 0, style: { width: '100%' } },
  },
  {
    label: t('data.quotation.col.inquiryPhoto'),
    field: 'inquiryPhoto',
    component: 'JImageUpload',
    required: false,
    componentProps: {
      text: t('component.upload.imgUpload'),
    },
  },
  { label: t('data.quotation.col.inquirySpec'), field: 'inquirySpec', component: 'Input', required: false },
  { label: t('data.quotation.col.inquiryColor'), field: 'inquiryColor', component: 'Input', required: false },
  {
    label: t('data.quotation.col.priorityMode'),
    field: 'priorityMode',
    component: 'Select',
    required: false,
    componentProps: {
      allowClear: true,
      options: priorityModeOptions,
    },
  },
  {
    label: t('data.quotation.col.attachments'),
    field: 'attachments',
    component: 'JUpload',
    required: false,
    componentProps: {
      text: t('component.upload.upload'),
    },
  },
  {
    label: t('data.quotation.col.inquiryRemark'),
    field: 'inquiryRemark',
    component: 'InputTextArea',
    required: false,
    componentProps: { rows: 3 },
  },
];
