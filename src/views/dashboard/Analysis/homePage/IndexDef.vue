<template>
  <div class="p-4">
    <GrowCard :loading="loading" class="enter-y" :isEmployee="test"/>
    <SiteAnalysis class="!my-4 enter-y" :loading="loading" />
    <div class="md:flex enter-y">
      <VisitRadar class="md:w-1/3 w-full" :loading="loading" />
      <VisitSource class="md:w-1/3 !md:mx-4 !md:my-0 !my-4 w-full" :loading="loading" />
      <SalesProductPie class="md:w-1/3 w-full" :loading="loading" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import {computed, ref} from 'vue';
  import GrowCard from '../components/GrowCard.vue';
  import SiteAnalysis from '../components/SiteAnalysis.vue';
  import VisitSource from '../components/VisitSource.vue';
  import VisitRadar from '../components/VisitRadar.vue';
  import SalesProductPie from '../components/SalesProductPie.vue';

  const loading = ref(true);

  const props = defineProps({
    isEmployee: {
      type: Boolean,
    },
  })
  const test = computed(() => {
    return props.isEmployee;
  })
  setTimeout(() => {
    loading.value = false;
  }, 500);
</script>
