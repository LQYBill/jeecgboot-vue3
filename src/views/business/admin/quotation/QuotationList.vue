<template>
  <PageWrapper :title="t('data.quotation.quote')">
    <div v-if="showRouteInquirySummary" class="route-inquiry-summary">
      <div class="route-inquiry-summary__title">{{ t('data.quotation.section.inquiryInfo') }}</div>
      <div class="route-inquiry-summary__grid">
        <div class="route-inquiry-summary__item">
          <span class="route-inquiry-summary__label">{{ t('data.quotation.col.inquiryClient') }}</span>
          <span class="route-inquiry-summary__value">{{ routeInquiryDisplay.client }}</span>
        </div>
        <div class="route-inquiry-summary__item">
          <span class="route-inquiry-summary__label">{{ t('data.quotation.col.inquirySales') }}</span>
          <span class="route-inquiry-summary__value">{{ routeInquiryDisplay.sales }}</span>
        </div>
        <div class="route-inquiry-summary__item">
          <span class="route-inquiry-summary__label">{{ t('data.quotation.col.inquiryCountry') }}</span>
          <span class="route-inquiry-summary__value">{{ routeInquiryDisplay.country }}</span>
        </div>
        <div class="route-inquiry-summary__item">
          <span class="route-inquiry-summary__label">{{ t('data.quotation.col.expectedSales') }}</span>
          <span class="route-inquiry-summary__value">{{ routeInquiryDisplay.expectedSales }}</span>
        </div>
        <div class="route-inquiry-summary__item route-inquiry-summary__item--full">
          <span class="route-inquiry-summary__label">{{ t('data.quotation.col.inquiryLink') }}</span>
          <span class="route-inquiry-summary__value">{{ routeInquiryDisplay.link }}</span>
        </div>
      </div>
    </div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #tableTitle>
        <a-button
          v-if="isEmployee && routeInquiryId"
          type="default"
          preIcon="ant-design:form-outlined"
          @click="handleQuoteFromRouteInquiry"
        >
          {{ t('data.quotation.action.quoteFromInquiry') }}
        </a-button>
        <a-button v-if="isEmployee" type="primary" preIcon="ant-design:plus-outlined" @click="handleDirectAdd">
          {{ t('data.quotation.action.addDirectQuote') }}
        </a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="handleExportCustomerQuotes">
          {{ t('common.operation.export') }} {{ t('data.quotation.tableGroup.customer') }} {{ t('data.quotation.quote') }}
        </a-button>
        <a-button
          v-if="isEmployee && selectedRowKeys.length > 0"
          danger
          preIcon="ant-design:delete-outlined"
          @click="batchHandleDelete"
        >
          {{ t('common.operation.batchDelete') }}
        </a-button>
      </template>

      <template #action="{ record }">
        <div class="quotation-actions">
          <template v-if="isEmployee">
            <a-button type="link" size="small" class="quotation-actions__btn" @click="handleEdit(record)">
              {{ t('common.operation.edit') }}
            </a-button>
            <a-button type="link" size="small" class="quotation-actions__btn" @click="handleDetail(record)">
              {{ t('common.operation.details') }}
            </a-button>
            <a-popconfirm
              :title="t('common.operation.deleteConfirmation')"
              placement="topLeft"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" size="small" class="quotation-actions__btn quotation-actions__btn--danger">
                {{ t('common.operation.delete') }}
              </a-button>
            </a-popconfirm>
          </template>
          <template v-else>
            <a-button type="link" size="small" class="quotation-actions__btn" @click="handleDetail(record)">
              {{ t('common.operation.details') }}
            </a-button>
          </template>
        </div>
      </template>
      <template #bodyCell="{ column, text, record }">
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
        <template v-else-if="column.dataIndex === 'linkedInquiryAction'">
          <a-button
            v-if="hasLinkedInquiry(record)"
            type="link"
            size="small"
            class="quotation-inquiry-link"
            @click="handleInquiryDetail(record)"
          >
            {{ t('data.quotation.inquiry') }}
          </a-button>
          <span v-else class="quotation-inquiry-link--empty">-</span>
        </template>
      </template>
    </BasicTable>
    <QuotationModal @register="registerModal" @success="handleSuccess" />
    <InquiryModal @register="registerInquiryModal" @success="handleSuccess" />
  </PageWrapper>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { PageWrapper } from '/@/components/Page';
