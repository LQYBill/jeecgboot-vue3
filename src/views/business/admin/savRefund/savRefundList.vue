<template>
  <PageWrapper title="SAV Refunds">
    <div class="searchForm">
      <BasicForm
        @register="registerForm"
        @submit="handleFilter"
        @reset="handleReset"
      />
    </div>
  </PageWrapper>
  <BasicTable @register="registerTable">
    <template #toolbar>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">{{ t('common.operation.addNew') }}</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="handleExportXls('SAV Refund List', Api.exportXls, exportParams)"> {{ t("common.operation.export") }}</a-button>
      <a-upload name="file" :showUploadList="false" :customRequest="(file) => handleImportXls(file, Api.importExcelUrl, loadList)">
        <a-button preIcon="ant-design:import-outlined" type="primary">{{ t('common.operation.import') }}</a-button>
      </a-upload>
    </template>
    <template v-slot:refundStatus="record">
      <a-tag v-if="record.text === null" color="yellow">{{ t('data.refund.notRefunded') }}</a-tag>
      <a-tag v-else color="green">{{ t('data.refund.refunded') }} {{record.text}}</a-tag>
    </template>
    <template v-slot:yesno="record">
      <a-tag v-if="record.text === 'Y'" color="green">{{ t('common.yes') }}</a-tag>
      <a-tag v-else color="red">{{ t('common.no') }}</a-tag>
    </template>
    <template v-slot:createTime="record">
      <time :datetime="record.text"><span>{{ record.text.split(' ')[0] }}</span><br/><span class="font-extralight">{{ record.text.split(' ')[1] }}</span></time>
    </template>
    <template v-slot:action="{ record }">
      <TableAction
        :actions="[
          {
            icon: 'clarity:note-edit-line',
            onClick: handleEdit.bind(null, record),
          },
        ]"
        :dropDownActions="[
          {
            label: t('common.operation.details'),
            icon: 'ant-design:eye-outlined',
            onClick: handleDetail.bind(null, record),
          },
          {
            label: t('common.operation.delete'),
            icon: 'ic:outline-delete-outline',
            popConfirm: {
              title: t('common.operation.deleteConfirmation'),
              confirm: handleDelete.bind(null, record),
            },
          },
        ]"
      />
    </template>
    <template #customFilterDropdown="{ confirm }">
      <div class="p-2 flex flex-col items-center justify-between w-48 min-h-20 mb-1 gap-4">
        <div class=" w-full flex flex-no-wrap gap-1">
          <a-select
            v-model:value="formState.invoiceNumber"
            ref="searchInput"
            mode="multiple"
            @change="handleChange"
            @pressEnter="handleSearch(confirm)"
            allowClear
            class="flex-1"
          >
            <a-select-option value="Y">{{ t('data.refund.refunded') }}</a-select-option>
            <a-select-option value="N">{{ t('data.refund.notRefunded') }}</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch(confirm)" preIcon="ant-design:search-outlined" class=""/>
        </div>
        <div class="flex justify-between w-full">
          <a-button @click="handleReset" preIcon="ic:baseline-restart-alt" class="flex-1"/>
        </div>
      </div>
    </template>
    <template #filterIcon="filtered">
      <SearchOutlined :style="{ color: filtered ? 'var(--primary-color)' : undefined }" />
    </template>
  </BasicTable>
  <SavRefundModal @register="registerModal" @success="loadList" :isDisabled="isDisabled"/>
</template>
<script lang="ts" setup>
import {BasicTable, TableAction, useTable} from "/@/components/Table";
import {defHttp} from '/@/utils/http/axios';
import {useI18n} from "/@/hooks/web/useI18n";
import {useMethods} from "/@/hooks/system/useMethods";
import {computed, onMounted, reactive, ref} from "vue";
import {filterObj} from "/@/utils/common/compUtils";
import {useModal} from "/@/components/Modal";

import SavRefundModal from './modules/SavRefundModal.vue';
import BasicForm from "/@/components/Form/src/BasicForm.vue";
import {useForm} from "/@/components/Form";
import {toUpper} from "lodash-es";
import {SearchOutlined} from "@ant-design/icons-vue";
import {Select as ASelect} from "ant-design-vue";
import { PageWrapper } from '/@/components/Page';
import {columns, searchFormSchema} from "/@/views/business/admin/savRefund/data/savRefundList.data";

const { t } = useI18n();
const { handleExportXls, handleImportXls } = useMethods();
const [registerModal, { openModal }] = useModal();

onMounted(()=> {
  loadList();
})
enum Api {
  list = "/savRefund/savRefund/list",
  add = "/savRefund/savRefund/add",
  edit = "/savRefund/savRefund/edit",
  delete = "/savRefund/savRefund/delete",
  deleteBatch = "/savRefund/savRefund/deleteBatch",
  exportXls = "/savRefund/savRefund/exportXls",
  importExcelUrl = "savRefund/savRefund/importExcel",
}

