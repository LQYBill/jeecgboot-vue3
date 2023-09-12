<template>
  <PageWrapper title='Expenses Overview'>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <PopConfirmButton
        type="warning"
        shape="round"
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
      <template v-slot:transactionType="record">
        <Tag
          :color="record.record.type === 'Credit' ? 'green' : 'yellow'"
        >
          {{ record.record.type }}
        </Tag>
      </template>
      <template v-slot:invoiceNumber="record">
        <a-button
          v-if="!!record.record.invoiceNumber"
          type="primary"
          preIcon="ant-design:eye-outlined"
          @click="openInvoice(record.record)"
          shape="round"
        >
          {{ record.record.invoiceNumber }}
        </a-button>
      </template>
      <template v-slot:amount="record">
        <Tag
            v-if="record.record.type == 'Credit'"
            color="green"
        >
            +{{ record.record.amount }}
        </Tag>
        <span v-else>
          -{{ record.record.amount }}
        </span>
      </template>
      <template #imgs="{ text }">
        <TableImg
          v-if="!!text"
          :size="60"
          :imgList="[imgHost+imgPath+text]"
        />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
<script lang="ts">

import {defineComponent, onMounted, ref} from "vue";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {TableImg, useTable} from "/@/components/Table";
import {useI18n} from "/@/hooks/web/useI18n";
import {useMessage} from "/@/hooks/web/useMessage";
import PageWrapper from "/@/components/Page/src/PageWrapper.vue";
import {PopConfirmButton} from "/@/components/Button";
import {defHttp} from "/@/utils/http/axios";
import {getColumns} from "/@/views/business/client/overview/data";
import {Tag} from "ant-design-vue";
import { useGo } from '/@/hooks/web/usePage';

const { t } = useI18n();
const { createMessage } = useMessage();

export default defineComponent({
  components: {TableImg, Tag, PopConfirmButton, PageWrapper, BasicTable},
  setup() {
    const go = useGo();
    onMounted(()=> {
      checkUser();
    });
    const Api = {
      getClient: '/userClient/getClient',
      list: '/transaction/listByClient',
      debit: '/transaction/debit',
    };
    const imgHost = "http://localhost:8080";
    const imgPath = "/jeecg-boot/sys/common/static/";
    const client = ref();
    const invoiceDisabled = ref<boolean>(true);
    const invoiceLoading = ref<boolean>(false);

    const transactions = ref<any[]>([]);
    const debit = ref();

    const rowSelection = {
      type: 'checkbox',
      columnWidth: 30,
      onChange: onSelectChange,
      // getCheckboxProps: getCheckboxProps
    };
    const [registerTable, {reload, setLoading, getSelectRowKeys, getSelectRows}] = useTable({
      dataSource: transactions,
      columns: getColumns(),
      bordered: true,
      striped: true,
      rowSelection: rowSelection,
      clickToRowSelect: false,
      showIndexColumn: true,
      indexColumnProps: {
        width: 60,
        title: "#"
      },
      rowKey: 'id',
    });
    function checkUser() {
      setLoading(true);
      defHttp.get({url: Api.getClient})
        .then(res => {
          console.log(res);
          if(res === 'admin') {
            console.log('admin');
          }
          else {
            client.value = res;
            loadTransactions();
          }
        })
        .catch(e => {
          console.error(e);
        })
        .finally(()=> {
          setLoading(false);
        });
    }
    function loadTransactions() {
      // TODO change
      const params = {
        clientId: client.value.id,
      }
      defHttp.get({ url: Api.list, params: {clientId: '1380540772134338561'} })
        .then(res => {
          // console.log(`transactions : ${JSON.stringify(res)}`);
          transactions.value = res;
          //TODO : add condition client type 1,2,3
          loadDebit();
        })
        .catch(e => {
          console.error(e);
        })
    }
    function loadDebit() {
      defHttp.get({url: Api.debit, params: { clientId: client.value.id }})
        .then(res => {
          debit.value = res;
          console.log(`estimations : ${JSON.stringify(res)}`);
        })
        .catch(e=> {
          console.error(e);
        })
    }
    function makeInvoice() {

    }
    function openInvoice(record) {
      go(`/business/admin/shippingInvoice/Invoice?invoice=${record.invoiceNumber}`);
    }
    function onSelectChange() {
      if(getSelectRowKeys.length > 0) {
        invoiceDisabled.value = false;
      }
      else {
        invoiceDisabled.value = true;
      }
    }
    function getCheckboxProps() {

    }
    let rows = document.getElementsByClassName('ant-table-row-level-0');

    console.log(rows);
    return {
      reload,
      registerTable,
      makeInvoice,
      getSelectRowKeys,
      getSelectRows,
      openInvoice,
      t,
      createMessage,
      invoiceDisabled,
      invoiceLoading,
      imgHost,
      imgPath,
    }
  }
})
</script>

<style>
</style>
