import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {useI18n} from "@/hooks/web/useI18n";

const {t} = useI18n();
export const columns: BasicColumn[] = [
  {
    title: t('data.Client'),
    align: "center",
    dataIndex: 'internalCode'
  },
  {
    title: t('data.shop.default'),
    align: "center",
    dataIndex: 'erpCode'
  },
  {
    title: 'ID',
    dataIndex: 'shopOptionsId',
    defaultHidden: true,
  },
  {
    title: t('data.shopOptions.useBalance'),
    align: "center",
    dataIndex: 'useBalance',
  },
  {
    title: t('data.shopOptions.showBalance'),
    align: "center",
    dataIndex: 'showBalance',
  },
  {
    title: t('data.shopOptions.balanceThreshold'),
    align: "center",
    dataIndex: 'balanceThreshold',
    helpMessage: t('data.shopOptions.help.balanceThreshold'),
  },
  {
    title: t('data.shopOptions.isAutoInvoice'),
    align: "center",
    dataIndex: 'isAutoInvoice',
  },
  {
    title: t('data.shopOptions.isBreakdownInvoice'),
    align: "center",
    dataIndex: 'isBreakdownInvoice',
  },
  {
    title: t('data.shopOptions.isCompleteInvoice'),
    align: "center",
    dataIndex: 'isCompleteInvoice',
    helpMessage: t('data.shopOptions.help.isCompleteInvoice'),
  },
  {
    title: t('data.shopOptions.isChronologicalOrder'),
    align: "center",
    dataIndex: 'isChronologicalOrder',
    helpMessage: [t('data.shopOptions.help.isChronologicalOrder1'), t('data.shopOptions.help.isChronologicalOrder2')],
  },
  {
    title: t('data.shopOptions.canSelfInvoice'),
    align: "center",
    dataIndex: 'canSelfInvoice',
  },
  {
    title: t('data.shopOptions.canSelfP'),
    align: "center",
    dataIndex: 'canSelfP',
  },
  {
    title: t('data.shopOptions.canSelfL'),
    align: "center",
    dataIndex: 'canSelfL',
  },
  {
    title: t('data.shopOptions.canSelfPL'),
    align: "center",
    dataIndex: 'canSelfPL',
  },
  {
    title: t('data.shopOptions.isSelfIgnoreStock'),
    align: "center",
    dataIndex: 'isSelfIgnoreStock',
    helpMessage: t('data.shopOptions.help.isSelfIgnoreStock'),
  },
  {
    title: t('data.shopOptions.hasStock'),
    align: "center",
    dataIndex: 'hasStock',
  },
  {
    title: t('data.shopOptions.hasShippingInvoiceRemark'),
    align: "center",
    dataIndex: 'hasShippingInvoiceRemark',
  },
  {
    title: 'hasOptions',
    dataIndex: 'hasOptions',
    defaultHidden: true,
  }
];
export const formSchema: FormSchema[] = [
  {
    label: 'id',
    field: 'shopOptionsId',
    component: 'Input',
    show: false,
    dynamicDisabled: true
  },
  {
    label: t('data.shop.shopList'),
    field: 'shopIds',
    component: 'JSelectMultiple',
    componentProps: {
      dictCode: "shop,erp_code,id",
      placeholder: t('data.shop.shopList'),
    },
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
  },
  {
    label: t('data.client.accountBalance'),
    field: '',
    required: false,
    component: 'Divider',
    componentProps: {
      orientation: 'left',
      style: {fontSize: '16px', fontWeight: 'bold'},
    },
  },
  {
    label: t('data.shopOptions.useBalance'),
    field: 'useBalance',
    colProps: {span: 8},
    component: 'Switch',
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
  },
  {
    label: t('data.shopOptions.showBalance'),
    field: 'showBalance',
    colProps: {span: 8},
    component: 'Switch',
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
    dynamicDisabled: ({model}) => {
      return !model.useBalance;
    }
  },
  {
    label: t('data.shopOptions.balanceThreshold'),
    field: 'balanceThreshold',
    colProps: {span: 8},
    component: 'InputNumber',
    defaultValue: -1,
    dynamicRules: () => {
      return [
        {
          required: true,
          message: t('component.form.required')
        },
      ];
    },
    dynamicDisabled: ({model}) => {
      return !model.useBalance;
    }
  },
  {
    label: t('data.invoicing.default'),
    field: '',
    required: false,
    component: 'Divider',
    componentProps: {
      orientation: 'left',
      style: {fontSize: '16px', fontWeight: 'bold'},
    },
  },
  {
    label: t('data.shopOptions.isAutoInvoice'),
    field: 'isAutoInvoice',
    component: 'Switch',
    componentProps: ({formModel}) => {
      return {
        checkedChildren: t('common.yes'),
        unCheckedChildren: t('common.no'),
        onChange: (checked: boolean, _e: Event) => {
          if (!checked && !formModel.isBreakdownInvoice) {
            formModel.isCompleteInvoice = false;
            formModel.isChronologicalOrder = false;
          }
        }
      }
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
  },
  {
    label: t('data.shopOptions.isBreakdownInvoice'),
    field: 'isBreakdownInvoice',
    colProps: {span: 8},
    component: 'Switch',
    componentProps: ({formModel}) => {
      return {
        checkedChildren: t('common.yes'),
        unCheckedChildren: t('common.no'),
        onChange: (checked: boolean, _e: Event) => {
          if (!checked && !formModel.isAutoInvoice) {
            formModel.isCompleteInvoice = false;
            formModel.isChronologicalOrder = false;
          }
        }
      }
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
  },
  {
    label: t('data.shopOptions.isCompleteInvoice'),
    field: 'isCompleteInvoice',
    colProps: {span: 8},
    component: 'Switch',
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
    dynamicDisabled: ({model}) => {
      return !(model.isBreakdownInvoice || model.isAutoInvoice);
    }
  },
  {
    label: t('data.shopOptions.isChronologicalOrder'),
    field: 'isChronologicalOrder',
    colProps: {span: 8},
    component: 'Switch',
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
    dynamicDisabled: ({model}) => {
      return !(model.isAutoInvoice || model.isBreakdownInvoice) || model.balanceThreshold < 0;
    }
  },
  {
    label: t('data.invoicing.clientInvoicing'),
    field: '',
    required: false,
    component: 'Divider',
    componentProps: {
      orientation: 'left',
      style: {fontSize: '16px', fontWeight: 'bold'},
    },
  },
  {
    label: t('data.shopOptions.canSelfInvoice'),
    field: 'canSelfInvoice',
    colProps: {span: 6},
    component: 'Switch',
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
  },
  {
    label: t('data.shopOptions.canSelfP'),
    field: 'canSelfP',
    colProps: {span: 6},
    component: 'Switch',
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
    dynamicDisabled: ({model}) => {
      return !model.canSelfInvoice;
    }
  },
  {
    label: t('data.shopOptions.canSelfL'),
    field: 'canSelfL',
    colProps: {span: 6},
    component: 'Switch',
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
    dynamicDisabled: ({model}) => {
      return !model.canSelfInvoice;
    }
  },
  {
    label: t('data.shopOptions.canSelfPL'),
    field: 'canSelfPL',
    colProps: {span: 6},
    component: 'Switch',
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
    dynamicDisabled: ({model}) => {
      return !model.canSelfInvoice;
    }
  },
  {
    label: t('data.shopOptions.isSelfIgnoreStock'),
    field: 'isSelfIgnoreStock',
    component: 'Switch',
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
    dynamicDisabled: ({model}) => {
      return !model.canSelfInvoice;
    }
  },
  {
    label: t('common.other'),
    field: '',
    required: false,
    component: 'Divider',
    componentProps: {
      orientation: 'left',
      style: {fontSize: '16px', fontWeight: 'bold'},
    },
  },
  {
    label: t('data.shopOptions.hasStock'),
    field: 'hasStock',
    colProps: {span: 12},
    component: 'Switch',
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
      ];
    },
  },
  {
    label: t('data.shopOptions.hasShippingInvoiceRemark'),
    field: 'hasShippingInvoiceRemark',
    colProps: {span: 12},
    component: 'Switch',
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    defaultValue: false,
    dynamicRules: () => {
      return [
        {required: true, message: t('component.form.required')},
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


/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
