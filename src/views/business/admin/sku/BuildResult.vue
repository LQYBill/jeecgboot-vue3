<template>
  <div class="bg-white px-12 py-6">
    <Result
      status="success"
      :title="`${Object.keys(apiResponse.successes).length}/${Object.keys(apiResponse.successes).length + Object.keys(apiResponse.failures).length} Sku(s) successfully created`"
      sub-title="Now please sync the sku to the system"
    >
      <template #extra>
        <a-button type="primary" @click="handleSync"> {{ t('common.operation.sync') }} </a-button>
        <a-button @click="handleReload"> {{ t('common.back') }} </a-button>
      </template>
    </Result>
    <a-collapse :bordered="false" class="w-full mb-6 bg-gray-100">
      <a-collapse-panel key="1">
        <template #header>
          <h2>API response's details</h2>
        </template>
        <div class="bg-white">
          <div class="grid grid-cols-2">
            <div class="p-6">
              <h3>Successes</h3>
              <ul class="columns-3">
                <li v-if="Object.keys(apiResponse.successes).length" v-for="(value, _index) in Object.keys(apiResponse.successes)">
                  {{ value }}
                </li>
                <li v-else>
                  None
                </li>
              </ul>
            </div>
            <div class="border-l p-6">
              <h3>Failures</h3>
              <ul>
                <li v-if="Object.keys(apiResponse.failures).length > 0" v-for="(value, _index) in Object.keys(apiResponse.failures)" class="bg-gray-100 flex p-2 rounded-2 mb-2 break-inside-avoid-column">
                  <strong class="flex-1 font-semibold">{{ value }}</strong>
                  <template v-if="apiResponse.failures[value].length > 0">
                    <ul class="list-disc flex-1">
                      <li v-for="(v, _i) in apiResponse.failures[value]">
                        {{ v }}
                      </li>
                    </ul>
                  </template>
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
  </div>
</template>
<script setup lang="ts">
import { Result } from 'ant-design-vue';
import {inject, Ref} from "vue";
import {skuSyncApi} from "@/views/business/admin/sku/data";
import {useI18n} from "vue-i18n";

const { t } = useI18n();

const apiResponse = inject('apiResponse') as Ref<{successes:Record<string, string[]>, failures:Record<string, string[]>}>;

async function handleSync() {
  const skus = Object.keys(apiResponse.value.successes);
  await skuSyncApi(skus);
}
function handleReload() {
  location.reload();
}
</script>
