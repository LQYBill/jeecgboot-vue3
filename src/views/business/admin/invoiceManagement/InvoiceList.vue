<template>
  <PageWrapper title="Invoice Management">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <PopConfirmButton
          v-if="checkedKeys && checkedKeys.length > 0"
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
        <a-button v-if="checkedKeys && checkedKeys.length > 0" type="primary" preIcon="ant-design:download-outlined" @click="downloadExcelInvoice('invoice')" :disabled = 'downloadInvoiceDisabled'> {{ t("data.invoice.downloadInvoice") }}</a-button>
        <a-button v-if="checkedKeys && checkedKeys.length > 0" type="primary" preIcon="ant-design:download-outlined" @click="downloadExcelInvoice('detail')" :disabled = 'downloadDetailDisabled'> {{ t("data.invoice.downloadDetails") }}</a-button>
        <PopConfirmButton
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
        </PopConfirmButton>
      </template>
      <template v-slot:action="{ record, column }">
        <TableAction
          :actions="[
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
      <template #type="{record}">
        <div v-if="record?.type == 'purchase'" class="flex justify-evenly items-center"><BasketIcon color="var(--success-color)" width="16px" height="16px" title="data.invoice.purchaseInvoice"/></div>
        <div v-else-if="record?.type == 'shipping'" class="flex justify-evenly items-center"><PlainIcon color="var(--primary-color)" width="24px" height="24px" title="data.invoice.shippingInvoice"/></div>
        <div v-else-if="record?.type == 'complete'" class="flex justify-evenly items-center"><BasketIcon color="var(--success-color)" width="16px" height="16px" title="data.invoice.purchaseInvoice"/> + <PlainIcon color="var(--primary-color)" width="24px" height="24px" title="data.invoice.shippingInvoice"/></div>
        <div v-else class="flex justify-evenly items-center text-error"> ?? </div>
      </template>
      <template #invoiceNumber="{record}">
        <div class="flex flex-row flex-nowrap justify-between items-center">
          <a-button
            type="primary"
            preIcon="ant-design:eye-outlined"
            @click="openInvoice(record)"
            shape="round"
          >
            {{ record.invoiceNumber }}
          </a-button>
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
import {computed, onMounted, ref, unref} from "vue";
import {filterObj} from "/@/utils/common/compUtils";
import {useUserStore} from "/@/store/modules/user";
import {usePermissionStore} from "/@/store/modules/permission";
import {PopConfirmButton} from "/@/components/Button";
import { PageWrapper } from '/@/components/Page';
import {columns, fetchUserList, searchFormSchema} from "./data/InvoiceList.data";
import {list, Api, setPaid} from "./api/invoiceList.api";
import PlainIcon from "/@/views/business/admin/invoiceManagement/components/PlainIcon.vue";
import BasketIcon from "/@/views/business/admin/invoiceManagement/components/BasketIcon.vue";
import {useRouter} from "vue-router";
import {useCopyToClipboard} from "@/hooks/web/useCopyToClipboard";

const userStore = useUserStore();
const permissionStore = usePermissionStore();
const { createMessage } = useMessage();
const { t } = useI18n();
const { handleExportXls } = useMethods();
const {resolve}=useRouter();
const { clipboardRef, copiedRef } = useCopyToClipboard();
const username = ref<string>();

onMounted(async () => {
  fetchUserList();
  username.value = userStore.getUserInfo.username;
})

const deleteBatchDisabled = ref(true);
const downloadInvoiceDisabled = ref(true);
const downloadDetailDisabled = ref(true);
const paidDisabled = ref(false);

const deleteBatchLoading = ref<boolean>(false);
const paidLoading = ref<boolean>(false);

// get the list of all shipping invoice

// creating table
const [registerTable, { reload, clearSelectedRowKeys, setLoading }] = useTable({
  title: 'Invoice List',
  titleHelpMessage: "You can view and download all shipping invoices on this page.",
  api: list,
  columns,
  formConfig: {
    schemas: searchFormSchema,
  },
  //自定义默认排序
  defSort: {
    column: 'createTime',
    order: 'desc',
  },
  bordered: true,
  striped: true,
  useSearchForm: true,
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
const selectRows = ref<Array<any>>([]);
const rowSelection = {
  type: 'checkbox',
  columnWidth: 30,
  selectedRowKeys: checkedKeys,
  onChange: onSelectChange,
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

function downloadExcelInvoice(type) {
  if(checkedKeys.value.length === 0) {
    downloadInvoiceDisabled.value = true;
    downloadDetailDisabled.value = true;
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
        else {
          filename = res.internalCode + "_" + invoiceNum + '_Détail_calcul_de_facture_' + date + '.xlsx';
        }
        console.log("Filename : " + filename);
        downloadFile(Api.downloadCompleteInvoiceExcel, filename, param).then(() => {
        }).catch((err) => {
          console.error(err);
          createMessage.error(invoiceNum + " : " + err);

          if(type === "detail") {
            createMessage.info("Generating a new detail file ...");
            let params = {invoiceNumber: invoiceNum, invoiceEntity: res.invoiceEntity, internalCode: res.internalCode};
            downloadFile(Api.downloadInvoiceDetail, filename, params).then(() => {
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
function onSelectChange(selectedRowKeys: (string | number)[], selectRow) {
  checkedKeys.value = selectedRowKeys;
  selectRows.value = selectRow;
  if(checkedKeys.value.length > 0) {
    downloadInvoiceDisabled.value = false;
    downloadDetailDisabled.value = false;
    deleteBatchDisabled.value = false;
  }
  else {
    downloadInvoiceDisabled.value = true;
    downloadDetailDisabled.value = true;
    deleteBatchDisabled.value = true;
  }
}
function handleDelete(record: Recordable) {
  defHttp.delete({ url: Api.cancelInvoice, data: { id: record.id, invoiceNumber: record.invoiceNumber, clientId: record.clientId } }, { joinParamsToUrl: true }).then(()=> {
    checkedKeys.value = [];
    selectRows.value = [];
    clearSelectedRowKeys();
    reload();
  }).catch(e =>{
    console.error(e);
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
</style>
