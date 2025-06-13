import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {render} from '/@/utils/common/renderUtils';
import {useI18n} from "@/hooks/web/useI18n";

const {t} = useI18n();
export const columns: BasicColumn[] = [
  {
    title: t('data.shop.default'),
    align: "center",
    dataIndex: 'shopId_dictText'
  },
  {
    title: t('data.shop.useBalance'),
    align: "center",
    dataIndex: 'useBalance',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
  },
  {
    title: t('data.shop.showBalance'),
    align: "center",
    dataIndex: 'showBalance',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
  },
  {
    title: t('data.shop.balanceThreshold'),
    align: "center",
    dataIndex: 'balanceThreshold',
    helpMessage: t('data.shop.help.balanceThreshold'),
  },
  {
    title: t('data.shop.isAutoInvoice'),
    align: "center",
    dataIndex: 'isAutoInvoice',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
  },
  {
    title: t('data.shop.isBreakdownInvoice'),
    align: "center",
    dataIndex: 'isBreakdownInvoice',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
  },
  {
    title: t('data.shop.isCompleteInvoice'),
    align: "center",
    dataIndex: 'isCompleteInvoice',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
    helpMessage: t('data.shop.help.isCompleteInvoice'),
  },
  {
    title: t('data.shop.isChronologicalOrder'),
    align: "center",
    dataIndex: 'isChronologicalOrder',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
    helpMessage: [t('data.shop.help.isChronologicalOrder1'), t('data.shop.help.isChronologicalOrder2')],
  },
  {
    title: t('data.shop.canSelfInvoice'),
    align: "center",
    dataIndex: 'canSelfInvoice',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
  },
  {
    title: t('data.shop.canSelfP'),
    align: "center",
    dataIndex: 'canSelfP',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
  },
  {
    title: t('data.shop.canSelfL'),
    align: "center",
    dataIndex: 'canSelfL',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
  },
  {
    title: t('data.shop.canSelfPL'),
    align: "center",
    dataIndex: 'canSelfPL',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
  },
  {
    title: t('data.shop.isSelfIgnoreStock'),
    align: "center",
    dataIndex: 'isSelfIgnoreStock',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
    helpMessage: t('data.shop.help.isSelfIgnoreStock'),
  },
  {
    title: t('data.shop.hasStock'),
    align: "center",
    dataIndex: 'hasStock',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
  },
  {
    title: t('data.shop.hasShippingInvoiceRemark'),
    align: "center",
    dataIndex: 'hasShippingInvoiceRemark',
    customRender: ({text}) => {
      return render.renderSwitch(text, [{text: t('common.yes'), value: 1}, {
        text: t('common.no'),
        value: 0
      }])
    },
  },
];
//查询数据
export const searchFormSchema: FormSchema[] = [];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: t('data.shop.default'),
    field: 'shopId',
    component: 'JSearchSelect',
    componentProps: {
      dict: "shop,erp_code,id"
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
    label: t('data.shop.useBalance'),
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
    label: t('data.shop.showBalance'),
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
    label: t('data.shop.balanceThreshold'),
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
    label: t('data.shop.isAutoInvoice'),
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
    label: t('data.shop.isBreakdownInvoice'),
    field: 'isBreakdownInvoice',
    colProps: {span: 8},
    component: 'Switch',
    componentProps: ({formModel}) => {
      return {
        checkedChildren: t('common.yes'),
        unCheckedChildren: t('common.no'),
        onChange: (checked: boolean, _e: Event) => {
          console.log('formModel', formModel)
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
    label: t('data.shop.isCompleteInvoice'),
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
    label: t('data.shop.isChronologicalOrder'),
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
    label: t('data.shop.canSelfInvoice'),
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
    label: t('data.shop.canSelfP'),
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
    label: t('data.shop.canSelfL'),
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
    label: t('data.shop.canSelfPL'),
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
    label: t('data.shop.isSelfIgnoreStock'),
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
    label: t('data.shop.hasStock'),
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
    label: t('data.shop.hasShippingInvoiceRemark'),
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

// 高级查询数据
export const superQuerySchema = {
  shopId: {
    title: t('data.shop.shopID'),
    order: 0,
    view: 'sel_search',
    type: 'string',
    dictTable: "shop",
    dictCode: 'id',
    dictText: 'erp_code',
  },
  useBalance: {title: t('data.shop.useBalance'), order: 1, view: 'number', type: 'number',},
  showBalance: {title: t('data.shop.showBalance'), order: 2, view: 'number', type: 'number',},
  balanceThreshold: {
    title: t('data.shop.balanceThreshold'),
    order: 3,
    view: 'number',
    type: 'number',
  },
  isAutoInvoice: {title: t('data.shop.isAutoInvoice'), order: 4, view: 'number', type: 'number',},
  isChronologicalOrder: {
    title: t('data.shop.isChronologicalOrder'),
    order: 5,
    view: 'number',
    type: 'number',
  },
  isBreakdownInvoice: {
    title: t('data.shop.isBreakdownInvoice'),
    order: 6,
    view: 'number',
    type: 'number',
  },
  isCompleteInvoice: {
    title: t('data.shop.isCompleteInvoice'),
    order: 7,
    view: 'number',
    type: 'number',
  },
  canSelfInvoice: {title: t('data.shop.canSelfInvoice'), order: 8, view: 'number', type: 'number',},
  canSelfP: {title: t('data.shop.canSelfP'), order: 9, view: 'number', type: 'number',},
  canSelfL: {title: t('data.shop.canSelfL'), order: 10, view: 'number', type: 'number',},
  canSelfPL: {title: t('data.shop.canSelfPL'), order: 11, view: 'number', type: 'number',},
  isSelfIgnoreStock: {
    title: t('data.shop.isSelfIgnoreStock'),
    order: 12,
    view: 'number',
    type: 'number',
  },
  hasStock: {title: t('data.shop.hasStock'), order: 13, view: 'number', type: 'number',},
  hasShippingInvoiceRemark: {
    title: t('data.shop.hasShippingInvoiceRemark'),
    order: 14,
    view: 'number',
    type: 'number',
  },
};

/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
