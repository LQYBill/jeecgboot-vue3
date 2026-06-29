<template>
  <skuTable @generate="handleGenerate" @selectionChange="handleSelectionChange"></skuTable>
  <div class="flex flex-row flex-nowrap gap-5 sku-builder-div">
  </div>
  <div class="mt-4" ref="tempSkuBulkForm">
    <TempSkuBulkForm ref="tempSkuBulkFormRef" @submit="handleBulkEdit" @error="handleError" @addMore="handleAddMore" @sync="handleSync"/>
  </div>
</template>
<script setup lang="ts">
import {useMessage} from "@/hooks/web/useMessage";
import {nextTick, ref} from "vue";
import {Sku} from "@/views/business/dto/sku.dto";
import SkuTable from "@/views/business/admin/sku/components/skuTable.vue";
import TempSkuBulkForm from "@/views/business/admin/sku/components/tempSkuBulkForm.vue";

const { createMessage } = useMessage();
const emit = defineEmits(["submit", "error", "generate", "addMore", "sync", "selectionChange"]);

const tempSkuBulkForm = ref<HTMLDivElement | null>(null);
const tempSkuBulkFormRef = ref<InstanceType<typeof TempSkuBulkForm> | null>(null);

const editedUnpairedSkuList = ref<Sku[]>([]);

async function handleGenerate(records: Sku[]) {
  if(records.length === 0) {
    createMessage.error('Please select at least one sku');
    emit('generate', []);
    return;
  }
  emit('generate', records);
  await nextTick();
  const div = tempSkuBulkForm.value!;
  div.scrollIntoView({ behavior: 'smooth' });
}

function handleError() {
  emit('error');
}
function handleBulkEdit(data: Sku[]) {
  if(Object.keys(data).length === 0) {
    createMessage.error('Please fill in the form');
    return;
  }
  editedUnpairedSkuList.value = data;

  emit('submit', editedUnpairedSkuList.value);
}

function handleSync(data: Sku[]) {
  emit('sync', data);
}

function handleSelectionChange(records: Sku[]) {
  emit('selectionChange', records);
}

function handleAddMore() {
  emit('addMore');
}

async function validateBeforeNext() {
  const validatedData = await tempSkuBulkFormRef.value?.validateCurrentForm?.(false);
  if (!validatedData) {
    return false;
  }
  editedUnpairedSkuList.value = validatedData;
  emit('submit', editedUnpairedSkuList.value);
  return true;
}

defineExpose({
  validateBeforeNext,
});
</script>
