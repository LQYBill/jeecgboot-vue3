<template>
  <div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> {{ t('common.operation.add') }}
        </a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> {{ t('common.operation.export') }}
        </a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">
          {{ t('common.operation.import') }}
        </j-upload-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                {{ t('common.operation.delete') }}
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            {{ t('common.operation.batchOperation') }}
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
        <super-query :config="superQueryConfig" @search="handleSuperQuery"/>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"
                     :dropDownActions="getDropDownAction(record)"/>
      </template>
    </BasicTable>
    <ShopOptionsModal @register="registerModal" @success="handleSuccess"></ShopOptionsModal>
  </div>
</template>

<script lang="ts" setup>
import {ref, reactive,} from 'vue';
import {BasicTable, TableAction} from '/@/components/Table';
import {useModal} from '/@/components/Modal';
import {useListPage} from '/@/hooks/system/useListPage'
import ShopOptionsModal from './components/ShopOptionsModal.vue'
import {columns, searchFormSchema, superQuerySchema} from './ShopOptions.data';
import {list, deleteOne, batchDelete, getImportUrl, getExportUrl} from './ShopOptions.api';
import {useUserStore} from '/@/store/modules/user';
import {useI18n} from "vue-i18n";
import {Icon} from "@/components/Icon";

const queryParam = reactive<any>({});
const checkedKeys = ref<Array<string | number>>([]);
const userStore = useUserStore();
const {t} = useI18n();
const [registerModal, {openModal}] = useModal();
const { tableContext, onExportXls, onImportXls} = useListPage({
  tableProps: {
    title: '客户选项列表',
    api: list,
    columns,
    canResize: false,
    ellipsis: false,
    formConfig: {
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    actionColumn: {
      width: 120,
      fixed: 'right',
      title: t('common.operation.action'),
    },
    beforeFetch: (params) => {
      return Object.assign(params, queryParam);
    },
  },
  exportConfig: {
    name: "客户选项列表",
    url: getExportUrl,
    params: queryParam,
  },
  importConfig: {
    url: getImportUrl,
    success: handleSuccess
  },
})

const [registerTable, {reload}, {rowSelection, selectedRowKeys}] = tableContext

const superQueryConfig = reactive(superQuerySchema);

function handleSuperQuery(params) {
  Object.keys(params).map((k) => {
    queryParam[k] = params[k];
  });
  reload();
}

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

function getTableAction(record) {
  return [
    {
      label: t('common.operation.edit'),
      onClick: handleEdit.bind(null, record),
    }
  ]
}

function getDropDownAction(record) {
  return [
    {
      label: t('common.operation.details'),
      onClick: handleDetail.bind(null, record),
    }, {
      label: t('common.operation.delete'),
      popConfirm: {
        title: t('common.operation.deleteConfirmation'),
        confirm: handleDelete.bind(null, record),
        placement: 'topLeft',
      }
    }
  ]
}
</script>

<style scoped>

</style>
