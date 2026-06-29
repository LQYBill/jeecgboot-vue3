<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    destroyOnClose
    :title="title"
    :width="1200"
    :bodyStyle="{ maxHeight: '72vh', overflow: 'auto' }"
    @ok="handleSubmit"
  >
    <div class="q-wrap">
      <div class="q-top">
        <BasicForm class="q-form q-form-top" @register="registerTopForm" />
      </div>
      <!-- zone: for each section, render a form -->
      <div class="q-section" :class="{ 'q-section-readonly': sec.readonly }" v-for="sec in visibleSections" :key="sec.key">
        <div class="q-section-title">
          <span class="bar"></span>
          <span class="txt">{{ sec.title }}</span>
          <span v-if="sec.readonly" class="readonly-tag">{{ readonlyText }}</span>
        </div>
        <BasicForm class="q-form" @register="sec.register" />
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form';
import { useUserStore } from '/@/store/modules/user';
import { getClientOptions, getLogisticChannelOptionsByCountry, getMergedCountryOptions, getSalespersons, quoteAdd, quoteDirectAdd, quoteEdit, quoteEstimate } from '../Quotation.api';
import { formSchema as rawSchemas } from '../Quotation.data';
import { useI18n } from '/@/hooks/web/useI18n';
const i18n = useI18n() as any;
const { t } = i18n;
const emit = defineEmits(['register', 'success']);
const editId = ref<string>('');
const isDirectAdd = ref(false);
const fromInquiry = ref(false);
const sourceInquiryId = ref<string>('');
type PricingDriver = 'salePriceRmb' | 'margin';
const userStore = useUserStore();
const isEmployee = userStore.getIsEmployee;
type Section = { key: string; title: string; schemas: any[]; readonly?: boolean };
const formLabelWidth = 160;
const { top, sections: sectionDefs } = splitByDivider(rawSchemas);
const topSchemas = top.filter((x: any) => x?.field === 'status');
const customerHiddenSections = new Set(['sec-4', 'sec-5']);
const customerHiddenFields = new Set(['logisticChannel', 'expressWeightG']);
const inquirySectionKey = 'sec-1';
const readonlyText = computed(() => {
  const locale = String(i18n.locale?.value || i18n.locale || '');
  return locale.startsWith('zh') ? '只读' : 'Read-only';
});

function normalizePriorityMode(value?: string) {
  if (value === '一件代发') return 'dropShipping';
  if (value === '库存模式') return 'stockMode';
  return value;
}
function normalizeMultiValue(value: any): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}
function splitByDivider(schemas: any[]): { top: any[]; sections: Section[] } {
  const top: any[] = [];
  const sections: Section[] = [];
  let current: Section | null = null;
  let idx = 0;
  for (const s of schemas || []) {
    if (s?.component === 'Divider') {
      idx += 1;
      const title =
        (typeof s.renderComponentContent === 'function' ? s.renderComponentContent() : '') ||
        s.label ||
        `分区${idx}`;
      current = { key: `sec-${idx}`, title, schemas: [] };
      sections.push(current);
      continue;
    }
    if (!current) top.push(s);
    else current.schemas.push(s);
  }
  return { top, sections };
}
const [registerTopForm, topFormApi] = useForm({
  labelWidth: formLabelWidth,
  labelAlign: 'right',
  schemas: topSchemas,
  showActionButtonGroup: false,
  autoSetPlaceHolder: false,
  baseColProps: { span: 24 },
  rowProps: { gutter: 16 },
});
function makeSectionForm(schemas: any[]) {
  return useForm({
    labelWidth: formLabelWidth,
    labelAlign: 'right',
    schemas,
    showActionButtonGroup: false,
    autoSetPlaceHolder: false,
    baseColProps: { span: 12 },
    rowProps: { gutter: 16 },
  });
}
const displaySectionDefs = isEmployee
  ? sectionDefs
  : sectionDefs
      .filter((sec) => !customerHiddenSections.has(sec.key))
      .map((sec) => ({
        ...sec,
        schemas: (sec.schemas || []).filter((schema: any) => !schema?.field || !customerHiddenFields.has(schema.field)),
      }));