import { BasicTable } from '/@/components/Table';
import { useModal } from '/@/components/Modal';
import { useListPage } from '/@/hooks/system/useListPage';
import { downloadFile } from '/@/utils/common/renderUtils';
import { useUserStore } from '/@/store/modules/user';
import { useMessage } from '/@/hooks/web/useMessage';
import QuotationModal from './components/QuotationModal.vue';
import InquiryModal from './components/InquiryModal.vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { columns, searchFormSchema, } from './Quotation.data';
import { inquiryQueryById } from './Inquiry.api';
import {
  getClientOptions,
  quoteList,
  quoteQueryById,
  quoteDeleteOne,
  quoteDeleteBatch,
  getMergedCountryOptions,
  getSalespersons,
  exportCustomerQuotes,
} from './Quotation.api';
const { t } = useI18n();
const { createMessage, createConfirm } = useMessage();
const userStore = useUserStore();
const isEmployee = userStore.getIsEmployee;
const router = useRouter();
const route = router.currentRoute;
const routeInquiryId = computed(() => String(route.value.query?.inquiryId || '').trim());
const routeInquiryRecord = ref<any>(null);
const routeInquiryMatchedCount = ref<number | null>(null);
const inquiryAvailabilityCache = new Map<string, boolean>();
const routeInquiryOptionMaps = {
  client: new Map<string, string>(),
  salesperson: new Map<string, string>(),
  country: new Map<string, string>(),
};
const showRouteInquirySummary = computed(() => !!routeInquiryId.value && !!routeInquiryRecord.value);
function firstNonEmpty(...values: any[]) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return '-';
}

function firstNonEmptyRaw(...values: any[]) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return undefined;
}

function mergePreferNonNil(...objs: any[]) {
  const out: any = {};
  for (const obj of objs) {
    for (const key of Object.keys(obj || {})) {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== '') out[key] = value;
      else if (out[key] === undefined) out[key] = value;
    }
  }
  return out;
}

function normalizeMultiDisplay(value: any) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean).join(', ') || '-';
  if (typeof value === 'string') {
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return items.join(', ') || value || '-';
  }
  return firstNonEmpty(value, '-');
}

function extractQuoteDetailRecord(resp: any) {
  return resp?.result ?? resp?.record ?? resp?.data ?? resp;
}

function hasQuoteDetailData(record: any) {
  if (!record || typeof record !== 'object') return false;
  return !!firstNonEmptyRaw(
    record.productName,
    record.supplierSku,
    record.moq,
    record.photo,
    record.customerUrl,
    record.country,
    record.country_dictText,
    record.logisticChannel,
    record.logisticChannel_dictText,
    record.purchasePriceRmb,
    record.domesticShippingRmb,
    record.salePriceRmb,
    record.partnerSalePrice,
    record.supplierLink,
    record.supplierName
  );
}

function normalizeQuoteDetailRecord(detail: any, fallbackRecord: any) {
  const extracted = extractQuoteDetailRecord(detail);
  if (!extracted || typeof extracted !== 'object') return { ...(fallbackRecord || {}) };
  if (!hasQuoteDetailData(extracted) && fallbackRecord && hasQuoteDetailData(fallbackRecord)) {
    return mergePreferNonNil({ ...(fallbackRecord || {}) }, extracted);
  }
  return mergePreferNonNil({ ...(fallbackRecord || {}) }, extracted);
}

function setOptionMap(type: 'client' | 'salesperson' | 'country', options: any[] = []) {
  const map = routeInquiryOptionMaps[type];
  map.clear();
  options.forEach((item) => {
    const value = item?.value ?? item?.id;
    const label = item?.label ?? item?.text ?? item?.name ?? value;
    if (value !== null && value !== undefined && value !== '') {
      map.set(String(value), String(label ?? ''));
    }
  });
}

