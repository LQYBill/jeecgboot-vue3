import { useI18n } from '/@/hooks/web/useI18n';
import { BasicColumn } from '/@/components/Table';

const { t } = useI18n();

export function getColumns(): BasicColumn[] {
  return [
    {
      title: "id",
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
    },
    {
      title: t('data.invoice.shippingInvoice'),
      align: 'center',
      sorter: (a, b) => a['shippingAvailable'].localeCompare(b['shippingAvailable']),
      dataIndex: 'shippingAvailable',
      slots: { customRender: 'shippingAvailability' },
      customFilterDropdown: true,
      onFilter(value: Array<string | number | boolean >, record) {
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
      onFilter(value: Array<string | number | boolean >, record) {
        return value.includes(record.purchaseAvailable);
      },
    },
  ];
}
