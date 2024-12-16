import { FormSchema } from '/@/components/Table';
import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const Api = {
  list: '/sku/listWithFilters',
  update: '/skuWeight/update',
  updateBatch: '/skuWeight/updateBatch',
};
export function getProductColumns(): BasicColumn[] {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'left',
      sorter: true,
      defaultHidden: true,
    },
    {
      title: t('data.sku.erpCode'),
      dataIndex: 'erpCode',
      align: 'left',
      sorter: true,
      customFilterDropdown: true,
      onFilter: (value, record: Recordable) => {
        for (let i = 0; i < (value as string).length; i++) {
          if (record.product.toString().toLowerCase().includes(value[i].toLowerCase())) {
            return true;
          }
        }
        return false;
      },
    },
    {
      title: t('data.zhName'),
      dataIndex: 'zhName',
      align: 'left',
      sorter: true,
      customFilterDropdown: true,
      onFilter: (value, record: Recordable) => {
        for (let i = 0; i < (value as string).length; i++) {
          if (record.zhName.toString().toLowerCase().includes(value[i].toLowerCase())) {
            return true;
          }
        }
        return false;
      },
    },
    {
      title: t('data.enName'),
      dataIndex: 'enName',
      align: 'left',
      sorter: true,
      customFilterDropdown: true,
      onFilter: (value, record: Recordable) => {
        for (let i = 0; i < (value as string).length; i++) {
          if (record.enName.toString().toLowerCase().includes(value[i].toLowerCase())) {
            return true;
          }
        }
        return false;
      },
    },
    {
      title: t('data.shipping.weight'),
      dataIndex: 'weight',
      align: 'left',
      sorter: true,
    },
    {
      title: t('data.invoice.effectiveDate'),
      dataIndex: 'weightEffectiveDate',
      align: 'left',
      sorter: true,
    },
  ];
}

export function getModalFormSchema(): FormSchema[] {
  return [
    {
      field: 'weight',
      label: t('data.shipping.weight'),
      component: 'InputNumber',
      required: true,
      defaultValue: 1,
      componentProps: {
        min: 0,
      },
    },
    {
      field: 'effectiveDate',
      label: t('data.invoice.effectiveDate'),
      component: 'DatePicker',
      required: true,
      defaultValue: new Date(),
      componentProps: {
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        showTime: true,
      }
    },
  ];
}
