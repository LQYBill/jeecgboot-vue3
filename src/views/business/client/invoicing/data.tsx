import { useI18n } from '/@/hooks/web/useI18n';
import { BasicColumn } from '/@/components/Table';
import {defHttp} from "@/utils/http/axios";
import {Api} from "@/views/business/client/client.api";

const { t } = useI18n();

export function getColumns(): BasicColumn[] {
  return [
    {
      title: 'id',
      dataIndex: 'id',
      defaultHidden: true,
    },
    {
      title: t('data.invoice.shop'),
      align: 'center',
      sorter: (a, b) => a['shopId'].localeCompare(b['shopId']),
      dataIndex: 'shopId',
    },
    {
      title: t('data.invoice.platformOrderNumber'),
      align: 'center',
      sorter: (a, b) => a['platformOrderNumber'].localeCompare(b['platformOrderNumber']),
      dataIndex: 'platformOrderNumber',
      slots: { customRender: 'platformOrderNumber' },
      width: 200,
    },
    {
      title: t('data.invoice.orderTime'),
      align: 'center',
      sorter: (a, b) => a['orderTime'].localeCompare(b['orderTime']),
      dataIndex: 'orderTime',
    },
    {
      title: t('data.invoice.country'),
      align: 'center',
      sorter: (a, b) => a['country'].localeCompare(b['country']),
      dataIndex: 'country',
    },
    {
      title: t('data.order.inStock'),
      align: 'center',
      sorter: (a, b) => a.productAvailable - b.productAvailable,
      dataIndex: 'productAvailable',
      slots: { customRender: 'productAvailability' },
      customFilterDropdown: true,
      onFilter(value: Array<string | number | boolean>, record) {
        return value.includes(record.productAvailable);
      },
    },
    {
      title: t('data.invoice.shippingInvoice'),
      align: 'center',
      sorter: (a, b) => a['shippingAvailable'].localeCompare(b['shippingAvailable']),
      dataIndex: 'shippingAvailable',
      slots: { customRender: 'shippingAvailability' },
      customFilterDropdown: true,
      onFilter(value: Array<string | number | boolean>, record) {
        return value.includes(record.shippingAvailable);
      },
      fixed: 'right',
    },
    {
      title: t('data.invoice.purchaseInvoice'),
      align: 'center',
      sorter: (a, b) => a['purchaseAvailable'].localeCompare(b['purchaseAvailable']),
      dataIndex: 'purchaseAvailable',
      slots: { customRender: 'purchaseAvailability' },
      fixed: 'right',
      customFilterDropdown: true,
      onFilter(value: Array<string | number | boolean>, record) {
        return value.includes(record.purchaseAvailable);
      },
    },
    {
      title: t("data.order.hasDesyncedSku"),
      align:"center",
      dataIndex: 'hasDesyncedSku',
      slots: {customRender: 'hasDesyncedSku'},
    }
  ];
}
export const pocColumns: BasicColumn[] = [
  {
    title: 'id',
    dataIndex: 'id',
    defaultHidden: true,
  },
  {
    title: 'SKU ID',
    align: 'center',
    dataIndex: 'skuId_dictText'
  },
  {
    title: t("data.invoice.skuQty"),
    align: 'center',
    dataIndex: 'quantity',
  },
  {
    title: t('data.sku.isSynced'),
    align: 'center',
    dataIndex: 'isSynced',
    slots: { customRender: 'isSynced' },
  }
]
export const invoiceFilter = [
  { text: t('common.available'), value: '0' },
  { text: t('data.invoice.invoiced'), value: '1' },
  { text: t('data.invoice.paid'), value: '2' },
  { text: t('common.unavailable'), value: '-1' },
];

export const inStockFilter = [
  { text: t('data.order.outOfStock'), value: '0' },
  { text: t('data.order.inStock'), value: '1' },
  { text: t('data.order.ordered'), value: '2' },
];

export const fetchValidPeriod = async (params: Recordable) => {
  return await defHttp.get({ url: Api.getValidOrderTimePeriod, params });
};