function mapDisplayValue(value: any, type: 'client' | 'salesperson' | 'country') {
  const map = routeInquiryOptionMaps[type];
  if (Array.isArray(value)) {
    return value.map((item) => map.get(String(item)) || String(item)).join(', ') || '-';
  }
  if (typeof value === 'string') {
    const values = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (values.length > 1) {
      return values.map((item) => map.get(item) || item).join(', ');
    }
    if (values.length === 1) return map.get(values[0]) || values[0];
  }
  const single = firstNonEmpty(value, '');
  if (single === '-') return '-';
  return map.get(String(single)) || single;
}

const routeInquiryDisplay = computed(() => {
  const record = routeInquiryRecord.value || {};
  return {
    client: firstNonEmpty(
      record.inquiryClient_dictText,
      record.clientName,
      mapDisplayValue(firstNonEmpty(record.inquiryClient, record.clientId), 'client')
    ),
    sales: firstNonEmpty(
      record.inquirySales_dictText,
      record.salespersonNames,
      mapDisplayValue(firstNonEmpty(record.inquirySales, record.salesId), 'salesperson')
    ),
    country: firstNonEmpty(
      record.inquiryCountry_dictText,
      record.countryName,
      mapDisplayValue(firstNonEmpty(record.inquiryCountry, record.countryId), 'country')
    ),
    expectedSales: firstNonEmpty(record.expectedSales, '-'),
    link: firstNonEmpty(record.inquiryLink, record.inquiryUrl, record.link),
  };
});

function getRouteInquiryId() {
  return String(route.value.query?.inquiryId || '').trim();
}

function matchesRouteInquiry(record: any, inquiryId: string) {
  if (!inquiryId || !record) return true;
  const candidates = [
    record?.inquiryId,
    record?.inquiry_id,
    record?.sourceInquiryId,
    record?.source_inquiry_id,
    record?.id,
  ];
  return candidates.some((value) => String(value || '').trim() === inquiryId);
}

function mergeInquiryFallbackIntoQuote(record: any, inquiryRecord: any) {
  if (!record || !inquiryRecord) return record;
  const merged = {
    ...record,
    inquiryClient: record?.inquiryClient ?? inquiryRecord?.inquiryClient ?? inquiryRecord?.clientId,
    inquirySales: record?.inquirySales ?? inquiryRecord?.inquirySales ?? inquiryRecord?.salesId,
    inquiryCountry: record?.inquiryCountry ?? inquiryRecord?.inquiryCountry ?? inquiryRecord?.countryId,
    inquiryLink: record?.inquiryLink ?? inquiryRecord?.inquiryLink ?? inquiryRecord?.inquiryUrl ?? inquiryRecord?.link,
    inquiryUrl: record?.inquiryUrl ?? inquiryRecord?.inquiryUrl ?? inquiryRecord?.inquiryLink ?? inquiryRecord?.link,
    expectedSales: record?.expectedSales ?? inquiryRecord?.expectedSales,
    inquiryPhoto: record?.inquiryPhoto ?? inquiryRecord?.inquiryPhoto ?? inquiryRecord?.photo,
    inquirySpec: record?.inquirySpec ?? inquiryRecord?.inquirySpec ?? inquiryRecord?.specification,
    inquiryColor: record?.inquiryColor ?? inquiryRecord?.inquiryColor ?? inquiryRecord?.color,
    inquiryRemark: record?.inquiryRemark ?? inquiryRecord?.inquiryRemark ?? inquiryRecord?.remark,
    priorityMode: record?.priorityMode ?? inquiryRecord?.priorityMode,
    attachments: record?.attachments ?? inquiryRecord?.attachments,
  } as any;

  const clientDisplay =
    firstNonEmpty(
      record?.inquiryClient_dictText,
      inquiryRecord?.inquiryClient_dictText,
      inquiryRecord?.clientName,
      mapDisplayValue(firstNonEmpty(record?.inquiryClient, inquiryRecord?.inquiryClient, inquiryRecord?.clientId), 'client')
    ) || '';
  const salesDisplay =
    firstNonEmpty(
      record?.inquirySales_dictText,
      inquiryRecord?.inquirySales_dictText,
      inquiryRecord?.salespersonNames,
      mapDisplayValue(firstNonEmpty(record?.inquirySales, inquiryRecord?.inquirySales, inquiryRecord?.salesId), 'salesperson')
    ) || '';
  const countryDisplay =
    firstNonEmpty(
      record?.inquiryCountry_dictText,
      inquiryRecord?.inquiryCountry_dictText,
      inquiryRecord?.countryName,
      mapDisplayValue(firstNonEmpty(record?.inquiryCountry, inquiryRecord?.inquiryCountry, inquiryRecord?.countryId), 'country')
    ) || '';

  return {
    ...merged,
    inquiryClient_dictText: clientDisplay,
    inquirySales_dictText: salesDisplay,
    inquiryCountry_dictText: countryDisplay,
    clientName: clientDisplay,
    salespersonNames: salesDisplay,
    countryName: countryDisplay,
  };
}

