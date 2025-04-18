import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {useI18n} from "/@/hooks/web/useI18n";

const {t} = useI18n();
//列表数据
export const columns: BasicColumn[] = [
  {
    title: t('data.Client'),
    align: "center",
    dataIndex: 'clientId_dictText',
    width: 90,
  },
  {
    title: t('data.invoice.createDate'),
    align: "center",
    dataIndex: 'createTime',
    slots: {customRender: 'createTime'},
  },
  {
    title: t('data.invoice.invoiceNumber'),
    align: "center",
    dataIndex: 'invoiceNumber',
    slots: {customRender: 'invoiceNumber'},
    width: 180,
  },
  {
    title: t('data.invoice.description'),
    align: "center",
    dataIndex: 'description',
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
    slots: {customRender: 'amount'},
  },
  {
    title: t('data.client.currency'),
    align: "center",
    dataIndex: 'currencyId_dictText',
    defaultHidden: true,
  },
  {
    title: 'Row num',
    align: "center",
    dataIndex: 'rowNum',
    defaultHidden: true,
  }
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: t('data.invoice.clientId'),
    field: 'clientId',
    component: 'JSearchSelect',
    componentProps: {
      placeholder: t('component.searchForm.clientInputSearch'),
      dict: "client WHERE active = '1',internal_code,id"
    },
    dynamicDisabled: ({ values }) => {
      return !!values.id;
    },
    dynamicRules: () => {
      return [
        {required: true, message: t('component.searchForm.clientInputSearch')},
      ];
    },
  },
  {
    label: t('data.invoice.invoiceNumber'),
    field: 'invoiceNumber',
    component: 'Input',
    componentProps: {
      placeholder: t('component.searchForm.enterInvoiceNumber')
    },
    dynamicDisabled: true,
    ifShow: ({ values }) => {
      return !!values.id;
    }
  },
  {
    label: t('data.invoice.description'),
    field: 'description',
    component: 'Input',
    componentProps: {
      placeholder: t('component.searchForm.descriptionInput')
    }
  },
  {
    label: t('data.transaction.amount'),
    field: 'amount',
    component: 'InputNumber',
    componentProps: {
      min: 1,
      precision: 2,
      placeholder: t('component.searchForm.amountInput')
    },
    defaultValue: 1,
    rules: [
        {required: true, message: t('component.searchForm.amountInput'), trigger: "blur"}
    ],
    dynamicDisabled: ({ values }) => {
      return !!values.rowNum ? values.rowNum === '1' ? values.status !== '1' : true : false;
    }
  },
  {
    label: t('data.client.currency'),
    field: 'currencyId',
    component: 'JSearchSelect',
    componentProps: {
      placeholder: t('component.searchForm.currencyInputSearch'),
      dict: "currency WHERE code != 'RMB',code,id" // for prod
      // dict: "currency%20WHERE%20code%20%3C%3E%20'RMB'%2Ccode%2Cid" //currency WHERE code <> 'RMB',code,id for localhost
    },
    dynamicDisabled: ({ values }) => {
      return !!values.id;
    },
    dynamicRules: () => {
      return [
        {required: true, message: t('component.searchForm.currencyInputSearch')},
      ];
    },
  },
  {
    label: t('data.transaction.paymentProof'),
    field: 'paymentProofString',
    component: 'JImageUpload',
    componentProps: {
      fileMax: 1,
      listType : 'picture',
      text: t('component.upload.upload'),
      bizPath: 'credit/screenshots',
    },
    dynamicRules: () => {
      return [
        {required: true, message: t('component.searchForm.proofInput')},
      ];
    },
  },
  {
    label: t('data.transaction.showBalance'),
    field: 'showBalance',
    component: 'Switch',
    required: true,
    defaultValue: '0',
    componentProps: {
      checkedValue: '1',
      checkedChildren: t('common.yes'),
      unCheckedValue: '0',
      unCheckedChildren: t('common.no'),
    },
  },
  {
    label: '',
    field: 'rowNum',
    component: 'Input',
    dynamicDisabled: true,
    show: false,
  },
  {
    label: '',
    field: 'status',
    component: 'Input',
    dynamicDisabled: true,
    show: false,
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
