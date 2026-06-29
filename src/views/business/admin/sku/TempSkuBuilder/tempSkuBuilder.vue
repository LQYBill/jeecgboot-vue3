<template>
  <PageWrapper title="Temp Sku builder" v-if="userCode">
    <template #headerContent>
      <a-steps :current="current" :items="items" />
    </template>
    <tempBuilder ref="tempBuilderRef" v-if="current == 0" @generate="handleGenerate" @submit="handleSkuBuildSubmit" @error="handleError" @addMore="handleAddMore" @sync="handleDraftSync" @selectionChange="handleSelectionChange"></tempBuilder>
    <Review v-if="current == 1" @update="handleUpdateSku" @delete="handleDeleteSku"></Review>
    <BuildResult v-if="current == 2"></BuildResult>
    <div class="bg-white p-4 text-center mt-4 flex gap-2 justify-center">
      <a-button
        :disabled="current < 1"
        @click="prev"
        preIcon="ic:outline-arrow-circle-left"
        size="large"
      >
        {{ t('common.operation.previous') }}
      </a-button>
      <a-button
        :disabled="current !== 1 || currentFormSkuList.length === 0"
        type="primary"
        @click="handlePublish"
        size="large"
      >
        {{ t('common.operation.publish') }}
      </a-button>
      <a-button
        v-if="current == 0"
        type="primary"
        @click="next"
        :disabled="nextButtonDisabled"
        postIcon="ic:outline-arrow-circle-right"
        size="large"
      >
        {{ t('common.operation.next') }}
      </a-button>
    </div>
  </PageWrapper>
  <Result v-else :status="Number(ExceptionEnum.PAGE_NOT_FOUND)" :title="ExceptionEnum.PAGE_NOT_FOUND" :sub-title="t('sys.invoice.missingUserCode')">
    <template #extra>
      <a-button key="console" type="primary" @click="returnHome()"> {{ t('sys.exception.backHome') }} </a-button>
    </template>
  </Result>
</template>
<script lang="ts" setup>

import { PageWrapper } from "/src/components/Page";
import {onMounted, provide, ref} from "vue";
import { Sku } from "@/views/business/dto/sku.dto";
import {Api, createMabangSkuApi, fetchUserCode} from "@/views/business/admin/sku/data";
import { useMessage } from "@/hooks/web/useMessage";
import Review from "@/views/business/admin/sku/components/Review.vue";
import BuildResult from "@/views/business/admin/sku/BuildResult.vue";
import {useI18n} from "vue-i18n";
import TempBuilder from "@/views/business/admin/sku/TempSkuBuilder/tempBuilder.vue";
import {useMethods} from "@/hooks/system/useMethods";
import dayjs from "dayjs";
import {ExceptionEnum} from "/@/enums/exceptionEnum";
import {Result} from "ant-design-vue";

const { t } = useI18n();
const { createMessage } = useMessage();
const { handleExportXls } = useMethods();


const current = ref(0);
const tempBuilderRef = ref<InstanceType<typeof TempBuilder> | null>(null);
const steps = [
  {
    title: 'Build',
  },
  {
    title: 'Review',
  },
  {
    title: 'Publishing',
  }
];
const items = steps.map(item => ({ key: item.title, title: item.title }));

const isAddMore = ref(false);

const nextButtonDisabled = ref(true);

const currentFormSkuList = ref<Sku[]>([]);
const skuListResult = ref<Sku[]>([]);
const generatedSkuMap = ref(new Map<string, Sku>());
const skuDraftMap = ref(new Map<string, Sku>());
const tempSkuSearchState = ref<Recordable | null>(null);
const selectedSourceRows = ref<any[]>([]);
const selectedSourceRowKeys = ref<Array<string | number>>([]);

const userCode = ref();

const apiResponse = ref<{successes:string[], failures:string[]}>({successes: [], failures: []});

onMounted(async () => {
  await fetchUserCode().then((res) => {
    userCode.value = res;
  }).catch(e => {
    console.error('error', e);
  });
});

async function createSku() {
  await createMabangSkuApi(skuListResult.value).then((res) => {
    apiResponse.value['successes'] = res.successes;
    apiResponse.value['failures'] = res.failures;
  });
}

