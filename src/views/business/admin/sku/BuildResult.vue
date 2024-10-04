<template>
  <div class="bg-white px-12 py-6">
    <Result
      status="success"
      :title="`${apiResponse.successes.length}/${apiResponse.successes.length + apiResponse.failures.length} Sku(s) successfully created`"
      sub-title="Now please sync the sku to the system"
    >
      <template #extra>
        <a-button type="primary" @click="handleSync"> {{ t('common.operation.sync') }} </a-button>
        <a-button @click="handleReload"> retour </a-button>
      </template>
    </Result>
    <a-collapse :bordered="false" class="w-full mb-6">
      <a-collapse-panel key="1">
        <template #header>
          <h2>API response's details</h2>
        </template>
        <div class="bg-white">
          <div class="grid grid-cols-2">
            <div class="p-6">
              <h3>Successes</h3>
              <ul class="columns-3">
                <li v-if="apiResponse.successes.length" v-for="(value, index) in apiResponse.successes">
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
                <li v-if="apiResponse.failures.length > 0" v-for="(value, index) in apiResponse.failures">
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
  </div>
</template>
<script setup lang="ts">
import { Result } from 'ant-design-vue';
import {inject, Ref} from "vue";
import {skuSyncApi} from "@/views/business/admin/sku/data";
import {useI18n} from "vue-i18n";

const { t } = useI18n();

const apiResponse = inject('apiResponse') as Ref<{successes:string[], failures:string[]}>;

async function handleSync() {
  console.log('sync');
  const skus = apiResponse.value.successes;
  await skuSyncApi(skus).then((res) => {
    console.log('res', res);
  });
}
function handleReload() {
  location.reload();
}
</script>
