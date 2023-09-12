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
      sorter: true,
      dataIndex: 'createBy',
        defaultHidden: true,
    },
    {
      title: t("data.invoice.createDate"),
      align:"center",
      sorter: true,
      dataIndex: 'createTime',
    },
    {
      title: t('data.transaction.type'),
      align: 'center',
      sorter: true,
      dataIndex: 'type',
      slots: {customRender: 'transactionType'},
    },
    {
      title: t('data.Client'),
      align: 'center',
      sorter: true,
      dataIndex: 'clientId',
    },
    {
      title: t('data.transaction.paymentProof'),
      align: 'center',
      sorter: true,
      dataIndex: 'paymentProofString',
      slots: { customRender: 'imgs' },
    },
    {
      title: t('data.invoice.invoiceNumber'),
      align: 'center',
      sorter: true,
      dataIndex: 'invoiceNumber',
      slots: {customRender: 'invoiceNumber'}
    },
    {
      title: t('data.transaction.amount'),
      align: 'center',
      sorter: true,
      dataIndex: 'amount',
      slots: {customRender: 'amount'},
    },
    {
      title: t('data.client.currency'),
      align: 'center',
      sorter: true,
      dataIndex: 'currency',
    },
  ];
}
