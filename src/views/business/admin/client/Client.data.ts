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
    title: t('data.client.invoiceEntityCount'),
    align: 'center',
    dataIndex: 'invoiceEntityCount',
    customRender: ({ record }: { record: Recordable }) => {
      return record.invoiceEntityCount ?? record.invoiceEntitiesCount ?? record.invoiceEntityList?.length ?? 0;
    },
  },
  {
    title: t('data.client.salesperson'),
    align: 'center',
    sorter: true,
    dataIndex: 'salespersonNames',
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
    label: t('data.sku.shippingDiscount'),
    field: 'shippingDiscount',
    defaultValue: 1,
    component: 'InputNumber',
  },
  {
    label: t('data.client.salesperson'),
    field: 'salespersonIds',
    defaultValue: [],
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'sys_user,realname,id',
      showSearch: true,
      mode: 'multiple',
      maxTagCount: 'responsive',
      allowClear: true,
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
export const invoiceEntityColumns: JVxeColumn[] = [
  {
    title: t('data.InvoiceEntity'),
    key: 'invoiceEntity',
    type: JVxeTypes.input,
    width: '220px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '',
    validateRules: [{ required: true, message: '${title} ' + t('component.form.notEmpty') }],
  },
  {
    title: t('data.client.isDefault'),
    key: 'isDefault',
    type: JVxeTypes.checkbox,
    width: '110px',
    // 后端 isDefault 跟 active 字段一样走 '1'/'0' 字符串约定，不是原生布尔值——
    // 不设 customValue 的话，字符串 "0" 会被 JVxeCheckboxCell 的 !!value 误判成真值（勾选）
    customValue: ['1', '0'],
    defaultChecked: false,
  },
  {
    title: t('data.client.country'),
    key: 'country',
    type: JVxeTypes.selectSearch,
    dictCode: 'country,name_zh,name_en',
    width: '180px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '',
    validateRules: [{ required: true, message: '${title} ' + t('component.form.notEmpty') }],
  },
  {
    title: t('data.client.currency'),
    key: 'currency',
    type: JVxeTypes.select,
    dictCode: "currency where code != 'RMB',zh_name,code",
    width: '140px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: 'EUR',
    validateRules: [{ required: true, message: '${title} ' + t('component.form.notEmpty') }],
  },
  {
    title: t('data.client.email'),
    key: 'email',
    type: JVxeTypes.input,
    width: '220px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '',
  },
  {
    title: t('data.client.telephone'),
    key: 'phone',
    type: JVxeTypes.input,
    width: '160px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '',
  },
  {
    title: t('data.client.companyIdType'),
    key: 'companyIdType',
    type: JVxeTypes.input,
    width: '180px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '',
  },
  {
    title: t('data.client.companyIdValue'),
    key: 'companyIdValue',
    type: JVxeTypes.input,
    width: '200px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '',
  },
  {
    title: t('data.client.iossNumber'),
    key: 'iossNumber',
    type: JVxeTypes.input,
    width: '180px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '',
  },
  {
    title: t('data.client.vatPercentage'),
    key: 'vatPercentage',
    type: JVxeTypes.inputNumber,
    width: '160px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: 0.22,
  },
  {
    title: t('data.client.active'),
    key: 'active',
    type: JVxeTypes.select,
    dictCode: 'yn',
    width: '140px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '1',
    validateRules: [{ required: true, message: '${title} ' + t('component.form.notEmpty') }],
  },
  {
    title: t('data.client.streetNumber'),
    key: 'streetNumber',
    type: JVxeTypes.input,
    width: '180px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '',
  },
  {
    title: t('data.client.streetName'),
    key: 'streetName',
    type: JVxeTypes.input,
    width: '300px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '',
  },
  {
    title: t('data.client.additionalAddress'),
    key: 'additionalAddress',
    type: JVxeTypes.input,
    width: '280px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '',
  },
  {
    title: t('data.client.postCode'),
    key: 'postcode',
    type: JVxeTypes.input,
    width: '150px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '',
  },
  {
    title: t('data.client.city'),
    key: 'city',
    type: JVxeTypes.input,
    width: '200px',
    placeholder: t('common.inputText') + ' ${title}',
    defaultValue: '',
  },
];

export const superQuerySchema = {
  surname: { title: t('data.client.familyName'), order: 0, view: 'text', type: 'string' },
  firstName: { title: t('data.client.firstName'), order: 1, view: 'text', type: 'string' },
  internalCode: { title: t('data.abbreviation'), order: 2, view: 'text', type: 'string' },
  salesperson: {
    title: t('data.client.salesperson'),
    order: 3,
    view: 'sel_search',
    type: 'string',
    dictTable: 'sys_user',
    dictCode: 'id',
    dictText: 'username',
  },
  isCompleteInvoice: { title: t('data.client.isCompleteInvoice'), order: 4, view: 'radio', type: 'string' },
  balanceThreshold: { title: t('data.client.balanceThreshold'), order: 5, view: 'number', type: 'number' },
  isChronologicalOrder: { title: t('data.client.isChronologicalOrder'), order: 6, view: 'radio', type: 'string' },
};
