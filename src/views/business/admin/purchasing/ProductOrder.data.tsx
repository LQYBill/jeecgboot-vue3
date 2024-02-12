import {useI18n} from '/@/hooks/web/useI18n';
import {BasicColumn, FormSchema} from '/@/components/Table';

const {t} = useI18n();

export const columns: BasicColumn[] = [
  {
    title: t('data.sku.erpCode'),
    align: 'center',
    dataIndex: 'erpCode',
  },
  {
    title: t('data.product.product'),
    align: 'center',
    dataIndex: 'product',
  },
  {
    title: t('data.sku.availableAmount'),
    align: 'center',
    dataIndex: 'availableAmount',
    slots: {customRender: 'availableAmount'},
    helpMessage: t('data.sku.availableAmountHelpMessage'),
  },
  {
    title: t('data.sku.purchasingAmount'),
    align: 'center',
    dataIndex: 'purchasingAmount',
    defaultHidden: true,
  },
  {
    title: t('data.sku.quantityInOrders'),
    align: 'center',
    dataIndex: 'qtyInOrdersNotShipped',
    defaultHidden: true,
  },
  {
    title: t('data.order.stock'),
    align: 'center',
    dataIndex: 'stock',
    customRender: ({record}:any) => {
      if(record.stock > 0) {
        return record.stock;
      }
      return <span class={'text-red-500'}>{record.stock}</span>;
    },
    sorter: (a:any, b:any) => a.stock - b.stock,
  },
  {
    title: t('data.sku.imageSource'),
    align: 'center',
    dataIndex: 'imageSource',
    slots: {customRender: 'image'}
  },
  {
    title: t('data.sku.serviceFee'),
    align: 'center',
    dataIndex: 'serviceFee',
  },
  {
    title: t('data.sku.discountMOQ'),
    align: 'center',
    dataIndex: 'discountMoq',
  },
  {
    title: t('data.sku.discountedPrice'),
    align: 'center',
    dataIndex: 'discountedPrice',
  },
  {
    title: t('data.sku.sales'),
    align: 'center',
    dataIndex: 'salesLastWeek',
    slots: {customRender: 'sales'},
    helpMessage: t('data.sku.volumeSoldDuringPeriod',{var: '7 | 28 | 42'}),
    fixed: 'right',
    sorter: (a:any, b:any) => a.salesLastWeek - b.salesLastWeek,
  },
  {
    title: t('data.sku.skuPrice'),
    align: 'center',
    dataIndex: 'skuPrice',
    slots: {customRender: 'skuPrice'},
    fixed: 'right',
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'erpCode',
    component: 'Input',
    label: t('data.sku.erpCode'),
    show: false,
  }
];

