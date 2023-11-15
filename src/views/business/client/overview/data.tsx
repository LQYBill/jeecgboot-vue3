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
      title: t('data.invoice.createBy'),
      align: 'center',
      dataIndex: 'createBy',
        defaultHidden: true,
    },
    {
      title: t("data.invoice.createDate"),
      align:"center",
      dataIndex: 'createTime',
      slots: {customRender: 'date'},
    },
    {
      title: t('data.transaction.type'),
      align: 'center',
      dataIndex: 'type',
      width: 70,
      slots: {customRender: 'transactionType'},
    },
    {
      title: t('data.Client'),
      align: 'center',
      dataIndex: 'clientId',
      defaultHidden: true,
    },
    {
      title: 'Attachments',
      align: 'center',
      dataIndex: 'attachments',
      slots: {customRender: 'attachments'},
    },
    {
      title: t('data.invoice.shippingFee'),
      align: 'center',
      dataIndex: 'shippingFee',
      slots: {customRender: 'shippingFee'},
    },
    {
      title: t('data.invoice.purchaseFee'),
      align: 'center',
      dataIndex: 'purchaseFee',
      slots: {customRender: 'purchaseFee'},
    },
    {
      title: t('data.transaction.amount'),
      align: 'center',
      dataIndex: 'amount',
      slots: {customRender: 'amount'},
    },
    {
      title: t('data.client.currency'),
      align: 'center',
      dataIndex: 'currency',
      defaultHidden: true,
    },
  ];
}
