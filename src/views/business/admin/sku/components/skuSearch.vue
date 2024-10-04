<template>
  <section class="bg-white p-4 mb-4">
    <h2>1. Sku search</h2>
    <a-form>
      <a-row>
        <a-col>
          <a-form-item>
            <div class="flex">
              <a-input
                v-model:value="searchState"
                allowClear
                @change="handleSearchChange"
                ref="searchInput"
              />
              <a-button
                type="primary"
                @click="beforeSearch"
                preIcon="ic:baseline-search"
                :disabled="searchDisabled"
              >
                Search
              </a-button>
            </div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <BasicTable @register="registerTable">
      <template #image="{ text }">
            <span v-if="!text" class="italic text-cs">
              {{ t("data.upload.noDocument") }}
            </span>
        <TableImg v-else :size="60" :imgList="[text]"/>
      </template>
      <template #action="{ record }">
        <TableAction
          :actions="[
            {
              onClick: handleCopy.bind(null, record),
              icon: 'clarity:copy-line',
            },
          ]"
          :drop-down-actions="[
            {
              label: t('common.operation.edit'),
              icon: 'clarity:note-edit-line',
              onClick: handleEdit.bind(null, record),
            },
            {
              label: t('common.operation.delete'),
              icon: 'ic:outline-delete-outline',
              popConfirm: {
                title: t('common.operation.deleteConfirmation'),
                confirm: handleDelete.bind(null, record),
              },
            },
          ]"
        />

      </template>

      <template v-slot:weightEffectDate="record">
        <time :datetime="record.text"><span>{{ record.text.split(' ')[0] }}</span><br/><span class="font-extralight">{{ record.text.split(' ')[1] }}</span></time>
      </template>
    </BasicTable>
  </section>
</template>
<script setup lang="ts">
import { BasicTable, TableImg, TableAction, useTable } from "@/components/Table";
import { useI18n } from "@/hooks/web/useI18n";
import {onUnmounted, ref} from "vue";
import { searchExistingSkuApi, tableColumns } from "@/views/business/admin/sku/data";
import {Sku} from "@/views/business/dto/sku.dto";

const { t } = useI18n();
const emits = defineEmits(["change", "search", "beforeSearch", "copy"]);

const MIN_KEYWORD_LENGTH = 2;
const searchState = ref<string>();

const searchInput = ref();
const skuListResult = ref<Sku[]>([]);
const copiedRecord = ref<Sku>();

const searchDisabled = ref(true);

let ac = new AbortController();
const signal = ref(ac.signal);

onUnmounted(() => {
  ac.abort(t('sys.api.abortController.onUnmount'));
})
const [registerTable] = useTable({
  columns: tableColumns,
  dataSource: skuListResult,
  ellipsis: false,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  rowKey: 'id',
});

async function handleSearchChange(e: Event) {
  ac.abort();
  ac = new AbortController();
  signal.value = ac.signal;
  searchState.value = e.target ? (e.target as HTMLInputElement).value : undefined;
  await beforeSearch();
}
async function beforeSearch() {
  if(!!searchState.value) {
    // works for both chinese and english
    //\u00ff-\uffff part of the regex is a Unicode character range
    const wordRegex = new RegExp(/[\u00ff-\uffff]|\S+/g);
    const matches = searchState.value.match(wordRegex);
    if(!matches) {
      return;
    }
    if(matches.length < MIN_KEYWORD_LENGTH) {
      searchDisabled.value = true;
      return;
    }
    searchDisabled.value = false;
    await search();
  }
  else {
    skuListResult.value = [];
  }
}
async function search() {
  console.log('search expression', searchState.value);
  await searchExistingSkuApi(searchState.value!, signal.value).then((res) => {
    console.log('search result', res);
    skuListResult.value = res;
  })
}

function handleEdit(record:Sku) {
  console.log('edit', record);
}
function handleCopy(record:Sku) {
  console.log('copy', record);
  copiedRecord.value = record;
  emits("copy", copiedRecord);
}
function handleDelete(record:Sku) {
  console.log('delete', record);
}
</script>
