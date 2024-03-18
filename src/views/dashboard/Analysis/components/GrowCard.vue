<template>
  <div class="md:flex">
    <template v-for="(item, index) in growCardList" :key="item.title">
      <Card
        size="small"
        :loading="loading"
        :title="t(item.title)"
        class="md:w-1/4 w-full !md:mt-0 !mt-4 kpi"
        :class="[index + 1 < 4 && '!md:mr-4']"
        :canExpan="false"
      >
        <template #extra>
          <Tag :color="item.color" :class="item.tagclass">{{ t(item.action) }}</Tag>
        </template>

        <div class="py-4 px-4 flex justify-between items-center">
          <div class="flex flex-col flex-2 justify-start items-start">
            <div class="flex flex-row flex-wrap items-end justify-start">
              <CountTo :prefix="item.prefix" :suffix="item.suffix" :startVal="1" :endVal="item.value" class="text-3xl font-bold kpi-number kpi-number-main duck--color leading-full" />
              <span :class="[item.growthQty > 0 ? 'text-growth kpi-growth-pos' : 'text-error kpi-growth-neg']" class="kpi-growth">{{ item.growthQty }}%</span>
            </div>
            <span class="font-light"> {{t(item.suffixText)}}</span>
          </div>
          <div class="flex-1">
            <Icon v-if="!!item.icon" :icon="item.icon" :size="40" />
            <component :is="components[item.svg]" :key="item.svg"/>
          </div>
        </div>

        <div class="p-2 px-4 flex justify-between items-center w-full">
          <span class="text-primary">{{ t(item.totalTitle).toUpperCase() }} : </span>
          <div class="flex justify-start items-end" :class="!!item.growthTotal ? 'mr-4' : ''">
            <CountTo :prefix="item.totalPrefix" :suffix="item.totalSuffix" :startVal="1" :endVal="item.total" class="kpi-number leading-full"/>
            <span v-if="!!item.growthTotal" :class="[item.growthTotal > 0 ? 'text-growth kpi-growth-pos' : 'text-error kpi-growth-neg']" class="kpi-growth kpi-growth-small">{{ item.growthQty }}%</span>
          </div>
        </div>
      </Card>
    </template>
  </div>
</template>
<script lang="ts" setup>
  import { CountTo } from '/@/components/CountTo';
  import { Icon } from '/@/components/Icon';
  import { Tag, Card } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {computed, onMounted, ref, unref} from "vue";
  import {fetchKpis} from "/@/views/dashboard/Analysis/api";
  import ShippingInvoiceIcon from "./Icons/ShippingInvoiceIcon.vue";
  import PurchaseInvoiceIcon from "./Icons/PurchaseInvoiceIcon.vue";
  import OrdersIcon from "./Icons/OrdersIcon.vue";
  const { t } = useI18n();
  const props = defineProps({
    loading: {
      type: Boolean,
    },
    isEmployee: {
      type: Boolean,
    },
  });
  const components = {
    ShippingInvoiceIcon,
    PurchaseInvoiceIcon,
    OrdersIcon,
  };
  const isEmployee = computed(() => {
    return props.isEmployee;
  });

  const growCardList = ref<any[]>([]);
  const kpiList = ref<any[]>([]);
  onMounted(() => {
    loadKpis();
  })
  async function loadKpis() {
    await fetchKpis(computed(()=> unref(isEmployee)), handleKpis);
  }
  function handleKpis(res: any) {
    console.log("res res")
    console.log(res);
    kpiList.value = res;
    growCardList.value.push({
      title: 'data.invoice.shippingInvoice',
      value: kpiList.value['shippingInvoices'].qty,
      color: '',
      tagclass: 'ant-tag-duck',
      action: 'chart.period.past12Months',
      svg: 'ShippingInvoiceIcon',
      prefix: '',
      suffix: '',
      suffixText: 'chart.created',
      totalTitle: 'common.data.total',
      total: kpiList.value['shippingInvoices'].total,
      totalPrefix: '',
      totalSuffix: '€',
      growthTotal: kpiList.value['shippingInvoices'].growthTotal,
      growthQty: kpiList.value['shippingInvoices'].growthQty,
    });
    growCardList.value.push({
      title: 'data.invoice.purchaseInvoice',
      value: kpiList.value['purchaseInvoices'].qty,
      color: '',
      tagclass: 'ant-tag-duck',
      action: 'chart.period.past12Months',
      svg: 'PurchaseInvoiceIcon',
      prefix: '',
      suffix: '',
      suffixText: 'chart.created',
      totalTitle: 'common.data.total',
      total: kpiList.value['purchaseInvoices'].total,
      totalPrefix: '',
      totalSuffix: '€',
      growthTotal: kpiList.value['purchaseInvoices'].growthTotal,
      growthQty: kpiList.value['purchaseInvoices'].growthQty,

    });
    growCardList.value.push({
      title: 'chart.orders',
      value: kpiList.value['platformOrders'].processed,
      color: '',
      tagclass: 'ant-tag-duck',
      action: 'chart.period.past12Months',
      svg: 'OrdersIcon',
      prefix: '',
      suffix: '',
      suffixText: 'chart.processed',
      totalTitle: 'chart.beingProcessed',
      total: kpiList.value['platformOrders'].processing,
      totalPrefix: '',
      totalSuffix: '',
      growthQty: kpiList.value['platformOrders'].growth,
    });
    // growCardList.value.push({
    //   title: 'chart.shippingInvoiceCreated',
    //   icon: 'visit-count|svg',
    //   value: shippingInvoices.value,
    //   total: shippingInvoices.value,
    //   color: 'green',
    //   action: 'chart.period.past12Months',
    // });
  }
</script>
