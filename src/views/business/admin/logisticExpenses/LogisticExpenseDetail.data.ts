import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {useI18n} from "@/hooks/web/useI18n";

const { t } = useI18n();
export const columns: BasicColumn[] = [
  {
    title: t('data.logistics.platformOrderSerialId'),
    align: "center",
    dataIndex: 'platformOrderSerialId'
  },
  {
    title: t('data.invoice.date'),
    align: "center",
    dataIndex: 'date',
  },
  {
    title: t('data.logistics.virtualTrackingNumber'),
    align: "center",
    dataIndex: 'virtualTrackingNumber'
  },
  {
    title: t('data.logistics.logisticInternalNumber'),
    align: "center",
    dataIndex: 'logisticInternalNumber'
  },
  {
    title: t('data.logistics.trackingNum'),
    align: "center",
    dataIndex: 'trackingNumber'
  },
  {
    title: t('data.logistics.realWeight'),
    align: "center",
    dataIndex: 'realWeight'
  },
  {
    title: t('data.logistics.volumetricWeight'),
    align: "center",
    dataIndex: 'volumetricWeight'
  },
  {
    title: t('data.logistics.chargingWeight'),
    align: "center",
    dataIndex: 'chargingWeight'
  },
  {
    title: '优惠金额',
    align: "center",
    dataIndex: 'discount'
  },
  {
    title: t('data.logistics.shippingFee'),
    align: "center",
    dataIndex: 'shippingFee'
  },
  {
    title: t('data.logistics.fuelSurcharge'),
    align: "center",
    dataIndex: 'fuelSurcharge'
  },
  {
    title: t('data.logistics.registerFee'),
    align: "center",
    dataIndex: 'registrationFee'
  },
  {
    title: t('data.logistics.secondDeliveryFee'),
    align: "center",
    dataIndex: 'secondDeliveryFee'
  },
  {
    title: t('data.invoice.vat'),
    align: "center",
    dataIndex: 'vat'
  },
  {
    title: t('data.logistics.vatServiceFee'),
    align: "center",
    dataIndex: 'vatServiceFee'
  },
  {
    title: t('data.invoice.additionalFees'),
    align: "center",
    dataIndex: 'additionalFee'
  },
  {
    title: t('data.logistics.totalFee'),
    align: "center",
    dataIndex: 'totalFee'
  },
  {
    title: t('data.logistics.company'),
    align: "center",
    dataIndex: 'logisticCompanyId_dictText'
  },
  {
    title: t('data.logistics.compensation'),
    align: "center",
    dataIndex: 'compensation'
  },
  {
    title: t('data.invoice.country'),
    align: "center",
    dataIndex: 'targetCountry'
  }
];
export const searchFormSchema: FormSchema[] = [];
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
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入物流商内部单号!'},
      ];
    },
  },
  {
    label: '物流单号（服务商单号）',
    field: 'trackingNumber',
    component: 'Input',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入物流单号（服务商单号）!'},
      ];
    },
  },
  {
    label: '实际重量',
    field: 'realWeight',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入实际重量!'},
      ];
    },
  },
  {
    label: '体积重量',
    field: 'volumetricWeight',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入体积重量!'},
      ];
    },
  },
  {
    label: '计费重量',
    field: 'chargingWeight',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入计费重量!'},
      ];
    },
  },
  {
    label: '优惠金额',
    field: 'discount',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入优惠金额!'},
      ];
    },
  },
  {
    label: '运费金额',
    field: 'shippingFee',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入运费金额!'},
      ];
    },
  },
  {
    label: '燃油附加费',
    field: 'fuelSurcharge',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入燃油附加费!'},
      ];
    },
  },
  {
    label: '挂号费',
    field: 'registrationFee',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入挂号费!'},
      ];
    },
  },
  {
    label: '重派费',
    field: 'secondDeliveryFee',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入重派费!'},
      ];
    },
  },
  {
    label: '增值税',
    field: 'vat',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入增值税!'},
      ];
    },
  },
  {
    label: '增值税服务费',
    field: 'vatServiceFee',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入增值税服务费!'},
      ];
    },
  },
  {
    label: '附加费用',
    field: 'additionalFee',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入附加费用!'},
      ];
    },
  },
  {
    label: '总费用',
    field: 'totalFee',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入总费用!'},
      ];
    },
  },
  {
    label: '物流公司ID',
    field: 'logisticCompanyId',
    component: 'Input',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入物流公司ID!'},
      ];
    },
  },
  {
    label: '货物赔偿',
    field: 'compensation',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: '请输入货物赔偿!'},
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
