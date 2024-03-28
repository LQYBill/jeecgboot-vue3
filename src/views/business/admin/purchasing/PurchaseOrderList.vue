<template>
  <PageWrapper
    title="Purchase Order Management."
  >
    <template #headerContent>
      {{t('guide.purchaseInvoice.line1')}}<br/>
      {{t('guide.purchaseInvoice.line2')}}<a-button type="primary" @click="" preIcon="ant-design:plus-outlined">{{ t('common.operation.addNew') }}</a-button><br/>
      {{t('guide.purchaseInvoice.line3')}}<a-button type="warning" @click="" preIcon="ant-design:shopping-cart-outlined"></a-button>
    </template>
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined">
          {{ t('common.operation.addNew') }}
        </a-button>
        <a-button type="warning" @click="handleCreateOrder" preIcon="ant-design:shopping-cart-outlined" :disabled="createOrderDisabled">
        </a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="handleDeleteBatch">
                <Icon icon="ant-design:delete-outlined"></Icon>
                {{ t('common.operation.delete') }}
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>{{ t('common.operation.batchOperation') }}
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"
                     :dropDownActions="getDropDownAction(record)"/>
      </template>
      <!--字段回显插槽-->
      <template #htmlSlot="{text}">
        <div v-html="text"></div>
      </template>
      <!-- documents -->
      <template #fileSlot="{text}">
        <span v-if="!text" class="text-xs italic text-gray-300">{{ t("data.upload.noDocument") }}</span>
        <a-button v-else :ghost="true" type="primary" preIcon="ant-design:download-outlined"
                  size="small" @click="downloadFile(text)">
          {{ t('common.operation.download') }}
        </a-button>
      </template>
      <!-- images -->
      <template #img="{ text }">
        <span v-if="!text" class="text-xs italic text-gray-300">{{ t("data.upload.noDocument") }}</span>
        <TableImg v-else :size="60" :imgList="[text]" :src-prefix="imgPrefix"/>
      </template>
      <template #finalAmount="{record}">
        <span class="font-bold">{{record?.finalAmount}}</span>
      </template>
      <template #paidAmount="{record}">
        <span :class="record?.paidAmount <= 0 ? 'number--error' : (record?.paidAmount) < (record?.finalAmount) ? 'number--warning' : 'number--ok'" class="number">
          {{ record?.paidAmount }}
        </span>
      </template>
      <template #ordered="{record}">
        <Icon v-if="record?.ordered" icon="ant-design:shopping-cart-outlined" class="success--color"></Icon>
        <Icon v-else icon="ant-design:close-outlined" class="error--color"></Icon>
      </template>
      <template #platformOrderId="{record}">
        <a-tag v-if="!!record?.platformOrderId" class="ant-tag-primary" v-for="order in record?.platformOrderId.split(',')">{{ order }}</a-tag>
        <span v-else class="text-xs italic text-gray-300">{{t('data.noData')}}</span>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <PurchaseOrderModal @register="registerModal" @success="handleSuccess"></PurchaseOrderModal>
  </PageWrapper>
</template>

<script lang="ts" name="purchaseOrder" setup>
import {ref, computed, unref} from 'vue';
import {BasicTable, useTable, TableAction, TableImg} from '/@/components/Table';
import {useModal} from '/@/components/Modal';
import {useListPage} from '/@/hooks/system/useListPage'
import PurchaseOrderModal from './components/PurchaseOrder.modal.vue'
import {columns, searchFormSchema} from './PurchaseOrder.data';
import {
  list,
  cancelInvoice,
  batchCancel,
  getImportUrl,
  getExportUrl,
  deleteOne, batchDelete
} from './PurchaseOrder.api';
import {downloadFile} from '/@/utils/common/renderUtils';
import {useI18n} from "/@/hooks/web/useI18n";
import {useMessage} from "/@/hooks/web/useMessage";
import {PageWrapper} from "/@/components/Page";
import {useGlobSetting} from "/@/hooks/setting";
import Icon from "/@/components/Icon";


const {t} = useI18n();
const {createMessage} = useMessage();

const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;

const imgPrefix = `${baseUploadUrl}/sys/common/static/`;

const checkedKeys = ref<Array<string | number>>([]);
let ipagination = ref({
  current: 1,
  defaultPageSize: 100,
  pageSize: 100,
  pageSizeOptions: ['50', '100', '200', '500'],
  showTotal: (total, range) => {
    return range[0] + '-' + range[1] + ' / ' + total
  },
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
});
const iSorter = ref({
  column: 'createTime',
  order: 'desc'
});
//注册model
const [registerModal, {openModal}] = useModal();
//注册table数据
const {prefixCls, tableContext, onExportXls, onImportXls} = useListPage({
  tableProps: {
    title: 'Register Purchase Order',
    api: list,
    columns,
    canResize: true,
    defSort: iSorter.value,
    pagination: ipagination,
    showIndexColumn: true,
    striped: true,
    bordered: false,
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        if(selectedRows.length === 0) {
          createOrderDisabled.value = true;
          return;
        }
        for(let i = 0; i < selectedRows.length; i++) {
          let row = selectedRows[i];
          if(row.paidAmount !== row.finalAmount || !row.paymentDocumentString || row.ordered) {
            createOrderDisabled.value = true;
            return;
          }
        }
        createOrderDisabled.value = false;
      }
    },
    indexColumnProps: {
      width: 60,
      title: "#"
    },
    formConfig: {
      //labelWidth: 120,
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    actionColumn: {
      title: t('common.operation.action'),
      width: 120,
      fixed: 'right'
    },
  },
  exportConfig: {
    name: "purchase_order",
    url: getExportUrl,
  },
  importConfig: {
    url: getImportUrl,
    success: handleSuccess
  },
})

const [registerTable, {reload}, {rowSelection, selectedRowKeys, selectedRows}] = tableContext;

const createOrderDisabled = ref<boolean>(true);

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
async function handleDeleteOne(record) {
  await deleteOne({id: record.id}, handleSuccess);
}
async function handleDeleteBatch(record) {
  await batchDelete({ids: selectedRowKeys.value}, handleSuccess);
}
/**
 * 删除事件
 */
async function handleCancel(record) {
  await cancelInvoice({id: record.id,invoiceNumber: record.invoiceNumber}, handleSuccess);
}

/**
 * 批量删除事件
 */
async function batchHandleCancel() {
  await batchCancel({ids: selectedRowKeys.value}, handleSuccess);
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
      icon: 'clarity:note-edit-line',
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
      icon: 'clarity:info-standard-line',
      label: t('common.operation.details'),
      onClick: handleDetail.bind(null, record),
    },
    {
      icon: 'ant-design:delete-outlined',
      label: t('common.operation.cancel'),
      ifShow: !!record.invoiceNumber && getInvoiceType(record.invoiceNumber) === '1',
      popConfirm: {
        title: t('common.operation.deleteConfirmation'),
        confirm: handleCancel.bind(null, record),
      },
    },
    {
      icon: 'ant-design:delete-outlined',
      label: t('common.operation.delete'),
      ifShow: true,
      popConfirm: {
        title: t('common.operation.deleteConfirmation'),
        confirm: handleDeleteOne.bind(null, record),
      },
    }
  ]
}
function getInvoiceType(invoiceNumber) {
  return invoiceNumber.slice(-4,-3);
}
function handleCreateOrder() {
  openModal(true, {
    isUpdate: false,
    isOrder: true,
    showFooter: true,
    selectedRows: selectedRows.value,
  })
}
</script>

<style lang="less" scoped>

</style>
