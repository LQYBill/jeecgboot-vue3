import {BasicColumn, FormSchema} from "/@/components/Table";
import {reactive} from "vue";
import {useI18n} from "/@/hooks/web/useI18n";

const {t} = useI18n();
export const columns: BasicColumn[] = [
  {
    title: t('data.invoice.createBy'),
    align:"center",
    sorter: true,
    dataIndex: 'createBy',
    fixed: 'left',
    width: 120,
  },
  {
    title: t('data.invoice.createDate'),
    align:"center",
    sorter: true,
    dataIndex: 'createTime',
    fixed: 'left',
    width: 110,
    slots: { customRender: 'createTime' },
  },
  {
    title:t('data.invoice.shop'),
    align:"center",
    sorter: true,
    dataIndex: 'erpCode',
    fixed: 'left',
    width: 80,
  },
  {
    title: t('data.invoice.platformOrderIDMabang'),
    align:"center",
    sorter: true,
    dataIndex: 'platformOrderId_dictText',
    fixed: 'left',
    width: 200,
  },
  {
    title: t('data.invoice.platformOrderNumber'),
    align:"center",
    sorter: true,
    dataIndex: 'platformOrderNumber',
    fixed: 'left'
  },
  {
    title: t("data.refund.refundStatus"),
    align:"center",
    sorter: true,
    dataIndex: 'invoiceNumber',
    fixed: 'left',
    slots: {
      customRender : 'refundStatus',
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
    },
    onFilter: (value:string, record:any) => value === 'Y' ? record.invoiceNumber : record.invoiceNumber === null,
  },
  {
    title: t('data.refund.purchaseRefund'),
    align:"center",
    sorter: true,
    dataIndex: 'purchaseRefund',
    width: 100,
    slots: { customRender : 'yesno'},
  },
  {
    title: t('data.refund.purchaseRefundAmount'),
    align:"center",
    dataIndex: 'purchaseRefundAmount',
    editComponent: 'InputNumber',
    width: 150,
  },
  {
    title: t('data.refund.shippingRefund'),
    align:"center",
    sorter: true,
    dataIndex: 'shippingRefund',
    width: 100,
    slots: { customRender : 'yesno'},
  },
  {
    title: t('data.refund.fretFeeRefundAmount'),
    align:"center",
    dataIndex: 'fretFee',
  },
  {
    title: t('data.refund.shippingRefundAmount'),
    align:"center",
    dataIndex: 'shippingFee',
  },
  {
    title: t('data.refund.tvaRefundAmount'),
    align:"center",
    dataIndex: 'vat',
  },
  {
    title: t('data.refund.serviceFeeRefundAmount'),
    align:"center",
    dataIndex: 'serviceFee',
  },
  {
    title: t('data.refund.totalRefundAmount'),
    align:"center",
    sorter: true,
    dataIndex: 'totalRefundAmount',
  },
  {
    title:  t('data.refund.refundReason'),
    align: "center",
    dataIndex: 'refundReason',
    editRow: true,
  },
  {
    title: t('data.refund.refundDate'),
    align:"center",
    sorter: true,
    dataIndex: 'refundDate',
  },
  {
    title: t('common.operation.action'),
    dataIndex: 'action',
    align: "center",
    fixed: "right",
    width: 120,
    slots: { customRender: 'action' }
  }
];
export const searchFormSchema: FormSchema[] = [
  {
    field: "erpCode",
    label: t("data.invoice.shop"),
    labelWidth: 20,
    component: 'Input',
    componentProps: {
      placeholder: t('component.searchForm.shopFilter'),
    },
    disabledLabelWidth:true,
    itemProps: {
      labelCol: reactive({
        xs: { span: 4 },
        lg: { span: 4 },
      }),
      wrapperCol: reactive({
        xs: { span: 18 },
        lg: { span: 18 },
      }),
    },
    colProps: { span: 5 },
  },
  {
    field: "platformOrderId",
    label: t("data.invoice.platformOrderID"),
    component: 'Input',
    componentProps: {
      placeholder: t('component.searchForm.platformOrderIDFilter'),
    },
    disabledLabelWidth:true,
    itemProps: {
      labelCol: reactive({
        xs: { span: 12 },
        lg: { span: 12 },
      }),
      wrapperCol: reactive({
        xs: { span: 12 },
        lg: { span: 12 },
      }),
    },
    colProps: { span: 5 },
  },
];
