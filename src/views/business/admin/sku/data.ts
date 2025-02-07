import {defHttp} from "@/utils/http/axios";
import {FormSchema} from "@/components/Form";
import {Ref} from "vue";
import {BasicColumn} from "@/components/Table";
import {useI18n} from "@/hooks/web/useI18n";
import {Sku} from "@/views/business/dto/sku.dto";
import dayjs from "dayjs";

const { t } = useI18n();

export const Api = {
  CATEGORY_LIST: '/skuCategory/list',
  PRODUCT_LIST: '/product/listByCategory',
  SHOP_LIST: '/shop/shopGroupedByClient',
  SUBCATEGORY_LIST: '/skuSubcategory/listByCategory',
  CRITERIA_LIST: '/skuCriteria/listByCategory',
  CRITERIA_VALUE_LIST: '/skuCriteriaValue/listByCriteria',
  TRANSLATED_CRITERIA_VALUE: '/skuCriteriaValue/translateValueByCriteria',
  TRANSLATED_PRODUCT_NAME: '/product/translateProductNameByValue',
  CLIENT_LIST: "/client/client/all",
  SEARCH_EXISTING_SKU: '/sku/searchExistingSkuByKeywords',
  SENSITIVE_ATTRIBUTE_LIST: '/sensitiveAttribute/list',
  LABEL_DATA_LIST: '/labelData/list',
  CREATE_MABANG_SKU: '/sku/createMabangSku',
  SKU_SYNC: '/sku/syncSkus',
  UNPAIRED_SKU_LIST: '/sku/unpairedSkus',
  EXCEL_EXPORT_MABANG_CREATED_SKU: '/sku/exportNewMabangSkusXls',
}
export const categoryListApi = async () => {
  return await defHttp.get({ url: Api.CATEGORY_LIST });
}
export const subcategoryListApi = async (categoryCode: string) => {
  return await defHttp.get({ url: Api.SUBCATEGORY_LIST, params: {categoryCode} });
}
export const criteriaListApi = async (categoryCode: string) => {
  return await defHttp.get({ url: Api.CRITERIA_LIST, params: {categoryCode} });
}
export const criteriaValueListApi = async (criteriaId: string) => {
  return await defHttp.get({ url: Api.CRITERIA_VALUE_LIST, params: {criteriaId} });
}
export const translatedValueByCriteriaApi = async (criteria: string, field: string, value: string) => {
  return await defHttp.get({ url: Api.TRANSLATED_CRITERIA_VALUE, params: {criteria, field, value} });
}
export const translatedProductNameApi = async (field: string, categoryCode: string, value: string) => {
  return await defHttp.get({ url: Api.TRANSLATED_PRODUCT_NAME, params: {field, categoryCode, value} });
}
export const clientListApi = async () => {
  return await defHttp.get({ url: Api.CLIENT_LIST });
}
export const searchExistingSkuApi = async (keywords: string, signal: AbortSignal) => {
  return await defHttp.get({ url: Api.SEARCH_EXISTING_SKU, params: {keywords}, signal });
}
export const sensitiveAttributeListApi = async () => {
  return await defHttp.get({ url: Api.SENSITIVE_ATTRIBUTE_LIST });
}
export const labelDataListApi = async () => {
  return await defHttp.get({ url: Api.LABEL_DATA_LIST });
}
export const createMabangSkuApi = async (skus: Sku[]) => {
  return await defHttp.post({ url: Api.CREATE_MABANG_SKU, params: skus });
}
export const skuSyncApi = async (skus: string[]) => {
  return await defHttp.post({ url: Api.SKU_SYNC, params: skus });
}
export const productListApi = async (categoryCode: string) => {
  return await defHttp.get({ url: Api.PRODUCT_LIST, params: {categoryCode} });
}
export const shopListApi = async (handler:Function) => {
  return await defHttp.get({url: Api.SHOP_LIST}).then((res) => {
    handler(res);
  });
}
export const listUnpairedSkus = async (params, handler:Function) => {
  return await defHttp.get({url: Api.UNPAIRED_SKU_LIST, params}).then((res) => {
    handler(res);
  });
}

