import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';

export const columns: BasicColumn[] = [
   {
    title: '平台订单序列号（客户单号）',
    align:"center",
    dataIndex: 'platformOrderSerialId'
   },
   {
    title: '虚拟单号',
    align:"center",
    dataIndex: 'virtualTrackingNumber'
   },
   {
    title: '物流商内部单号',
    align:"center",
    dataIndex: 'logisticInternalNumber'
   },
   {
    title: '物流单号（服务商单号）',
    align:"center",
    dataIndex: 'trackingNumber'
   },
   {
    title: '实际重量',
    align:"center",
    dataIndex: 'realWeight'
   },
   {
    title: '体积重量',
    align:"center",
    dataIndex: 'volumetricWeight'
   },
   {
    title: '计费重量',
    align:"center",
    dataIndex: 'chargingWeight'
   },
   {
    title: '优惠金额',
    align:"center",
    dataIndex: 'discount'
   },
   {
    title: '运费金额',
    align:"center",
    dataIndex: 'shippingFee'
   },
   {
    title: '燃油附加费',
    align:"center",
    dataIndex: 'fuelSurcharge'
   },
   {
    title: '挂号费',
    align:"center",
    dataIndex: 'registrationFee'
   },
   {
    title: '重派费',
    align:"center",
    dataIndex: 'secondDeliveryFee'
   },
   {
    title: '增值税',
    align:"center",
    dataIndex: 'vat'
   },
   {
    title: '增值税服务费',
    align:"center",
    dataIndex: 'vatServiceFee'
   },
   {
    title: '附加费用',
    align:"center",
    dataIndex: 'additionalFee'
   },
   {
    title: '总费用',
    align:"center",
    dataIndex: 'totalFee'
   },
   {
    title: '物流公司ID',
    align:"center",
    dataIndex: 'logisticCompanyId'
   },
   {
    title: '货物赔偿',
    align:"center",
    dataIndex: 'compensation'
   },
];
export const searchFormSchema: FormSchema[] = [
];
export const formSchema: FormSchema[] = [
  {
    label: '平台订单序列号（客户单号）',
    field: 'platformOrderSerialId',
    component: 'Input',
  },
  {
    label: '虚拟单号',
    field: 'virtualTrackingNumber',
    component: 'Input',
  },
  {
    label: '物流商内部单号',
    field: 'logisticInternalNumber',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入物流商内部单号!'},
          ];
     },
  },
  {
    label: '物流单号（服务商单号）',
    field: 'trackingNumber',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入物流单号（服务商单号）!'},
          ];
     },
  },
  {
    label: '实际重量',
    field: 'realWeight',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入实际重量!'},
          ];
     },
  },
  {
    label: '体积重量',
    field: 'volumetricWeight',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入体积重量!'},
          ];
     },
  },
  {
    label: '计费重量',
    field: 'chargingWeight',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入计费重量!'},
          ];
     },
  },
  {
    label: '优惠金额',
    field: 'discount',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入优惠金额!'},
          ];
     },
  },
  {
    label: '运费金额',
    field: 'shippingFee',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入运费金额!'},
          ];
     },
  },
  {
    label: '燃油附加费',
    field: 'fuelSurcharge',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入燃油附加费!'},
          ];
     },
  },
  {
    label: '挂号费',
    field: 'registrationFee',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入挂号费!'},
          ];
     },
  },
  {
    label: '重派费',
    field: 'secondDeliveryFee',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入重派费!'},
          ];
     },
  },
  {
    label: '增值税',
    field: 'vat',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入增值税!'},
          ];
     },
  },
  {
    label: '增值税服务费',
    field: 'vatServiceFee',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入增值税服务费!'},
          ];
     },
  },
  {
    label: '附加费用',
    field: 'additionalFee',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入附加费用!'},
          ];
     },
  },
  {
    label: '总费用',
    field: 'totalFee',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入总费用!'},
          ];
     },
  },
  {
    label: '物流公司ID',
    field: 'logisticCompanyId',
    component: 'Input',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入物流公司ID!'},
          ];
     },
  },
  {
    label: '货物赔偿',
    field: 'compensation',
    component: 'InputNumber',
    dynamicRules: ({model,schema}) => {
          return [
                 { required: true, message: '请输入货物赔偿!'},
          ];
     },
  },
	{
	  label: '',
	  field: 'id',
	  component: 'Input',
	  show: false
	},
];

// 高级查询数据
export const superQuerySchema = {
  platformOrderSerialId: {title: '平台订单序列号（客户单号）',order: 0,view: 'text', type: 'string',},
  virtualTrackingNumber: {title: '虚拟单号',order: 1,view: 'text', type: 'string',},
  logisticInternalNumber: {title: '物流商内部单号',order: 2,view: 'text', type: 'string',},
  trackingNumber: {title: '物流单号（服务商单号）',order: 3,view: 'text', type: 'string',},
  realWeight: {title: '实际重量',order: 4,view: 'number', type: 'number',},
  volumetricWeight: {title: '体积重量',order: 5,view: 'number', type: 'number',},
  chargingWeight: {title: '计费重量',order: 6,view: 'number', type: 'number',},
  discount: {title: '优惠金额',order: 7,view: 'number', type: 'number',},
  shippingFee: {title: '运费金额',order: 8,view: 'number', type: 'number',},
  fuelSurcharge: {title: '燃油附加费',order: 9,view: 'number', type: 'number',},
  registrationFee: {title: '挂号费',order: 10,view: 'number', type: 'number',},
  secondDeliveryFee: {title: '重派费',order: 11,view: 'number', type: 'number',},
  vat: {title: '增值税',order: 12,view: 'number', type: 'number',},
  vatServiceFee: {title: '增值税服务费',order: 13,view: 'number', type: 'number',},
  additionalFee: {title: '附加费用',order: 14,view: 'number', type: 'number',},
  totalFee: {title: '总费用',order: 15,view: 'number', type: 'number',},
  logisticCompanyId: {title: '物流公司ID',order: 16,view: 'text', type: 'string',},
  compensation: {title: '货物赔偿',order: 17,view: 'number', type: 'number',},
};
export function getBpmFormSchema(_formData): FormSchema[]{
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
