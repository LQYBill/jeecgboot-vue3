import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { JVxeTypes, JVxeColumn } from '/@/components/jeecg/JVxeTable/types';
import { useI18n } from '@/hooks/web/useI18n';
import {useLocaleStore} from "@/store/modules/locale";
const { t } = useI18n();
const localeStore = useLocaleStore();
export const columns: BasicColumn[] = [
  {
    title: t('data.client.familyName'),
    align: 'center',
    sorter: true,
    dataIndex: 'surname',
  },
  {
    title: t('data.client.firstName'),
    align: 'center',
    sorter: true,
    dataIndex: 'firstName',
  },
  {
    title: t('data.abbreviation'),
    align: 'center',
    sorter: true,
    dataIndex: 'internalCode',
  },
  {
    title: t('data.InvoiceEntity'),
    align: 'center',
    dataIndex: 'invoiceEntity',
  },
  {
    title: t('data.client.email'),
    align: 'center',
    dataIndex: 'email',
  },
  {
    title: t('data.client.telephone'),
    align: 'center',
    dataIndex: 'phone',
  },
  {
    title: t('data.client.streetNumber'),
    align: 'center',
    dataIndex: 'streetNumber',
  },
  {
    title: t('data.client.streetName'),
    align: 'center',
    dataIndex: 'streetName',
  },
  {
    title: t('data.client.additionalAddress'),
    align: 'center',
    dataIndex: 'additionalAddress',
  },
  {
    title: t('data.client.postCode'),
    align: 'center',
    dataIndex: 'postcode',
  },
  {
    title: t('data.client.city'),
    align: 'center',
    dataIndex: 'city',
  },
  {
    title: t('data.client.country'),
    align: 'center',
    sorter: true,
    dataIndex: 'country_dictText',
  },
  {
    title: t('data.client.currency'),
    align: 'center',
    dataIndex: 'currency_dictText',
  },
  {
    title: t('data.sku.shippingDiscount'),
    align: 'center',
    dataIndex: 'shippingDiscount',
  },
  {
    title: t('data.client.companyIdType'),
    align: 'center',
    dataIndex: 'companyIdType',
  },
  {
    title: t('data.client.companyIdValue'),
    align: 'center',
    dataIndex: 'companyIdValue',
  },
  {
    title: t('data.client.iossNumber'),
    align: 'center',
    dataIndex: 'iossNumber',
  },
  {
    title: t('data.client.vatPercentage'),
    align: 'center',
    dataIndex: 'vatPercentage',
  },
  {
    title: t('data.client.active'),
    align: 'center',
    sorter: true,
    dataIndex: 'active_dictText',
  },
  {
    title: t('data.client.salesperson'),
    align: 'center',
    sorter: true,
    dataIndex: 'salesperson_dictText',
  },
  {
    title: t('data.client.isCompleteInvoice'),
    align: 'center',
    dataIndex: 'isCompleteInvoice_dictText',
  },
  {
    title: t('data.client.balanceThreshold'),
    align: 'center',
    dataIndex: 'balanceThreshold',
  },
  {
    title: t('data.client.isChronologicalOrder'),
    align: 'center',
    dataIndex: 'isChronologicalOrder_dictText',
  },
  {
    title: t('data.client.useBalance'),
    align: 'center',
    dataIndex: 'useBalance',
    customRender: ({ value }: {value: boolean}) => {
      return value ? t('common.yes') : t('common.no');
    },
  },
  {
    title: t('data.client.displayBalance'),
    align: 'center',
    dataIndex: 'displayBalance',
    customRender: ({ value }: {value: boolean}) => {
      return value ? t('common.yes') : t('common.no');
    },
  },
  {
    title: t('data.client.receiveInvoiceByEmail'),
    align: 'center',
    dataIndex: 'receiveInvoiceByEmail',
    customRender: ({ value }: {value: boolean}) => {
      return value ? t('common.yes') : t('common.no');
    },
  }
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: t('data.client.familyName'),
    field: 'surname',
    component: 'Input',
    dynamicRules: () => {
      return [{ required: true, message: t('common.inputText') + t('data.client.familyName') + '!' }];
    },
  },
  {
    label: t('data.client.firstName'),
    field: 'firstName',
    component: 'Input',
    dynamicRules: () => {
      return [{ required: true, message: t('common.inputText') + t('data.client.firstName') + '!' }];
    },
  },
  {
    label: t('data.abbreviation'),
    field: 'internalCode',
    component: 'Input',
    dynamicRules: () => {
      return [{ required: true, message: t('common.inputText') + t('data.abbreviation') + '!' }];
    },
  },
  {
    label: t('data.InvoiceEntity'),
    field: 'invoiceEntity',
    component: 'Input',
    dynamicRules: () => [
      {
        required: true,
        message: t('common.inputText') + " " + t('data.InvoiceEntity'),
      },
    ],
  },
  {
    label: t('data.client.email'),
    field: 'email',
    component: 'Input',
    dynamicRules: () => {
      return [{ required: true, message: t('common.inputText') +  t('data.client.email') + '!' }];
    },
  },
  {
    label: t('data.client.telephone'),
    field: 'phone',
    component: 'Input',
  },
  {
    label: t('data.client.streetNumber'),
    field: 'streetNumber',
    component: 'Input',
  },
  {
    label: t('data.client.streetName'),
    field: 'streetName',
    component: 'Input',
  },
  {
    label: t('data.client.additionalAddress'),
    field: 'additionalAddress',
    component: 'Input',
  },
  {
    label: t('data.client.postCode'),
    field: 'postcode',
    component: 'Input',
  },
  {
    label: t('data.client.city'),
    field: 'city',
    component: 'Input',
  },
  {
    label: t('data.client.country'),
    field: 'country',
    component: 'JSearchSelect',
    componentProps: {
      dict: 'country,name_zh,name_en',
    },
    dynamicRules: () => {
      return [{ required: true, message: t('common.inputText') + t('data.client.country') + '!' }];
    },
  },
  {
    label: t('data.client.currency'),
    field: 'currency',
    defaultValue: 'EUR',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: "currency where code != 'RMB',zh_name,code",
    },
    dynamicRules: () => {
      return [{ required: true, message: t('common.inputText') + t('data.client.currency') +'!' }];
    },
  },
  {
    label: t('data.sku.shippingDiscount'),
    field: 'shippingDiscount',
    defaultValue: 1,
    component: 'InputNumber',
  },
  {
    label: t('data.client.companyIdType'),
    field: 'companyIdType',
    component: 'Input',
  },
  {
    label: t('data.client.companyIdValue'),
    field: 'companyIdValue',
    component: 'Input',
  },
  {
    label: t('data.client.iossNumber'),
    field: 'iossNumber',
    component: 'Input',
  },
  {
    label: t('data.client.vatPercentage'),
    field: 'vatPercentage',
    defaultValue: 0.22,
    component: 'InputNumber',
    dynamicRules: () => {
      return [{ required: true, message: t('common.inputText') + t('data.client.vatPercentage') + '!' }];
    },
  },
  {
    label: t('data.client.active'),
    field: 'active',
    defaultValue: '1',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'yn',
    },
  },
  {
    label: t('data.client.salesperson'),
    field: 'salesperson',
    component: 'JSearchSelect',
    componentProps: {
      dict: 'sys_user,username,id',
    },
  },
  {
    label: t('data.client.isCompleteInvoice'),
    field: 'isCompleteInvoice',
    defaultValue: '0',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'yn',
    },
    dynamicRules: () => {
      return [{ required: true, message: t('common.inputText') + t('data.client.isCompleteInvoice')+'!' }];
    },
  },
  {
    label: t('data.client.balanceThreshold'),
    field: 'balanceThreshold',
    component: 'InputNumber',
  },
  {
    label: t('data.client.isChronologicalOrder'),
    field: 'isChronologicalOrder',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'yn',
    },
  },
  {
    label: t('data.client.useBalance'),
    field: 'useBalance',
    component: 'Switch',
    defaultValue: false,
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    colProps: { span: 12 },
    show: true,
  },
  {
    label: t('data.client.displayBalance'),
    field: 'displayBalance',
    component: 'Switch',
    defaultValue: true,
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    colProps: { span: 12 },
  },
  {
    label: t('data.client.receiveInvoiceByEmail'),
    field: 'receiveInvoiceByEmail',
    component: 'Switch',
    defaultValue: true,
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    colProps: { span: 12 },
  },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
];
//子表单数据
//子表表格配置
export const shopColumns: JVxeColumn[] = [
  {
    title: t('data.shop.website'),
    key: 'website',
    type: JVxeTypes.input,
    width: '200px',
    placeholder: t('common.inputText') + localeStore.getLocale === 'zh_CN' ?'${title}' : ' ${title}',
    defaultValue: '',
  },
  {
    title: t('data.sku.shippingDiscount'),
    key: 'shippingDiscount',
    type: JVxeTypes.inputNumber,
    width: '200px',
    placeholder: t('common.inputText') + localeStore.getLocale === 'zh_CN' ?'${title}' : ' ${title}',
    defaultValue: 1,
    validateRules: [{ required: true, message: localeStore.getLocale === 'zh_CN' ?'${title}' : '${title} ' + t('component.form.notEmpty') }],
  },
  {
    title: t('data.shop.ownerId'),
    key: 'ownerId',
    type: JVxeTypes.selectSearch,
    dictCode: 'client,internal_code,id',
    width: '200px',
    placeholder: t('common.inputText') + localeStore.getLocale === 'zh_CN' ?'${title}' : ' ${title}',
    defaultValue: '',
    validateRules: [{ required: false, message: '${title} ' + t('component.form.notEmpty') }],
    disabled: true
  },
  {
    title: t('data.shop.name'),
    key: 'name',
    type: JVxeTypes.input,
    width: '200px',
    placeholder: t('common.inputText') + localeStore.getLocale === 'zh_CN' ?'${title}' : ' ${title}',
    defaultValue: '',
    validateRules: [{ required: true, message: localeStore.getLocale === 'zh_CN' ?'${title}' : '${title} ' + t('component.form.notEmpty') }],
  },
  {
    title: t('data.shop.erpCode'),
    key: 'erpCode',
    type: JVxeTypes.input,
    width: '200px',
    placeholder: t('common.inputText') + localeStore.getLocale === 'zh_CN' ?'${title}' : ' ${title}',
    defaultValue: '',
    validateRules: [{ required: true, message: localeStore.getLocale === 'zh_CN' ?'${title}' : '${title} ' + t('component.form.notEmpty') }],
  },
  {
    title: t('data.shop.defaultSkuZhName'),
    key: 'defaultSkuZhName',
    type: JVxeTypes.input,
    width: '200px',
    placeholder: t('common.inputText') + localeStore.getLocale === 'zh_CN' ?'${title}' : ' ${title}',
    defaultValue: '',
  },
  {
    title: t('data.shop.orderServiceFee'),
    key: 'orderServiceFee',
    type: JVxeTypes.inputNumber,
    width: '200px',
    placeholder: t('common.inputText') + localeStore.getLocale === 'zh_CN' ?'${title}' : ' ${title}',
    defaultValue: 0,
    validateRules: [{ required: true, message: localeStore.getLocale === 'zh_CN' ?'${title}' : '${title} ' + t('component.form.notEmpty') }],
  },
  {
    title: t('data.client.active'),
    key: 'active',
    type: JVxeTypes.select,
    options: [],
    dictCode: 'yn',
    width: '200px',
    placeholder: t('common.inputText') + localeStore.getLocale === 'zh_CN' ?'${title}' : ' ${title}',
    defaultValue: '1',
    validateRules: [{ required: true, message: ' ${title} ' + t('component.form.notEmpty') }],
  },
  {
    title: t('data.shop.shopifyPrefix'),
    key: 'shopifyPrefix',
    type: JVxeTypes.input,
    width: '200px',
    placeholder: t('common.inputText') + localeStore.getLocale === 'zh_CN' ?'${title}' : ' ${title}',
    defaultValue: '',
  },
  {
    title: 'Shopify API Token',
    key: 'shopifyToken',
    type: JVxeTypes.input,
    width: '200px',
    placeholder: t('common.inputText') + localeStore.getLocale === 'zh_CN' ?'${title}' : ' ${title}',
    defaultValue: '',
  },
  {
    title: t('data.shop.packagingMaterialFee'),
    key: 'packagingMaterialFee',
    type: JVxeTypes.inputNumber,
    width: '200px',
    placeholder: t('common.inputText') + localeStore.getLocale === 'zh_CN' ?'${title}' : ' ${title}',
    defaultValue: 0,
    validateRules: [{ required: true, message: localeStore.getLocale === 'zh_CN' ?'${title}' : '${title} ' + t('component.form.notEmpty') }],
  },
];

