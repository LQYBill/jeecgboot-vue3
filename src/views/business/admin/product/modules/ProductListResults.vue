<template>
  <section v-if="hasResultsToShow" class="bg-white border-l-4 border-l-amber blink">
    <a-collapse :bordered="false" class="w-full mb-6 bg-white">
      <!-- DATABASE results -->
      <a-collapse-panel key="1" class="items-center" v-if="sortedSuccessKeys.length > 0 || sortedFailureKeys.length > 0">
        <template #header>
          <h2 class="mb-0">{{ t('data.pageTitle.skuWeightEditResult') }}</h2>
        </template>
        <div class="bg-gray-50">
          <div class="grid grid-cols-2">
            <div>
              <h3 class="bg-lightGray w-full p-4">Successes</h3>
              <ul class="columns-3 p-6">
                <li v-if="sortedSuccessKeys.length > 0"
                    v-for="(key, _index) in sortedSuccessKeys"
                    class="p-2 bg-lightGray rounded-2 break-inside-avoid-column mb-2">
                  {{ key }}
                  <a-tag color="success">
                    <template #icon><CheckCircleFilled /></template>
                    {{ t('data.database') }}
                  </a-tag>
                  <template v-for="(v, _i) in results.successes[key]" class="text-success">
                    <a-tag :color="/跳过/.test(v) ? 'orange' : 'success'">
                      <template #icon>
                        <component :is="/跳过/.test(v) ? WarningFilled : CheckCircleFilled" />
                      </template>
                      {{ v }}
                    </a-tag>
                  </template>
                </li>
                <li v-else>
                  <span class="font-italic text-gray-400">None</span>
                </li>
              </ul>
            </div>
            <div class="border-l">
              <h3 class="bg-lightGray w-full p-4">Failures</h3>
              <ul class="columns-2 p-6">
                <li v-if="sortedFailureKeys.length > 0"
                    v-for="(key, _index) in sortedFailureKeys"
                    class="p-2 bg-lightGray rounded-2 break-inside-avoid-column">
                  {{ key }}
                  {{ JSON.stringify(key) }}
                  <a-tag color="error">
                    <template #icon><CloseCircleFilled /></template>
                    {{ t('data.database') }}
                  </a-tag>
                  <template v-for="(v, _i) in results.failures[key]" class="text-error">
                    <a-tag color="error">
                      <template #icon><CloseCircleFilled /></template>
                      {{ v }}
                    </a-tag>
                  </template>
                </li>
                <li v-else>
                  <span class="font-italic text-gray-400">None</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </a-collapse-panel>
      <!-- Mabang results -->
      <a-collapse-panel key="2" class="items-center" v-if="sortedMabangSuccessKeys.length > 0 || sortedMabangFailureKeys.length > 0">
        <template #header>
          <h2 class="mb-0">马帮处理结果</h2>
        </template>
        <div class="bg-gray-50">
          <div class="grid grid-cols-2">
            <div>
              <h3 class="bg-lightGray w-full p-4">Successes</h3>
              <ul class="columns-3 p-6">
                <li v-if="sortedMabangSuccessKeys.length > 0"
                    v-for="(key, _index) in sortedMabangSuccessKeys"
                    class="p-2 bg-lightGray rounded-2 break-inside-avoid-column mb-2">
                  {{ key }}
                  <a-tag color="success">
                    <template #icon><CheckCircleFilled /></template>
                    马帮
                  </a-tag>
                  <template v-for="(v, _i) in mabangResults.successes[key]" class="text-success">
                    <a-tag :color="/跳过/.test(v) ? 'orange' : 'success'">
                      <template #icon>
                        <component :is="/跳过/.test(v) ? WarningFilled : CheckCircleFilled" />
                      </template>
                      {{ v }}
                    </a-tag>
                  </template>
                </li>
                <li v-else>
                  <span class="font-italic text-gray-400">None</span>
                </li>
              </ul>
            </div>
            <div class="border-l">
              <h3 class="bg-lightGray w-full p-4">Failures</h3>
              <ul class="columns-2 p-6">
                <li v-if="sortedMabangFailureKeys.length > 0"
                    v-for="(key, _index) in sortedMabangFailureKeys"
                    class="p-2 bg-lightGray rounded-2 break-inside-avoid-column">
                  {{ key }}
                  <a-tag color="error">
                    <template #icon><CloseCircleFilled /></template>
                    马帮
                  </a-tag>
                  <template v-for="(v, _i) in mabangResults.failures[key]" class="text-error">
                    <a-tag color="error">
                      <template #icon><CloseCircleFilled /></template>
                      {{ v }}
                    </a-tag>
                  </template>
                </li>
                <li v-else>
                  <span class="font-italic text-gray-400">None</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </a-collapse-panel>

    </a-collapse>
  </section>
</template>
<script lang="ts" setup>

import {inject, computed} from "vue";
import {useI18n} from "vue-i18n";
import { CheckCircleFilled, CloseCircleFilled, WarningFilled } from '@ant-design/icons-vue';

const { t } = useI18n();
const results = inject('results') as {
  successes: Record<string, string>;
  failures: Record<string, string>;
};
const mabangResults = inject('mabangResults') as {
  successes: Record<string, string>;
  failures: Record<string, string>;
};
const hasResultsToShow = computed(() => {
  const success = results?.successes || {};
  const failure = results?.failures || {};
  const mabangSuccess = mabangResults?.successes || {};
  const mabangFailure = mabangResults?.failures || {};
  return (
    Object.keys(success).length > 0 ||
    Object.keys(failure).length > 0 ||
    Object.keys(mabangSuccess).length > 0 ||
    Object.keys(mabangFailure).length > 0
  );
});
const sortedSuccessKeys = computed(() => {
  return Object.keys(results.successes || {}).sort((a, b) => a.localeCompare(b));
});
const sortedFailureKeys = computed(() => {
  return Object.keys(results.failures || {}).sort((a, b) =>
    parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, ''))
  );
});
const sortedMabangSuccessKeys = computed(() => {
  return Object.keys(mabangResults.successes || {}).sort((a, b) =>
    parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, ''))
  );
});
const sortedMabangFailureKeys = computed(() => {
  return Object.keys(mabangResults.failures || {}).sort((a, b) =>
    parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, ''))
  );
});
</script>
<style scoped>
.blink {
  animation: blinker 2s linear 1s;
}
@keyframes blinker {
  0% {
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
