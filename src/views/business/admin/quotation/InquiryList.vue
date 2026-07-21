<template>
  <PageWrapper :title="t('data.quotation.inquiry')">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">
          {{ t('common.operation.addNew') }}
        </a-button>
        <a-button
          v-if="selectedRowKeys.length > 0"
          danger
          preIcon="ant-design:delete-outlined"
          @click="batchHandleDelete"
        >
          {{ t('common.operation.batchDelete') }}
        </a-button>
      </template>
      <template #action="{ record }">
        <div class="inquiry-action-cell">
          <TableAction :actions="getTableAction(record)" />
        </div>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'attachments'">
          <span v-if="!text" style="font-size: 12px; font-style: italic">{{ t('data.upload.noDocument') }}</span>
          <a-button
            v-else
            type="default"
            size="small"
            style="min-width: 96px; white-space: nowrap;"
            @click="downloadFile(text)"
            preIcon="ant-design:download-outlined"
          >
            {{ t('common.operation.download') }}
          </a-button>
        </template>
        <template v-else-if="column.dataIndex === 'inquiryPhoto'">
          <span v-if="!(text || record?.photo)" style="font-size: 12px; font-style: italic">{{ t('data.upload.noDocument') }}</span>
          <TableImg
            v-else
            :size="60"
            :imgList="String(text || record?.photo).split(',').filter(Boolean)"
            :src-prefix="imgPrefix"
          />
        </template>
      </template>
    </BasicTable>
    <InquiryModal @register="registerModal" @success="handleSuccess" />
  </PageWrapper>
</template>

<script lang="ts" name="src2-inquiry" setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PageWrapper } from '/@/components/Page';
import { BasicTable, TableAction, TableImg } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useListPage } from '/@/hooks/system/useListPage';
import { useI18n } from '/@/hooks/web/useI18n';
import { downloadFile } from '/@/utils/common/renderUtils';
import { useGlobSetting } from '/@/hooks/setting';
import { useUserStore } from '/@/store/modules/user';

import InquiryModal from './components/InquiryModal.vue';
import { inquiryColumns, inquirySearchFormSchema, setInquiryDisplayOptions } from './Inquiry.data';
import {
  getClientOptions,
  inquiryBatchDelete,
  inquiryDeleteOne,
  inquiryList,
  inquiryQueryById,
  getMergedCountryOptions,
  getSalespersons,
} from './Inquiry.api';
import { buildInquiryQuoteRouteQuery, resolveQuoteRoutePath } from './quotation.route';

const { t } = useI18n();
const userStore = useUserStore();
const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
const imgPrefix = `${baseUploadUrl}/sys/common/static/`;
const [registerModal, { openModal }] = useModal();
const router = useRouter();
const route = useRoute();
const searchSchemas = userStore.getIsEmployee
  ? inquirySearchFormSchema
  : inquirySearchFormSchema.filter((schema) => schema.field !== 'clientId');
const { tableContext} = useListPage({
  tableProps: {
    title: t('data.quotation.page.inquiryList'),
    api: inquiryList,
    columns: inquiryColumns,
    canResize: false,
    formConfig: {
      schemas: searchSchemas,
      autoSubmitOnEnter: true,
      showAdvancedButton: false,
      labelWidth: 120,
      actionColOptions: { span: 8, offset: 16, style: { textAlign: 'right' } },
      fieldMapToNumber: ['expected_sales'],
      fieldMapToTime: [],
    },
    actionColumn: {
      width: 300,
      fixed: 'right',
      title: t('common.operation.action'),
    },
  },
});

const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;

onMounted(async () => {
  const [clientOptions, countryOptions, salespersonOptions] = await Promise.all([
    getClientOptions(),
    getMergedCountryOptions(),
    getSalespersons(),
  ]);
  setInquiryDisplayOptions('client', clientOptions);
  setInquiryDisplayOptions('country', countryOptions);
  setInquiryDisplayOptions('salesperson', salespersonOptions);
  await getForm().updateSchema([
    {
      field: 'clientId',
      componentProps: { options: clientOptions, showSearch: true, allowClear: true, placeholder: t('common.chooseText') },
    },
    {
      field: 'countryId',
      componentProps: { options: countryOptions, showSearch: true, placeholder: t('common.chooseText') },
    },
    {
      field: 'salesId',
      componentProps: {
        options: salespersonOptions,
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 'responsive',
        allowClear: true,
        placeholder: t('common.chooseText'),
      },
    },
  ]);
});
function handleAdd() {
  openModal(true, { isUpdate: false, showFooter: true });
}

function handleEdit(record: any) {
  openModal(true, { record, isUpdate: true, showFooter: true });
}

async function handleQuote(record: any) {
  await router.push({
    path: resolveQuoteRoutePath(router, route.path),
    query: buildInquiryQuoteRouteQuery(String(record.id)),
  });
}

async function handleDetail(record: any) {
  const fullRecordResp = await inquiryQueryById({ id: record.id });
  const fullRecord = fullRecordResp?.result ?? fullRecordResp;
  openModal(true, { record: fullRecord, isUpdate: true, showFooter: false });
}

async function handleDelete(record: any) {
  await inquiryDeleteOne({ id: record.id }, handleSuccess);
}

async function batchHandleDelete() {
  await inquiryBatchDelete({ ids: selectedRowKeys.value }, handleSuccess);
}

function handleSuccess() {
  (selectedRowKeys.value = []) && reload();
}

function getTableAction(record: any) {
  return [
    { label: t('data.quotation.quote'), onClick: handleQuote.bind(null, record) },
    { label: t('common.operation.details'), onClick: handleDetail.bind(null, record) },
    { label: t('common.operation.edit'), onClick: handleEdit.bind(null, record) },
    {
      label: t('common.operation.delete'),
      color: 'error',
      popConfirm: {
        title: t('common.operation.deleteConfirmation'),
        confirm: handleDelete.bind(null, record),
        placement: 'topLeft',
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

.inquiry-action-cell {
  min-width: 260px;
}

.inquiry-action-cell:deep(.jeecg-basic-table-action) {
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 0;
  height: auto;
  min-height: 22px;
}

.inquiry-action-cell:deep(.jeecg-basic-table-action button) {
  white-space: nowrap;
}
</style>
