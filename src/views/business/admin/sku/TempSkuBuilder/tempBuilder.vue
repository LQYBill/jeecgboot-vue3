<template>
  <skuTable @generate="handleGenerate"></skuTable>
  <div class="flex flex-row flex-nowrap gap-5 sku-builder-div">
  </div>
  <div class="mt-4" ref="tempSkuBulkForm">
    <TempSkuBulkForm @submit="handleBulkEdit" @error="handleError" @addMore="handleAddMore"/>
  </div>
</template>
<script setup lang="ts">
import {useMessage} from "@/hooks/web/useMessage";
import {nextTick, ref} from "vue";
import {Sku} from "@/views/business/dto/sku.dto";
import SkuTable from "@/views/business/admin/sku/components/skuTable.vue";
import TempSkuBulkForm from "@/views/business/admin/sku/components/tempSkuBulkForm.vue";

const { createMessage } = useMessage();
const emit = defineEmits(["submit", "error", "generate", "addMore"]);

const tempSkuBulkForm = ref<HTMLDivElement | null>(null);

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

function handleAddMore() {
  emit('addMore');
}
</script>
