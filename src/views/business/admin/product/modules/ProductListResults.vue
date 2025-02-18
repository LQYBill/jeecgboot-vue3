<template>
  <section v-if="Object.keys(results).length > 0" class="bg-white border-l-4 border-l-amber blink">
    <a-collapse :bordered="false" class="w-full mb-6 bg-white">
      <a-collapse-panel key="1" class="items-center">
        <template #header>
          <h2 class="mb-0">{{ t('data.pageTitle.skuWeightEditResult') }}</h2>
        </template>
        <div class="bg-gray-50">
          <div class="grid grid-cols-2">
            <div>
              <h3 class="bg-lightGray w-full p-4">Successes</h3>
              <ul class="columns-3 p-6">
                <li v-if="Object.keys(results.successes).length > 0" v-for="(value, _index) in Object.keys(results.successes)" class="p-2 bg-lightGray rounded-2 break-inside-avoid-column mb-2">
                  {{ value }}
                  <a-tag color="success">
                    <template #icon>
                      <CheckCircleFilled/>
                    </template>
                    {{ t('data.database') }}
                  </a-tag>
                  <template v-for="(v, _i) in results.successes[value]" class="text-success">
                    <a-tag color="success">
                      <template #icon>
                        <CheckCircleFilled/>
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
                <li v-if="Object.keys(results.failures).length > 0" v-for="(value, _index) in Object.keys(results.failures)" class="p-2 bg-lightGray rounded-2 break-inside-avoid-column">
                  {{ value }}
                  <a-tag color="error">
                    <template #icon>
                      <CloseCircleFilled/>
                    </template>
                    {{ t('data.database') }}
                  </a-tag>
                  <template v-for="(v, _i) in results.failures[value]" class="text-error">
                    <a-tag color="error">
                      <template #icon>
                        <CloseCircleFilled/>
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
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue';


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
