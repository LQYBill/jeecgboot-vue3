<template>
  <PageWrapper title='Billable Orders Breakdown'>
    <BasicTable
      @register="registerTable"
    >
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
        <PopConfirmButton v-if="username === 'admin' || username === 'Gauthier'"
                          type="error"
                          title="Confirm reset task status ?"
                          preIcon="ant-design:reload-outlined"
                          @confirm="resetTask" okText="ok"
                          :loading="resetLoading"
                          cancelText="Cancel"
        >
          {{ t("common.operation.resetTask") }}
        </PopConfirmButton>
      </template>

      <template v-slot:invoiceType="record">
        <Tag
          :color="record.record.isCompleteInvoice === '1' ? 'green' : 'yellow'"
        >
          {{ record.record.isCompleteInvoice === '1' ? t("data.invoice.completeInvoice") : t("data.invoice.shippingInvoice") }}
        </Tag>
      </template>
      <template v-slot:hasErrors="record">
        <Tag
          :color="record.record.hasErrors === 0 ? 'green' : 'volcano'"

        >
          <Icon icon="ant-design:flag-twotone"></Icon>
          {{ record.record.hasErrors }}
        </Tag>
      </template>
      <!--Expanded Sub Table-->
      <template v-slot:expandedRowRender="record">
        <billable-orders-sub-table :record='subTableContent' />
      </template>
    </BasicTable>
  </PageWrapper>
</template>
<script lang="ts">
import {BasicColumn, useTable} from "/@/components/Table";
import {defineComponent, onMounted, reactive, ref} from "vue";
import {defHttp} from "/@/utils/http/axios";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {useI18n} from "/@/hooks/web/useI18n";
import { useMessage } from '/@/hooks/web/useMessage';
import BillableOrdersSubTable
  from "/@/views/business/admin/shippingInvoice/modules/billableOrdersSubTable.vue";
