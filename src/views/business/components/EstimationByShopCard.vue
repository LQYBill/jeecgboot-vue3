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
              <div class="fee-amount mt-2">
                <span>{{ formatAmount(item?.shippingFeesEstimation) }} {{item?.currency}}</span>
                <span v-if="item?.currency !== 'EUR'" class="original-eur">
                  ({{ formatAmount(item?.shippingFeesEstimationEur) }} EUR)
                </span>
              </div>
            </div>
            <div class="flex justify-between w-full">
              <span class="text-md mt-2">{{ t('data.invoice.purchaseFee')}} : </span>
              <div class="fee-amount mt-2">
                <span>{{ formatAmount(item?.purchaseEstimation) }} {{item?.currency}}</span>
                <span v-if="item?.currency !== 'EUR'" class="original-eur">
                  ({{ formatAmount(item?.purchaseEstimationEur) }} EUR)
                </span>
              </div>
            </div>
            <div
              v-if="item?.domesticShippingFee !== undefined && item?.domesticShippingFee !== null"
              class="flex justify-between w-full"
            >
              <span class="text-md mt-2">{{ t('data.purchase.domesticShippingFeeTotal')}} : </span>
              <div class="fee-amount mt-2">
                <span>{{ formatAmount(item.domesticShippingFee) }} {{item?.currency}}</span>
                <span v-if="item?.currency !== 'EUR'" class="original-eur">
                  ({{ formatAmount(item?.domesticShippingFeeEur) }} EUR)
                </span>
              </div>
            </div>
            <div class="flex justify-between w-full">
              <span class="text-md mt-2">{{ t('data.invoice.total')}} : </span>
              <div class="fee-amount mt-2">
                <span>{{ formatAmount(item?.totalEstimation) }} {{item?.currency}}</span>
                <span v-if="item?.currency !== 'EUR'" class="original-eur">
                  ({{ formatAmount(item?.totalEstimationEur) }} EUR)
                </span>
              </div>
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
const formatAmount = (amount?: number) => Number(amount || 0).toFixed(2)
</script>

<style scoped>
.fee-amount {
  display: flex;
  flex-direction: column;
  min-width: 100px;
  margin-left: 12px;
  align-items: flex-end;
  text-align: right;
  font-size: 14px;
  line-height: 20px;
}

.original-eur {
  color: #8c8c8c;
  font-size: 11px;
  line-height: 16px;
  text-align: right;
}
</style>
