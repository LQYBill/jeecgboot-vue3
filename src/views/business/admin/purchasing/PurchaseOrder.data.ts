import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {useI18n} from "/@/hooks/web/useI18n";
import {useMessage} from "/@/hooks/web/useMessage";
import {duplicateInvoiceNumberCheck} from "/@/views/business/admin/purchasing/PurchaseOrder.api";

const {t} = useI18n();
const {createMessage} = useMessage();
export const columns: BasicColumn[] = [
  {
    title: t('data.invoice.createDate'),
    align: "center",
    dataIndex: 'createTime',
    defaultHidden: true,
  },
  {
    title: t('data.invoice.clientId'),
    align: "center",
    dataIndex: 'clientId_dictText',
    width: 100,
  },
  {
    title: t('data.invoice.invoiceNumber'),
    align: "center",
    dataIndex: 'invoiceNumber',
  },
  {
    title: t('data.client.currency'),
    align: 'center',
    dataIndex: 'currencyId_dictText',
    width: 100,
  },
  {
    title: t('data.invoice.totalAmount'),
    align: "center",
    dataIndex: 'totalAmount',
    width: 100,
    ellipsis: false,
  },
  {
    title: t('data.invoice.discountAmount'),
    align: "center",
    dataIndex: 'discountAmount',
    width: 100,
    ellipsis: false,
  },
  {
    title: t('data.invoice.finalAmount'),
    align: "center",
    dataIndex: 'finalAmount',
    slots: {customRender: 'finalAmount'},

  },
  {
    title: t('data.invoice.paidAmount'),
    align: "center",
    dataIndex: 'paidAmount',
    slots: {customRender: 'paidAmount'},
    sorter: (a:any, b:any) => a.paidAmount - b.paidAmount,
  },
  {
    title: t('data.transaction.paymentProof'),
    align: "center",
    dataIndex: 'paymentDocumentString',
    slots: {customRender: 'img'},
  },
  {
    title: t('data.upload.inventoryRecap'),
    align: "center",
    dataIndex: 'inventoryDocumentString',
    slots: {customRender: 'fileSlot'},
  },
  {
    title: t('data.order.ordered'),
    align: "center",
    dataIndex: 'ordered',
    slots: {customRender: 'ordered'},
    width: 80,
    sorter: (a:any, b:any) => a.ordered - b.ordered,
  },
  {
    title: t('data.invoice.platformOrderID'),
    align: "center",
    dataIndex: 'platformOrderId',
    slots: {customRender: 'platformOrderId'},
  }
];
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    field: 'clientId',
    component: 'JSearchSelect',
    label: t('data.invoice.clientId'),
    colProps: {
      span: 8,
    },
    componentProps: {
      placeholder: t('component.searchForm.clientInputSearch'),
      dict: "client WHERE active = '1',internal_code,id",
      pageSize: 6,
      async: true,
    },
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
    dynamicDisabled: ({values}) => {
      return !!values.id;
    },
    dynamicRules: ({}) => {
      return [
        {required: true, message: t('component.searchForm.clientInputSearch')},
      ];
    },
  },
  {
    label: t('data.client.currency'),
    field: 'currencyId',
    component: 'JSearchSelect',
    componentProps: {
      dict: "currency,code,id"
    },
    dynamicRules: ({}) => {
      return [
        {required: true, message: t('component.searchForm.currencyInputSearch')},
      ];
    },
  },
  {
    label: t('data.invoice.totalAmount'),
    field: 'totalAmount',
    component: 'InputNumber',
    componentProps :{
      precision: 2
    },
  },
  {
    label: t('data.invoice.discountAmount'),
    field: 'discountAmount',
    component: 'InputNumber',
    componentProps :{
      min: 0,
      precision: 2
    },
  },
  {
    label: t('data.invoice.finalAmount'),
    field: 'finalAmount',
    component: 'InputNumber',
    componentProps :{
      precision: 2
    },
  },
  {
    label: t('data.invoice.invoiceNumber'),
    field: 'invoiceNumber',
    component: 'Input',
    dynamicRules: ({model}) => {
      return [
        {
          required: false,
          validator: (_, value) => {
            if(!value)
              return Promise.resolve();
            if (!/^[0-9]{4}-[0-1][0-9]-[127][0-9]{3}$/g.test(value)) {
              return Promise.reject(t('component.verify.wrongInvoiceNumberFormat'));
            }
            return new Promise((resolve, reject) => {
              let params = {
                id: model.id,
                invoiceNumber: value,
                invoiceType: 'purchase'
              };
              duplicateInvoiceNumberCheck(params)
                .then(() => {
                  resolve();
                })
                .catch((err) => {
                  reject(err.message);
                });
            });
          },
        },
      ];
    }
  },
  {
    label: t('data.invoice.paidAmount'),
    field: 'paidAmount',
    slot: 'paidAmount',
    component: 'InputNumber',
    componentProps :{
      min: 0,
      precision: 2
    },
    dynamicRules: ({model}) => {
      return [
        {
          required: true,
          validator: (_, value) => {
            console.log(value, 'value')
            console.log(model, 'model')
            if(value >= 0 && value <= model.finalAmount) {
              return Promise.resolve();
            }
            return Promise.reject(t('component.searchForm.paidAmountInput'))
          }
        },
        // message: t('component.searchForm.paidAmountInput')
      ];
    },
  },
  {
    label: t('data.transaction.paymentProof'),
    field: 'paymentDocumentString',
    component: 'JImageUpload',
    componentProps: {
      fileMax: 1,
      listType : 'picture',
      text: t('component.upload.upload'),
      bizPath: 'purchase_order/screenshots'
    },
  },
  {
    label: t('data.upload.inventoryRecap'),
    field: 'inventoryDocumentString',
    component: 'JUpload',
    componentProps: {
      text: t('component.upload.upload'),
      bizPath: 'purchase_order/sheets',
      beforeUpload: beforeUpload,
    },
  },
  {
    label: t('data.invoice.platformOrderID'),
    field: 'platformOrderId',
    component: 'InputTextArea',
    helpMessage: [t('component.tips.orderNumberSplitComma')],
    componentProps: {
      placeholder: '1234567890, 234567891, ...',
    },
  },
  {
    label: t('data.order.ordered'),
    field: 'ordered',
    component: 'Switch',
    helpMessage: [t('component.tips.orderStatus')],
    componentProps: {
      checkedChildren: t('common.yes'),
      unCheckedChildren: t('common.no'),
    },
    defaultValue: false,
    required: true,
    itemProps: {
      extra: t('component.tips.orderStatus'),
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

/**
 * 上传前事件
 * @param file
 */
export function beforeUpload(file) {
  let validExts = [
    'text/csv',
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/pdf'
  ];
  if(!validExts.includes(file.type)) {
    createMessage.error(t("data.upload.xlsCsvPdfOnly"));
    return false;
  }
}
export function listFormatting(values:string) {
  let res = values.replace(/['"]/gm,"\n");
  res = res.replace(/[\n\s]+/gm, ",");
  res = res.replace(/(,{2,})/g, ",");
  res = res.replace(/(^,)|(,$)/g, "");
  return res;
}
