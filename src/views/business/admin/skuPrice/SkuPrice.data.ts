import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();
//列表数据
export const columns: BasicColumn[] = [
   {
    title: t("data.sku.erpCode"),
    align:"center",
    sorter: true,
    dataIndex: 'skuId_dictText'
   },
   {
    title: t("data.sku.skuPrice"),
    align:"center",
    dataIndex: 'price'
   },
   {
    title: t("data.sku.skuPriceThreshold"),
    align:"center",
    dataIndex: 'threshold'
   },
   {
    title: t("data.sku.skuPriceDiscounted"),
    align:"center",
    dataIndex: 'discountedPrice'
   },
   {
    title: t("data.sku.skuPriceEffectiveDate"),
    align:"center",
     sorter: true,
    dataIndex: 'date'
   },
   {
    title: t("data.sku.currency"),
    align:"center",
    dataIndex: 'currencyId_dictText'
   },
  {
    title: t("data.sku.skuPriceUnit"),
    align:"center",
    dataIndex: 'unit',
  },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: t("data.sku.erpCode"),
    field: 'skuId',
    component: 'JSearchSelect',
    componentProps:{
       dict:"sku,erp_code,id"
    },
  },
  {
    label: t("data.sku.skuPrice"),
    field: 'price',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入价格!'},
          ];
     },
  },
  {
    label: t("data.sku.skuPriceThreshold"),
    field: 'threshold',
    component: 'InputNumber',
  },
  {
    label: t("data.sku.skuPriceDiscounted"),
    field: 'discountedPrice',
    component: 'InputNumber',
  },
  {
    label: t("data.sku.skuPriceEffectiveDate"),
    field: 'date',
    component: 'DatePicker',
    componentProps: {
       showTime: true,
       valueFormat: 'YYYY-MM-DD HH:mm:ss'
     },
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入生效日期!'},
          ];
     },
  },
  {
    label: t("data.sku.currency"),
    field: 'currencyId',
    component: 'JSearchSelect',
    componentProps:{
       dict:"currency,code,id"
    },
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入币种ID!'},
          ];
     },
  },
	// TODO 主键隐藏字段，目前写死为ID
	{
	  label: '',
	  field: 'id',
	  component: 'Input',
	  show: false
	},
];

// 高级查询数据
export const superQuerySchema = {
  skuId: {title: t("data.sku.erpCode"),order: 0,view: 'sel_search', type: 'string',dictTable: "sku", dictCode: 'id', dictText: 'erp_code',},
  price: {title: t("data.sku.skuPrice"),order: 1,view: 'number', type: 'number',},
  threshold: {title: t("data.sku.skuPriceThreshold"),order: 2,view: 'number', type: 'number',},
  discountedPrice: {title: t("data.sku.skuPriceDiscounted"),order: 3,view: 'number', type: 'number',},
  date: {title: t("data.sku.skuPriceEffectiveDate"),order: 4,view: 'datetime', type: 'string',},
  currencyId: {title: t("data.sku.currency"),order: 5,view: 'sel_search', type: 'string',dictTable: "currency", dictCode: 'id', dictText: 'code',},
};

/**
* 流程表单调用这个方法获取formSchema
* @param param
*/
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
