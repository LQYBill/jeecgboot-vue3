<template>
  <div>
    <BasicTable @register="registerTable" @add="handleAdd" @batchDelete="batchHandleDelete">
      <template #tableTitle>
        <TableTitle/>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"
                     :dropDownActions="getDropDownAction(record)"/>
      </template>
    </BasicTable>
    <LogisticExpenseDetailModal @register="registerModal"
                                @success="handleSuccess"></LogisticExpenseDetailModal>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, provide, ref} from 'vue';
import {BasicTable, TableAction, useTable} from '/@/components/Table';
import {useModal} from '/@/components/Modal';
import {downloadFile} from '/@/utils/common/renderUtils';
const { t } = useI18n();

import LogisticExpenseDetailModal from './components/LogisticExpenseDetailModal.vue'
import {columns, searchFormSchema} from './LogisticExpenseDetail.data';
import {
  list,
  deleteOne,
  batchDelete,
} from './LogisticExpenseDetail.api';
import {useI18n} from "vue-i18n";
import TableTitle from "@/views/business/admin/logisticExpenses/components/TableTitle.vue";



const checkedKeys = ref<Array<string | number>>([]);
const selectedRowKeys = ref<string[]>([]);

const [registerModal, {openModal}] = useModal();

const [registerTable, {reload, getSelectRowKeys, getRowSelection, getSelectRows}] = useTable({
  title: 'logistic_expense_detail',
  api: list,
  columns,
  canResize: false,
  formConfig: {
    //labelWidth: 120,
    schemas: searchFormSchema,
    autoSubmitOnEnter: true,
    showAdvancedButton: true,
    fieldMapToNumber: [],
    fieldMapToTime: [],
  },
  bordered: true,
  rowSelection: {
    onChange: () => {
      console.log('selectedRowKeys', getSelectRowKeys());
      selectedRowKeys.value = getSelectRowKeys();
    }
  },
  showIndexColumn: true,
  indexColumnProps: {
    width: 50,
    align: 'center',
    title: '#',
  },
  actionColumn: {
    title: t('common.operation.action'),
    width: 120,
    fixed: 'right',
    slots: {
      customRender: 'action',
    },
  },
})

onMounted(async() => {
});
function handleAdd() {
  openModal(true, {
    isUpdate: false,
    showFooter: true,
  });
}
function handleEdit(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
  });
}
function handleDetail(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: false,
  });
}
async function handleDelete(record) {
  await deleteOne({id: record.id}, handleSuccess);
}
async function batchHandleDelete() {
  await batchDelete({ids: selectedRowKeys.value}, handleSuccess);
}

function handleSuccess() {
  (selectedRowKeys.value = []) && reload();
}

/**
 * Actions
 */
function getTableAction(record) {
  return [
    {
      icon: 'clarity:note-edit-line',
      onClick: handleEdit.bind(null, record),
    }
  ]
}
function getDropDownAction(record) {
  return [
    {
      icon: 'clarity:info-standard-line',
      label: t('common.operation.details'),
      onClick: handleDetail.bind(null, record),
    },
    {
      icon: 'ant-design:delete-outlined',
      label: t('common.operation.delete'),
      popConfirm: {
        title: t('common.operation.deleteConfirmation'),
        confirm: handleDelete.bind(null, record),
        placement: 'topLeft',
      }
    }
  ]
}
provide('selectedRowKeys', selectedRowKeys);
</script>

<style>
</style>