export function skuCodeBuilderFormSchema(
  categoryList: Ref<Array<any>>,
  clientList: Ref<Array<any>>,
  updateErpCode: Function,
): FormSchema[] {
  return [
    {
      field: 'category',
      label: 'Category',
      component: 'JSelectInput',
      componentProps : {
        style: { borderLeft: '4px solid #f50' },
        options: categoryList,
        showSearch: true,
        placeholder: 'Category',
        onChange: (value: any) => {
          updateErpCode('category', value);
        },
      },
      itemProps: {
        id: 'category',
        labelAlign: 'left',
      },
      required: true,
    },
    // {
    //   field: 'subcategory',
    //   label: 'Subcategory',
    //   component: 'JSearchSelect',
    //   componentProps : {
    //     style: { borderLeft: '4px solid #2db7f5' },
    //     showSearch: true,
    //     placeholder: 'Subcategory',
    //     onChange: (value: any) => {
    //       console.log('onChange', value);
    //       updateErpCode('subcategory', value);
    //     },
    //     disabled: true,
    //   },
    //   itemProps: {
    //     id: 'subcategory',
    //     labelAlign: 'left',
    //   },
    //   required: true,
    // },
    {
      field: 'client',
      label: 'Client',
      component: 'JSearchSelect',
      componentProps : {
        style: { borderLeft: '4px solid #000' },
        options: clientList,
        showSearch: true,
        placeholder: 'Client',
        onChange: (value: any) => {
          updateErpCode('client', value);
        },
      },
      itemProps: {
        id: 'client',
        labelAlign: 'left',
      },
      required: true,
    }
  ];
}
export const tableColumns: BasicColumn[] = [
  {
    title: 'SKU ID',
    dataIndex: 'id',
    key: 'id',
    defaultHidden: true,
  },
  {
    title: 'ERP Code',
    dataIndex: 'erpCode',
    key: 'erpCode',
  },
  {
    title: t('data.enName'),
    dataIndex: 'enName',
    key: 'enName',
  },
  {
    title: t('data.zhName'),
    dataIndex: 'zhName',
    key: 'zhName',
  },
  {
    title: t('data.sku.weight'),
    dataIndex: 'weight',
    key: 'weight',
    width: 80,
  },
  {
    title: t('data.sku.weightEffectiveDate'),
    dataIndex: 'weightEffectiveDate',
    key: 'weightEffectDate',
    width: 110,
    slots: { customRender: 'weightEffectDate' },
  },
  {
    title: t('data.sku.availableAmount'),
    dataIndex: 'availableAmount',
    key: 'availableAmount',
    width: 80,
  },
  {
    title: t('data.sku.purchasingAmount'),
    dataIndex: 'purchasingAmount',
    key: 'purchasingAmount',
    width: 90,
  },
  {
    title: t('data.sku.imageSource'),
    dataIndex: 'imageSource',
    key: 'imageSource',
    slots: {customRender: 'image'}
  },
  {
    title: t('data.sku.shippingDiscount'),
    dataIndex: 'shippingDiscount',
    key: 'shippingDiscount',
    width: 80,
  },
  {
    title: t('data.sku.serviceFee'),
    dataIndex: 'serviceFee',
    key: 'serviceFee',
    width: 80,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 70,
  },
  {
    title: 'MOQ',
    dataIndex: 'moq',
    key: 'moq',
    width: 70,
    defaultHidden: true,
  },
  {
    title: t('data.sku.sensitiveAttribute'),
    dataIndex: 'sensitiveAttribute',
    key: 'sensitiveAttribute',
    width: 100,
  },
  {
    title: t('data.sku.isGift'),
    dataIndex: 'isGift',
    key: 'isGift',
    width: 70,
  },
  {
    title: t('data.sku.skuPrice'),
    dataIndex: 'skuPrice',
    key: 'skuPrice',
    width: 80,
  },
  {
    title: t('data.sku.declaredValue'),
    dataIndex: 'declaredValue',
    width: 100,
  }
  ,{
    title: t('common.operation.action'),
    dataIndex: 'action',
    key: 'action',
    fixed: 'right',
    slots: { customRender: 'action' },
    width: 100,
  },
];
export const reviewColumns: BasicColumn[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    defaultHidden: true,
  },
  {
    title: 'ERP Code',
    dataIndex: 'erpCode',
    width: 200,
  },
  {
    title: t('data.enName'),
    dataIndex: 'enName',
    width: 200,
    editRow: true,
  },
  {
    title: t('data.zhName'),
    dataIndex: 'zhName',
    width: 200,
    editRow: true,
  },
  {
    title: t('data.sku.declareEname'),
    dataIndex: 'declareEname',
    width: 200,
    editRow: true,
  },
  {
    title: t('data.sku.declareName'),
    dataIndex: 'declareName',
    width: 200,
    editRow: true,
  },
  {
    title: t('data.sku.weight'),
    dataIndex: 'weight',
    editRow: true,
    width: 150,
    editComponentProps: {
      prefix: t('data.shipping.gram'),
    },
    editComponent: 'InputNumber',
  },
  {
    title: t('data.sku.shippingDiscount'),
    dataIndex: 'shippingDiscount',
    editRow: true,
    width: 150,
    editComponentProps: {
      prefix: '€',
    },
    editComponent: 'InputNumber',
  },
  {
    title: t('data.sku.serviceFee'),
    dataIndex: 'serviceFee',
    editRow: true,
    width: 150,
    editComponentProps: {
      prefix: '€',
    },
    editComponent: 'InputNumber',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 70,
    slots: { customRender: 'status' },
  },
  {
    title: t('data.sku.sensitiveAttribute'),
    dataIndex: 'sensitiveAttribute',
    width: 200,
    editRow: true,
    editComponent: 'ApiSelect',
    editComponentProps: {
      api: sensitiveAttributeListApi,
      resultField: 'records',
      labelField: 'zhName',
      valueField: 'zhName',
    },
  },
  {
    title: t('data.sku.labelData'),
    dataIndex: 'labelData',
    width: 200,
    editRow: true,
    editComponent: 'ApiSelect',
    editComponentProps: {
      api: labelDataListApi,
      resultField: 'records',
      labelField: 'name',
      valueField: 'name',
    },
  },
  {
    title: t('data.sku.isGift'),
    dataIndex: 'isGift',
    width: 150,
    editRow: true,
    editComponent: 'Switch',
    editValueMap: (value) => {
      return value === 1 ? t('common.yes') : t('common.no');
    },
  },
  {
    title: t('data.sku.skuPrice'),
    dataIndex: 'skuPrice',
    editRow: true,
    width: 150,
    editComponentProps: {
      prefix: '€',
    },
    editComponent: 'InputNumber',
  },
  {
    title: t('data.sku.declaredValue'),
    dataIndex: 'declaredValue',
    editRow: true,
    width: 150,
    editComponentProps: {
      prefix: '€',
    },
    editComponent: 'InputNumber',
  },
  {
    title: t('data.sku.supplier'),
    dataIndex: 'supplier',
    width: 200,
    editRow: true,
  },
  {
    title: t('data.sku.supplierLink'),
    dataIndex: 'supplierLink',
    width: 200,
    editRow: true,
  },
];
export function formatDateTime(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}
export function discountDecimalToPercentage(value: number): number {
  return (1-value) * 100;
}
export function discountPercentageToDecimal(value: number): number {
  return Math.round(10000-value*100) / 10000;
}