async function hydrateQuoteRecord(record: any) {
  if (!record) return record;
  const inquiryId = String(firstNonEmpty(record?.inquiryId, record?.inquiry_id, '') || '').trim();
  if (!inquiryId) return record;

  const currentRouteInquiryId = getRouteInquiryId();
  if (routeInquiryRecord.value && currentRouteInquiryId && inquiryId === currentRouteInquiryId) {
    return mergeInquiryFallbackIntoQuote(record, routeInquiryRecord.value);
  }

  try {
    const inquiryResp = await inquiryQueryById({ id: inquiryId });
    const inquiryRecord = inquiryResp?.result ?? inquiryResp;
    return mergeInquiryFallbackIntoQuote(record, inquiryRecord);
  } catch (error) {
    console.warn('[quotation-list] failed to hydrate quote record with inquiry', error);
    return record;
  }
}

async function quoteListWithInquiryContext(params: Record<string, any>) {
  const normalizedParams = normalizeQuoteSearchParams(params);
  const inquiryId = getRouteInquiryId();
  if (!inquiryId) {
    const resp: any = await quoteList(normalizedParams);
    const records = Array.isArray(resp?.records) ? resp.records : Array.isArray(resp) ? resp : [];
    const annotated = await annotateInquiryAvailability(records);
    if (Array.isArray(resp)) return annotated;
    return { ...resp, records: annotated };
  }

  const resp: any = await quoteList({
    ...normalizedParams,
    pageNo: 1,
    pageSize: 9999,
  });
  const records = Array.isArray(resp?.records) ? resp.records : Array.isArray(resp) ? resp : [];
  const filtered = await annotateInquiryAvailability(
    records
      .filter((item) => matchesRouteInquiry(item, inquiryId))
      .map((item) => mergeInquiryFallbackIntoQuote(item, routeInquiryRecord.value))
  );

  routeInquiryMatchedCount.value = filtered.length;
  if (Array.isArray(resp)) return filtered;
  return { ...resp, records: filtered, total: filtered.length };
}

const [registerModal, { openModal }] = useModal();
const [registerInquiryModal, { openModal: openInquiryModal }] = useModal();

function getRecordInquiryId(record: any) {
  return String(firstNonEmpty(record?.inquiryId, record?.inquiry_id, '') || '').trim();
}

function getPotentialInquiryId(record: any) {
  const inquiryId = getRecordInquiryId(record);
  const quoteId = String(firstNonEmpty(record?.id, '') || '').trim();
  if (!inquiryId || inquiryId === '0') return false;
  if (inquiryId.toLowerCase?.() === 'null' || inquiryId.toLowerCase?.() === 'undefined') return false;
  if (quoteId && inquiryId === quoteId) return false;
  return inquiryId;
}

