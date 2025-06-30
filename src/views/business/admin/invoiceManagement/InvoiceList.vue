<template>
  <PageWrapper title="Invoice Management">
    <InvoiceListSearchForm @search="handleSearch"/>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" ref="tableRef">
      <template #tableTitle>
        <PopConfirmButton
          v-if="checkedKeys && checkedKeys.length > 0 && !hasPurchaseInvoice()"
          type="success"
          :title="t('component.popConfirm.setInvoicesPaid')"
          preIcon="ant-design:dollar-outlined"
          @confirm="setPaid(selectRows, handleSetPaid)"
          :disabled="paidDisabled"
          okText="ok" :loading="paidLoading"
          cancelText="Cancel"
        >
          {{ t("data.invoice.paid") }}
        </PopConfirmButton>
      </template>
      <template #toolbar>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="handleExportXls('Invoice List', Api.exportXls, exportParams)"> {{ t("common.operation.export") }}</a-button>
        <a-button v-if="checkedKeys && checkedKeys.length > 0" type="primary" preIcon="ic:outline-receipt-long" @click="downloadExcelInvoice('invoice')" :disabled = 'downloadInvoiceDisabled'> {{ t("data.invoice.downloadInvoice") }}</a-button>
        <a-button v-if="checkedKeys && checkedKeys.length > 0" type="success" preIcon="ic:round-list-alt" @click="downloadExcelInvoice('detail')" :disabled = 'downloadDetailDisabled'> {{ t("data.invoice.downloadDetails") }}</a-button>
        <a-button v-if="checkedKeys && checkedKeys.length > 0 && selectRows.some(row => row.type === 'shipping')" type="error" preIcon="ic:round-list-alt" @click="downloadExcelInvoice('completeDetail')" :disabled = 'downloadDetailDisabled'>{{ t("data.invoice.downloadDetailsComplete") }}</a-button>
        <a-button v-if="checkedKeys && checkedKeys.length > 0" type="warning" preIcon="ic:outline-inventory" @click="downloadExcelInvoice('inventory')" :disabled = 'downloadInventoryDisabled'> {{ t("data.upload.inventoryRecap") }}</a-button>
        <!-- TODO : re-adapt -->
        <!--<PopConfirmButton
            v-if="checkedKeys && checkedKeys.length > 0 && (username === 'admin' || username === 'Gauthier')"
            type="error"
            title="Confirm cancelling invoice ?"
            preIcon="ant-design:delete-outlined"
            @confirm="handleDeleteBatch"
            :disabled="deleteBatchDisabled"
            :okText="t('common.operation.delete')"
            :loading="deleteBatchLoading"
            :cancelText="t('common.operation.cancel')"
        >
          {{ t("common.operation.delete") }}
        </PopConfirmButton>-->
      </template>
      <template v-slot:action="{ record }">
        <TableAction
          :actions="[
            {
              label: t('common.operation.cancel'),
              icon: 'ic:outline-delete-outline',
              popConfirm: {
                title: t('common.operation.cancelConfirmation'),
                confirm: handleDelete.bind(null, record),
              },
              disabled: record.status !== 1,
            },
          ]"
        />
      </template>
      <template #type="{record}">
        <div v-if="record?.type == 'purchase'" class="flex justify-evenly items-center"><BasketIcon color="var(--success-color)" width="16px" height="16px" title="data.invoice.purchaseInvoice"/></div>
        <div v-else-if="record?.type == 'shipping'" class="flex justify-evenly items-center"><PlainIcon color="var(--primary-color)" width="24px" height="24px" title="data.invoice.shippingInvoice"/></div>
        <div v-else-if="record?.type == 'complete'" class="flex justify-evenly items-center"><BasketIcon color="var(--success-color)" width="16px" height="16px" title="data.invoice.purchaseInvoice"/> + <PlainIcon color="var(--primary-color)" width="24px" height="24px" title="data.invoice.shippingInvoice"/></div>
        <div v-else class="flex justify-evenly items-center text-error"> ?? </div>
      </template>
      <template #invoiceNumber="{record}">
        <div class="flex flex-row flex-nowrap justify-evenly items-center">
          <a-button
            v-if="record.status === 1"
            type="primary"
            preIcon="ant-design:eye-outlined"
            @click="openInvoice(record)"
            shape="round"
          >
            {{ record.invoiceNumber }}
          </a-button>
          <span v-else class="text-error line-through">{{ record.invoiceNumber }}</span>
          <Icon icon="ant-design:copy-outlined" @click="handleCopy(record.invoiceNumber)" class="cursor-pointer"></Icon>
        </div>
      </template>
    </BasicTable>
  </PageWrapper>