export const skuStatus = {
  1: '自动创建',
  2: '待开发',
  3: '正常',
  4: '清仓',
  5: '停止销售',
}

export const SkuColumns: BasicColumn[] = [
  {
    title: 'Mabang SKU ID',
    dataIndex: 'id',
    defaultHidden: true,
  },
  {
    title: t('data.sku.erpCode'),
    dataIndex: 'erpCode',
  },
  {
    title: t('data.enName'),
    dataIndex: 'enName',
  },
  {
    title: t('data.zhName'),
    dataIndex: 'zhName',
  },
  {
    title: t('data.sku.salePicture'),
    align: 'center',
    dataIndex: 'imageSource',
    slots: {customRender: 'image'}
  },
  {
    title: t('common.status.status'),
    dataIndex: 'status',
    slots: { customRender: 'status' },
    width: 70,
  },
  {
    title: t('data.sku.skuPrice'),
    dataIndex: 'skuPrice',
    width: 80
  },
  {
    title: t('data.sku.declaredValue'),
    dataIndex: 'declaredValue',
    width: 80
  },
  {
    title: t('data.sku.isGift'),
    dataIndex: 'isGift',
    width: 70,
    slots: { customRender: 'isGift' },
  },
  {
    title: t('data.sku.sensitiveAttribute'),
    dataIndex: 'sensitiveAttribute',
    width: 100,
    slots: { customRender: 'sensitiveAttribute' },
  },
  {
    title: t('data.invoice.warehouse'),
    dataIndex: 'warehouse',
  }
];

export const numberColumns = ['weight', 'shippingDiscount', 'serviceFee', 'skuPrice', 'declaredValue', 'isGift'];


