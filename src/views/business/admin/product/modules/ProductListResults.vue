<template>
  <section v-if="Object.keys(results).length > 0" class="bg-white border-l-4 border-l-amber blink">
    <a-collapse :bordered="false" class="w-full mb-6 bg-white">
      <a-collapse-panel key="1" class="items-center">
        <template #header>
          <h2 class="mb-0">{{ t('data.pageTitle.skuWeightEditResult') }}</h2>
        </template>
        <div class="bg-gray-50">
          <div class="grid grid-cols-2">
            <div class="p-6">
              <h3>Successes</h3>
              <ul class="columns-3">
                <li v-if="results.successes.length > 0" v-for="(value, _index) in results.successes">
                  {{ value }}
                </li>
                <li v-else>
                  None
                </li>
              </ul>
            </div>
            <div class="border-l p-6">
              <h3>Failures</h3>
              <ul class="columns-2">
                <li v-if="results.failures.length > 0" v-for="(value, _index) in results.failures">
                  {{ value }}
                </li>
                <li v-else>
                  None
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

import {inject, Ref} from "vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const results = inject('results') as Ref<Recordable>;

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
