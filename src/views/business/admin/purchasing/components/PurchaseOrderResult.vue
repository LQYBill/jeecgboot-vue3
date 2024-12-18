<template>
  <div class="bg-white px-12 py-6" v-if="Object.keys(apiResponse).length > 0">
    <a-collapse :bordered="false" class="w-full mb-6">
      <a-collapse-panel key="1">
        <template #header>
          <h2>{{ t('data.pageTitle.createPurchaseResult') }}</h2>
        </template>
        <div class="bg-white">
          <div v-for="(value, index) in apiResponse">
            <h3 v-if="index == 'groupIdDelete'" class="bg-gray-200 p-4">{{ t('data.purchase.groupIdDeleteResults') }}</h3>
            <h3 v-else class="bg-gray-200 p-4">{{ t('data.invoice.invoiceNumber')}} : <span class="border rounded-2 border-gray-500 p-2 bg-white">{{ index }}</span></h3>
            <div class="grid grid-cols-2">
              <div class="p-6">
                <h3>Successes</h3>
                <ul class="columns-3">
                  <li v-if="value.successes.length" v-for="(v, _index) in value.successes">
                    {{ v }}
                  </li>
                  <li v-else>
                    None
                  </li>
                </ul>
              </div>
              <div class="border-l p-6">
                <h3>Failures</h3>
                <ul class="columns-1">
                  <li v-if="value.failures.length > 0" v-for="(v, _index) in value.failures">
                    {{ v }}
                  </li>
                  <li v-else>
                    None
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script setup lang="ts">
import {inject, Ref} from "vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n();

const apiResponse = inject('apiResponse') as Ref<Recordable>;


</script>
