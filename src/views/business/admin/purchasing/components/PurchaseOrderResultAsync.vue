<template>
  <div
    v-if="status !== 'idle'"
    class="w-full p-4 rounded border"
    :class="status === 'running'
      ? 'bg-yellow-50 border-yellow-300'
      : 'bg-green-50 border-green-300'"
  >
    <div class="text-base font-medium text-gray-800">
      {{ statusText }}
    </div>

    <div
      class="mt-3 max-h-40 overflow-auto border p-3 bg-white rounded text-sm"
    >
      <div
        v-for="[invoice, gids] in invoiceEntries"
        :key="invoice"
        class="mb-3"
      >
        <div class="font-medium text-gray-700">
          {{ t('data.invoice.invoiceNumber') }}：{{ invoice }}
        </div>
        <ul class="list-disc pl-6 text-gray-800">
          <li v-for="gid in Array.from(gids)" :key="gid">
            {{ gid }}
          </li>
        </ul>
      </div>
      <div v-if="invoiceEntries.length === 0 && invoiceFailureEntries.length === 0" class="text-gray-400">
        {{ t('data.purchase.noData') }}
      </div>
    </div>

    <div
      v-if="invoiceFailureEntries.length > 0"
      class="mt-3 max-h-40 overflow-auto border border-red-300 p-3 bg-red-50 rounded text-sm"
    >
      <div
        v-for="[invoice, reasons] in invoiceFailureEntries"
        :key="invoice"
        class="mb-3"
      >
        <div class="font-medium text-red-700">
          {{ t('data.invoice.invoiceNumber') }}：{{ invoice }} - {{ t('data.purchase.failed') }}
        </div>
        <ul class="list-disc pl-6 text-red-700">
          <li v-for="(reason, idx) in reasons" :key="idx">
            {{ reason }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, defineExpose } from 'vue';
import { onWebSocket, offWebSocket } from '@/hooks/web/useWebSocket';
import { useI18n } from '@/hooks/web/useI18n';
const { t } = useI18n();
const emit = defineEmits(['statusChange']);
type Status = 'idle' | 'running' | 'completed';
const status = ref<Status>('idle');
const invoiceGroupMap = ref<Record<string, Set<string>>>({});
const invoiceFailureMap = ref<Record<string, string[]>>({});
const progressCount = ref(0);
const invoiceEntries = computed(() =>
  Object.entries(invoiceGroupMap.value)
);
const invoiceFailureEntries = computed(() =>
  Object.entries(invoiceFailureMap.value)
);
const createdCount = computed(() =>
  invoiceEntries.value.reduce(
    (sum, [, set]) => sum + set.size,
    0
  )
);
const statusText = computed(() => {
  return status.value === 'running'
    ? t('data.purchase.creating', { count: progressCount.value })
    : t('data.purchase.completed', { count: createdCount.value });
});
function handleWs(raw: any) {
  const msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (msg.task !== 'createMabangPurchaseOrder') return;
  const type = msg.msgTxt;
  const data = msg.data || {};
  if (type === 'creating') {
    if (status.value !== 'running') {
      status.value = 'running';
      emit('statusChange', 'running');
    }
    const invoice = data.invoice || 'UNKNOWN';
    if (!invoiceGroupMap.value[invoice]) {
      invoiceGroupMap.value[invoice] = new Set();
    }
    if (data.groupId) {
      invoiceGroupMap.value[invoice].add(data.groupId);
    }
    progressCount.value = createdCount.value;
    return;
  }
  if (type === 'DONE') {
    status.value = 'completed';
    emit('statusChange', 'completed');
    invoiceGroupMap.value = {};
    invoiceFailureMap.value = {};
    const result = data.result || {};
    Object.values(result).forEach((item: any) => {
      if (!item || !item.invoice) return;
      if (item.finalStatus === 'SUCCESS') {
        invoiceGroupMap.value[item.invoice] =
          new Set(item.groupIds || []);
      } else if (item.finalStatus === 'FAILURE') {
        invoiceFailureMap.value[item.invoice] =
          item.failures && item.failures.length > 0
            ? item.failures
            : [t('data.purchase.unknownFailureReason')];
      }
    });
    return;
  }
}
function reset() {
  status.value = 'idle';
  invoiceGroupMap.value = {};
  invoiceFailureMap.value = {};
  progressCount.value = 0;
}
function start() {
  reset();
  status.value = 'running';
  emit('statusChange', 'running');
}
defineExpose({
  start,
  reset,
});
onMounted(() => {
  onWebSocket(handleWs);
});
onBeforeUnmount(() => {
  offWebSocket(handleWs);
});
</script>

<style scoped>
</style>
