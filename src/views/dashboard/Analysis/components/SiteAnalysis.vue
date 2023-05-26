<template>
  <Card :tab-list="tabListTitle" v-bind="$attrs" :active-tab-key="activeKey" @tabChange="onTabChange">
    <p v-if="activeKey === 'tab1'">
      <VisitAnalysis />
    </p>
    <p v-if="activeKey === 'tab2'">
      <VisitAnalysisBar />
    </p>
  </Card>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { Card } from 'ant-design-vue';
  import VisitAnalysis from './VisitAnalysis.vue';
  import VisitAnalysisBar from './VisitAnalysisBar.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const activeKey = ref('tab1');

  const tabListTitle = [
    {
      key: 'tab1',
      tab: t('common.data.traffic'),
    },
    {
      key: 'tab2',
      tab: t('common.data.visits'),
    },
  ];

  function onTabChange(key) {
    activeKey.value = key;
  }
</script>
