<template>
  <Card title="Package status for last 15 days" :loading="loading">
    <div ref="chartRef" :style="{ width, height }"></div>
  </Card>
</template>
<script lang="ts" setup>
import {computed, onMounted, onUnmounted, Ref, ref, unref, watch} from 'vue';
import { Card } from 'ant-design-vue';
import { useECharts } from '/@/hooks/web/useECharts';
import {fetchPackageStatuses} from "@/views/dashboard/Analysis/api";

const props = defineProps({
  loading: Boolean,
  width: {
    type: String as PropType<string>,
    default: '100%',
  },
  height: {
    type: String as PropType<string>,
    default: '300px',
  },
  isEmployee: {
    type: Boolean,
  },
});

const ac = new AbortController();
const {signal} = ac;
onMounted(() => {
  loadPackages();
});
onUnmounted(() => {
  ac.abort();
})
const isEmployee = computed(() => {
  return props.isEmployee;
});
const chartRef = ref<HTMLDivElement | null>(null);
const { setOptions } = useECharts(chartRef as Ref<HTMLDivElement>);
watch(
  () => props.loading,
  () => {
    if (props.loading) {
      return;
    }
    setOptions({
      tooltip: {
        trigger: 'item',
      },

      series: [
        {
          name: 'Packages',
          type: 'pie',
          radius: '80%',
          center: ['50%', '50%'],
          color: ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9'],
          data: [
            { value: 500, name: '电子产品' },
            { value: 310, name: '服装' },
            { value: 274, name: '化妆品' },
            { value: 400, name: '家居' },
          ].sort(function (a, b) {
            return a.value - b.value;
          }),
          roseType: 'radius',
          animationType: 'scale',
          animationEasing: 'exponentialInOut',
          animationDelay: function () {
            return Math.random() * 400;
          },
        },
      ],
    });
  },
  { immediate: true }
);
async function loadPackages() {
  if(!unref(isEmployee)){
    return;
  }
  await fetchPackageStatuses(signal, handlePackageStatuses);
}
function handlePackageStatuses(res: any) {
  console.log(`Package statuses: ${JSON.stringify(res)}`);
}
</script>
