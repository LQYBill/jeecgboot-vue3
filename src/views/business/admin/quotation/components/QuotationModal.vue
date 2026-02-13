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
      <div class="q-section" v-for="sec in sections" :key="sec.key">
        <div class="q-section-title">
          <span class="bar"></span>
          <span class="txt">{{ sec.title }}</span>
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
import {quoteEdit, quoteEstimate } from '../Quotation.api';
import { formSchema as rawSchemas } from '../Quotation.data';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
const emit = defineEmits(['register', 'success']);
const editId = ref<string>('');
const statusVal = ref<string>('0');
type Section = { key: string; title: string; schemas: any[] };
const { top, sections: sectionDefs } = splitByDivider(rawSchemas);
const topSchemas = top.filter((x: any) => x?.field === 'status');
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
  labelWidth: 110,
  labelAlign: 'right',
  schemas: topSchemas,
  showActionButtonGroup: false,
  baseColProps: { span: 24 },
  rowProps: { gutter: 16 },
});
function makeSectionForm(schemas: any[]) {
  return useForm({
    labelWidth: 110,
    labelAlign: 'right',
    schemas,
    showActionButtonGroup: false,
    baseColProps: { span: 12 },
    rowProps: { gutter: 16 },
  });
}
const sections = sectionDefs.map((d) => {
  const [register, api] = makeSectionForm(d.schemas);
  return { ...d, register, api };
});
let estimateTimer: any = null;
let estimating = false;
function debounceEstimate(fn: () => void, delay = 250) {
  clearTimeout(estimateTimer);
  estimateTimer = setTimeout(fn, delay);
}
function normalizePayload(v: any) {
  const payload = { ...v };
  // inquiryCountry array -> string
  if (Array.isArray(payload.inquiryCountry)) payload.inquiryCountry = payload.inquiryCountry.join(',');
  payload.id = editId.value;
  return payload;
}
// only patch computed fields, avoid overwriting user input
function pickComputed(est: any) {
  return {
    expressWeight: est?.expressWeight,
    expressWeightG: est?.expressWeightG,

    costRmb: est?.costRmb,
    costEur: est?.costEur,
    prixAchat: est?.prixAchat,

    salePriceEur: est?.salePriceEur,

    logisticsFee: est?.logisticsFee,
    totalFee: est?.totalFee,

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
      else if (out[k] === undefined) out[k] = v; // 第一次出现允许落位
    }
  }
  return out;
}

async function collectValuesNoValidate() {
  const topV = topFormApi.getFieldsValue?.() ?? {};
  const parts = sections.map((s) => s.api.getFieldsValue?.() ?? {});
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
async function applyComputedFields(fields: any) {
  if (!fields) return;
  const patch = removeNil(fields);
  if (!Object.keys(patch).length) return;
  await topFormApi.setFieldsValue(patch);
  for (const s of sections) await s.api.setFieldsValue(patch);
}

async function doEstimate() {
  if (estimating) return;
  estimating = true;
  try {
    const raw = await collectValuesNoValidate();
    const payload = normalizePayload(raw);
    const resp = await quoteEstimate(payload);
    const est = (resp as any)?.result ?? resp;
    await applyComputedFields(pickComputed(est));
  } catch (e) {
    console.warn('[quote-estimate] failed', e);
  } finally {
    estimating = false;
  }
}
function estimateDebounced() {
  debounceEstimate(() => {
    doEstimate();
  }, 250);
}
// these fields are the ones that affect estimate result, so onChange
function bindEstimateHooks(formApi: any) {
  formApi.updateSchema?.([
    { field: 'country', componentProps: { onChange: estimateDebounced } },
    { field: 'logisticChannel', componentProps: { onChange: estimateDebounced } },
    { field: 'grossWeightG', componentProps: { onChange: estimateDebounced } },
    { field: 'packWeightG', componentProps: { onChange: estimateDebounced } },
    { field: 'purchasePriceRmb', componentProps: { onChange: estimateDebounced } },
    { field: 'domesticShippingRmb', componentProps: { onChange: estimateDebounced } },
    { field: 'salePriceRmb', componentProps: { onChange: estimateDebounced } },
  ]);
}

/** when modal opens, reset all forms, set values, bind hooks, and trigger estimate */
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  await topFormApi.resetFields();
  for (const s of sections) await s.api.resetFields();
  setModalProps({
    confirmLoading: false,
    showCancelBtn: !!data?.showFooter,
    showOkBtn: !!data?.showFooter,
  });
  const r: any = { ...(data?.record || {}) };
  editId.value = r?.id || '';
  statusVal.value = (r?.status ?? '0') + '';
  if (typeof r.inquiryCountry === 'string') {
    r.inquiryCountry = r.inquiryCountry
      ? r.inquiryCountry.split(',').map((x) => x.trim()).filter(Boolean)
      : [];
  } else if (!Array.isArray(r.inquiryCountry)) {
    r.inquiryCountry = [];
  }
  await topFormApi.setFieldsValue(r);
  for (const s of sections) await s.api.setFieldsValue(r);
  topFormApi.setProps({ disabled: !data?.showFooter });
  for (const s of sections) s.api.setProps({ disabled: !data?.showFooter });
  bindEstimateHooks(topFormApi);
  for (const s of sections) bindEstimateHooks(s.api);
  estimateDebounced();
});
const title = computed(() => {
  return t('data.quotation.quote');
});

async function handleSubmit() {
  try {
    // 1) validate: get all values (top + sections)
    const topValues: any = await topFormApi.validate();
    const values: any = { ...topValues };
    for (const s of sections) {
      const part = await s.api.validate();
      Object.assign(values, part);
    }
    // 2) normalize: convert inquiryCountry array to string
    if (Array.isArray(values.inquiryCountry)) {
      values.inquiryCountry = values.inquiryCountry.join(',');
    }
    values.id = editId.value;
    setModalProps({ confirmLoading: true });
    // 4) estimate: call quoteEstimate with current values to get computed fields
    const estimated = await quoteEstimate(values);
    // 5) merge: prefer non-nil computed fields,
    // but don't overwrite user input with nil
    // (e.g. if estimate fails and returns null, we keep user's input instead of wiping it)
    const est = (estimated as any)?.result ?? estimated;
    const payload = { ...values, ...pickComputed(est), id: editId.value };
    await quoteEdit(payload);
    await topFormApi.setFieldsValue(payload);
    for (const s of sections) await s.api.setFieldsValue(payload);
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


:deep(.q-form) {
  .ant-form-item { margin-bottom: 12px; }
  .ant-form-item-label { white-space: nowrap; }

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
