import type { BasicColumn } from '/@/components/Table';
import type { FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { h } from 'vue';
import { Tooltip, Tag } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
const dash = () => t('data.quotation.placeholder.dash');
const headerWrap = () => ({
  style: { whiteSpace: 'normal', lineHeight: '1.2' },
});
/** Link tool - renders a clickable link that opens in a new tab, with ellipsis and tooltip for long URLs */
function renderLink(text: string) {
  const url = (text || '').trim();
  if (!url) return '—';
  const open = (e: any) => {
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
}

/** image tool - safely renders an image if text is a valid URL, otherwise shows a placeholder */
function renderImageSafe(text?: string) {
  const v = (text || '').trim();
  if (!v) return '—';
  return render.renderImage({ text: v } as any);
}
function ynText(v: any) {
  if (v === 1 || v === '1' || v === true) return t('common.yes');
  if (v === 0 || v === '0' || v === false) return t('common.no');
  return dash();
}

/** renders a colored tag based on status value (1 = green "报价完成", 0 = orange "询单中") */
function statusText(v: any) {
  const baseStyle = {
    display: 'inline-block',
    width: '88px',
    textAlign: 'center',
  };
  if (v === '1' || v === 1) return h(Tag, { color: 'green', style: baseStyle }, () => t('data.quotation.statusText.quoted'));
  if (v === '0' || v === 0) return h(Tag, { color: 'orange', style: baseStyle }, () => t('data.quotation.statusText.inInquiry'));
  return dash();
}

/** utility to show dict text if available, otherwise show raw value, and if both are empty, show a placeholder */
function showDictText(record: any, dictKey: string, rawKey: string) {
  const dt = (record?.[dictKey] ?? '').toString().trim();
  if (dt) return dt;
  const raw = (record?.[rawKey] ?? '').toString().trim();
  return raw || '—';
}
const headerCls = (cls: string) => () => ({ class: cls });
export const columns: BasicColumn[] = [
  {
    title: t('data.quotation.col.status'),
    align: 'center',
    dataIndex: 'status',
    width: 110,
    customRender: ({ text }) => statusText(text),
  },
  // zone inquiry
  {
    title: t('data.quotation.tableGroup.inquiry'),
    align: 'center',
    customHeaderCell: headerCls('grp') as any,
    children: [
      {
        title:  t('data.quotation.col.inquiryClient'),
        align: 'center',
        dataIndex: 'inquiryClient_dictText',
        width: 140,
        ellipsis: true,
        customRender: ({ record }) => showDictText(record, 'inquiryClient_dictText', 'inquiryClient'),
      },
      {
        title: t('data.quotation.col.inquirySales'),
        align: 'center',
        dataIndex: 'inquirySales_dictText',
        width: 120,
        ellipsis: true,
        customRender: ({ record }) => showDictText(record, 'inquirySales_dictText', 'inquirySales'),
      },
      {
        title: t('data.quotation.col.inquiryCountry'),
        align: 'center',
        dataIndex: 'inquiryCountry_dictText',
        width: 160,
        ellipsis: true,
        customRender: ({ record }) => showDictText(record, 'inquiryCountry_dictText', 'inquiryCountry'),
      },
      {
        title: t('data.quotation.col.inquiryLink'),
        align: 'center',
        dataIndex: 'inquiryLink',
        width: 260,
        ellipsis: true,
        customRender: ({ text }) => renderLink(text),
      },
      { title: t('data.quotation.col.expectedSales'), align: 'center', dataIndex: 'expectedSales', width: 100,customHeaderCell: headerWrap, },
      {
        title: t('data.quotation.col.inquiryPhoto'),
        align: 'center',
        dataIndex: 'inquiryPhoto',
        width: 90,
        customHeaderCell: headerWrap,
        customRender: ({ text }) => renderImageSafe(text),
      },
      { title: t('data.quotation.col.inquirySpec'), align: 'center', dataIndex: 'inquirySpec', width: 180, ellipsis: true },
      { title: t('data.quotation.col.inquiryColor'), align: 'center', dataIndex: 'inquiryColor', width: 140, ellipsis: true },
      { title: t('data.quotation.col.inquiryRemark'), align: 'center', dataIndex: 'inquiryRemark', width: 200, ellipsis: true },
      { title: t('data.quotation.col.attachments'), align: 'center', dataIndex: 'attachments', width: 110 },
    ],
  },

  // zone quote
  {
    title: t('data.quotation.tableGroup.quote'),
    align: 'center',
    customHeaderCell: headerCls('grp') as any,
    children: [
      // product
      {
        title: t('data.quotation.tableGroup.product'),
        align: 'center',
        customHeaderCell: headerCls('grp') as any,
        children: [
          { title: t('data.quotation.col.productName'), align: 'center', dataIndex: 'productName', width: 200, ellipsis: true },
          { title: t('data.quotation.col.supplierSku'), align: 'center', dataIndex: 'supplierSku', width: 140, ellipsis: true },
          { title: t('data.quotation.col.moq'), align: 'center', dataIndex: 'moq', width: 110 },
          {
            title: t('data.quotation.col.photo'),
            align: 'center',
            dataIndex: 'photo',
            width: 90,
            customRender: ({ text }) => renderImageSafe(text),
          },
        ],
      },

      // client
      {
        title: t('data.quotation.tableGroup.customer'),
        align: 'center',
        customHeaderCell: headerCls('grp') as any,
        children: [
          {
            title: t('data.quotation.col.customerUrl'),
            align: 'center',
            dataIndex: 'customerUrl',
            width: 240,
            ellipsis: true,
            customRender: ({ text }) => renderLink(text),
          },
          { title: t('data.quotation.col.customerPrice'), align: 'center', dataIndex: 'customerPrice', width: 120,customHeaderCell: headerWrap, },
        ],
      },

      // logistics
      {
        title: t('data.quotation.tableGroup.logistics'),
        align: 'center',
        customHeaderCell: headerCls('grp') as any,
        children: [
          {
            title: t('data.quotation.col.country'),
            align: 'center',
            dataIndex: 'country_dictText',
            width: 160,
            ellipsis: true,
          },
          { title: t('data.quotation.col.logisticChannel'), align: 'center', dataIndex: 'logisticChannel_dictText', width: 160, ellipsis: true },
          { title: t('data.quotation.col.livraison'), align: 'center', dataIndex: 'livraison', width: 110, ellipsis: true },
          { title: t('data.quotation.col.prixAchat'), align: 'center', dataIndex: 'prixAchat', width: 110 },
          { title: t('data.quotation.col.logisticsFee'), align: 'center', dataIndex: 'logisticsFee', width: 110,customHeaderCell: headerWrap, },
          { title: t('data.quotation.col.totalFee'), align: 'center', dataIndex: 'totalFee', width: 110 },
          { title: t('data.quotation.col.expressWeightG'), align: 'center', dataIndex: 'expressWeightG', width: 110 ,customHeaderCell: headerWrap,},
        ],
      },

      // cost & profit
      {
        title: t('data.quotation.tableGroup.costProfit'),
        align: 'center',
        customHeaderCell: headerCls('grp') as any,
        children: [
          { title: t('data.quotation.col.purchasePriceRmb'), align: 'center', dataIndex: 'purchasePriceRmb', width: 110,customHeaderCell: headerWrap, },
          { title: t('data.quotation.col.domesticShippingRmb'), align: 'center', dataIndex: 'domesticShippingRmb', width: 120 ,customHeaderCell: headerWrap,},

          { title: t('data.quotation.col.costRmb'), align: 'center', dataIndex: 'costRmb', width: 110 },
          { title: t('data.quotation.col.costEur'), align: 'center', dataIndex: 'costEur', width: 110 },

          { title: t('data.quotation.col.salePriceRmb'), align: 'center', dataIndex: 'salePriceRmb', width: 110,customHeaderCell: headerWrap, },
          { title: t('data.quotation.col.salePriceEur'), align: 'center', dataIndex: 'salePriceEur', width: 110 },

          { title: t('data.quotation.col.partnerSalePrice'), align: 'center', dataIndex: 'partnerSalePrice', width: 130 },

          { title: t('data.quotation.col.profitRmb'), align: 'center', dataIndex: 'profitRmb', width: 110 },
          { title: t('data.quotation.col.profitEur'), align: 'center', dataIndex: 'profitEur', width: 110 },
          { title: t('data.quotation.col.margin'), align: 'center', dataIndex: 'margin', width: 100 },
          { title: t('data.quotation.col.grossWeightG'), align: 'center', dataIndex: 'grossWeightG', width: 110 ,customHeaderCell: headerWrap,},
          { title: t('data.quotation.col.packWeightG'), align: 'center', dataIndex: 'packWeightG', width: 110,customHeaderCell: headerWrap, },
          { title: t('data.quotation.col.expressWeightG'), align: 'center', dataIndex: 'expressWeightG', width: 110 ,customHeaderCell: headerWrap,},
        ],
      },

      // supplier & packaging
      {
        title: t('data.quotation.tableGroup.supplierPack'),
        align: 'center',
        customHeaderCell: headerCls('grp') as any,
        children: [
          {
            title: t('data.quotation.col.supplierLink'),
            align: 'center',
            dataIndex: 'supplierLink',
            width: 240,
            ellipsis: true,
            customRender: ({ text }) => renderLink(text),
          },
          { title: t('data.quotation.col.supplierName'), align: 'center', dataIndex: 'supplierName', width: 140, ellipsis: true },
          { title: t('data.quotation.col.supplierPrice'), align: 'center', dataIndex: 'supplierPrice', width: 110 },
          { title: t('data.quotation.col.inStock'), align: 'center', dataIndex: 'inStock', width: 100, customRender: ({ text }) => ynText(text) },

          { title: t('data.quotation.col.productSize'), align: 'center', dataIndex: 'productSize', width: 120, ellipsis: true },
          {
            title: t('data.quotation.col.productSizeImg'),
            align: 'center',
            dataIndex: 'productSizeImg',
            width: 90,
            customRender: ({ text }) => renderImageSafe(text),
          },

          { title: t('data.quotation.col.isVolumetric'), align: 'center', dataIndex: 'isVolumetric', width: 110, customRender: ({ text }) => ynText(text) },
          { title: t('data.quotation.col.category'), align: 'center', dataIndex: 'category', width: 140, ellipsis: true },
          { title: t('data.quotation.col.packageLength'), align: 'center', dataIndex: 'packageLength', width: 90,customHeaderCell: headerWrap, },
          { title: t('data.quotation.col.packageWidth'), align: 'center', dataIndex: 'packageWidth', width: 90,customHeaderCell: headerWrap, },
          { title: t('data.quotation.col.packageHeight'), align: 'center', dataIndex: 'packageHeight', width: 90 ,customHeaderCell: headerWrap,},

          { title: t('data.quotation.col.specification'), align: 'center', dataIndex: 'specification', width: 200, ellipsis: true },
          { title: t('data.quotation.col.colorNote'), align: 'center', dataIndex: 'colorNote', width: 160, ellipsis: true },

          {
            title: t('data.quotation.col.colorImg'),
            align: 'center',
            dataIndex: 'colorImg',
            width: 90,
            customHeaderCell: headerWrap,
            customRender: ({ text }) => renderImageSafe(text),
          },
          {
            title: t('data.quotation.col.outerPackageImg'),
            align: 'center',
            dataIndex: 'outerPackageImg',
            width: 90,
            customHeaderCell: headerWrap,
            customRender: ({ text }) => renderImageSafe(text),
          },
        ],
      },
    ],
  },
];


export const searchFormSchema: FormSchema[] = [
    {
      label: t('data.quotation.col.status'),
      field: 'status',
      component: 'Select',
      componentProps: {
        options: [
          { label: t('data.quotation.statusText.inInquiry'), value: '0' },
          { label: t('data.quotation.statusText.quoted'), value: '1' },
        ],
        allowClear: true,
      },
      colProps: { span: 6 },
    },
    {
      label: t('data.quotation.col.inquiryClient'),
      field: 'inquiryClient',
      component: 'JDictSelectTag',
      componentProps: { dictCode: 'client,internal_code,id', showSearch: true, allowClear: true ,},
      colProps: { span: 6 },
    },
    {
      label: t('data.quotation.col.inquirySales'),
      field: 'inquirySales',
      component: 'JDictSelectTag',
      componentProps: { dictCode: "sys_user where org_code <> 'A02',username,id", showSearch: true, allowClear: true, },
      colProps: { span: 6 },
    },
    {
      label: t('data.quotation.col.inquiryCountry'),
      field: 'inquiryCountry',
      component: 'JDictSelectTag',
      componentProps: { dictCode: 'country,name_en,id', showSearch: true, allowClear: true },
      colProps: { span: 6 },
    },
    {
      label: t('data.quotation.col.country'),
      field: 'country',
      component: 'JDictSelectTag',
      componentProps: { dictCode: 'country,name_en,id', showSearch: true, allowClear: true },
      colProps: { span: 6 },
    },
  ];


export const formSchema: FormSchema[] = [
    {
      label: t('data.quotation.col.status'),
      field: 'status',
      component: 'Select',
      colProps: { span: 12 },
      defaultValue: '0',
      componentProps: {
        options: [
          { label: t('data.quotation.statusText.inInquiry'), value: '0' },
          { label: t('data.quotation.statusText.quoted'), value: '1' },
        ],
        allowClear: false,
      },
      dynamicRules: () => [{ required: true, message: t('data.quotation.validate.chooseStatus') }],
    },

    // zone 1 inquiry info
    {
      field: 'd1',
      component: 'Divider',
      label: t('data.quotation.section.inquiryInfo'),
      colProps: { span: 24 },
      renderComponentContent: () => t('data.quotation.section.inquiryInfo'),
    },
    {
      label: t('data.quotation.col.inquiryClient'),
      field: 'inquiryClient',
      component: 'JDictSelectTag',
      colProps: { span: 12 },
      componentProps: { dictCode: 'client,internal_code,id', showSearch: true, allowClear: true },
    },
    {
      label: t('data.quotation.col.inquirySales'),
      field: 'inquirySales',
      component: 'JDictSelectTag',
      colProps: { span: 12 },
      componentProps: { dictCode: "sys_user where org_code <> 'A02',username,id", showSearch: true, allowClear: true },
    },
    {
      label: t('data.quotation.col.inquiryCountry'),
      field: 'inquiryCountry',
      component: 'JDictSelectTag',
      colProps: { span: 12 },
      defaultValue: [],
      componentProps: {
        dictCode: 'country,name_en,id',
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 'responsive',
        allowClear: true,
        style: { width: '100%' },
      },
      dynamicRules: () => [{ required: true, message: t('data.quotation.validate.chooseInquiryCountry') }],
    },
    {
      label: t('data.quotation.col.expectedSales'),
      field: 'expectedSales',
      component: 'InputNumber',
      colProps: { span: 12 },
      componentProps: { min: 0, precision: 0, style: { width: '100%' } },
      dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputExpectedSales') }],
    },
    {
      label: t('data.quotation.col.inquiryLink'),
      field: 'inquiryLink',
      component: 'InputTextArea',
      colProps: { span: 12 },
      componentProps: { rows: 2 },
      dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputInquiryLink') }],
    },
    { label: t('data.quotation.col.inquiryPhoto'), field: 'inquiryPhoto', component: 'JImageUpload', colProps: { span: 24 } ,
      componentProps: {
        text: t('component.upload.imgUpload'),
      },},
    { label: t('data.quotation.col.attachments'), field: 'attachments', component: 'JUpload', colProps: { span: 24 } ,
      componentProps: {
        text: t('component.upload.upload'),
      },},
    { label: t('data.quotation.col.inquirySpec'), field: 'inquirySpec', component: 'Input', colProps: { span: 12 } },
    { label: t('data.quotation.col.inquiryColor'), field: 'inquiryColor', component: 'Input', colProps: { span: 12 } },
    { label: t('data.quotation.col.inquiryRemark'), field: 'inquiryRemark', component: 'InputTextArea', colProps: { span: 12 }, componentProps: { rows: 2 } },

    // zone 2 product info
    {
      field: 'd2',
      component: 'Divider',
      label: t('data.quotation.section.productInfo'),
      colProps: { span: 24 },
      renderComponentContent: () => t('data.quotation.section.productInfo'),
    },
    {
      label: t('data.quotation.col.productName'),
      field: 'productName',
      component: 'Input',
      colProps: { span: 12 },
      dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputProductName') }],
    },
    { label: t('data.quotation.col.supplierSku'), field: 'supplierSku', component: 'Input', colProps: { span: 12 } },
    {
      label: t('data.quotation.col.moq'),
      field: 'moq',
      component: 'Input',
      colProps: { span: 12 },
      dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputMoq') }],
    },
    { label: t('data.quotation.col.customerPrice'), field: 'customerPrice', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' } } },
    {
      label: t('data.quotation.col.photo'),
      field: 'photo',
      component: 'JImageUpload',
      colProps: { span: 12 },
      componentProps: {
      text: t('component.upload.imgUpload'),
    },
      dynamicRules: () => [{ required: true, message: t('data.quotation.validate.uploadPhoto') }],
    },
    { label: t('data.quotation.col.customerUrl'), field: 'customerUrl', component: 'InputTextArea', colProps: { span: 12 }, componentProps: { rows: 2 } },

    // zone 3 logistics and fees
    {
      field: 'd3',
      component: 'Divider',
      label: t('data.quotation.section.logisticsFee'),
      colProps: { span: 24 },
      renderComponentContent: () => t('data.quotation.section.logisticsFee'),
    },
    {
      label: t('data.quotation.col.country'),
      field: 'country',
      component: 'JDictSelectTag',
      colProps: { span: 12 },
      componentProps: { dictCode: 'country,name_en,id', showSearch: true, allowClear: true },
      dynamicRules: () => [{ required: true, message: t('data.quotation.validate.chooseCountry') }],
    },
    {
      label: t('data.quotation.col.logisticChannel'),
      field: 'logisticChannel',
      component: 'JDictSelectTag',
      colProps: { span: 12 },
      componentProps: {
        dictCode: 'logistic_channel,zh_name,id',
        showSearch: true,
        allowClear: true,
      },
      dynamicRules: () => [{ required: true, message: t('data.quotation.validate.chooseLogisticChannel') }],
    },
    { label: t('data.quotation.col.livraison'), field: 'livraison', component: 'Input', colProps: { span: 12 } },
    { label: t('data.quotation.col.prixAchat'), field: 'prixAchat', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' }, precision: 2, disabled: true } },
    { label: t('data.quotation.col.logisticsFee'), field: 'logisticsFee', component: 'InputNumber', dynamicDisabled: true, colProps: { span: 12 }, componentProps: { style: { width: '100%' } } },
    { label: t('data.quotation.col.totalFee'), field: 'totalFee', component: 'InputNumber', dynamicDisabled: true, colProps: { span: 12 }, componentProps: { style: { width: '100%' } } },
    { label: t('data.quotation.col.expressWeightG'), field: 'expressWeightG', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' }, customHeaderCell: headerWrap,precision: 0, disabled: true } },

    { label: t('data.quotation.col.sizeRange'), field: 'sizeRange', component: 'Input', colProps: { span: 12 }, dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputSizeRange') }] },

    // zone 4 cost and profit
    {
      field: 'd4',
      component: 'Divider',
      label: t('data.quotation.section.costProfit'),
      colProps: { span: 24 },
      renderComponentContent: () => t('data.quotation.section.costProfit'),
    },
    { label: t('data.quotation.col.purchasePriceRmb'), field: 'purchasePriceRmb', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' } }, dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputPurchasePrice') }] },
    { label: t('data.quotation.col.domesticShippingRmb'), field: 'domesticShippingRmb', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' }, customHeaderCell: headerWrap,}, dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputDomesticShipping') }] },
    { label: t('data.quotation.col.costRmb'), field: 'costRmb', component: 'InputNumber', colProps: { span: 12 }, dynamicDisabled: true, componentProps: { style: { width: '100%' } } },
    { label: t('data.quotation.col.costEur'), field: 'costEur', component: 'InputNumber', colProps: { span: 12 }, dynamicDisabled: true, componentProps: { style: { width: '100%' } } },
    { label: t('data.quotation.col.salePriceRmb'), field: 'salePriceRmb', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' } }, dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputSalePriceRmb') }] },
    { label: t('data.quotation.col.salePriceEur'), field: 'salePriceEur', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' }, disabled: true } },
    { label: t('data.quotation.col.partnerSalePrice'), field: 'partnerSalePrice', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' } }, dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputPartnerSalePrice') }] },
    { label: t('data.quotation.col.margin'), field: 'margin', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' }, precision: 4, disabled: true } },
    { label: t('data.quotation.col.profitRmb'), field: 'profitRmb', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' }, disabled: true } },
    { label: t('data.quotation.col.profitEur'), field: 'profitEur', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' }, disabled: true } },
    { label: t('data.quotation.col.expressWeightG'), field: 'expressWeightG', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' }, precision: 0, disabled: true } },
    { label: t('data.quotation.col.grossWeightG'), field: 'grossWeightG', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' } }, dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputGrossWeight') }] },
    { label: t('data.quotation.col.packWeightG'), field: 'packWeightG', component: 'Input', colProps: { span: 12 }, dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputPackWeight') }] },

    // zone 5 supplier and packaging
    {
      field: 'd5',
      component: 'Divider',
      label: t('data.quotation.section.supplierPack'),
      colProps: { span: 24 },
      renderComponentContent: () => t('data.quotation.section.supplierPack'),
    },
    { label: t('data.quotation.col.supplierLink'), field: 'supplierLink', component: 'InputTextArea', colProps: { span: 12 }, componentProps: { rows: 2 }, dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputSupplierLink') }] },
    { label: t('data.quotation.col.supplierName'), field: 'supplierName', component: 'Input', colProps: { span: 12 }, dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputSupplierName') }] },
    { label: t('data.quotation.col.supplierPrice'), field: 'supplierPrice', component: 'Input', colProps: { span: 12 }, componentProps: { style: { width: '100%' } }, dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputSupplierPrice') }] },
    { label: t('data.quotation.col.inStock'), field: 'inStock', component: 'JDictSelectTag', colProps: { span: 12 }, componentProps: { dictCode: 'yn', showSearch: false, allowClear: true } },
    { label: t('data.quotation.col.isVolumetric'), field: 'isVolumetric', component: 'JDictSelectTag', colProps: { span: 12 }, componentProps: { dictCode: 'yn', showSearch: false, allowClear: true } },
    { label: t('data.quotation.col.category'), field: 'category', component: 'Input', colProps: { span: 12 }, dynamicRules: () => [{ required: true, message: t('data.quotation.validate.inputCategory') }] },
    { label: t('data.quotation.col.packageLength'), field: 'packageLength', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' } } },
    { label: t('data.quotation.col.packageWidth'), field: 'packageWidth', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' } } },
    { label: t('data.quotation.col.packageHeight'), field: 'packageHeight', component: 'InputNumber', colProps: { span: 12 }, componentProps: { style: { width: '100%' } } },
    { label: t('data.quotation.col.specification'), field: 'specification', component: 'InputTextArea', colProps: { span: 12 }, componentProps: { rows: 2 } },
    { label: t('data.quotation.col.colorNote'), field: 'colorNote', component: 'Input', colProps: { span: 12 } },
    { label: t('data.quotation.col.productSize'), field: 'productSize', component: 'Input', colProps: { span: 12 } },
    { label: t('data.quotation.col.productSizeImg'), field: 'productSizeImg', component: 'JImageUpload', colProps: { span: 12 },
      componentProps: {
        text: t('component.upload.imgUpload'),
      }, },
    { label: t('data.quotation.col.colorImg'), field: 'colorImg', component: 'JImageUpload', colProps: { span: 12 },
      componentProps: {
        text: t('component.upload.imgUpload'),
      }, },
    { label: t('data.quotation.col.outerPackageImg'), field: 'outerPackageImg', component: 'JImageUpload', colProps: { span: 12 },
      componentProps: {
        text: t('component.upload.imgUpload'),
      }, },
  ];

export function getBpmFormSchema(_formData): FormSchema[] {
  return formSchema;
}
