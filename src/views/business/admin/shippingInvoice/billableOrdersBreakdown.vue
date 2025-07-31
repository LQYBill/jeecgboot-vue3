<template>
  <PageWrapper title='Billable Orders Breakdown'>
    <div v-if="showProgress" style="margin-bottom: 16px">
      <a-progress
        :percent="progress"
        :steps="5"
        :stroke-width="16"
        :stroke-color="progressColor"
        status="active"
      />
      <div style="margin-top: 8px">{{ msg }}</div>
    </div>
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
        <a-button type="primary" @click="triggerEstimation" preIcon="ant-design:calculator-outlined" >
          {{ t('common.data.loadUninvoicedOrders') }}
        </a-button>
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
  import { BasicColumn, useTable } from '/@/components/Table';
  import { defineComponent, onMounted, onUnmounted, reactive, computed, ref,toRaw } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import BasicTable from '/@/components/Table/src/BasicTable.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import BillableOrdersSubTable from '/@/views/business/admin/shippingInvoice/modules/billableOrdersSubTable.vue';
  import { PageWrapper } from '/@/components/Page';
  import { PopConfirmButton } from '/@/components/Button';
  import { Tag } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';
  import { offWebSocket, onWebSocket } from '@/hooks/web/useWebSocket';
  import { Icon } from '@/components/Icon';
  export default defineComponent({
    components: { Icon, Tag, PageWrapper, BasicTable, BillableOrdersSubTable, PopConfirmButton },
    setup() {
      const progress = ref(0);
      const msg = ref('');
      const showProgress = ref(false);
      const progressColor = computed(() => {
        if (progress.value < 50) return '#1890ff';
        if (progress.value < 90) return '#faad14';
        return '#52c41a';
      });

      const { t } = useI18n();
      const { createMessage, createConfirm, createErrorModal } = useMessage();
      const userStore = useUserStore();
      const username = ref<string>();
      const abortController = new AbortController();
      const { signal } = abortController;

      onMounted(() => {
        offWebSocket(handleWsMsg);
        onWebSocket(handleWsMsg);
        username.value = userStore.getUserInfo.username;
      });
      onUnmounted(() => {
        abortController.abort(t('sys.api.abortController.onUnmount'));
      });
      enum Api {
        list = '/shippingInvoice/breakdown/byShop',
        listByClient = '/shippingInvoice/breakdown/byClient',
        makeInvoice = '/shippingInvoice/breakdown/makeInvoice',
        resetTask = '/taskHistory/reset',
      }

    const invoiceLoading = ref<boolean>(false);
    const invoiceDisabled = ref<boolean>(false);
    const resetLoading = ref<boolean>(false);

      const clientsToInvoice = ref({ 0: [], 1: [] });
      const listByClient = ref<any[]>([]);
      const listByShop = ref<any[]>([]);
      const subTableContent = ref<any[]>();
      const loading = ref<boolean>(false);
      const expandedRowKeys = ref<any[]>([]);
      const ipagination = reactive({
        current: 1,
        pageSize: 100,
        pageSizeOptions: ['50', '100'],
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
      });
      const checkedKeys = ref<Array<string | number>>([]);
      const selectRows = ref<Array<any>>([]);
      const rowSelection = {
        type: 'checkbox',
        columnWidth: 30,
        selectedRowKeys: checkedKeys,
        onChange: onSelectChange,
        getCheckboxProps: getCheckboxProps,
      };
      const columns: BasicColumn[] = [
        {
          title: t('data.invoice.customer') + 'ID',
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
          slots: { customRender: 'invoiceType' },
          width: 150,
        },
        {
          title: 'Error',
          dataIndex: 'hasErrors',
          sorter: (a, b) => a.hasErrors - b.hasErrors,
          slots: { customRender: 'hasErrors' },
          width: 150,
        },
      ];
      const [registerTable, { reload, clearSelectedRowKeys, getSelectRowKeys, setSelectedRowKeys, setProps }] = useTable({
        dataSource: listByClient,
        columns,
        pagination: ipagination,
        defSort: {
          field: 'code',
          order: 'ascend',
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
          title: '#',
        },
        tableSetting: { fullScreen: true },
        canResize: false,
        rowKey: 'code',
      });
      function triggerEstimation() {
        showProgress.value = true;
        progress.value = 0;
        msg.value = '正在准备加载数据...';
        loading.value = true;
        loadList();
      }
      function loadList() {
        checkedKeys.value = [];
        loading.value = true;
        showProgress.value = true;
        defHttp
          .get({ url: Api.list, signal })
          .then(() => {
          })
          .catch((e) => {
            loading.value = false;
            if (signal.aborted) {
              const { reason } = signal;
              console.warn(`Http request aborted : ${reason}`);
              createMessage.warn(reason);
            }
            console.error(e);
          });
      }
      async function getClientListFromShopData() {
        loading.value = true;
        const payload = toRaw(listByShop.value);
        try {
          const res = await defHttp.post({
            url: Api.listByClient,
            data: payload,
          });
          createMessage.success('Estimation by client finished.');
          listByClient.value = res;
          clientsToInvoice.value = { 0: [], 1: [] };
          listByClient.value?.forEach((estimation) => {
            clientsToInvoice.value[estimation.isCompleteInvoice].push(estimation.clientId);
          });
        } catch (err) {
          console.error(err);
        } finally {
          loading.value = false;
        }
      }
      function setSubTableContent(code) {
        subTableContent.value = [];
        if (!!listByShop.value) {
          for (let entry of listByShop.value) {
            if (entry.code === code) {
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
    async function makeInvoice() {
      await loadClientToInvoice()
      createMessage.info("Invoicing task started ...");
      await defHttp.get({
        url: Api.makeInvoice,
        params: {shipping: clientsToInvoice.value[0], complete: clientsToInvoice.value[1]}
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

    async function handleWsMsg(data: any) {
        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          if (parsed?.cmd === 'estimationBulk') {
            let estimations = parsed.msgTxt;
            if (!Array.isArray(estimations) && typeof estimations === 'string') {
              try {
                estimations = JSON.parse(estimations);
              } catch (e) {
                console.error('[WS] estimationBulk JSON parse error:', e, estimations);
                return;
              }
            }
            listByShop.value = estimations;
            loading.value = false;
            }
          if (parsed?.cmd === 'estimation') {
            const msgTxt = parsed.msgTxt;
            if (msgTxt) {
              msg.value = msgTxt;
            }
            const match = msgTxt.match(/(\d+)%/);
            if (match) {
              showProgress.value = true;
              progress.value = Number(match[1]);
            }
            if (typeof msgTxt === 'string' && msgTxt.includes('全部完成')) {
              progress.value = 100;
              loading.value = false;
              await getClientListFromShopData();
              const clientCount = listByClient.value.length;
              const shopCount = listByShop.value.length;
              createConfirm({
                title: '任务完成通知',
                content: `${msgTxt}<br/>共加载：<b>${clientCount}</b> 个客户，<b>${shopCount}</b> 个店铺<br/>`,
                iconType: 'info',
                okText: '我知道了',
              });
            }
          }
          if (parsed?.cmd === 'user') {
            const { msgTxt, data: msgData } = parsed;
            msg.value = msgTxt;
            const match = msgTxt?.match(/(\d+)%/);
            if (match) {
              showProgress.value = true;
              progress.value = Number(match[1]);
            }
            const isFinal = msgTxt?.includes('全部完成');
            if (isFinal) {
              let content = msgTxt;
              if (msgData?.total != null) {
                content += `<br/>共处理：<b>${msgData.total}</b> 条<br/>`;
              }
              createConfirm({
                title: '任务完成通知',
                content,
                iconType: 'info',
                okText: '我知道了',
              });
            }else{
              createMessage.info(msgTxt);
            }
            return;
          }
        } catch (e) {
          console.error('[WebSocket] 消息解析失败：', e);
        }
      }


    function resetTask() {
      defHttp.get({ url: Api.resetTask, params: {task : 'SI_G'} })
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
      triggerEstimation,
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
      progress,
      msg,
      showProgress,
      progressColor,
    }
  }
});
</script>
<style lang="less">
.ant-table-expanded-row.ant-table-expanded-row-level-1 {
  table {
    border: 1px solid #ddd !important;
  }
  .ant-spin-container {
    background: #ddd;
  }
}

.ant-checkbox-disabled .ant-checkbox-inner{
  background-color: fade(@error-color, 10%);
  border-color: @error-color!important;
}
</style>
