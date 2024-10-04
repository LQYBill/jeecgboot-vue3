<template>
  <PageWrapper title="Sku builder">
    <template #headerContent>
      <a-steps :current="current" :items="items" />
    </template>
    <Builder v-if="current == 0" @submit="handleSkuBuildSubmit"></Builder>
    <Review v-if="current == 1"></Review>
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

import { PageWrapper } from "/@/components/Page";
import {provide, ref} from "vue";
import { Sku } from "@/views/business/dto/sku.dto";
import { createMabangSkuApi } from "@/views/business/admin/sku/data";
import { useMessage } from "@/hooks/web/useMessage";

import Builder from "@/views/business/admin/sku/Builder.vue";
import Review from "@/views/business/admin/sku/Review.vue";
import BuildResult from "@/views/business/admin/sku/BuildResult.vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const { createMessage } = useMessage();

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

const nextButtonDisabled = ref(true);

const skuListResult = ref<Sku[]>([]);

const apiResponse = ref<{successes:string[], failures:string[]}>({successes: [], failures: []});

async function createSku() {
  await createMabangSkuApi(skuListResult.value).then((res) => {
    console.log('res', res);
    apiResponse.value['successes'] = res.successes;
    apiResponse.value['failures'] = res.failures;
    console.log('res', res);
  });
}

function handleSkuBuildSubmit(data: Sku[]) {
  skuListResult.value = data;
  nextButtonDisabled.value = false;
}
async function handlePublish() {
  await createSku().then(() => {
    current.value++;
    createMessage.success('Processing complete!');
  });
}
const next = () => {
  current.value++;
};
const prev = () => {
  current.value--;
};

provide('skuList', skuListResult);
provide('apiResponse', apiResponse);
</script>
<style>
.jeecg-page-wrapper-content .sku-builder-div .jeecg-basic-table div.ant-table-wrapper {
  border-radius: 0;
}
</style>