const sections = displaySectionDefs.map((d) => {
  const [register, api] = makeSectionForm(d.schemas);
  return { ...d, readonly: d.key === inquirySectionKey, register, api };
});
const estimateTriggerFields = [
  'logisticChannel',
  'grossWeightG',
  'packWeightG',
  'purchasePriceRmb',
  'domesticShippingRmb',
  'declaredValue',
  'iossRate',
] as const;
let estimateTimer: any = null;
let estimating = false;
let pendingEstimateDriver: PricingDriver | undefined;
let hasPendingEstimate = false;
const hasLinkedInquiry = computed(() => {
  const inquiryId = String(sourceInquiryId.value || '').trim();
  return !!inquiryId && inquiryId !== '0' && inquiryId.toLowerCase() !== 'null' && inquiryId.toLowerCase() !== 'undefined';
});
const visibleSections = computed(() =>
  isDirectAdd.value || (!fromInquiry.value && !hasLinkedInquiry.value)
    ? sections.filter((section) => section.key !== inquirySectionKey)
    : sections
);

function getActiveSections() {
  return visibleSections.value;
}

function debounceEstimate(fn: () => void, delay = 250) {
  clearTimeout(estimateTimer);
  estimateTimer = setTimeout(fn, delay);
}
function hasValue(value: any) {
  return value !== null && value !== undefined && value !== '';
}
function applyPricingDriver(payload: Record<string, any>, driver?: PricingDriver) {
  if (driver && hasValue(payload[driver])) {
    payload.pricingDriver = driver;
    if (driver === 'salePriceRmb') {
      delete payload.margin;
    }
    if (driver === 'margin') {
      delete payload.salePriceRmb;
    }
    return;
  }
  delete payload.pricingDriver;
}
function normalizePayload(v: any, driver?: PricingDriver) {
  const payload = { ...v };
  // inquiryCountry array -> string
  if (Array.isArray(payload.inquiryCountry)) payload.inquiryCountry = payload.inquiryCountry.join(',');
  payload.priorityMode = normalizePriorityMode(payload.priorityMode);
  applyPricingDriver(payload, driver);
  if (fromInquiry.value && !editId.value) {
    payload.inquiryId = payload.inquiryId || sourceInquiryId.value;
  }
  if (isDirectAdd.value) {
    delete payload.inquiryId;
  }
  if (editId.value) {
    payload.id = editId.value;
  } else {
    delete payload.id;
  }
  return payload;
}
// only patch computed fields, avoid overwriting user input
function pickComputed(est: any) {
  const salePriceEur = est?.salePriceEur;
  return {
    expressWeight: est?.expressWeight,
    expressWeightG: est?.expressWeightG,

    costRmb: est?.costRmb,
    costEur: est?.costEur,
    prixAchat: salePriceEur ?? est?.prixAchat,

    salePriceRmb: est?.salePriceRmb,
    salePriceEur,

    logisticsFee: est?.logisticsFee,
    totalFee: est?.totalFee,
    iossFee: est?.iossFee,

    profitRmb: est?.profitRmb,
    profitEur: est?.profitEur,
    margin: est?.margin,
  };
}

function mergePreferNonNil(...objs: any[]) {
  const out: any = {};
  for (const o of objs) {
    for (const k of Object.keys(o || {})) {
      const v = o[k];
      if (v !== null && v !== undefined && v !== '') out[k] = v;
      else if (out[k] === undefined) out[k] = v;
    }
  }
  return out;
}

async function collectValuesNoValidate() {
  const topV = topFormApi.getFieldsValue?.() ?? {};
  const parts = getActiveSections().map((s) => s.api.getFieldsValue?.() ?? {});
  return mergePreferNonNil(topV, ...parts);
}

function removeNil(obj: Record<string, any>) {
  const out: Record<string, any> = {};
  Object.keys(obj || {}).forEach((k) => {
    const v = obj[k];
    if (v !== null && v !== undefined) out[k] = v;
  });
  return out;
}
function buildComputedPatch(fields: any, skipFields: string[] = []) {
  if (!fields) return;
  const patch = removeNil(fields);
  skipFields.forEach((field) => {
    delete patch[field];
  });
  return Object.keys(patch).length ? patch : undefined;
}
async function applyComputedFields(fields: any, skipFields: string[] = []) {
  const patch = buildComputedPatch(fields, skipFields);
  if (!patch) return;
  await topFormApi.setFieldsValue(patch);
  for (const s of getActiveSections()) await s.api.setFieldsValue(patch);
}

async function updateSchemaEverywhere(schema: any) {
  await topFormApi.updateSchema?.(schema);
  for (const s of getActiveSections()) {
    await s.api.updateSchema?.(schema);
  }
}

async function applyCountryOptions() {
  try {
    const options = await getMergedCountryOptions();
    await updateSchemaEverywhere([
      {
        field: 'inquiryCountry',
        componentProps: {
          options,
          showSearch: true,
          mode: 'multiple',
          maxTagCount: 'responsive',
          allowClear: true,
          style: { width: '100%' },
        },
      },
      {
        field: 'country',
        componentProps: {
          options,
          showSearch: true,
          allowClear: true,
        },
      },
    ]);
  } catch (error) {
    console.warn('[quotation-modal] failed to load country options', error);
  }
}