import PageWrapper from "/@/components/Page/src/PageWrapper.vue";
import {PopConfirmButton} from "/@/components/Button";
import {Tag} from "ant-design-vue";
import {useUserStore} from "/@/store/modules/user";
export default defineComponent({
  components: {Tag, PageWrapper, BasicTable, BillableOrdersSubTable, PopConfirmButton},
  setup() {

    const { t } = useI18n();
    const { createMessage } = useMessage();
    const userStore = useUserStore();
    const username = ref<string>();

    onMounted(()=> {
      loadList();
      username.value = userStore.getUserInfo.username;
    });
    enum Api {
      list = "/shippingInvoice/breakdown/byShop",
      listByClient = "/shippingInvoice/breakdown/byClient",
      makeInvoice = "/shippingInvoice/breakdown/makeInvoice",
      resetTask = "/taskHistory/reset",
    }

    const invoiceLoading = ref<boolean>(false);
    const invoiceDisabled = ref<boolean>(false);
    const resetLoading = ref<boolean>(false);

    const clientsToInvoice = ref({0:[],1:[]});
    const listByClient = ref<any[]>();
    const listByShop = ref<any[]>();
    const subTableContent = ref<any[]>();
    const loading = ref<boolean>(true);
    const expandedRowKeys = ref<any[]>([]);
    const ipagination = reactive({
      current: 1,
      pageSize: 100,
      pageSizeOptions: ['50', '100'],
      showQuickJumper: true,
      showSizeChanger: true,
      total: 0
    });
    const checkedKeys = ref<Array<string | number>>([]);
    const selectRows = ref<Array<any>>([]);
    const rowSelection = {
      type: 'checkbox',
      columnWidth: 30,
      selectedRowKeys: checkedKeys,
      onChange: onSelectChange,
      getCheckboxProps: getCheckboxProps
    };
    const columns: BasicColumn[] = [
      {
        title: t('data.invoice.customer')+'ID',
        dataIndex: 'clientId',
        width: 100,
        defaultHidden: true,
      },
      {
        title: t('data.invoice.customerCode'),
        dataIndex: 'code',
        align: 'left',
        sorter: (a, b) => a['code'].localeCompare(b['code']),
        width: 100,
      },
      {
        title: t('data.order.unshippedOrdersVolume'),
        dataIndex: 'ordersToProcess',
        sorter: (a, b) => a.ordersToProcess - b.ordersToProcess,
        width: 150,
      },
      {
        title: t('data.order.shippedUninvoicedOrdersVolume'),
        dataIndex: 'processedOrders',
        sorter: (a, b) => a.processedOrders - b.processedOrders,
        width: 150,
      },
      {
        title: t('data.order.shippedUninvoicedOrdersAmountToBill'),
        dataIndex: 'dueForProcessedOrders',
        sorter: (a, b) => a.dueForProcessedOrders - b.dueForProcessedOrders,
        align: 'right',
        width: 150,
      },
      {
        title: t('data.invoice.invoiceType'),
        dataIndex: 'isCompleteInvoice',
        sorter: (a, b) => a.isCompleteInvoice - b.isCompleteInvoice,
        slots: {customRender: 'invoiceType'},
        width: 150,
      },
      {
        title: 'Error',
        dataIndex: 'hasErrors',
        sorter: (a, b) => a.hasErrors - b.hasErrors,
        slots: {customRender: 'hasErrors'},
        width: 150,
      }
    ];
    const [registerTable, { reload, clearSelectedRowKeys, getSelectRowKeys, setSelectedRowKeys, setProps }] = useTable({
      dataSource: listByClient,
      columns,
      pagination: ipagination,
      defSort: {
        field: 'code',
        order: 'ascend'
      },
      rowSelection: rowSelection,
      clickToRowSelect: false,
      expandedRowKeys: expandedRowKeys,
      onExpand: handleExpand,
      loading: loading,
      ellipsis: false,
      useSearchForm: false,
      bordered: true,
      striped: true,
      showTableSetting: false,
      showSummary: false,
      showIndexColumn: true,
      indexColumnProps: {
        width: 60,
        title: "#"
      },
      tableSetting: { fullScreen: true },
      canResize: false,
      rowKey: 'code',
    });
    function loadList() {
      checkedKeys.value = [];
      defHttp.get({ url: Api.list })
        .then(res=> {
          createMessage.info("Estimation by shop finished, now mapping by client.");
          listByShop.value = res;
          defHttp.post({url: Api.listByClient, params : res})
            .then( r => {
              createMessage.info("Estimation by client finished.");
              listByClient.value = r;
              clientsToInvoice.value = {0:[],1:[]};
              listByClient.value?.map((estimation)=> {
                clientsToInvoice.value[estimation.isCompleteInvoice].push(estimation.clientId);
              });
              loading.value = false;
            })
            .catch(err => {
              console.error(err);
            })
        })
        .catch(e => {
          console.error(e);
        });
    }
    function setSubTableContent(code) {
      subTableContent.value = [];
      if(!!listByShop.value) {
        for (let entry of listByShop.value) {
          if(entry.code === code) {
            let tmpEntry = {
              shop: entry.shop,
              ordersToProcess: entry.ordersToProcess,
              processedOrders: entry.processedOrders,
              dueForProcessedOrders: entry.dueForProcessedOrders,
              errorMessage: entry.errorMessage,
            };
            subTableContent.value.push(tmpEntry);
          }
        }
      }
    }
    function handleExpand(expanded, record) {
      expandedRowKeys.value = [];
      if (expanded === true) {
        expandedRowKeys.value.push(record.code);
        setSubTableContent(record.code);
      }
    }
    function onSelectChange(selectedRowKeys: (string | number)[], selectRow) {
      checkedKeys.value = selectedRowKeys;
      selectRows.value = selectRow;

      invoiceDisabled.value = checkedKeys.value.length === 0;
    }
    function getCheckboxProps(record: Recordable) {
      if (record.hasErrors === 0) {
        return { disabled: false };
      } else {
        return { disabled: true };
      }
    }
    function makeInvoice() {
      loadClientToInvoice()
      createMessage.info("Invoicing task started ...");
      defHttp.get({
        url: Api.makeInvoice,
        params: { shipping: clientsToInvoice.value[0], complete: clientsToInvoice.value[1] }
      });
      clearSelectedRowKeys();

    }
    async function loadClientToInvoice() {
      return new Promise<void>(resolve => {
        clientsToInvoice.value = {0:[],1:[]};
        listByClient.value?.map((estimation)=> {
          if(checkedKeys.value.includes(estimation.code)) {
            clientsToInvoice.value[estimation.isCompleteInvoice].push(estimation.clientId);
          }
        });
        console.log(`clients to invoice : ${JSON.stringify(clientsToInvoice.value)}`);
        resolve();
      });
    }
    function resetTask() {
      defHttp.get({ url: Api.resetTask, params: {task : 'BI'} })
        .then(res => {

        })
        .catch(e => {
          console.error(e);
        });
    }
    return {
      registerTable,
      reload,
      clearSelectedRowKeys,
      getSelectRowKeys,
      setSelectedRowKeys,
      setProps,
      makeInvoice,
      resetTask,
      t,
      createMessage,
      username,
      loading,
      invoiceLoading,
      invoiceDisabled,
      subTableContent,
      listByClient,
      listByShop,
      checkedKeys,
      resetLoading,
    }
  }
});
</script>
<style>
.ant-table-expanded-row.ant-table-expanded-row-level-1 {
  table {
    border: 1px solid #ddd !important;
  }
  .ant-spin-container {
    background: #ddd;
  }
}

.ant-checkbox-disabled .ant-checkbox-inner{
  background-color: #fff2e8;
  border-color: #ffbb96!important;
}
</style>