</template>
<script async setup lang="ts">
import {BasicTable, TableAction, useTable} from "/@/components/Table";
import {downloadFile} from '/@/api/common/api';
import {defHttp} from '/@/utils/http/axios';
import {useMessage} from '/@/hooks/web/useMessage';
import {useI18n} from "/@/hooks/web/useI18n";
import {useMethods} from "/@/hooks/system/useMethods";
import {computed, onMounted, reactive, ref, unref} from "vue";
import {filterObj} from "/@/utils/common/compUtils";
import {useUserStore} from "/@/store/modules/user";
import {PopConfirmButton} from "/@/components/Button";
import { PageWrapper } from '/@/components/Page';
import {columns} from "./data/InvoiceList.data";
import {list, Api, setPaid} from "./api/InvoiceList.api";
import PlainIcon from "/@/views/business/admin/invoiceManagement/components/PlainIcon.vue";
import BasketIcon from "/@/views/business/admin/invoiceManagement/components/BasketIcon.vue";
import {useRouter} from "vue-router";
import {useCopyToClipboard} from "@/hooks/web/useCopyToClipboard";
import {toUpper} from "lodash-es";
import InvoiceListSearchForm
  from "@/views/business/admin/invoiceManagement/components/InvoiceListSearchForm.vue";

const userStore = useUserStore();
const { createMessage } = useMessage();
const { t } = useI18n();
const { handleExportXls } = useMethods();
const {resolve}=useRouter();
const { clipboardRef, copiedRef } = useCopyToClipboard();
const username = ref<string>();
const tableRef = ref();

onMounted(async () => {
  username.value = userStore.getUserInfo.username;
  loadInvoices();
})
const dataSource = ref<Array<Recordable>>([]);

const iSorter = ref({
  column: 'createTime',
  order: 'desc'
});
const ipagination = ref({
  current: 1,
  defaultPageSize: 50,
  pageSize: 50,
  pageSizeOptions: ['50', '100', '200', '500'],
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: showPaginationTotal,
  total: 0,
  onChange: handlePaginationChange,
  onShowSizeChange: handleShowSizeChange,
});
function showPaginationTotal(total: number, range: [number, number]) {
  return range[0] + '-' + range[1] + ' / ' + total;
}
function handlePaginationChange(p:number, pz:number) {
  console.log('p', p, 'pz', pz);
  ipagination.value.current = p;
  ipagination.value.pageSize = pz;
  loadInvoices();
}
function handleShowSizeChange(current:number, size:number) {
  ipagination.value.current = current;
  ipagination.value.pageSize = size;
  loadInvoices();
}
const deleteBatchDisabled = ref(true);
const downloadInvoiceDisabled = ref(true);
const downloadDetailDisabled = ref(true);
const downloadInventoryDisabled = ref(true);
const paidDisabled = ref(false);

const deleteBatchLoading = ref<boolean>(false);
const paidLoading = ref<boolean>(false);

const searchState = reactive<Record<string, string | string[]>>({
  createBy: '',
  clientId: '',
  invoiceNumbers: [] as string[],
  type: '',
});

