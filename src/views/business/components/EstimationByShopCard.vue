<template>
  <a-card
    :bordered='false'
    :title='t("data.invoice.estimatedFeesForSelectedOrders")'
    :loading='!estimatesReady'
    style="width: 100%;">
    <div class="cardGridContainer">
      <p class="mt-4" style="width: 100%" v-if='props.estimation.length === 0'>{{t("data.invoice.noOrdersSelected")}}</p>
      <template v-for='item in props.estimation' style='width:20%;text-align:center'>
        <div class="fee-card" style="min-height: 170px">
          <div class="flex flex-col items-center head-info">
            <h1 class="text-md mt-2">{{item.shop}}</h1>
            <div class="flex justify-between w-full">
              <span class="text-md mt-2">{{ t('data.invoice.shippingFee')}} : </span>
              <span class="text-md mt-2">{{item?.shippingFeesEstimation}} €</span>
            </div>
            <div class="flex justify-between w-full">
              <span class="text-md mt-2">{{ t('data.invoice.purchaseFee')}} : </span>
              <span class="text-md mt-2">{{item?.purchaseEstimation}} €</span>
            </div>
            <div class="flex justify-between w-full">
              <span class="text-md mt-2">{{ t('data.invoice.total')}} : </span>
              <span class="text-md mt-2">{{item?.totalEstimation}} €</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import {estimation} from "@/views/business/dto/estimation.dto";
import {useI18n} from "vue-i18n";

const props = defineProps({
  estimation: {
    type: Array<estimation>,
    required: true
  },
  estimatesReady: {
    type: Boolean,
    required: true
  }
})
const { t } = useI18n()
</script>
