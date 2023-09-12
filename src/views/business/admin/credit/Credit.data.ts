import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {useI18n} from "/@/hooks/web/useI18n";

const {t} = useI18n();
//列表数据
export const columns: BasicColumn[] = [
  {
    title: t('data.invoice.clientId'),
    align: "center",
    dataIndex: 'clientId_dictText',
  },
  {
    title: t('data.invoice.createDate'),
    align: "center",
    dataIndex: 'createTime',
  },
  {
    title: t('data.transaction.paymentProof'),
    align: "center",
    dataIndex: 'paymentProofString',
    slots: {customRender: 'img'},
  },
  {
    title: t('data.transaction.amount'),
    align: "center",
    dataIndex: 'amount',
  },
  {
    title: t('data.client.currency'),
    align: "center",
    dataIndex: 'currencyId_dictText',
  },
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: t('data.invoice.clientId'),
    field: 'clientId',
    component: 'JSearchSelect',
    componentProps: {
      dict: "client WHERE active = '1',internal_code,id"
    },
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: t('component.searchForm.clientInputSearch')},
      ];
    },
  },
  {
    label: t('data.transaction.amount'),
    field: 'amount',
    component: 'InputNumber',
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: t('component.searchForm.amountInput')},
      ];
    },
  },
  {
    label: t('data.client.currency'),
    field: 'currencyId',
    component: 'JSearchSelect',
    componentProps: {
      dict: "currency WHERE code <> 'RMB',code,id"
    },
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: t('component.searchForm.currencyInputSearch')},
      ];
    },
  },
  {
    label: t('data.transaction.paymentProof'),
    field: 'paymentProofString',
    component: 'JImageUpload',
    componentProps: {},
    dynamicRules: ({model, schema}) => {
      return [
        {required: true, message: t('component.searchForm.proofInput')},
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


/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
