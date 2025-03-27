<template>
  <PageWrapper title='Credit Management Page'>
    <SearchForm @search="handleSearch" @reset="handleReset"></SearchForm>
    <BasicTable @register="registerTable" :rowSelection="rowSelection" ref="tableRef">
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
      </template>
      <template #toolbar>
        <a-button type="primary" preIcon="ic:outline-file-download" @click="downloadExcelInvoice" :disabled="downloadDisabled">
          {{ t('data.invoice.downloadInvoice') }}
        </a-button>
      </template>
      <template #invoiceNumber="{ record }">
        <template v-if="!!record.invoiceNumber">
          <div v-if="record.status == 0">
            <span class="uppercase text-red">{{ t('common.status.cancelled') }}</span>
            <p class="line-through">{{ record.invoiceNumber }}</p>
          </div>
          <div v-else class="flex flex-row flex-nowrap justify-evenly items-center">
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
      </template>
      <template #createTime="{ text }">
        <time :datetime="text"><span>{{ text.split(' ')[0] }}</span><br/><span class="font-extralight">{{ text.split(' ')[1] }}</span></time>
      </template>
      <template #amount="{ record }">
        <p :class="`font-semibold ${record.status === 0 ? 'line-through' : ''}`">{{ record.amount.toFixed(2) }}{{ record.currencyId_dictText === "EUR" ? '€' : '$' }}</p>
      </template>
      <!-- image -->
      <template #img="{ text }"> <TableImg :size="60" :imgList="[text]" :src-prefix="imgPrefix" /> </template>
      <!-- batch action -->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)"/>
      </template>
    </BasicTable>
    <CreditModal @register="registerModal" @success="handleSaveCreditSuccess"></CreditModal>
  </PageWrapper>
</template>

<script lang="ts" setup>
import {ref, onMounted, reactive, unref} from 'vue';
import {BasicTable, TableAction, TableImg} from '/@/components/Table';
import {useModal} from '/@/components/Modal';
import {useListPage} from '/@/hooks/system/useListPage'
import CreditModal from './components/CreditModal.vue'
import {columns} from './Credit.data';
import {
  list,
  cancelOne,
  getImportUrl,
  getExportUrl,
  downloadInvoice, getInvoiceClient
} from './Credit.api';
import {useI18n} from "/@/hooks/web/useI18n";
import { PageWrapper } from '/@/components/Page';
import {useGlobSetting} from "/@/hooks/setting";
import {InvoiceMetaData} from "@/views/business/dto/invoiceMetaData.dto";
import {Credit} from "@/views/business/dto/credit.dto";
import {toUpper} from "lodash-es";
import {filterObj} from "@/utils/common/compUtils";
import SearchForm from "@/views/business/admin/credit/components/SearchForm.vue";
import {useRouter} from "vue-router";
import {useMessage} from "@/hooks/web/useMessage";
import {useCopyToClipboard} from "@/hooks/web/useCopyToClipboard";
import {Icon} from "@/components/Icon";

const { resolve }=useRouter();
const { createMessage } = useMessage();
const { t } = useI18n();
const { clipboardRef, copiedRef } = useCopyToClipboard();
const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
const imgPrefix = `${baseUploadUrl}/sys/common/static/`;

const tableRef = ref<InstanceType<typeof BasicTable>>();

const searchState = reactive<Record<string, string>>({
  clientId: '',
  invoiceNumber: '',
  currencyId: '',
});

const creditSource = ref<Credit[]>([]);
const downloadDisabled = ref(true);

onMounted(async () => {
  await listCredits(1);
});