export const tempSkuCommonSchema = (updateFieldsValue:Function): FormSchema[] =>
{
  return [
    {
      field: 'skuPrice',
      label: t('data.sku.skuPrice'),
      component: 'InputNumber',
      componentProps: {
        placeholder: t('data.sku.skuPrice'),
        min: 0,
        style: {width: '100%'},
        addonAfter: '€',
        onBlur: (e: FocusEvent) => {
          updateFieldsValue('skuPrice', (e.target as HTMLInputElement).value);
        },
      },
      itemProps: {
        id: 'skuPrice',
      },
      defaultValue: 0
    },
    {
      field: 'declaredValue',
      label: t('data.sku.declaredValue'),
      component: 'InputNumber',
      componentProps: {
        placeholder: t('data.sku.declaredValue'),
        min: 0,
        style: {width: '100%'},
        addonAfter: '€',
        onBlur: (e: FocusEvent) => {
          updateFieldsValue('declaredValue', (e.target as HTMLInputElement).value);
        },
      },
      itemProps: {
        id: 'declaredValue',
      },
      defaultValue: 0
    },
    {
      field: 'serviceFee',
      label: t('data.sku.serviceFee'),
      component: 'InputNumber',
      componentProps: {
        placeholder: t('data.sku.serviceFee'),
        min: 0,
        style: {width: '100%'},
        addonAfter: '€',
        onBlur: (e: FocusEvent) => {
          updateFieldsValue('serviceFee', (e.target as HTMLInputElement).value);
        },
      },
      itemProps: {
        id: 'serviceFee',
      },
      defaultValue: 0
    },
    {
      field: 'shippingDiscount',
      label: t('data.sku.shippingDiscount'),
      component: 'InputNumber',
      componentProps: {
        placeholder: t('data.sku.shippingDiscount'),
        min: 0,
        precision: 0,
        style: {width: '100%'},
        addonAfter: '%',
        onBlur: (e: FocusEvent) => {
          updateFieldsValue('shippingDiscount', (e.target as HTMLInputElement).value);
        },
      },
      itemProps: {
        id: 'shippingDiscount',
      },
      defaultValue: 0
    },
    {
      field: 'weight',
      label: t('data.sku.weight'),
      component: 'InputNumber',
      componentProps: {
        placeholder: t('data.sku.weight'),
        min: 0,
        style: {width: '100%'},
        onBlur: (e: FocusEvent) => {
          updateFieldsValue('weight', (e.target as HTMLInputElement).value);
        },
      },
      itemProps: {
        addonAfter: t('data.shipping.gram'),
        id: 'weight',
      },
      defaultValue: 0
    },
    {
      field: 'sensitiveAttribute',
      label: t('data.sku.sensitiveAttribute'),
      component: 'JSearchSelect',
      componentProps: {
        dict: 'sensitive_attribute, zh_name, zh_name',
        placeholder: t('data.sku.sensitiveAttribute'),
        style: {width: '100%'},
        onChange: (e: string) => {
          updateFieldsValue('sensitiveAttribute', e);
        },
      },
      itemProps: {
        id: 'sensitiveAttribute',
      }
    },
    {
      field: 'labelData',
      label: t('data.sku.labelData'),
      component: 'JSelectMultiple',
      componentProps: {
        dictCode: 'label_data,name,name',
        placeholder: t('data.sku.labelData'),
        style: {width: '100%'},
        onChange: (e: string) => {
          updateFieldsValue('labelData', e);
        },
      },
      itemProps: {
        id: 'labelData',
      }
    },
    {
      field: 'supplier',
      label: t('data.sku.supplier'),
      component: 'Input',
      componentProps: {
        placeholder: t('data.sku.supplier'),
        style: {width: '100%'},
        onBlur: (e: FocusEvent) => {
          updateFieldsValue('supplier', (e.target as HTMLInputElement).value);
        },
      },
      itemProps: {
        id: 'supplier',
      },
      defaultValue: '临时供货商'
    },
    {
      field: 'supplierLink',
      label: t('data.sku.supplierLink'),
      component: 'Input',
      componentProps: {
        placeholder: t('data.sku.supplierLink'),
        style: {width: '100%'},
        onBlur: (e: Event) => {
          updateFieldsValue('supplierLink', (e.target as HTMLInputElement).value);
        },
      },
      itemProps: {
        id: 'supplierLink',
      }
    },
    {
      field: 'provider',
      label: t('data.sku.warehouse'),
      component: 'Input',
      componentProps: {
        placeholder: t('data.sku.warehouse'),
        style: {width: '100%'},
        onBlur: (e: FocusEvent) => {
          updateFieldsValue('provider', (e.target as HTMLInputElement)?.value);
        },
      },
      itemProps: {
        id: 'provider',
      },
      defaultValue: 'SZBA宝安仓'
    }
  ] as FormSchema[];
};
