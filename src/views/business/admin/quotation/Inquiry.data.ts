import type { FormSchema } from '/@/components/Form';
import {h} from "vue";
import {Tooltip} from "ant-design-vue";
import { useI18n } from '/@/hooks/web/useI18n';

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

function renderPriorityMode(value?: string) {
  if (value === 'dropShipping' || value === legacyPriorityMode.dropShipping) {
    return t('data.quotation.priorityMode.dropShipping');
  }
  if (value === 'stockMode' || value === legacyPriorityMode.stockMode) {
    return t('data.quotation.priorityMode.stockMode');
  }
  return value || '';
}

export const inquiryColumns = [
  { title: t('data.quotation.col.inquiryClient'), dataIndex: 'inquiryClient_dictText', width: 140 },
  { title:t('data.quotation.col.inquirySales'), dataIndex: 'inquirySales_dictText', width: 120 },
  { title: t('data.quotation.col.inquiryLink'), dataIndex: 'inquiryLink', width: 260, ellipsis: true,
    customRender: ({ text }) => {
      const url = (text || '').trim();
      if (!url) return '';
      const open = (e) => {
        e?.stopPropagation?.();
        window.open(url, '_blank', 'noopener,noreferrer');
      };
      return h(
        Tooltip,
        { title: url },
        {
          default: () =>
            h(
              'a',
              {
                onClick: open,
                style: {
                  display: 'inline-block',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              },
              url
            ),
        }
      );
    },
  },
  { title: t('data.quotation.col.inquiryCountry'), dataIndex: 'inquiryCountry_dictText', width: 110, ellipsis: true,customHeaderCell: headerWrap, },
  { title: t('data.quotation.col.expectedSales'), dataIndex: 'expectedSales', width: 90,customHeaderCell: headerWrap, },
  { title: t('data.quotation.col.inquiryPhoto'), dataIndex: 'inquiryPhoto', width: 90,customHeaderCell: headerWrap, },
  { title: t('data.quotation.col.inquirySpec'), dataIndex: 'inquirySpec', width: 160 },
  { title: t('data.quotation.col.inquiryColor'), dataIndex: 'inquiryColor', width: 120 },
  { title: t('data.quotation.col.priorityMode'), dataIndex: 'priorityMode', width: 120, customRender: ({ text }) => renderPriorityMode(text) },
  { title: t('data.quotation.col.attachments'), dataIndex: 'attachments', width: 140,customHeaderCell: headerWrap, },
  { title: t('data.quotation.col.inquiryRemark'), dataIndex: 'inquiryRemark', width: 180, ellipsis: true },
];

export const inquirySearchFormSchema: FormSchema[] = [
  { label: t('data.quotation.col.inquiryClient'), field: 'inquiryClient', component: 'JDictSelectTag', colProps: { span: 8 },componentProps: { dictCode: 'client,internal_code,id',showSearch: true, placeholder: t('common.chooseText') }, },
  { label: t('data.quotation.col.inquirySales'), field: 'inquirySales', component: 'JDictSelectTag', colProps: { span: 8 },componentProps: { dictCode: "sys_user where org_code <> 'A02' ,username,id",showSearch: true, placeholder: t('common.chooseText') }, },
  { label: t('data.quotation.col.inquiryCountry'), field: 'inquiryCountry', component: 'JDictSelectTag', colProps: { span: 8 },componentProps: { options: [], showSearch: true, placeholder: t('common.chooseText')}, },
];

export const inquiryFormSchema: FormSchema[] = [
  {
    label: t('data.quotation.col.inquiryClient'),
    field: 'inquiryClient',
    component: 'JDictSelectTag',
    required: false,
    componentProps: { dictCode: 'client,internal_code,id' ,showSearch: true},
  },
  {
    label: t('data.quotation.col.inquirySales'),
    field: 'inquirySales',
    component: 'JDictSelectTag',
    required: false,
    componentProps: { dictCode: "sys_user where org_code <> 'A02' ,username,id",
      showSearch: true
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
    componentProps: { rows: 3 },
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