// creating table
const [registerTable, { reload, clearSelectedRowKeys, setLoading }] = useTable({
  title: 'Invoice List',
  titleHelpMessage: "You can view and download all shipping invoices on this page.",
  dataSource,
  columns,
  defSort: iSorter,
  pagination: ipagination,
  bordered: true,
  striped: true,
  useSearchForm: false,
  showTableSetting: true,
  showSummary: true,
  clickToRowSelect: true,
  showIndexColumn: true,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  tableSetting: { fullScreen: true },
  canResize: false,
  rowKey: 'id',
});

const checkedKeys = ref<Array<string | number>>([]);
const selectRows = ref<Array<Recordable>>([]);
const rowSelection = {
  type: 'checkbox',
  columnWidth: 30,
  selectedRowKeys: checkedKeys,
  onChange: onSelectChange,
  getCheckboxProps: getCheckboxProps,
};
const exportParams = computed(()=>{
  let paramsForm = {};
  let list:any[] = [];
  if (selectRows.value && selectRows.value.length > 0) {
    for(let item of selectRows.value) {
      list.push(item.id);
    }
  }
  paramsForm['selections'] = list;
  return filterObj(paramsForm)
});

function loadInvoices(page?:number) {
  if (page) {
    ipagination.value.current = page;
  }
  const params = getQueryParams();
  list(params).then((res) => {
    dataSource.value = res.records;
    tableRef.value.setPagination({
      current: res.current,
      pageSize: res.size,
      total: res.total
    })
  })
}
function getQueryParams() {
  let params = Object.assign(iSorter.value);
  params.pageNo = ipagination.value.current;
  params.pageSize = ipagination.value.pageSize;
  params.order = toUpper(iSorter.value.order);
  params.column = iSorter.value.column;
  params.createBy = searchState.createBy;
  params.clientId = searchState.clientId;
  params.invoiceNumber = searchState.invoiceNumbers;
  params.type = searchState.type;
  return filterObj(params);
}
function downloadExcelInvoice(type : string) {
  if(checkedKeys.value.length === 0) {
    downloadInvoiceDisabled.value = true;
    downloadDetailDisabled.value = true;
    downloadInventoryDisabled.value = true;
    return;
  }
  let today = new Date();
  let month = today.getMonth()+1 < 10 ? '0'+(today.getMonth()+1) : today.getMonth()+1;
  let day = today.getDate() < 10 ? '0'+today.getDate() : today.getDate();
  let date = today.getFullYear()+'-'+ month +'-'+ day;

  for( let row of selectRows.value) {
    let invoiceNum = row.invoiceNumber
    const param = {
      invoiceNumber: invoiceNum,
      filetype: type
    }
    defHttp.get({url: Api.getClient, params: param})
      .then(res => {
        let filename = "";
        if(type === "invoice") {
          filename = "Invoice N°" + invoiceNum + " (" + res.invoiceEntity + ").xlsx";
        }
        else if (type === "detail") {
          filename = res.internalCode + "_" + invoiceNum + '_Détail_calcul_de_facture_' + date + '.xlsx';
        } else if (type === "completeDetail") {
          filename = res.internalCode + "_" + invoiceNum + '_Détail_calcul_de_facture_complete_' + date + '.xlsx';
        } else {
          filename = invoiceNum + "_Inventaire_SKU.xlsx";
        }
        downloadFile(Api.downloadCompleteInvoiceExcel, filename, param).then(() => {
        }).catch((err) => {
          console.error(err);
          createMessage.error(invoiceNum + " : " + err);
          if(type === "detail" || type === "completeDetail") {
            const isComplete = type === "completeDetail";
            const message = isComplete ? "Generating complete invoice detail for " : "Generating invoice detail for ";
            createMessage.info(message + invoiceNum + " ...");
            const api = isComplete ? Api.downloadCompleteInvoiceDetail : Api.downloadInvoiceDetail;
            let params = {invoiceNumber: invoiceNum, invoiceEntity: res.invoiceEntity, internalCode: res.internalCode};
            downloadFile(api, filename, params).then(() => {
              createMessage.info("Download successful.")
            }).catch((err) => {
              console.error(err);
              createMessage.error("Download invoice detail fail " + invoiceNum + " : " + err);
            });
          }
        });
      }).catch((e) => {
        console.error("Failed to find the shop owner ! Check if invoice is valid : " + invoiceNum);
        createMessage.error(e);
      })
  }
}
function onSelectChange(selectedRowKeys: (string | number)[], selectRow: Recordable[]) {
  checkedKeys.value = selectedRowKeys;
  selectRows.value = selectRow;
  if(checkedKeys.value.length > 0) {
    const purchaseInvoices = selectRows.value.filter((row) => row.type === 'purchase' || row.type === 'complete');
    const shippingInvoices = selectRows.value.filter((row) => row.type === 'shipping' || row.type === 'complete');
    downloadInvoiceDisabled.value = false;
    downloadDetailDisabled.value = shippingInvoices.length === 0;
    downloadInventoryDisabled.value = purchaseInvoices.length === 0;
    deleteBatchDisabled.value = false;
  }
  else {
    downloadInvoiceDisabled.value = true;
    downloadDetailDisabled.value = true;
    downloadInventoryDisabled.value = true;
    deleteBatchDisabled.value = true;
  }
}
function getCheckboxProps(record: Recordable) {
  if (record.status === 1) {
    return { disabled: false };
  } else {
    return { disabled: true };
  }
}
function handleDelete(record: Recordable) {
  setLoading(true)
  defHttp.delete({ url: Api.cancelInvoice, data: { id: record.id, invoiceNumber: record.invoiceNumber, clientId: record.clientId } }, { joinParamsToUrl: true }).then(()=> {
    checkedKeys.value = [];
    selectRows.value = [];
    clearSelectedRowKeys();
  }).catch(e =>{
    console.error(e);
  }).finally(() => {
    reload();
    setLoading(false);
  });
}
async function handleDeleteBatch() {
  deleteBatchLoading.value = true;
  setLoading(true);
  let invoices:any = [];
  for (let row of selectRows.value) {
    invoices.push({
      id: row.id,
      invoiceNumber: row.invoiceNumber,
      clientId: row.clientId
    });
  }
  defHttp.delete({url: Api.cancelBatchInvoice, data: invoices}, { joinParamsToUrl: true }).then(() => {
    checkedKeys.value = [];
    selectRows.value = [];
    clearSelectedRowKeys();
    reload();
  }).catch(e => {
    console.error(e);
  }).finally(() => {
    deleteBatchLoading.value = false;
    setLoading(false);
  });
}
function handleSetPaid() {
  reload();
}

