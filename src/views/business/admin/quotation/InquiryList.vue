<template>
  <PageWrapper :title="t('data.quotation.inquiry')">
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">
          {{ t('common.operation.addNew') }}
        </a-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined" />
                {{ t('common.operation.delete') }}
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>
            {{ t('common.operation.batchEdit') }}
            <Icon icon="mdi:chevron-down" />
          </a-button>
        </a-dropdown>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
      <template #bodyCell="{ column, text }">
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
          <span v-if="!text" style="font-size: 12px; font-style: italic">{{ t('data.upload.noDocument') }}</span>
          <TableImg
            v-else
            :size="60"
            :imgList="String(text).split(',').filter(Boolean)"
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
import { PageWrapper } from '/@/components/Page';
import { BasicTable, TableAction,TableImg } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useListPage } from '/@/hooks/system/useListPage';
import { useI18n } from '/@/hooks/web/useI18n';
import { downloadFile } from '/@/utils/common/renderUtils';
import { useGlobSetting } from '/@/hooks/setting';
import { useUserStore } from '/@/store/modules/user';

import InquiryModal from './components/InquiryModal.vue';
import { inquiryColumns, inquirySearchFormSchema } from './Inquiry.data';
import { inquiryList, inquiryDeleteOne, inquiryBatchDelete, getMergedCountryOptions,} from './Quotation.api';

const { t } = useI18n();
const userStore = useUserStore();
const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
const imgPrefix = `${baseUploadUrl}/sys/common/static/`;
const [registerModal, { openModal }] = useModal();
const searchSchemas = userStore.getIsEmployee
  ? inquirySearchFormSchema
  : inquirySearchFormSchema.filter((schema) => schema.field !== 'inquiryClient');
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
      actionColOptions: { style: { textAlign: 'right' } },
      fieldMapToNumber: ['expected_sales'],
      fieldMapToTime: [],
    },
    actionColumn: {
      width: 160,
      fixed: 'right',
      title: t('common.operation.action'),
    },
  },
});

const [registerTable, { reload, getForm }, { rowSelection, selectedRowKeys }] = tableContext;

onMounted(async () => {
  const options = await getMergedCountryOptions();
  await getForm().updateSchema({
    field: 'inquiryCountry',
    componentProps: { options, showSearch: true, placeholder: t('common.chooseText') },
  });
});
function handleAdd() {
  openModal(true, { isUpdate: false, showFooter: true });
}

function handleEdit(record: any) {
  openModal(true, { record, isUpdate: true, showFooter: true });
}

function handleDetail(record: any) {
  openModal(true, { record, isUpdate: true, showFooter: false });
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
    { label: t('common.operation.details'), onClick: handleDetail.bind(null, record) },
    { label: t('common.operation.edit'), onClick: handleEdit.bind(null, record) },
  ];
}
function getDropDownAction(record: any) {
  return [
    {
      label: t('common.operation.delete') ,
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
</style>
