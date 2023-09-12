<template>
  <div>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined">{{
            t('common.operation.addNew')
          }}
        </a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls">
          {{ t('common.operation.export') }}
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
          <a-button>{{ t('common.operation.batchOperation') }}
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
        <super-query :config="superQueryConfig" @search="handleSuperQuery"/>
      </template>
      <!-- image -->
      <template #img="{ text }"> <TableImg :size="60" :imgList="[text]" :src-prefix="imgPrefix" /> </template>
      <!-- batch action -->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)"/>
      </template>
      <!--字段回显插槽-->
      <template #htmlSlot="{text}">
        <div v-html="text"></div>
      </template>
      <!--省市区字段回显插槽-->
      <template #pcaSlot="{text}">
        {{ getAreaTextByCode(text) }}
      </template>
      <template #fileSlot="{text}">
        <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
        <a-button v-else :ghost="true" type="primary" preIcon="ant-design:download-outlined" size="small"
                  @click="downloadFile(text)">下载
        </a-button>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <CreditModal @register="registerModal" @success="handleSuccess"></CreditModal>
  </div>
</template>

<script lang="ts" name="credit" setup>
import {ref, computed, unref, reactive, watch, toRaw} from 'vue';
import {BasicTable, useTable, TableAction, TableImg} from '/@/components/Table';
import {useModal} from '/@/components/Modal';
import {useListPage} from '/@/hooks/system/useListPage'
import CreditModal from './components/CreditModal.vue'
import {columns} from './Credit.data';
import {list, deleteOne, batchDelete, getImportUrl, getExportUrl} from './Credit.api';
import {downloadFile} from '/@/utils/common/renderUtils';
import {useI18n} from "/@/hooks/web/useI18n";
import {useMessage} from "/@/hooks/web/useMessage";

const {t} = useI18n();
const {createMessage} = useMessage();
const imgPrefix = "http://localhost:8080/jeecg-boot/sys/common/static/";
const checkedKeys = ref<Array<string | number>>([]);
//注册model
const [registerModal, {openModal}] = useModal();
//注册table数据
const {prefixCls, tableContext, onExportXls, onImportXls} = useListPage({
  tableProps: {
    title: 'Credit Page',
    api: list,
    columns,
    canResize: false,
    striped: true,
    actionColumn: {
      title: t('common.operation.action'),
      width: 120,
      fixed: 'right'
    },
  },
  exportConfig: {
    name: "credit",
    url: getExportUrl,
  },
  importConfig: {
    url: getImportUrl,
    success: handleSuccess
  },
})

const [registerTable, {reload, setProps}, {rowSelection, selectedRowKeys}] = tableContext

/**
 * 新增事件
 */
function handleAdd() {
  openModal(true, {
    isUpdate: false,
    showFooter: true,
  });
}

/**
 * 编辑事件
 */
function handleEdit(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
  });
}

/**
 * 详情
 */
function handleDetail(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: false,
  });
}

/**
 * 删除事件
 */
async function handleDelete(record) {
  await deleteOne({id: record.id}, handleSuccess);
}

/**
 * 批量删除事件
 */
async function batchHandleDelete() {
  await batchDelete({ids: selectedRowKeys.value}, handleSuccess);
}

/**
 * 成功回调
 */
function handleSuccess() {
  (selectedRowKeys.value = []) && reload();
}

/**
 * 操作栏
 */
function getTableAction(record) {
  return [
    {
      label: t('common.operation.edit'),
      onClick: handleEdit.bind(null, record),
    }
  ]
}

/**
 * 下拉操作栏
 */
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
      }
    }
  ]
}

/**
 * Search
 */
const superQueryConfig = reactive({
  clientId:{ title: "client", view: "sel_search", type: "string", dictTable: "client", dictCode: "id", dictText: "internal_code", order: 1 },
  createTime:{ title: t('data.invoice.createDate'), view: "datetime", type: "string", order: 2 },
  amount:{ title: t('data.transaction.amount'), view: "number", type: "number", order: 3 },
})

const customSearch = ref(false);
const queryParam = reactive({
  clientId: '',
  createTime: '',
  amount: '',
});
watch(customSearch, () => {
  setProps({ useSearchForm: !unref(customSearch) });
});
function searchQuery() {
  setProps({ searchInfo: toRaw(queryParam) });
  reload();
}
function searchReset() {
  Object.assign(queryParam, {
    clientId: '',
    createTime: '',
    amount: '',
  });
  reload();
}
//执行查询
function handleSuperQuery(params) {
  Object.keys(params).map(k=>{
    queryParam[k] = params[k]
  });
  searchQuery();
}

</script>

<style scoped>

</style>