async function applyClientOptions() {
  try {
    const options = await getClientOptions();
    await updateSchemaEverywhere({
      field: 'inquiryClient',
      componentProps: {
        options,
        showSearch: true,
        allowClear: true,
      },
    });
  } catch (error) {
    console.warn('[quotation-modal] failed to load client options', error);
  }
}

async function applySalespersonOptions() {
  try {
    const options = await getSalespersons();
    await updateSchemaEverywhere({
      field: 'inquirySales',
      componentProps: {
        options,
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 'responsive',
        allowClear: true,
      },
    });
  } catch (error) {
    console.warn('[quotation-modal] failed to load salesperson options', error);
  }
}

async function applyLogisticChannelOptions(country?: string, keepCurrent = true) {
  const raw = await collectValuesNoValidate();
  const current = raw?.logisticChannel;
  const options = country ? await getLogisticChannelOptionsByCountry(String(country)) : [];
  await updateSchemaEverywhere({
    field: 'logisticChannel',
    componentProps: {
      options,
      showSearch: true,
      allowClear: true,
    },
  });
  const currentStillValid = !!current && options.some((item: any) => item.value === String(current));
  if (!country || (keepCurrent && current && !currentStillValid)) {
    await applyComputedFields({ logisticChannel: '' });
  }
}

function queueEstimate(driver?: PricingDriver) {
  pendingEstimateDriver = driver;
  hasPendingEstimate = true;
}

function flushQueuedEstimate() {
  if (!hasPendingEstimate) return;
  const nextDriver = pendingEstimateDriver;
  hasPendingEstimate = false;
  pendingEstimateDriver = undefined;
  doEstimate(nextDriver);
}

async function doEstimate(driver?: PricingDriver) {
  if (!isEmployee) return;
  if (estimating) {
    queueEstimate(driver);
    return;
  }
  estimating = true;
  try {
    const raw = await collectValuesNoValidate();
    const payload = normalizePayload(raw, driver);
    const resp = await quoteEstimate(payload);
    const est = (resp as any)?.result ?? resp;
    await applyComputedFields(pickComputed(est), driver ? [driver] : []);
  } catch (e) {
    console.warn('[quote-estimate] failed', e);
  } finally {
    estimating = false;
    flushQueuedEstimate();
  }
}
function estimateDebounced(driver?: PricingDriver) {
  debounceEstimate(() => {
    doEstimate(driver);
  }, 250);
}
function triggerEstimateFrom(field: PricingDriver) {
  estimateDebounced(field);
}

// these fields are the ones that affect estimate result, so onChange
function bindEstimateHooks(formApi: any) {
  const schemaUpdates: any[] = [
    {
      field: 'country',
      componentProps: {
        onChange: async (value: string) => {
          await applyLogisticChannelOptions(value, true);
          estimateDebounced();
        },
      },
    },
    ...estimateTriggerFields.map((field) => ({
      field,
      componentProps: { onChange: estimateDebounced },
    })),
    { field: 'salePriceRmb', componentProps: { onChange: () => triggerEstimateFrom('salePriceRmb') } },
    { field: 'margin', componentProps: { onChange: () => triggerEstimateFrom('margin') } },
  ];
  formApi.updateSchema?.(schemaUpdates);
}

/** when modal opens, reset all forms, set values, bind hooks, and trigger estimate */
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  isDirectAdd.value = !!data?.isDirectAdd;
  fromInquiry.value = !!data?.fromInquiry;
  await topFormApi.resetFields();
  for (const s of getActiveSections()) await s.api.resetFields();
  setModalProps({
    confirmLoading: false,
    showCancelBtn: !!data?.showFooter || !isEmployee,
    showOkBtn: isEmployee && !!data?.showFooter,
  });
  const r: any = { ...(data?.record || {}) };
  editId.value = r?.id ?? '';
  sourceInquiryId.value = String(r?.inquiryId || data?.record?.inquiryId || '');
  r.priorityMode = normalizePriorityMode(r.priorityMode);
  await Promise.all([applyClientOptions(), applyCountryOptions(), applySalespersonOptions()]);
  if (typeof r.inquiryCountry === 'string') {
    r.inquiryCountry = r.inquiryCountry
      ? r.inquiryCountry.split(',').map((x) => x.trim()).filter(Boolean)
      : [];
  } else if (!Array.isArray(r.inquiryCountry)) {
    r.inquiryCountry = [];
  }
  r.inquirySales = normalizeMultiValue(r.inquirySalesList ?? r.inquirySales);
  await topFormApi.setFieldsValue(r);
  for (const s of getActiveSections()) await s.api.setFieldsValue(r);
  await applyLogisticChannelOptions(r.country, true);
  const disabled = !isEmployee || !data?.showFooter;
  topFormApi.setProps({ disabled });
  for (const s of getActiveSections()) s.api.setProps({ disabled: disabled || !!s.readonly });
  if (isEmployee) {
    bindEstimateHooks(topFormApi);
    for (const s of getActiveSections()) bindEstimateHooks(s.api);
    estimateDebounced();
  }
});
const title = computed(() => {
  if (isDirectAdd.value) return t('data.quotation.modalTitle.directQuoteAdd');
  if (!editId.value) return t('data.quotation.modalTitle.quoteAdd');
  return t('data.quotation.quote');
});

