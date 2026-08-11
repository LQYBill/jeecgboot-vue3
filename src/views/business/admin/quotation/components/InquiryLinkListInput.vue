<template>
  <div class="inquiry-link-list">
    <div v-for="(row, index) in rows" :key="index" class="inquiry-link-row">
      <a-input
        v-model:value="row.title"
        class="inquiry-link-title"
        :placeholder="t('data.quotation.col.inquiryLinkTitle')"
        :disabled="disabled"
        @change="emitChange"
      />
      <a-input
        v-model:value="row.url"
        class="inquiry-link-url"
        :placeholder="t('data.quotation.col.inquiryLinkUrl')"
        :disabled="disabled"
        @change="emitChange"
      />
      <a-button
        v-if="!disabled"
        type="text"
        danger
        shape="circle"
        size="small"
        :disabled="rows.length <= 1 && !row.title && !row.url"
        @click="removeRow(index)"
      >
        <Icon icon="ant-design:delete-outlined" />
      </a-button>
    </div>
    <a-button v-if="!disabled" type="dashed" block size="small" @click="addRow">
      <Icon icon="ant-design:plus-outlined" />
      {{ t('data.quotation.col.inquiryLinkAdd') }}
    </a-button>
    <div v-if="isTooLong" class="inquiry-link-warning">
      <Icon icon="ant-design:warning-outlined" />
      {{ t('data.quotation.col.inquiryLinkTooLong', [serializedLength]) }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { Icon } from '/@/components/Icon';
import { useI18n } from '/@/hooks/web/useI18n';
import { parseInquiryLinks, serializeInquiryLinks, type InquiryLinkEntry } from '../Inquiry.data';

// Soft warning only -- the backend column length isn't known to the frontend,
// so this can't be a hard limit, just an early signal before a save silently
// gets truncated or rejected server-side.
const LENGTH_WARN_THRESHOLD = 500;

const props = defineProps<{ value?: string; disabled?: boolean }>();
const emit = defineEmits<{ (e: 'update:value', value: string): void }>();
const { t } = useI18n();

function toRows(raw?: string): InquiryLinkEntry[] {
  const parsed = parseInquiryLinks(raw);
  return parsed.length ? parsed : [{ title: '', url: '' }];
}

const rows = ref<InquiryLinkEntry[]>(toRows(props.value));

const serializedLength = computed(() => serializeInquiryLinks(rows.value).length);
const isTooLong = computed(() => !props.disabled && serializedLength.value > LENGTH_WARN_THRESHOLD);

// Reset rows when the field value is reset externally (e.g. resetFields, loading a different record),
// but not when the change originated from this component's own edits.
let lastEmitted: string | undefined;
watch(
  () => props.value,
  (val) => {
    if (val === lastEmitted) return;
    rows.value = toRows(val);
  }
);

function emitChange() {
  const serialized = serializeInquiryLinks(rows.value);
  lastEmitted = serialized;
  emit('update:value', serialized);
}

function addRow() {
  rows.value.push({ title: '', url: '' });
}

function removeRow(index: number) {
  rows.value.splice(index, 1);
  if (rows.value.length === 0) rows.value.push({ title: '', url: '' });
  emitChange();
}
</script>

<style lang="less" scoped>
.inquiry-link-list {
  width: 100%;
}
.inquiry-link-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.inquiry-link-title {
  flex: 0 0 30%;
}
.inquiry-link-url {
  flex: 1 1 auto;
}
.inquiry-link-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  color: #d46b08;
  font-size: 12px;
}
</style>
