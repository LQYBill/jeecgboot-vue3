<template>
  <BasicTable
    @register="registerTable"
    size="middle"
    bordered
    :columns="columns"
    :dataSource="dataSource"
    :pagination="false"
    :loading="loading"
  >
  </BasicTable>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import { BasicTable, BasicColumn, useTable} from '/@/components/Table';
import {useMessage} from "/@/hooks/web/useMessage";
import {useI18n} from "/@/hooks/web/useI18n";

const { t } = useI18n();
const { createMessage } = useMessage();

const loading = ref<boolean>(false);

const props = defineProps({
  record: {
    type: Object,
    default: null,
  }
});

const dataSource = ref<any[]>([]);
const columns: BasicColumn[] = [
  {
    title: t('data.invoice.shop'),
    dataIndex: 'shop',
    sorter: (a, b) => a['shop'].localeCompare(b['shop']),
    width: 80,
  },
  {
    title: t('data.order.unshippedOrdersVolume'),
    dataIndex: 'ordersToProcess',
    sorter: (a, b) => a.ordersToProcess - b.ordersToProcess,
    width: 120,
  },
  {
    title: t('data.order.shippedUninvoicedOrdersVolume'),
    dataIndex: 'processedOrders',
    sorter: (a, b) => a.processedOrders - b.processedOrders,
    width: 120,
  },
  {
    title: t('data.order.shippedUninvoicedOrdersAmountToBill'),
    dataIndex: 'dueForProcessedOrders',
    sorter: (a, b) => a.dueForProcessedOrders - b.dueForProcessedOrders,
    width: 120,
  },
  {
    title: t('common.errorMessage'),
    dataIndex: 'errorMessage',
    width: 250,
    ellipsis: false,
  },
];
const [registerTable, { reload }] = useTable({
  columns,
  //自定义默认排序
  bordered: true,
  striped: true,
  showTableSetting: false,
  clickToRowSelect: true,
  showIndexColumn: true,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  canResize: false,
  defSort: {
    column: 'shop',
    order: 'ascend'
  },
  rowKey: 'id',
});
watch(
  () => props.record,
  () => {
    if (props.record != null) {
      loadData(props.record)
    }
  },
  {
    immediate: true,
  }
)
function loadData(record) {
  console.log(`record : ${JSON.stringify(record)}`);
  loading.value = true;
  dataSource.value = record;
  loading.value = false;
}

</script>

<style scoped>

</style>
