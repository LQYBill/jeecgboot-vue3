<template>
  <BasicTable
    @register="registerTable"
  />
</template>
<script lang="ts" setup>
import {BasicColumn, useTable} from "/@/components/Table";
import {reactive, ref} from "vue";
import {defHttp} from "/@/utils/http/axios";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {useI18n} from "/@/hooks/web/useI18n";
const { t } = useI18n();

enum Api {
  list = "/shippingInvoice/breakdown/byShop",
}
const ipagination = reactive({
    current: 1,
    pageSize: 100,
    pageSizeOptions: ['50', '100'],
    showQuickJumper: true,
    showSizeChanger: true,
    total: 0
  });
const columns: BasicColumn[] = [
  {
    title: t('data.invoice.customerCode'),
    dataIndex: 'code',
    sorter: (a, b) => a['code'].localeCompare(b['code'])
  },
  {
    title: t('data.invoice.shop'),
    dataIndex: 'shop',
    sorter: (a, b) => a['shop'].localeCompare(b['shop'])
  },
  {
    title: t('data.order.unshippedOrdersVolume'),
    dataIndex: 'ordersToProcess',
    sorter: (a, b) => a.ordersToProcess - b.ordersToProcess
  },
  {
    title: t('data.order.shippedUninvoicedOrdersVolume'),
    dataIndex: 'processedOrders',
    sorter: (a, b) => a.processedOrders - b.processedOrders
  },
  {
    title: t('data.order.shippedUninvoicedOrdersAmountToBill'),
    dataIndex: 'dueForProcessedOrders',
    sorter: (a, b) => a.dueForProcessedOrders - b.dueForProcessedOrders
  },
];
const list = (params) => {
  return defHttp.get({ url: Api.list, params });
}
const [registerTable, { reload, setProps }] = useTable({
  title: 'Billable Orders',
  api: list,
  columns,
  pagination: ipagination,
  defSort: {
    column: 'shop',
    order: 'desc'
  },
  ellipsis: false,
  useSearchForm: false,
  bordered: true,
  striped: true,
  showTableSetting: true,
  showSummary: false,
  showIndexColumn: true,
  clickToRowSelect: false,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  tableSetting: { fullScreen: true },
  canResize: false,
  rowKey: 'id',
});
</script>
<style>

</style>
