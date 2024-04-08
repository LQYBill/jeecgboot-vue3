<template>
  <Card :title="t('common.data.conversionRate')" :loading="loading">
    <div ref="chartRef" :style="{ width, height }"></div>
  </Card>
</template>
<script lang="ts" setup>
  import { Ref, ref, watch } from 'vue';
  import { Card } from 'ant-design-vue';
  import { useECharts } from '/@/hooks/web/useECharts';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
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
        legend: {
          bottom: 0,
          data: [t('common.data.access'), t('common.data.purchase')],
        },
        tooltip: {},
        radar: {
          radius: '60%',
          splitNumber: 8,
          indicator: [
            {
              name: t('common.data.computer'),
            },
            {
              name: t('common.data.charger'),
            },
            {
              name: t('common.data.earphone'),
            },
            {
              name: t('common.data.phone'),
            },
            {
              name: 'Ipad',
            },
            {
              name: t('common.data.earphone'),
            },
          ],
        },
        series: [
          {
            type: 'radar' as 'custom',
            symbolSize: 0,
            areaStyle: {
              shadowBlur: 0,
              shadowColor: 'rgba(0,0,0,.2)',
              shadowOffsetX: 0,
              shadowOffsetY: 10,
              opacity: 1,
            },
            data: [
              {
                value: [90, 50, 86, 40, 50, 20],
                name: t('common.data.access'),
                itemStyle: {
                  color: '#b6a2de',
                },
              },
              {
                value: [70, 75, 70, 76, 20, 85],
                name: t('common.data.purchase'),
                itemStyle: {
                  color: '#5ab1ef',
                },
              },
            ],
          },
        ],
      });
    },
    { immediate: true }
  );
</script>
