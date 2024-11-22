import {BasicColumn} from "@/components/Table";
import {defHttp} from "@/utils/http/axios";
import {useI18n} from "@/hooks/web/useI18n";

const { t } = useI18n();
export const Api = {
  SHOP_LIST: '/shop/shopGroupedByClient',
  EXTRA_FEES_LIST: '/extraFee/list',
  EXTRA_FEES_OPTIONS_LIST: '/extraFeeOption/list',
  CREATE_EXTRA_FEE: '/extraFee/create',
  UPDATE_EXTRA_FEE: '/extraFee/update',
}

export const additionalFeesColumns: BasicColumn[] = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
    align:"center",
    sorter: true,
    ifShow: false,
  },
  {
    title: t('data.invoice.createBy'),
    align:"center",
    sorter: true,
    dataIndex: 'createBy',
  },
  {
    title: t('data.invoice.createDate'),
    align:"center",
    sorter: true,
    dataIndex: 'createTime',
  },
  {
    title: t('data.invoice.shop'),
    dataIndex: 'shop',
    sorter: true,
  },
  {
    title: t('data.invoice.feeName'),
    align:"center",
    sorter: true,
    dataIndex: 'enName',
    slots: { customRender: 'feeName' },
  },
  {
    title: t('data.invoice.quantity'),
    width: 80,
    align:"center",
    dataIndex: 'quantity',
  },
  {
    title: t('data.invoice.totalAmount'),
    align:"center",
    sorter: true,
    dataIndex: 'unitPrice',
    slots: { customRender: 'unitPrice' },
  },
  {
    title: t('data.invoice.invoiceNumber'),
    width: 180,
    sorter: true,
    dataIndex: 'invoiceNumber',
    slots: { customRender: 'invoiceNumber' },
  },
];
export const actionColumn: BasicColumn = {
  width: 80,
  title: t('common.operation.action'),
  dataIndex: 'action',
  slots: { customRender: 'action' },
};
export const fetchExtraFeeList = async (handler: Function, params) => {
  return await defHttp.get({url: Api.EXTRA_FEES_LIST, params}).then((res) => {
    handler(res);
  })
}

export const fetchShopList = async (handler: Function) => {
  return await defHttp.get({url: Api.SHOP_LIST}).then((res) => {
    handler(res);
  });
}
export const fetchTypeList = async (handler: Function) => {
  return await defHttp.get({url: Api.EXTRA_FEES_OPTIONS_LIST}).then((res) => {
    handler(res);
  })
}

export const saveOrUpdateExtraFee = async (params: Record<string, any>, isUpdate:boolean, handler: Function) => {
  const url = isUpdate ? Api.UPDATE_EXTRA_FEE : Api.CREATE_EXTRA_FEE;
  return await defHttp.post({url, params}).then((res) => {
    handler(res);
  })
}

export const statusOptions = [
  {
    label: 'Not invoiced',
    value: '0',
  },
  {
    label: 'Invoiced',
    value: '1',
  }
]
