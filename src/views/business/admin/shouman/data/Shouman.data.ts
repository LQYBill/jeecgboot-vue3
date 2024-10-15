import {BasicColumn} from "@/components/Table";
import {useI18n} from "@/hooks/web/useI18n";

const {t} = useI18n()
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
    title: t("data.invoice.createDate"),
    align:"center",
    sorter: true,
    dataIndex: 'createTime'
  },
  {
    title: t("data.invoice.shopID"),
    align:"center",
    sorter: true,
    dataIndex: 'shopId_dictText',
  },
  {
    title: t("data.invoice.platformOrderID"),
    align:"center",
    sorter: true,
    dataIndex: 'platformOrderId'
  },
  {
    title: t("data.invoice.platformOrderNumber"),
    align:"center",
    sorter: true,
    dataIndex: 'platformOrderNumber'
  },
  {
    title: t("data.invoice.orderTime"),
    align:"center",
    sorter: true,
    dataIndex: 'orderTime'
  },
  {
    title: t("data.invoice.recipient"),
    align: "center",
    sorter: true,
    dataIndex: 'recipient'
  },
  {
    title: t("data.invoice.country"),
    align:"center",
    sorter: true,
    dataIndex: 'country'
  },
  {
    title: t("data.invoice.erpStatus"),
    align:"center",
    sorter: true,
    dataIndex: 'erpStatus',
    slots: {customRender: 'erpStatus'},
  },
  {
    title: t('common.operation.action'),
    dataIndex: 'action',
    align: "center",
    fixed: "right",
    width: 147,
    slots: { customRender: 'action' }
  }
];
export const innerColumns: BasicColumn[] = [
  {
    title: t('data.sku.erpCode'),
    dataIndex: 'skuId_dictText',
    align: "center"
  },
  {
    title: t('data.invoice.quantity'),
    align:"center",
    dataIndex: 'quantity'
  },
  {
    title: t('data.order.customData'),
    align:"center",
    dataIndex: 'customizationData'
  }
]
