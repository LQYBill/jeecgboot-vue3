<template>
  <PageWrapper :title="t('')"
  >
    <template #headerContent>
      <p>
        {{t('guide.paymentReview.line1')}}<br/>
        {{t('guide.paymentReview.line2')}}<a-button type="primary" @click="" preIcon="ant-design:plus-outlined">{{ t('common.operation.addNew') }}</a-button><br/>
        {{t('guide.paymentReview.line3')}}<a-button type="warning" @click="" preIcon="ant-design:shopping-cart-outlined"></a-button>
      </p>
      <div class="border border-amber bg-orange-50 rounded w-fit p-4">
        <h3>{{ t('component.table.legend') }} : </h3>
        <p>
        <span class="text-emerald-500">
          {{ t('data.invoice.purchaseFee') }}
        </span>
          <br/>
          <span class="text-blue-500">
          {{ t('data.invoice.shippingFee') }}
        </span>
        </p>
      </div>
    </template>
    <PurchaseOrderResultAsync
      ref="purchaseResultRef"
      @statusChange="handleStatusChange"
    />
    <!--引用表格-->
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined">
          {{ t('common.operation.addNew') }}
        </a-button>
        <a-button v-if="hasPurchasePermission()" type="warning" @click="handleCreateOrder" preIcon="ant-design:shopping-cart-outlined" :disabled="createOrderDisabled || isCreating">
        </a-button>
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"
                     :dropDownActions="getDropDownAction(record)"/>
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
      <template #invoiceNumber="{ record }">
        <div v-if="record.status === 0">
          <span class="uppercase text-red">{{ t('common.status.cancelled') }}</span>
          <p class="line-through">{{ record.invoiceNumber }}</p>
        </div>
        <span v-else>
          {{ record.invoiceNumber }}
        </span>
      </template>
      <template #totalAmount="{ record }">
        <div :class="record.status === 0 ? 'line-through text-gray-400' : ''">
          <span class="font-semibold">
            {{ ((+record.totalAmount || 0).toFixed(2)) }}
          </span>
          <template v-if="(+record.poTotalAmount || 0) > 0 || (+record.siTotalAmount || 0) > 0">
            <div class="text-xs p-2">
              <template v-if="(+record.poTotalAmount || 0) > 0">
                <p class="m-0 text-emerald-500">{{ ((+record.poTotalAmount || 0).toFixed(2)) }}</p>
              </template>
              <template v-if="(+record.siTotalAmount || 0) > 0">
                <p class="m-0 text-blue-500">{{ ((+record.siTotalAmount || 0).toFixed(2)) }}</p>
              </template>
            </div>
          </template>
        </div>
      </template>
      <template #finalAmount="{ record }">
        <div :class="record.status === 0 ? 'line-through text-gray-400' : ''">
          <span class="font-bold">
            {{ ((+record.finalAmount || 0).toFixed(2)) }}
          </span>
          <template v-if="(+record.poFinalAmount || 0) > 0 || (+record.siFinalAmount || 0) > 0">
            <div class="text-xs p-2">
              <template v-if="(+record.poFinalAmount || 0) > 0">
                <p class="m-0 text-emerald-500">{{ ((+record.poFinalAmount || 0).toFixed(2)) }}</p>
              </template>
              <template v-if="(+record.siFinalAmount || 0) > 0">
                <p class="m-0 text-blue-500">{{ ((+record.siFinalAmount || 0).toFixed(2)) }}</p>
              </template>
            </div>
          </template>
        </div>
      </template>
      <template #paymentApproved="{ record }">
        <a-tag v-if="record?.paymentApproved === true || record?.paymentApproved === 1" class="ant-tag-success">
          {{ t('common.status.approved') }}
        </a-tag>
        <a-tag v-else class="ant-tag-default">
          {{ t('common.status.notApproved') }}
        </a-tag>
      </template>
      <template #ordered="{record}">
        <Icon v-if="record?.ordered" icon="ant-design:shopping-cart-outlined" class="success--color"></Icon>
        <Icon v-else icon="ant-design:close-outlined" class="error--color"></Icon>
      </template>
      <template #groupId="{record}">
        <div class="flex flex-wrap gap-1">
          <a-tag v-if="!!record?.groupId" class="ant-tag-primary" v-for="group in record?.groupId.split(',').slice(0,5)">{{ group }}</a-tag>
          <a-popover
            v-if="!!record?.groupId && (record?.groupId.split(',').length > 5)"
            :title="t('data.purchase.groupId') + ' (' + record?.groupId.split(',').length + ')'"
            trigger="hover"
          >
            <a-tag>
              ...
            </a-tag>
            <template #content>
              <div class="flex flex-wrap max-w-sm gap-1">
                <a-tag class="ant-tag-primary" v-for="group in record.groupId.split(',')">{{ group }}</a-tag>
              </div>
            </template>
          </a-popover>
          <Icon v-if="!!record?.groupId" icon="ant-design:copy-outlined" @click="handleCopy(record.groupId)" class="cursor-pointer"></Icon>
        </div>
      </template>
      <template #platformOrderId="{record}">
        <div class="flex flex-wrap gap-1" v-if="!!record.platformOrderId">
          <a-tag class="ant-tag-primary" v-for="orderId in record?.platformOrderId.split(',').slice(0,5)">{{ orderId }}</a-tag>
          <a-popover
            v-if="!!record?.platformOrderId && (record?.platformOrderId.split(',').length > 5)"
            :title="t('data.invoice.platformOrderID') + ' (' + record?.platformOrderId.split(',').length + ')'"
            trigger="hover"
          >
            <a-tag>
              ...
            </a-tag>
            <template #content>
              <div class="flex flex-wrap max-w-sm gap-1">
                <a-tag class="ant-tag-primary" v-for="orderId in record.platformOrderId.split(',')">{{ orderId }}</a-tag>
              </div>
            </template>
          </a-popover>
          <Icon icon="ant-design:copy-outlined" @click="handleCopy(record.platformOrderId)" class="cursor-pointer"></Icon>
        </div>
        <span v-else class="text-xs italic text-gray-300">{{t('data.noData')}}</span>
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <PurchaseOrderModal @register="registerModal" @start-create="handleStartCreate" @success="handleCreateSuccess" :can-approve="hasPurchasePermission()"></PurchaseOrderModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
import {onMounted, ref, unref} from 'vue';
import {BasicTable, TableAction, TableImg} from '/@/components/Table';
import {useModal} from '/@/components/Modal';
import {useListPage} from '/@/hooks/system/useListPage'
import PurchaseOrderModal from './components/PurchaseOrder.modal.vue'
import {columns, searchFormSchema} from './PurchaseOrder.data';
import {
  paymentProofReviewList,
  cancelInvoice,
  batchCancel,
  getImportUrl,
  getExportUrl
} from './PurchaseOrder.api';
import {downloadFile} from '/@/utils/common/renderUtils';
import {useI18n} from "/@/hooks/web/useI18n";
import {PageWrapper} from "/@/components/Page";
import {useGlobSetting} from "/@/hooks/setting";
import Icon from "/@/components/Icon";
import {useCopyToClipboard} from "@/hooks/web/useCopyToClipboard";
import {useMessage} from "@/hooks/web/useMessage";
import {getUserInfo} from "@/api/sys/user";
import PurchaseOrderResultAsync from "@/views/business/admin/purchasing/components/PurchaseOrderResultAsync.vue";
const isCreating = ref(false);
const {t} = useI18n();
const { clipboardRef, copiedRef } = useCopyToClipboard();
const { createMessage } = useMessage();

