<template>
  <div class="bg-white border-l-4 border-l-amber blink" v-if="Object.keys(apiResponse).length > 0">
    <a-collapse :bordered="false" class="w-full mb-6 bg-white">
      <a-collapse-panel key="1" class="items-center">
        <template #header>
          <h2 class="mb-0">{{ t('data.pageTitle.createOrEditPurchaseResult') }}</h2>
        </template>
        <div class="bg-gray-50">
          <div v-for="(value, index) in apiResponse">
            <h3 v-if="isInvoiceNumber(index)" class="bg-gray-200 p-4">{{ t('data.invoice.invoiceNumber')}} : <span class="border rounded-2 border-gray-500 p-2 bg-white">{{ index }}</span></h3>
            <h3 v-else-if="index == 'groupIdDelete'" class="bg-gray-200 p-4">{{ t('data.purchase.groupIdDeleteResults') }}</h3>
            <h3 v-else class="bg-gray-200 p-4">
              <template v-for="(v, _i) in index.split(':')">
                <template v-if="v.trim() == 'orderUpdate'">
                  {{ t('data.purchase.orderUpdate') }} :
                </template>
                <template v-else-if="v.trim() == 'orderIdUpdate'">
                  {{ t('data.purchase.orderIdUpdate') }} :
                </template>
                <template v-else-if="isInvoiceNumber(v.trim())">
                  <span class="border rounded-2 border-gray-500 p-2 bg-white">{{ v }}</span>
                </template>
                <template v-else>
                  {{ index }}
                </template>
              </template>
            </h3>
            <div class="grid grid-cols-2">
              <div class="p-6">
                <h3>Successes</h3>
                <ul class="columns-3">
                  <li v-if="value.successes.length" v-for="(v, _index) in value.successes">
                    <a-tag color="green">{{ v }}</a-tag>
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
import {isInvoiceNumber} from "@/views/business/admin/purchasing/PurchaseOrder.data";

const { t } = useI18n();

const apiResponse = inject('apiResponse') as Ref<Recordable>;


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
