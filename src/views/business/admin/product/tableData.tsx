import { FormSchema } from '/@/components/Table';
import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';
import { reactive } from 'vue';
const { t } = useI18n();

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
      title: t('data.product.code'),
      dataIndex: 'code',
      align: 'left',
      sorter: true,
    },
    {
      title: t('data.zhName'),
      dataIndex: 'zhName',
      align: 'left',
      sorter: true,
    },
    {
      title: t('data.enName'),
      dataIndex: 'enName',
      align: 'left',
      sorter: true,
    },
    {
      title: t('data.shipping.weight'),
      dataIndex: 'weight',
      align: 'left',
      sorter: true,
      edit: true,
      editRule: true,
      editComponent: 'InputNumber',
    },
    {
      title: t('data.invoice.createDate'),
      dataIndex: 'createTime',
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
    },
  ];
}

export const superQueryConfig = reactive({
  code: { title: t('data.product.code'), view: 'text', type: 'string', order: 1 },
  zhName: { title: t('data.zhName'), view: 'text', type: 'string', order: 2 },
});
