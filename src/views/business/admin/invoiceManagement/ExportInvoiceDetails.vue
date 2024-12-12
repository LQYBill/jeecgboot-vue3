<template>
  <PageWrapper title="Export details">
    <search-form @search="handleSearch"/>
  </PageWrapper>
</template>
<script setup lang="ts">
import {PageWrapper} from "@/components/Page";
import {onMounted, provide, reactive, Ref, ref} from "vue";
import {
  fetchClientList,
  downloadInvoiceDetails,
} from "./data/ExportDetails.data";
import SearchForm from "./components/SearchForm.vue";
import {JSearchSelectOption} from "@/views/business/dto/JSearchSelectOption.dto";

const clientList: Ref<Recordable[]> = ref([]);
const clientOptions: Ref<JSearchSelectOption[]> = ref([]);

const searchState = reactive<Record<string, string>>({
  client: '',
  shops: '',
  date: '',
  type: '',
});

onMounted(async () => {
  await fetchClientList(handleFetchClientList);
});

function handleFetchClientList(res: Recordable[]) {
  clientList.value = res;
  clientOptions.value = res.map((client) => ({
    text: `${client.firstName} ${client.surname} (${client.internalCode})`,
    value: client.id,
  })) as JSearchSelectOption[];
}

async function handleSearch(state: Recordable) {
  console.log("search", state);
  searchState.client = state.client;
  searchState.shops = state.shops;
  searchState.date = state.date;
  searchState.type = state.type;
  const params = buildParams();
  await downloadInvoiceDetails(params, handleDownloadInvoiceDetails);
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
function handleDownloadInvoiceDetails() {
  console.log("fetchInvoiceDetails");
}
provide('clientOptions', clientOptions);
</script>