function openInvoice(record) {
  const invoicePreviewRoute = resolve({name: 'invoice-preview', query: {invoice: record.invoiceNumber}});
  window.open(invoicePreviewRoute.href, '_blank');
}
function handleCopy(invoiceNumber:string) {
  if (!invoiceNumber) {
    createMessage.warning(t('component.copy.noValue'));
    return;
  }
  clipboardRef.value = invoiceNumber;
  if (unref(copiedRef)) {
    createMessage.warning(t('component.copy.success'));
  }
}
function hasPurchaseInvoice() {
  for (let row of selectRows.value) {
    if(row.type === 'purchase') {
      return true;
    }
  }
  return false;
}
function handleSearch({clientId, createBy, invoiceNumbers, type}): void {
  searchState.clientId = clientId;
  searchState.createBy = createBy;
  searchState.invoiceNumbers = invoiceNumbers;
  searchState.type = type;

  loadInvoices(1);
}
</script>
<style lang="less">
.alert.ant-alert.ant-alert-info{
  margin: 0.5rem 0;
}
.ant-btn-link:hover, .ant-btn-link:focus {
  color: @error-color;
}
.jeecg-basic-table-header__tableTitle > * {
  margin: 0;
}
.ant-checkbox-disabled .ant-checkbox-inner{
  background-color: fade(@error-color, 10%);
  border-color: @error-color!important;
}
</style>