const purchaseResultRef = ref<any>(null);
const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;

const imgPrefix = `${baseUploadUrl}/sys/common/static/`;

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
const {tableContext} = useListPage({
  tableProps: {
    title: 'Register Purchase Order',
    api: paymentProofReviewList,
    columns,
    canResize: true,
    defSort: iSorter.value,
    pagination: ipagination,
    showIndexColumn: true,
    striped: true,
    bordered: false,
    rowSelection: {
      onChange: (_selectedRowKeys, selectedRows) => {
        if(selectedRows.length === 0) {
          createOrderDisabled.value = true;
          return;
        }
        for(let i = 0; i < selectedRows.length; i++) {
          let row = selectedRows[i];
          if(!row.paymentApproved || !row.paymentDocumentString || row.ordered) {
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
const roles = ref<string[]>([]);
onMounted(async () => {
  const res = await getUserInfo();
  roles.value = res.roles as unknown as string[];
  console.log('Current user role: ', [...roles.value]);
});
function hasPurchasePermission(): boolean {
  return ['accountant', 'admin'].some(role => roles.value.includes(role));
}
/**
 * 新增事件
 */
function handleAdd() {
  openModal(true, {
    isUpdate: false,
    isOrder: false,
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
    isOrder: false,
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
    isOrder: false,
    showFooter: false,
  });
}
/**
 * 删除采购发票
 */
async function handleCancel(record:any) {
  await cancelInvoice({id: record.id,invoiceNumber: record.invoiceNumber, clientId:record.clientId}, record, handleCancelSuccess);
}
async function handleBatchCancel() {
  let invoices:any = [];
  for(let row of selectedRows.value) {
    invoices.push({
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      clientId: row.clientId
    },);
  }
  batchCancel(invoices, handleSuccess);
}
/**
 * 成功回调
 */
function handleCancelSuccess(record: Recordable) {
  if(record.ordered) {
    createMessage.info(t('component.tips.cancelMabangOrder'), 10);
  }
  handleSuccess();
}
function handleSuccess() {
  (selectedRowKeys.value = []) && reload();
}

/**
 * 操作栏
 */
function getTableAction(record: Recordable) {
  return [
    {
      icon: 'clarity:note-edit-line',
      onClick: handleEdit.bind(null, record),
      disabled: record.status !== 1,
    }
  ]
}

/**
 * 下拉操作栏
 */
function getDropDownAction(record: Recordable) {
  return [
    {
      icon: 'clarity:info-standard-line',
      label: t('common.operation.details'),
      onClick: handleDetail.bind(null, record),
    },
    {
      icon: 'ant-design:delete-outlined',
      label: t('common.operation.cancel'),
      ifShow: !!record.invoiceNumber,
      popConfirm: {
        title: t('common.operation.deleteConfirmation'),
        confirm: handleCancel.bind(null, record),
      },
      disabled: record.status !== 1,
    },
  ]
}
function handleCreateOrder() {
  openModal(true, {
    isUpdate: false,
    isOrder: true,
    showFooter: true,
    selectedRows: selectedRows.value,
  })
}
function handleCopy(numbers:string) {
  if (!numbers) {
    createMessage.warning(t('component.copy.noValue'));
    return;
  }
  clipboardRef.value = numbers;
  if (unref(copiedRef)) {
    createMessage.warning(t('component.copy.success'));
  }
}
function handleStatusChange(s: string) {
  isCreating.value = s === 'running';
  if (s === 'completed') {
    reload();
  }
}
function handleCreateSuccess(data: Recordable) {
  handleSuccess();
}
function handleStartCreate() {
  selectedRowKeys.value = [];
  selectedRows.value = [];
  createOrderDisabled.value = true;
  purchaseResultRef.value?.start();
}
</script>

<style lang="less" scoped>

</style>