function handleGenerate(data: Sku[]) {
  currentFormSkuList.value = data;
  const nextGeneratedSkuMap = new Map(generatedSkuMap.value);
  data.forEach((sku) => {
    nextGeneratedSkuMap.set(String(sku.id), sku);
  });
  generatedSkuMap.value = nextGeneratedSkuMap;
  const nextDraftMap = new Map(skuDraftMap.value);
  data.forEach((sku) => {
    if (!nextDraftMap.has(String(sku.id))) {
      nextDraftMap.set(String(sku.id), sku);
    }
  });
  skuDraftMap.value = nextDraftMap;
  nextButtonDisabled.value = true;
}
function handleSkuBuildSubmit(data: Sku[]) {
  currentFormSkuList.value = data;
  const nextGeneratedSkuMap = new Map(generatedSkuMap.value);
  const nextDraftMap = new Map(skuDraftMap.value);
  data.forEach((sku) => {
    nextGeneratedSkuMap.set(String(sku.id), sku);
    nextDraftMap.set(String(sku.id), sku);
  });
  generatedSkuMap.value = nextGeneratedSkuMap;
  skuDraftMap.value = nextDraftMap;
  if (isAddMore.value) {
    const skuMap = new Map(skuListResult.value.map(sku => [sku.id, sku]));
    data.forEach((sku) => {
      skuMap.set(sku.id, sku);
    });
    skuListResult.value = Array.from(skuMap.values());
  } else {
    skuListResult.value = [...data];
  }
  nextButtonDisabled.value = false;
}
function handleDraftSync(data: Sku[]) {
  const nextDraftMap = new Map(skuDraftMap.value);
  data.forEach((sku) => {
    nextDraftMap.set(String(sku.id), sku);
  });
  skuDraftMap.value = nextDraftMap;
  const selectedIds = new Set(currentFormSkuList.value.map((sku) => String(sku.id)));
  skuListResult.value = skuListResult.value.map((sku) => {
    const id = String(sku.id);
    if (!selectedIds.has(id)) {
      return sku;
    }
    return nextDraftMap.get(id) ?? sku;
  });
}
function handleSelectionChange(records: any[]) {
  if (current.value !== 0) {
    return;
  }
  selectedSourceRows.value = [...records];
  selectedSourceRowKeys.value = records.map((record) => record.id);
  const nextGeneratedSkuMap = new Map(generatedSkuMap.value);
  const nextDraftMap = new Map(skuDraftMap.value);
  const nextList = records
    .map((record) => {
      const key = String(record.erpCode);
      const autoGeneratedSku = record.__buildSku as Sku | undefined;
      if (autoGeneratedSku && !nextGeneratedSkuMap.has(key)) {
        nextGeneratedSkuMap.set(key, autoGeneratedSku);
      }
      if (autoGeneratedSku && !nextDraftMap.has(key)) {
        nextDraftMap.set(key, autoGeneratedSku);
      }
      return nextDraftMap.get(key) ?? nextGeneratedSkuMap.get(key) ?? autoGeneratedSku;
    })
    .filter(Boolean) as Sku[];
  generatedSkuMap.value = nextGeneratedSkuMap;
  skuDraftMap.value = nextDraftMap;
  currentFormSkuList.value = nextList;
  skuListResult.value = nextButtonDisabled.value ? nextList : nextList.map((sku) => skuDraftMap.value.get(String(sku.id)) ?? sku);
  nextButtonDisabled.value = nextList.length === 0;
}
function handleUpdateSku({id, data}) {
  skuListResult.value = skuListResult.value.map((item) => {
    if(item.id === id) {
      return {
        ...item,
        ...data
      };
    }
    return item;
  });
  currentFormSkuList.value = [...skuListResult.value];
  const nextDraftMap = new Map(skuDraftMap.value);
  currentFormSkuList.value.forEach((sku) => {
    nextDraftMap.set(String(sku.id), sku);
  });
  skuDraftMap.value = nextDraftMap;
}
function handleDeleteSku(id: string) {
  skuListResult.value = skuListResult.value.filter((item) => item.id !== id);
  currentFormSkuList.value = [...skuListResult.value];
  selectedSourceRows.value = selectedSourceRows.value.filter((record) => String(record.erpCode) !== String(id));
  selectedSourceRowKeys.value = selectedSourceRows.value.map((record) => record.id);
  skuDraftMap.value.delete(String(id));
  generatedSkuMap.value.delete(String(id));
  if(currentFormSkuList.value.length === 0)
    nextButtonDisabled.value = true;
}
async function handlePublish() {
  await createSku().then(async () => {
    current.value++;

    let exportParams = {};
    exportParams['selections'] = skuListResult.value;
    const today = dayjs().format('YYYY-MM-DD');
    await handleExportXls('new_skus_' + today, Api.EXCEL_EXPORT_MABANG_CREATED_SKU,exportParams)
      .then(() => {
        createMessage.success('Excel exported successfully!');
      }).catch((e) => {
        console.error('error', e);
      });
  });
}

function handleError() {
  nextButtonDisabled.value = true;
}

const next = async () => {
  const passed = await tempBuilderRef.value?.validateBeforeNext?.();
  if (!passed) {
    return;
  }
  current.value++;
  currentFormSkuList.value = [...skuListResult.value];
  isAddMore.value = false;
};
const prev = () => {
  current.value--;
  currentFormSkuList.value = [...skuListResult.value];
  isAddMore.value = false;
};

function handleAddMore() {
  isAddMore.value = true;
}
provide('isAddMore', isAddMore);
provide('skuList', skuListResult);
provide('apiResponse', apiResponse);
provide('currentFormSkuList', currentFormSkuList);
provide('userCode', userCode);
provide('tempSkuSearchState', tempSkuSearchState);
provide('selectedSourceRowKeys', selectedSourceRowKeys);
</script>
<style>
.jeecg-page-wrapper-content .sku-builder-div .jeecg-basic-table div.ant-table-wrapper {
  border-radius: 0;
}
</style>
