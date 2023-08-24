<template>
  <PageWrapper title='Expenses Overview'>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <PopConfirmButton
        type="warning"
        title="Confirm making invoice ?"
        preIcon="ant-design:download-outlined"
        @confirm="makeInvoice"
        :disabled="invoiceDisabled"
        okText="ok" :loading="invoiceLoading"
        cancelText="Cancel"
        >
        {{ t("data.invoice.generateShippingInvoice") }}
        </PopConfirmButton>
      </template>
    </BasicTable>
  </PageWrapper>
</template>
<script lang="ts">

import {defineComponent, onMounted, ref} from "vue";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {useTable} from "/@/components/Table";
import {useI18n} from "/@/hooks/web/useI18n";
import {useMessage} from "/@/hooks/web/useMessage";
import PageWrapper from "/@/components/Page/src/PageWrapper.vue";
import {PopConfirmButton} from "/@/components/Button";
const { t } = useI18n();
const { createMessage } = useMessage();

export default defineComponent({
  components: {PopConfirmButton, PageWrapper, BasicTable},
  setup() {
    onMounted(()=> {

    });
    const invoiceDisabled = ref<boolean>(true);
    const invoiceLoading = ref<boolean>(false);
    const [registerTable, {reload}] = useTable({

    });
    function makeInvoice() {

    }
    return {
      reload,
      registerTable,
      makeInvoice,
      t,
      createMessage,
      invoiceDisabled,
      invoiceLoading,
    }
  }
})
</script>

<style>

</style>
