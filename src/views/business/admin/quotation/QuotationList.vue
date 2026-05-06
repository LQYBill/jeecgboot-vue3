<template>
  <PageWrapper :title="t('data.quotation.quote')">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="handleExportCustomerQuotes">
          {{ t('common.operation.export') }} {{ t('data.quotation.tableGroup.customer') }} {{ t('data.quotation.quote') }}
        </a-button>
        <a-dropdown v-if="isEmployee && selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleRevoke">
                <Icon icon="mdi:backup-restore" /> {{ t('common.operation.batchRevoke') }}
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            {{ t('common.operation.batchRevoke') }} <Icon icon="mdi:chevron-down" />
          </a-button>
        </a-dropdown>
      </template>

      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" />
      </template>
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex === 'attachments'">
          <a-button
            type="default"
            size="small"
            :disabled="!text"
            preIcon="ant-design:download-outlined"
            @click="text && downloadFile(text)"
          >
            {{ t('common.operation.download') }}
          </a-button>
        </template>
      </template>
    </BasicTable>
    <QuotationModal @register="registerModal" @success="handleSuccess" />
  </PageWrapper>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { PageWrapper } from '/@/components/Page';
import { BasicTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useListPage } from '/@/hooks/system/useListPage';
import { downloadFile } from '/@/utils/common/renderUtils';
import { useUserStore } from '/@/store/modules/user';
import QuotationModal from './components/QuotationModal.vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { columns, searchFormSchema, } from './Quotation.data';
import {
  quoteList,
  quoteRevoke,
  getMergedCountryOptions,
  exportCustomerQuotes,
} from './Quotation.api';
const { t } = useI18n();
const userStore = useUserStore();
const isEmployee = userStore.getIsEmployee;

const [registerModal, { openModal }] = useModal();

const clientVisibleDataIndexes = new Set([
  'status',
  'inquiryClient_dictText',
  'inquirySales_dictText',
  'priorityMode',
  'inquiryCountry_dictText',
  'inquiryLink',
  'expectedSales',
  'inquiryPhoto',
  'inquirySpec',
  'inquiryColor',
  'inquiryRemark',
  'attachments',
  'productName',
  'supplierSku',
  'moq',
  'photo',
  'customerUrl',
  'customerPrice',
  'country_dictText',
  'livraison',
  'prixAchat',
  'logisticsFee',
  'totalFee',
  'sizeRange',
]);

function filterColumnsForClient(list: any[]): any[] {
  return (list || [])
    .map((column) => {
      if (column.children?.length) {
        const children = filterColumnsForClient(column.children);
        return children.length ? { ...column, children } : null;
      }
      if (!column.dataIndex) return column;
      return clientVisibleDataIndexes.has(column.dataIndex) ? column : null;
    })
    .filter(Boolean);
}

const tableColumns = isEmployee ? columns : filterColumnsForClient(columns);
const tableSearchSchemas = isEmployee
  ? searchFormSchema
  : searchFormSchema.filter((schema) => schema.field !== 'inquiryClient');

const { tableContext } = useListPage({
  tableProps: {
    title: t('data.quotation.quote'),
    api: quoteList,
    columns: tableColumns,
    canResize: false,
    bordered: true,
    formConfig: {
      schemas: tableSearchSchemas,
      autoSubmitOnEnter: true,
      showAdvancedButton: false,
      labelWidth: 120,
      actionColOptions: { style: { textAlign: 'right' } },
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    actionColumn: { width: isEmployee ? 200 : 120, fixed: 'right', title: t('common.operation.action') },
  },
});

const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;

onMounted(async () => {
  const options = await getMergedCountryOptions();
  await getForm().updateSchema([
    {
      field: 'inquiryCountry',
      componentProps: { options, showSearch: true, allowClear: true, placeholder: t('common.chooseText') },
    },
    {
      field: 'country',
      componentProps: { options, showSearch: true, allowClear: true, placeholder: t('common.chooseText') },
    },
  ]);
});

function handleEdit(record: any) {
  openModal(true, { record, isUpdate: true, showFooter: true });
}
function handleDetail(record: any) {
  openModal(true, { record, isUpdate: true, showFooter: false });
}
async function batchHandleRevoke() {
  for (const id of selectedRowKeys.value) {
    await quoteRevoke({ id }, null);
  }
  handleSuccess();
}
function handleSuccess() {
  selectedRowKeys.value = [];
  reload();
}

function cleanParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

function getFilenameFromDisposition(disposition?: string) {
  if (!disposition) return 'customer_quotes.xlsx';
  const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i);
  if (!match?.[1]) return 'customer_quotes.xlsx';
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function downloadExcelBlob(data: BlobPart, filename: string) {
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

async function handleExportCustomerQuotes() {
  const params = selectedRowKeys.value.length
    ? { selections: selectedRowKeys.value.join(',') }
    : cleanParams(await getForm().validate());
  const res: any = await exportCustomerQuotes(params);
  const disposition = res?.headers?.['content-disposition'] || res?.headers?.['Content-Disposition'];
  downloadExcelBlob(res?.data ?? res, getFilenameFromDisposition(disposition));
}

function getTableAction(record: any) {
  if (!isEmployee) {
    return [{ label: t('common.operation.details'), onClick: handleDetail.bind(null, record) }];
  }
  return [
    { label: t('data.quotation.quote'), onClick: handleEdit.bind(null, record) },
    { label: t('common.operation.details'), onClick: handleDetail.bind(null, record) },
    {
      label: t('common.operation.revoke'),
      popConfirm: {
        title: t('data.quotation.confirm.revokeQuote'),
        confirm: () => quoteRevoke({ id: record.id }, handleSuccess),
      },
    },
  ];
}
</script>

<style scoped>
:deep(.ant-form-item-label > label) {
  white-space: normal;
  line-height: 1.2;
  height: auto;
}
</style>