const total = ref(0);
const page = ref(1);
const pageSize = ref(50);
const defSort = ref({
  column: 'create_time',
  order: 'DESC'
});
const pagination = ref({
  current: page,
  defaultPageSize: 50,
  pageSize,
  pageSizeOptions: ['10', '30', '50'],
  showTotal: (total: number, range: [number, number]) => {
    return range[0] + '-' + range[1] + ' / ' + total;
  },
  showQuickJumper: true,
  showSizeChanger: true,
  total,
  onChange: (p:number, pz:number) => {
    page.value = p;
    pageSize.value = pz;
    listCredits();
  },
  onShowSizeChange: (current:number, size:number) => {
    page.value = current;
    pageSize.value = size;
    listCredits(1);
  },
});
const rowSelection = {
  type: 'checkbox',
  columnWidth: 30,
  onChange: onSelectChange,
  getCheckboxProps: getCheckboxProps
};
const [registerModal, {openModal}] = useModal();
const {tableContext, onExportXls, onImportXls} = useListPage({
  tableProps: {
    title: 'Credit Page',
    dataSource: creditSource,
    columns,
    canResize: false,
    striped: true,
    useSearchForm: false,
    actionColumn: {
      title: t('common.operation.action'),
      width: 120,
      fixed: 'right'
    },
    pagination,
    ellipsis: false,
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

const [registerTable, {reload, clearSelectedRowKeys, setLoading, getSelectRowKeys, getSelectRows}] = tableContext

async function listCredits(arg?:number) {
  if(arg === 1) {
    pagination.value.current = 1;
    clearSelectedRowKeys();
  }
  const params = getQueryParams();
  creditSource.value = [];
  setLoading(true);
  await list(params).then((res) => {
    creditSource.value = res.records;
    total.value = res.total;
    page.value = res.current;
    pageSize.value = res.size;
    tableRef.value.setPagination({
      current: page.value,
      pageSize: pageSize.value,
      total: total.value,
    });
  }).catch( e => {
    console.error(e);
  }).finally(() => {
    setLoading(false);
  })
}
function getQueryParams() {
  let params = Object.assign(searchState);
  params.pageNo = pagination.value.current;
  params.pageSize = pagination.value.pageSize;
  params.order = toUpper(defSort.value.order);
  params.column = defSort.value.column;

  return filterObj(params);
}
/** Search */
function handleSearch({clientId, invoiceNumber, currencyId}) {
  searchState.clientId = clientId;
  searchState.invoiceNumber = invoiceNumber;
  searchState.currencyId = currencyId;

  listCredits(1);
}
function handleReset() {
  searchState.clientId = '';
  searchState.invoiceNumber = '';
  searchState.currencyId = '';
  listCredits(1);
  clearSelectedRowKeys();
}


/** CRUD operations */
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

async function handleCancel(record) {
  await cancelOne({id: record.id}, handleSuccess);
}

async function handleSuccess() {
  clearSelectedRowKeys();
  await reload();
}
function onSelectChange() {
  let hasInvoiceNumber = false;
  for(let row of getSelectRows()) {
    if(!!row.invoiceNumber) {
      hasInvoiceNumber = true;
      break;
    }
  }
  downloadDisabled.value = getSelectRowKeys().length === 0 || !hasInvoiceNumber;
}
function getCheckboxProps(record: Recordable) {
  if (record.status === 1) {
    return { disabled: false };
  } else {
    return { disabled: true };
  }
}
function handleSaveCreditSuccess(data: InvoiceMetaData) {
  downloadInvoice(data.filename, data.invoiceCode, handleSuccess);
}
function getTableAction(record: Recordable) {
  return [
    {
      icon: 'clarity:note-edit-line',
      onClick: handleEdit.bind(null, record),
    }
  ]
}
function getDropDownAction(record: Recordable) {
  return [
    {
      icon: 'clarity:info-standard-line',
      label: t('common.operation.details'),
      onClick: handleDetail.bind(null, record),
    }, {
      icon: 'ant-design:delete-outlined',
      label: t('common.operation.cancel'),
      popConfirm: {
        title: t('common.operation.cancelConfirmation'),
        confirm: handleCancel.bind(null, record),
      },
      disabled: record.status !== 1 || record.rowNum !== 1,
    }
  ]
}
async function downloadExcelInvoice() {
  if(getSelectRowKeys().length === 0) {
    return;
  }
  for(let row of getSelectRows()) {
    if(!row.invoiceNumber) continue;
    const invoiceNumber = row.invoiceNumber;

    await getInvoiceClient(invoiceNumber).then((res) => {
      const filename = `Invoice N° ${invoiceNumber} (${res.invoiceEntity}).xlsx`;
      downloadInvoice(filename, invoiceNumber, handleSuccess);
    }).catch( e => {
      console.error(e);
    });
  }
}
function openInvoice(record: Recordable) {
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
.ant-checkbox-disabled .ant-checkbox-inner{
  background-color: fade(@error-color, 10%);
  border-color: @error-color!important;
}
</style>
