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
import { defHttp } from '/@/utils/http/axios';
import { BasicTable, BasicColumn, useTable} from '/@/components/Table';
import {useMessage} from "/@/hooks/web/useMessage";
import {useI18n} from "/@/hooks/web/useI18n";

const { t } = useI18n();
const { createMessage } = useMessage();

const Api = {
  listByMainId: '/business/platformOrder/queryPlatformOrderContentByMainId',
}

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
    title: t("data.invoice.platformOrderID"),
    align: 'center',
    dataIndex: 'platformOrderId_dictText'
  },
  {
    title: 'SKU ID',
    align: 'center',
    dataIndex: 'skuId_dictText'
  },
  {
    title: t("data.invoice.skuQty"),
    align: 'center',
    dataIndex: 'quantity',
  },
  {
    title: t("data.invoice.purchaseFee"),
    align: 'center',
    dataIndex: 'purchaseFee',
  },
  {
    title: t("data.invoice.shippingFee"),
    align: 'center',
    dataIndex: 'shippingFee',
  },
  {
    title: t("data.invoice.serviceFee"),
    align: 'center',
    dataIndex: 'serviceFee',
  },
  {
    title: t("data.invoice.vat"),
    align: 'center',
    dataIndex: 'vat',
  },
  {
    title: t("data.invoice.skuPurchaseStatus"),
    align: 'center',
    dataIndex: 'status_dictText',
  },
  {
    title: t("data.invoice.erpStatus"),
    align: 'center',
    dataIndex: 'erpStatus',
  },
  {
    title: t("data.invoice.productAvailable"),
    align: 'center',
    dataIndex: 'productAvailable',
    helpMessage: ['1='+t("common.yes"), '0='+t("common.no")]
  },
];
const [registerTable, { reload }] = useTable({
  title: t('data.invoice.platformOrderContentList'),
  columns,
  //自定义默认排序
  bordered: true,
  striped: true,
  showTableSetting: false,
  clickToRowSelect: true,
  showIndexColumn: false,
  canResize: false,
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
  console.log(`record : ${JSON.stringify(record.record)}`);
  loading.value = true;
  dataSource.value = []
  defHttp.get(
  {
    url: Api.listByMainId,
    params: {
      id: record.record.id
    }
  }
  ).then((res) => {
    dataSource.value = res.records
  }).finally(() => {
    loading.value = false
  })
}

</script>

<style scoped>

</style>