// 高级查询数据
export const superQuerySchema = {
  surname: { title: t('data.client.familyName'), order: 0, view: 'text', type: 'string' },
  firstName: { title: t('data.client.firstName'), order: 1, view: 'text', type: 'string' },
  internalCode: { title: t('data.abbreviation'), order: 2, view: 'text', type: 'string' },
  invoiceEntity: { title: t('data.InvoiceEntity'), order: 3, view: 'text', type: 'string' },
  email: { title: t('data.client.email'), order: 4, view: 'text', type: 'string' },
  phone: { title: t('data.client.telephone'), order: 5, view: 'text', type: 'string' },
  streetNumber: { title: t('data.client.streetNumber'), order: 6, view: 'text', type: 'string' },
  streetName: { title: t('data.client.streetName'), order: 7, view: 'text', type: 'string' },
  additionalAddress: { title: t('data.client.additionalAddress'), order: 8, view: 'text', type: 'string' },
  postcode: { title: t('data.client.postCode'), order: 9, view: 'text', type: 'string' },
  city: { title: t('data.client.city'), order: 10, view: 'text', type: 'string' },
  country: {
    title: t('data.client.country'),
    order: 11,
    view: 'sel_search',
    type: 'string',
    dictTable: 'country',
    dictCode: 'name_en',
    dictText: 'name_zh',
  },
  currency: {
    title: t('data.client.currency'),
    order: 12,
    view: 'list',
    type: 'string',
    dictTable: 'currency',
    dictCode: 'code',
    dictText: 'zh_name',
  },
  shippingDiscount: { title: t('data.sku.shippingDiscount'), order: 13, view: 'number', type: 'number' },
  companyIdType: { title: t('data.client.companyIdType'), order: 14, view: 'text', type: 'string' },
  companyIdValue: { title: t('data.client.companyIdValue'), order: 15, view: 'text', type: 'string' },
  iossNumber: { title: t('data.client.iossNumber'), order: 16, view: 'text', type: 'string' },
  vatPercentage: { title: t('data.client.vatPercentage'), order: 17, view: 'number', type: 'number' },
  active: { title: t('data.client.active'), order: 18, view: 'radio', type: 'string' },
  salesperson: {
    title: t('data.client.salesperson'),
    order: 19,
    view: 'sel_search',
    type: 'string',
    dictTable: 'sys_user',
    dictCode: 'id',
    dictText: 'username',
  },
  isCompleteInvoice: { title: t('data.client.isCompleteInvoice'), order: 20, view: 'radio', type: 'string' },
  balanceThreshold: { title: t('data.client.balanceThreshold'), order: 21, view: 'number', type: 'number' },
  isChronologicalOrder: { title: t('data.client.isChronologicalOrder'), order: 22, view: 'radio', type: 'string' },
};