const isDisabled = ref(false);

const [registerForm] = useForm({
  actionColOptions: {
    span: 6,
  },
  schemas: searchFormSchema,
  showActionButtonGroup: true,
  compact: true,
});
const iPagination = ref<any>({
  current: 1,
  pageSize: 100,
  pageSizeOptions: ['100', '200', '500'],
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
});
const iSorter = ref({
  column: 'invoiceNumber',
  order: 'asc'
});
const checkedKeys = ref<Array<string | number>>([]);
const selectRows = ref<Array<any>>([]);
const rowSelection = {
  type: 'checkbox',
  columnWidth: 30,
  selectedRowKeys: checkedKeys,
  onChange: onSelectChange,
};
const exportParams = computed(()=>{
  let paramsForm = {};
  let list = "";
  if (selectRows.value && selectRows.value.length > 0) {
    for(let item of selectRows.value) {
      list = list.concat(item.id, ',');
    }
  }
  paramsForm['selections'] = list.slice(0,-1);
  return filterObj(paramsForm)
});
const dataSource = ref<Recordable<any>[]>();
const filters = ref<any>({invoiceNumber: 'null'});
const loading = ref<boolean>(false);
const [registerTable] = useTable({
  rowSelection,
  columns,
  dataSource,
  pagination: iPagination,
  defSort: iSorter,
  striped: false,
  clickToRowSelect: false,
  ellipsis: false,
  onChange: handleTableChange,
  loading: loading,
  showIndexColumn: true,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
});
function handleAdd() {
  openModal(true, {
    isUpdate: false,
  });
}
function handleEdit(record) {
  isDisabled.value = false;
  openModal(true, {
    record,
    isUpdate: true,
  });
}
function handleDetail(record) {
  isDisabled.value = true;
  openModal(true, {
    record,
    isUpdate: true,
  });
}
function onSelectChange(selectedRowKeys: (string | number)[], selectRow) {
  checkedKeys.value = selectedRowKeys;
  selectRows.value = selectRow;
}
function handleDelete(record: Recordable) {
  defHttp.delete({ url: Api.delete, data: { id: record.id } }, { joinParamsToUrl: true }).then(()=> {
    loadList();
  }).catch(e =>{
    console.error(e);
  });
}
function onEditChange({ column, value, record }) {
  // 本例
  if (column.dataIndex === 'id') {
    record.editValueRefs.name4.value = `${value}`;
  }
}
function handleSearch(confirm) {
  confirm();
  loadList(1);
}
function handleFilter(values) {
  filters.value = values;
  loadList(1);
}
function handleReset() {
  searchInput.value = [];
  formState.invoiceNumber = [];
  filters.value = {};
  loadList(1);
}
function handleTableChange(pagination, sorter) {
  iPagination.value = pagination;
  if (Object.keys(sorter).length > 0) {
    iSorter.value.column = sorter.field
    iSorter.value.order = 'ascend' === sorter.order ? 'asc' : 'desc'
  }
  loadList();
}
function getQueryParams() {
  let params = Object.assign(iSorter.value);
  params.pageNo = iPagination.value.current;
  params.pageSize = iPagination.value.pageSize;
  params.order = toUpper(iSorter.value.order);
  params.column = iSorter.value.column;
  params.shop = filters.value.erpCode;
  params.orderID = filters.value.platformOrderId;
  params.invoiceNumber = filters.value.invoiceNumber;
  return filterObj(params);
}
function loadList(arg?:number) {
  loading.value = true;
  if (arg === 1) {
    iPagination.value.current = 1;
  }
  let params = getQueryParams();
  defHttp.get({ url: Api.list, params: params }).then(res=> {
    dataSource.value = res.records;
    if (res.total) {
      iPagination.value.total = res.total;
    } else {
      iPagination.value.total = 0;
    }
  }).catch(e=> {
    console.error(e);
  }).finally(()=> {
    loading.value = false;
  });
}
const searchInput = ref();
const formState = reactive<Record<string, any>>({
  invoiceNumber: ['N'],
});

function handleChange(value:any[]) {
  if((value.length > 1 || value.length === 0) && filters.value.hasOwnProperty('invoiceNumber')) {
    delete filters.value.invoiceNumber;
    return;
  }
  if(value[0] === 'N') {
    filters.value['invoiceNumber'] = 'null';
    return;
  }
  else {
    filters.value['invoiceNumber'] = 'notNull';
    return;
  }
}
</script>
<style>
.alert.ant-alert.ant-alert-info{
  margin: 1em 0;
}
.jeecg-basic-form.jeecg-basic-form--compact {
  .ant-form-item {
    justify-content: flex-end;
  }
}
</style>
