import {BasicColumn} from "/@/components/Table";
import {useI18n} from "/@/hooks/web/useI18n";
import {getUserList} from "/@/api/common/api";

const {t} = useI18n()

// options of the select menu in search menu
export const columns: BasicColumn[] = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
    align:"center",
    sorter: true,
    ifShow: false,
  },
  {
    title: t("data.invoice.createBy"),
    align:"center",
    sorter: true,
    dataIndex: 'createBy'
  },
  {
    title: t("data.invoice.createDate"),
    align:"center",
    sorter: true,
    dataIndex: 'createTime'
  },
  {
    title: t("data.Client"),
    align: "center",
    sorter: true,
    dataIndex: 'clientId_dictText'
  },
  {
    title: t("data.invoice.invoiceNumber"),
    align:"center",
    sorter: true,
    dataIndex: 'invoiceNumber',
    slots: {customRender: 'invoiceNumber'},
    width: 180,
  },
  {
    title: t("data.invoice.totalAmountDue"),
    align:"center",
    dataIndex: 'totalAmount'
  },
  {
    title: t("data.invoice.discountAmount"),
    align:"center",
    dataIndex: 'discountAmount'
  },
  {
    title: t("data.invoice.finalAmount"),
    align:"center",
    dataIndex: 'finalAmount'
  },
  {
    title: t("data.invoice.paidAmount"),
    align:"center",
    dataIndex: 'paidAmount'
  },
  {
    title: t('data.client.currency'),
    align: "center",
    dataIndex: 'currencyId_dictText',
    fixed:"right",
    width: 100,
    sorter: true,
  },
  {
    title: t('data.invoice.invoiceType'),
    align: "center",
    dataIndex: 'type',
    fixed: "right",
    width: 100,
    sorter: true,
    slots: {customRender: 'type'}
  },
  {
    title: t('common.operation.action'),
    dataIndex: 'action',
    align: "center",
    fixed: "right",
    width: 147,
    slots: { customRender: 'action' }
  },
  {
   title: '',
    dataIndex: 'status',
    align: "center",
    defaultHidden: true,
  }
];
export const fetchUserList = (param) => {
  return getUserList(param);
}
