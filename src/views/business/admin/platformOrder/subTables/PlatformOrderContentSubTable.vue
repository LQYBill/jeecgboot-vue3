<template>
  <BasicTable
    @register="registerTable"
    size="middle"
    :dataSource="dataSource"
    :pagination="false"
    :loading="loading"
  >
    <template #erpStatus="{ text }">
      <Tag :color="text === '5' ? 'volcano' : text === '1' ? 'warning' : 'green'">
        {{ getErpStatus(text) }}
      </Tag>
    </template>
    <template #productAvailable="{ text }">
      <Tag :color="text === '0' ? 'volcano' : 'green'">
        {{ text === '0' ? t("common.no") : t("common.yes") }}
      </Tag>
    </template>
    <template #isSynced="{ text }">
      <Tag :color="text === 0 ? 'volcano' : 'green'">
        {{ text === 0 ? t("common.no") : t("common.yes") }}
      </Tag>
    </template>
  </BasicTable>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { BasicTable, useTable} from '/@/components/Table';
import {useI18n} from "/@/hooks/web/useI18n";
import {Tag} from "ant-design-vue";
import {getErpStatusFromCode} from "@/views/business/enum/ErpStatusEnum";
import {pocColumns} from "@/views/business/admin/shippingInvoice/data";

const { t } = useI18n();

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
const [registerTable, {}] = useTable({
  title: t('data.invoice.platformOrderContentList'),
  columns: pocColumns,
  ellipsis: false,
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

function getErpStatus(code: string) {
  return getErpStatusFromCode(code);
}

</script>

<style scoped>

</style>
