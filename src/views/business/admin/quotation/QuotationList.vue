<template>
  <PageWrapper :title="t('data.quotation.quote')">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
<!--        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">{{ t('common.operation.addNew') }}</a-button>-->
        <a-dropdown v-if="selectedRowKeys.length > 0">
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
import { reactive } from 'vue';
import { PageWrapper } from '/@/components/Page';
import { BasicTable, TableAction } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useListPage } from '/@/hooks/system/useListPage';
import { downloadFile } from '/@/utils/common/renderUtils';
import QuotationModal from './components/QuotationModal.vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { columns, searchFormSchema, } from './Quotation.data';
import {
  quoteList,
  quoteRevoke,
  quoteExportXlsUrl,
  quoteImportExcelUrl,
} from './Quotation.api';
const { t } = useI18n();
const queryParam = reactive<Record<string, any>>({});

const [registerModal, { openModal }] = useModal();

const { tableContext } = useListPage({
  tableProps: {
    title: t('data.quotation.quote'),
    api: quoteList,
    columns,
    canResize: false,
    bordered: true,
    formConfig: {
      schemas: searchFormSchema,
      autoSubmitOnEnter: true,
      showAdvancedButton: true,
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    actionColumn: { width: 200, fixed: 'right', title: t('common.operation.action') },
    beforeFetch: (params) => Object.assign(params, queryParam),
  },
  exportConfig: {
    name: t('data.quotation.quote'),
    url: quoteExportXlsUrl,
    params: queryParam,
  },
  importConfig: {
    url: quoteImportExcelUrl,
    success: handleSuccess,
  },
});

const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

function handleAdd() {
  openModal(true, { isUpdate: false, showFooter: true });
}
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

function getTableAction(record: any) {
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