async function annotateInquiryAvailability(records: any[] = []) {
  const pendingIds = Array.from(
    new Set(
      records
        .map((item) => getPotentialInquiryId(item))
        .filter((id): id is string => typeof id === 'string' && !!id && !inquiryAvailabilityCache.has(id))
    )
  );

  if (pendingIds.length) {
    const results = await Promise.allSettled(
      pendingIds.map(async (id) => {
        const inquiryResp = await inquiryQueryById({ id });
        const inquiryRecord = inquiryResp?.result ?? inquiryResp;
        return { id, ok: !!inquiryRecord && typeof inquiryRecord === 'object' };
      })
    );
    results.forEach((result, index) => {
      inquiryAvailabilityCache.set(
        pendingIds[index],
        result.status === 'fulfilled' ? !!result.value.ok : false
      );
    });
  }

  return records.map((item) => {
    const inquiryId = getPotentialInquiryId(item);
    return {
      ...item,
      _hasValidInquiry: !!inquiryId && inquiryAvailabilityCache.get(inquiryId) === true,
    };
  });
}

function hasLinkedInquiry(record: any) {
  return record?._hasValidInquiry === true;
}

const clientVisibleDataIndexes = new Set([
  'status',
  'linkedInquiryAction',
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

function filterOutInquiryGroup(list: any[]): any[] {
  return (list || []).filter((column) => {
    const title = String(column?.title ?? '');
    return title !== t('data.quotation.tableGroup.inquiry');
  });
}

function appendInquiryActionColumn(list: any[]): any[] {
  if ((list || []).some((column) => column?.dataIndex === 'linkedInquiryAction')) return list;
  const next = [...(list || [])];
  const inquiryColumn = {
    title: t('data.quotation.inquiry'),
    dataIndex: 'linkedInquiryAction',
    align: 'center',
    width: 88,
  };
  const statusIndex = next.findIndex((column) => column?.dataIndex === 'status');
  if (statusIndex >= 0) {
    next.splice(statusIndex + 1, 0, inquiryColumn);
    return next;
  }
  return [inquiryColumn, ...next];
}

const fullTableColumns = isEmployee ? columns : filterColumnsForClient(columns);
const tableColumns = appendInquiryActionColumn(filterOutInquiryGroup(fullTableColumns));
const customerHiddenSearchFields = new Set(['inquiryClient', 'inquirySales']);
const tableSearchSchemas = isEmployee
  ? searchFormSchema
  : searchFormSchema.filter((schema) => !customerHiddenSearchFields.has(String(schema.field || '')));

const { tableContext } = useListPage({
  tableProps: {
    title: t('data.quotation.quote'),
    api: quoteListWithInquiryContext,
    columns: tableColumns,
    canResize: false,
    bordered: true,
    afterFetch: (items: any[]) => {
      const inquiryId = getRouteInquiryId();
      if (!inquiryId) return items;
      const hydrated = (items || []).map((item) => mergeInquiryFallbackIntoQuote(item, routeInquiryRecord.value));
      routeInquiryMatchedCount.value = hydrated.length;
      return hydrated;
    },
    formConfig: {
      schemas: tableSearchSchemas,
      autoSubmitOnEnter: true,
      showAdvancedButton: false,
      labelWidth: 120,
      actionColOptions: { span: 8, offset: 16, style: { textAlign: 'right' } },
      fieldMapToNumber: [],
      fieldMapToTime: [],
    },
    actionColumn: { width: isEmployee ? 180 : 90, fixed: 'right', title: t('common.operation.action') },
  },
});

const [registerTable, { reload, getForm, setColumns }, { rowSelection, selectedRowKeys }] = tableContext;

onMounted(async () => {
  const [clientResult, countryResult, salespersonResult] = await Promise.allSettled([
    getClientOptions(),
    getMergedCountryOptions(),
    getSalespersons(),
  ]);
  const clientOptions = clientResult.status === 'fulfilled' ? clientResult.value : [];
  const countryOptions = countryResult.status === 'fulfilled' ? countryResult.value : [];
  const salespersonOptions = salespersonResult.status === 'fulfilled' ? salespersonResult.value : [];

  if (clientResult.status === 'rejected') {
    console.warn('[quotation-list] failed to load client options', clientResult.reason);
  }
  if (countryResult.status === 'rejected') {
    console.warn('[quotation-list] failed to load country options', countryResult.reason);
  }
  if (salespersonResult.status === 'rejected') {
    console.warn('[quotation-list] failed to load salesperson options', salespersonResult.reason);
  }

  setOptionMap('client', clientOptions);
  setOptionMap('country', countryOptions);
  setOptionMap('salesperson', salespersonOptions);
  await getForm().updateSchema([
    {
      field: 'inquiryClient',
      componentProps: { options: clientOptions, showSearch: true, allowClear: true, placeholder: t('common.chooseText') },
    },
    {
      field: 'inquiryCountry',
      componentProps: { options: countryOptions, showSearch: true, allowClear: true, placeholder: t('common.chooseText') },
    },
    {
      field: 'country',
      componentProps: { options: countryOptions, showSearch: true, allowClear: true, placeholder: t('common.chooseText') },
    },
    {
      field: 'inquirySales',
      componentProps: {
        options: salespersonOptions,
        showSearch: true,
        allowClear: true,
        placeholder: t('common.chooseText'),
      },
    },
  ]);
  await nextTick();
  setColumns(appendInquiryActionColumn(filterOutInquiryGroup(fullTableColumns)));
  await applyRouteInquiryContext();
});

async function applyRouteInquiryContext() {
  const inquiryId = String(route.value.query?.inquiryId || '').trim();
  if (!inquiryId) return;
  try {
    const fullRecordResp = await inquiryQueryById({ id: inquiryId });
    routeInquiryRecord.value = fullRecordResp?.result ?? fullRecordResp;
    await getForm().setFieldsValue?.({ inquiryId });
    await reload({
      page: 1,
      searchInfo: { inquiryId },
    });
  } catch (error) {
    console.warn('[quotation-list] failed to apply route inquiry context', error);
    routeInquiryRecord.value = null;
    routeInquiryMatchedCount.value = null;
    createMessage.error(t('common.queryFailed'));
  }
}

function handleQuoteFromRouteInquiry() {
  if (!routeInquiryRecord.value) return;
  openModal(true, {
    record: { ...routeInquiryRecord.value, id: '', inquiryId: routeInquiryId.value },
    isUpdate: false,
    fromInquiry: true,
    showFooter: true,
  });
}

async function handleEdit(record: any) {
  if (!record?.id) {
    createMessage.error(t('common.queryFailed'));
    return;
  }
  const fullRecordResp = await quoteQueryById({ id: record.id });
  const normalizedRecord = normalizeQuoteDetailRecord(fullRecordResp, record);
  const fullRecord = await hydrateQuoteRecord({ ...normalizedRecord, id: normalizedRecord?.id ?? record.id });
  openModal(true, { record: fullRecord, isUpdate: true, showFooter: true });
}
function handleDirectAdd() {
  openModal(true, { isDirectAdd: true, isUpdate: false, showFooter: true });
}
async function handleDetail(record: any) {
  if (!record?.id) {
    createMessage.error(t('common.queryFailed'));
    return;
  }
  const fullRecordResp = await quoteQueryById({ id: record.id });
  const normalizedRecord = normalizeQuoteDetailRecord(fullRecordResp, record);
  const fullRecord = await hydrateQuoteRecord({ ...normalizedRecord, id: normalizedRecord?.id ?? record.id });
  openModal(true, { record: fullRecord, isUpdate: true, showFooter: false });
}
async function handleInquiryDetail(record: any) {
  const inquiryId = getRecordInquiryId(record);
  if (!inquiryId) return;
  try {
    const inquiryResp = await inquiryQueryById({ id: inquiryId });
    const inquiryRecord = inquiryResp?.result ?? inquiryResp;
    openInquiryModal(true, { record: inquiryRecord, isUpdate: true, showFooter: false });
  } catch (error) {
    console.warn('[quotation-list] failed to open inquiry detail', error);
    createMessage.error(t('common.queryFailed'));
  }
}
async function handleDelete(record: any) {
  await quoteDeleteOne({ id: record.id }, handleSuccess);
}
async function batchHandleDelete() {
  createConfirm({
    iconType: 'warning',
    title: t('data.quotation.confirm.deleteTitle'),
    content: t('data.quotation.confirm.batchDelete'),
    okText: t('common.okText'),
    cancelText: t('common.operation.cancel'),
    onOk: () => quoteDeleteBatch({ ids: selectedRowKeys.value }, handleSuccess),
  });
}
function handleSuccess() {
  selectedRowKeys.value = [];
  reload();
}

function cleanParams(params: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => {
      if (value === undefined || value === null || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  );
}

function normalizeSearchValue(value: any) {
  if (Array.isArray(value)) {
    const items = value.map(String).map((item) => item.trim()).filter(Boolean);
    return items.length ? items.join(',') : undefined;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  return value;
}

function normalizeQuoteSearchParams(params: Record<string, any>) {
  const cleaned = cleanParams(params || {});
  const normalized: Record<string, any> = {};

  Object.entries(cleaned).forEach(([key, value]) => {
    const nextValue = normalizeSearchValue(value);
    if (nextValue !== undefined && nextValue !== null && nextValue !== '') {
      normalized[key] = nextValue;
    }
  });

  if (normalized.inquiryClient && !normalized.clientId) normalized.clientId = normalized.inquiryClient;
  if (normalized.inquirySales && !normalized.salesId) normalized.salesId = normalized.inquirySales;
  if (normalized.inquiryCountry && !normalized.countryId) normalized.countryId = normalized.inquiryCountry;
  if (normalized.country && !normalized.countryId) normalized.countryId = normalized.country;

  return normalized;
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
    : normalizeQuoteSearchParams(await getForm().validate());
  const res: any = await exportCustomerQuotes(params);
  const disposition = res?.headers?.['content-disposition'] || res?.headers?.['Content-Disposition'];
  downloadExcelBlob(res?.data ?? res, getFilenameFromDisposition(disposition));
}

</script>

<style scoped>
:deep(.ant-form-item-label > label) {
  white-space: normal;
  line-height: 1.2;
  height: auto;
}

.route-inquiry-summary {
  margin-bottom: 12px;
  padding: 14px 16px;
  border: 1px solid #dbe5f0;
  border-radius: 12px;
  background: linear-gradient(180deg, #fbfdff 0%, #f4f8fc 100%);
}

.route-inquiry-summary__title {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

.route-inquiry-summary__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 20px;
}

.quotation-actions {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(46px, max-content);
  align-items: center;
  justify-content: end;
  column-gap: 2px;
  white-space: nowrap;
}

.quotation-actions__btn {
  padding-inline: 4px;
}

.quotation-actions__btn--danger {
  color: #ff4d4f;
}

.quotation-inquiry-link {
  padding-inline: 4px;
}

.quotation-inquiry-link--empty {
  display: inline-block;
  min-width: 16px;
  color: rgba(0, 0, 0, 0.25);
}

.route-inquiry-summary__item {
  display: flex;
  gap: 8px;
  min-width: 0;
}

.route-inquiry-summary__item--full {
  grid-column: 1 / -1;
}

.route-inquiry-summary__label {
  flex: 0 0 auto;
  color: rgba(0, 0, 0, 0.45);
}

.route-inquiry-summary__value {
  min-width: 0;
  color: rgba(0, 0, 0, 0.88);
  word-break: break-word;
}

.route-inquiry-empty {
  margin-top: 12px;
}

.route-inquiry-empty__actions {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.route-inquiry-empty__panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  border: 1px dashed #d9d9d9;
  border-radius: 12px;
  background: #fff;
}

.route-inquiry-empty__text {
  color: rgba(0, 0, 0, 0.45);
}
</style>
