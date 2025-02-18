<template>
  <PageWrapper title="Temp Sku builder">
    <template #headerContent>
      <a-steps :current="current" :items="items" />
    </template>
    <tempBuilder v-if="current == 0" @generate="handleGenerate" @submit="handleSkuBuildSubmit" @error="handleError" @addMore="handleAddMore"></tempBuilder>
    <Review v-if="current == 1" @update="handleUpdateSku"></Review>
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
        :disabled="current !== 1"
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
</template>
<script lang="ts" setup>

import { PageWrapper } from "/src/components/Page";
import {provide, ref} from "vue";
import { Sku } from "@/views/business/dto/sku.dto";
import {Api, createMabangSkuApi} from "@/views/business/admin/sku/data";
import { useMessage } from "@/hooks/web/useMessage";
import Review from "@/views/business/admin/sku/components/Review.vue";
import BuildResult from "@/views/business/admin/sku/BuildResult.vue";
import {useI18n} from "vue-i18n";
import TempBuilder from "@/views/business/admin/sku/TempSkuBuilder/tempBuilder.vue";
import {useMethods} from "@/hooks/system/useMethods";
import dayjs from "dayjs";

const { t } = useI18n();
const { createMessage } = useMessage();
const { handleExportXls } = useMethods();


const current = ref(0);
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

const apiResponse = ref<{successes:string[], failures:string[]}>({successes: [], failures: []});

async function createSku() {
  await createMabangSkuApi(skuListResult.value).then((res) => {
    apiResponse.value['successes'] = res.successes;
    apiResponse.value['failures'] = res.failures;
  });
}

function handleGenerate(data: Sku[]) {
  currentFormSkuList.value = data;
  nextButtonDisabled.value = true;
}
function handleSkuBuildSubmit(data: Sku[]) {
  currentFormSkuList.value = data;
  const skuMap = new Map(skuListResult.value.map(sku => [sku.id, sku]));
  // Merge or replace items
  data.forEach(sku => {
    skuMap.set(sku.id, sku);
  });
  skuListResult.value = Array.from(skuMap.values());
  nextButtonDisabled.value = false;
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

const next = () => {
  current.value++;
  currentFormSkuList.value = [...skuListResult.value];
  isAddMore.value = false;
};
const prev = () => {
  current.value--;
  isAddMore.value = false;
};

function handleAddMore() {
  isAddMore.value = true;
}
provide('isAddMore', isAddMore);
provide('skuList', skuListResult);
provide('apiResponse', apiResponse);
provide('currentFormSkuList', currentFormSkuList);
</script>
<style>
.jeecg-page-wrapper-content .sku-builder-div .jeecg-basic-table div.ant-table-wrapper {
  border-radius: 0;
}
</style>