async function handleSubmit() {
  if (!isEmployee) return;
  try {
    // 1) validate: get all values (top + sections)
    const topValues: any = await topFormApi.validate();
    const values: any = { ...topValues };
    for (const s of getActiveSections()) {
      const part = await s.api.validate();
      Object.assign(values, part);
    }
    // 2) normalize: convert inquiryCountry array to string
    if (Array.isArray(values.inquiryCountry)) {
      values.inquiryCountry = values.inquiryCountry.join(',');
    }
    if (fromInquiry.value && !editId.value) {
      values.inquiryId = values.inquiryId || sourceInquiryId.value;
    }
    if (editId.value) {
      values.id = editId.value;
    } else {
      delete values.id;
    }
    setModalProps({ confirmLoading: true });
    // 4) estimate: call quoteEstimate with current values to get computed fields
    const estimated = await quoteEstimate(normalizePayload(values));
    // 5) merge: prefer non-nil computed fields,
    // but don't overwrite user input with nil
    // (e.g. if estimate fails and returns null, we keep user's input instead of wiping it)
    const est = (estimated as any)?.result ?? estimated;
    const payload = normalizePayload({ ...values, ...pickComputed(est) });
    if (editId.value) {
      await quoteEdit(payload);
    } else if (isDirectAdd.value) {
      await quoteDirectAdd(payload);
    } else {
      await quoteAdd(payload);
    }
    await topFormApi.setFieldsValue(payload);
    for (const s of getActiveSections()) await s.api.setFieldsValue(payload);
    closeModal();
    emit('success');
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>

<style lang="less" scoped>
.q-wrap {
  padding: 4px 6px 10px;
}
.q-top {
  padding: 2px 6px 10px;
}
.q-section {
  background: #fff;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  padding: 14px 14px 2px;
  margin: 12px 6px;
  box-shadow:
    0 6px 18px rgba(0, 0, 0, 0.18),
    0 1px 3px rgba(0, 0, 0, 0.06);
}

.q-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  user-select: none;
}
.q-section-title .bar {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: #1677ff;
}
.q-section-title .txt {
  font-weight: 800;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.88);
}
.readonly-tag {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
  color: rgba(0, 0, 0, 0.58);
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
}
.q-section-readonly {
  background: #fbfbfb;
}


:deep(.q-form) {
  .ant-form-item { margin-bottom: 12px; }
  .ant-form-item-label {
    white-space: normal;
    overflow: visible;
    line-height: 1.25;
  }
  .ant-form-item-label > label {
    height: auto;
    white-space: normal;
    line-height: 1.25;
  }

  .ant-form-item-control {
    flex: 1;
    min-width: 0;
  }
  .ant-form-item-control-input,
  .ant-form-item-control-input-content {
    width: 100% !important;
    min-width: 0 !important;
  }
  .ant-form-item-control-input-content {
    display: block;
  }

  .ant-input,
  .ant-input-number,
  .ant-picker,
  .ant-select,
  .ant-select-selector,
  textarea.ant-input {
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .ant-input-number { width: 100% !important; }
  .ant-input-number-input-wrap { width: 100% !important; }
  .j-dict-select-tag,
  .j-dict-select-tag > div,
  .j-dict-select-tag .ant-select {
    width: 100% !important;
    display: block !important;
    box-sizing: border-box !important;
  }
  .ant-select-multiple .ant-select-selector {
    min-height: 32px;
    height: auto !important;
    align-items: flex-start;
  }
  .ant-upload,
  .ant-upload-wrapper,
  .ant-upload-list,
  .ant-upload-list-item {
    width: 100% !important;
    box-sizing: border-box !important;
  }
  textarea.ant-input {
    resize: vertical;
  }
}
</style>
