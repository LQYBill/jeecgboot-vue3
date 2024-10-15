<template>
  <PageWrapper :title="t('data.pageTitle.shoumanOrderPage')">

    <template #footer>
      <a-tabs default-active-key="1" type="card">
        <a-tab-pane key="1" :tab="t('data.shouman.orderToPlace')">
          <OrdersToPlace/>
        </a-tab-pane>
      </a-tabs>
    </template>

  </PageWrapper>
</template>

<script setup lang="ts">
import {PageWrapper} from "@/components/Page";
import {useI18n} from "@/hooks/web/useI18n";
import OrdersToPlace from "@/views/business/admin/shouman/OrdersToPlace.vue";
const { t } = useI18n();
</script>

<style scoped lang="less">

</style>
