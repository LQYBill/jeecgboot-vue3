<template>
  <BasicTable @register="registerTable" @expand="handleExpand">
    <template #expandedRowRender>
      <BasicTable bordered size="middle" rowKey="id" :canResize="false" :columns="innerColumns"
                  :dataSource="innerData" :pagination="false">
      </BasicTable>
    </template>
    <template #tableTitle>
      <a-button v-if="selectRows.length > 0" type="primary" @click="placeOrders"
                preIcon="ant-design:cloud-upload-outlined">{{ t('data.order.placeOrder') }}
      </a-button>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)"/>
    </template>
  </BasicTable>
  <ShoumanPreviewModal @register="registerModal"></ShoumanPreviewModal>
</template>

<script async setup lang="ts">
import {useI18n} from "@/hooks/web/useI18n";
import {BasicTable, TableAction, useTable} from "@/components/Table";
import {columns, innerColumns} from "./data/Shouman.data";
import {useModal} from '/@/components/Modal';
import {list} from "./api/Shouman.api";
import {provide, ref} from "vue";
import {defHttp} from "@/utils/http/axios";
import ShoumanPreviewModal from "./components/ShoumanPreviewModal.vue";
import {useMessage} from "@/hooks/web/useMessage";

const {t} = useI18n();
const checkedKeys = ref<Array<string | number>>([]);
const selectRows = ref<Array<any>>([]);
const expandedRowKeys = ref<any[]>([]);
const $message = useMessage();
const [registerModal, {openModal}] = useModal();

const url = {
  orderContentByOrderId: '/business/platformOrder/queryPlatformOrderContentByMainId',
  previewByOrderId: '/business/platformOrder/shouman/preview',
  placeOrder: '/business/platformOrder/shouman/create'
};

const rowSelection = {
  type: 'checkbox',
  columnWidth: 30,
  selectedRowKeys: checkedKeys,
  onChange: onSelectChange,
};

// creating table
const [registerTable, {getSelectRows, reload}] = useTable({
  api: list,
  columns,
  innerColumns,
  //自定义默认排序
  defSort: {
    column: 'createTime',
    order: 'desc',
  },
  rowSelection: rowSelection,
  bordered: true,
  striped: true,
  showTableSetting: true,
  showSummary: true,
  clickToRowSelect: false,
  showIndexColumn: true,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  tableSetting: {fullScreen: true},
  canResize: false,
  rowKey: 'id',
  sortFn: (sorter) => ({
    column: sorter.field === 'shopId_dictText'
      ? 'shopId'
      : sorter.field,
    order: sorter.order === 'ascend' ? 'asc' : 'desc',
  }),
});

const innerData = ref<any[]>([]);
const platformOrderId = ref<string>('');
const allCustomComments = ref(new Map());
//下发 platformOrderId,子组件接收
provide('platformOrderId', platformOrderId);
//下发 customShoumanComments,子组件接收
provide('allCustomComments', allCustomComments);

function handlePreview(id) {
  defHttp.get({
    url: url.previewByOrderId,
    params: {platformOrderId: id}
  }, {isTransformResponse: false}).then((res) => {
    if (res.success) {
      const result = res.result;
      platformOrderId.value = id;
      openModal(true, {
        result
      });
    }
  });
}

function getTableAction(record) {
  return [
    {
      label: t("data.shouman.preview"),
      onClick: handlePreview.bind(null, record.platformOrderId),
    }
  ];
}

function onSelectChange(selectedRowKeys: (string | number)[]) {
  checkedKeys.value = selectedRowKeys;
  selectRows.value = getSelectRows();
}

function handleExpand(expanded, record) {
  expandedRowKeys.value = [];
  innerData.value = [];
  if (expanded === true) {
    expandedRowKeys.value.push(record.id);
    defHttp.get({
      url: url.orderContentByOrderId,
      params: {id: record.id}
    }, {isTransformResponse: false}).then((res) => {
      if (res.success) {
        innerData.value = res.result.records;
      }
    });
  }
}

function placeOrders() {
  let orders = [];
  selectRows.value.forEach((row) => {
    let customComments = allCustomComments.value.get(row.platformOrderId);
    let param = {
      platformOrderId: row.platformOrderId, remarks: customComments == null ? null : customComments,
    }
    orders.push(param);
  })
  defHttp.post({url: url.placeOrder, params: orders}, {isTransformResponse: false}).then((res) => {
    if (res.success) {
      $message.createMessage.success(res.message);
      // 重置
      checkedKeys.value = [];
      selectRows.value = [];
      allCustomComments.value = new Map();
      reload();
    }
  });
}
</script>

<style scoped lang="less">

</style>
