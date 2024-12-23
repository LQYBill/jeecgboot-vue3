<template>
  <PageWrapper title="Export details">
    <search-form @search="handleSearch"/>
  </PageWrapper>
</template>
<script setup lang="ts">
import {PageWrapper} from "@/components/Page";
import {onBeforeMount, provide, reactive} from "vue";
import {
  downloadInvoiceDetails, useClient,
} from "./data/ExportDetails.data";
import SearchForm from "./components/SearchForm.vue";

const { clientOptions, internalUse, initialize } = useClient();

const searchState = reactive<Record<string, string>>({
  client: '',
  shops: '',
  date: '',
  type: '',
});

onBeforeMount(async () => {
  await initialize();
});

async function handleSearch(state: Recordable) {
  searchState.client = state.client;
  searchState.shops = state.shops;
  searchState.date = state.date;
  searchState.type = state.type;
  const params = buildParams();
  await downloadInvoiceDetails(params);
}
function buildParams() {
  const startDate = searchState.date.split(',')[0];
  const endDate = searchState.date.split(',')[1];
  return {
    clientId: searchState.client,
    shopIds: searchState.shops.split(','),
    startDate,
    endDate,
    type: searchState.type,
  };
}
provide('clientOptions', clientOptions);
provide('internalUse', internalUse);
</script>
