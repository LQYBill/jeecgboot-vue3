import { useI18n } from '/@/hooks/web/useI18n';
import { BasicColumn } from '/@/components/Table';

const { t } = useI18n();

export function getColumns(): BasicColumn[] {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'left',
      defaultHidden: true,
    },
    {
      title: t('data.invoice.shop'),
      align: 'center',
      sorter: (a, b) => a.shopId - b.shopId,
      dataIndex: 'shopId_dictText',
    },
    {
      title: t("data.invoice.logisticChannel"),
      align:"center",
      sorter: (a, b) => a.logisticChannelName - b.logisticChannelName,
      dataIndex: 'logisticChannelName_dictText',
      slots: {customRender: 'logisticChannelName'}
    },
    {
      title: t('data.invoice.platformOrderID'),
      align: 'center',
      sorter: (a, b) => a.platformOrderId - b.platformOrderId,
      dataIndex: 'platformOrderId',
    },
    {
      title: t('data.invoice.platformOrderNumber'),
      align: 'center',
      sorter: (a, b) => a.platformOrderNumber - b.platformOrderNumber,
      dataIndex: 'platformOrderNumber',
    },
    {
      title: t('data.invoice.orderTime'),
      align: 'center',
      sorter: (a, b) => a.orderTime - b.orderTime,
      dataIndex: 'orderTime',
    },
    {
      title: t('data.invoice.recipient'),
      align: 'center',
      sorter: (a, b) => a.recipient - b.recipient,
      dataIndex: 'recipient',
      defaultHidden: true,
    },
    {
      title: t('data.client.postCode'),
      align: 'center',
      sorter: (a, b) => a.postcode - b.postcode,
      dataIndex: 'postcode',
    },
    {
      title: t('data.invoice.country'),
      align: 'center',
      sorter: (a, b) => a.country - b.country,
      dataIndex: 'country',
    },
    {
      title: t('data.order.inStock'),
      align: 'center',
      sorter: (a, b) => a.productAvailable - b.productAvailable,
      dataIndex: 'productAvailable',
      slots: { customRender: 'productAvailability' },
    },
  ];
}
