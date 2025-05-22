<template>
  <PageWrapper :title="t('data.sku.skuPrice')" >
    <!--引用表格-->
   <BasicTable @register="registerTable" :rowSelection="rowSelection">
     <!--插槽:table标题-->
      <template #tableTitle>
          <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined">  {{ t("common.operation.addNew") }}</a-button>
          <a-button  type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> {{ t("common.operation.export") }}</a-button>
          <j-upload-button  type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">{{ t('common.operation.import') }}</j-upload-button>
          <a-dropdown v-if="selectedRowKeys.length > 0">
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1" @click="batchHandleDelete">
                    <Icon icon="ant-design:delete-outlined"></Icon>
                    {{ t("common.operation.delete") }}
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button>{{ t("common.operation.batchOperation") }}
                <Icon icon="mdi:chevron-down"></Icon>
              </a-button>
        </a-dropdown>
        <!-- 高级查询 -->
        <super-query :config="superQueryConfig" @search="handleSuperQuery">
          <template #title>
            {{ t('common.operation.filter') }}
          </template>
        </super-query>
      </template>
      <!--字段回显插槽-->
      <template v-slot:bodyCell="{ column, record, index, text }">
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <SkuPriceModal @register="registerModal" @success="handleSuccess"></SkuPriceModal>
  </PageWrapper>
</template>

<script lang="ts" name="skuprice-skuPrice" setup>
  import {h, reactive} from 'vue';
  import {BasicTable} from '/@/components/Table';
  import { Modal } from 'ant-design-vue'
  import {useModal} from '/@/components/Modal';
  import { useListPage } from '/@/hooks/system/useListPage'
  import SkuPriceModal from './components/SkuPriceModal.vue'
  import {columns, searchFormSchema, superQuerySchema} from './SkuPrice.data';
  import {list, batchDelete, getImportUrl,getExportUrl} from './SkuPrice.api';
  import { PageWrapper } from '@/components/Page';
  import { useI18n } from '@/hooks/web/useI18n';

  const { t } = useI18n();
  const queryParam = reactive<any>({});
  //注册model
  const [registerModal, {openModal}] = useModal();
  //注册table数据
  const { tableContext,onExportXls,onImportXls } = useListPage({
      tableProps:{
           title: 'SKU售价',
           api: list,
           columns,
           showActionColumn: false,
           showIndexColumn: true,
        canResize:false,
           formConfig: {
              //labelWidth: 120,
              schemas: searchFormSchema,
              autoSubmitOnEnter:true,
              showAdvancedButton:true,
              fieldMapToNumber: [
              ],
              fieldMapToTime: [
              ],
            },
            beforeFetch: (params) => {
              return Object.assign(params, queryParam);
            },
      },
       exportConfig: {
            name:"SKU售价",
            url: getExportUrl,
            params: queryParam,
          },
          importConfig: {
            url: getImportUrl,
            success: (res) => {
              handleSuccess();
              handleImportResponse(res);
            },
          },
  })

  const [registerTable, {reload},{ rowSelection, selectedRowKeys }] = tableContext

  // 高级查询配置
  const superQueryConfig = reactive(superQuerySchema);

  /**
   * 高级查询事件
   */
  function handleSuperQuery(params) {
    Object.keys(params).map((k) => {
      queryParam[k] = params[k];
    });
    reload();
  }
   /**
    * 新增事件
    */
  function handleAdd() {
     openModal(true, {
       isUpdate: false,
       showFooter: true,
     });
  }

   /**
    * 批量删除事件
    */
  async function batchHandleDelete() {
     await batchDelete({ids: selectedRowKeys.value}, handleSuccess);
   }
   /**
    * 成功回调
    */
  function handleSuccess() {
      (selectedRowKeys.value = []) && reload();
   }

  function handleImportResponse(response) {
    const { successes = {}, failures = {} } = response.result || {}
    type RowType = 'success' | 'warning' | 'fail'
    const parseMessage = (msg: any): string => {
      if (typeof msg === 'string') {
        return msg
      } else if (Array.isArray(msg)) {
        return msg.length > 0 ? String(msg[0]) : ''
      } else if (typeof msg === 'object' && msg !== null && 'message' in msg) {
        return (msg as any).message ?? JSON.stringify(msg)
      } else {
        return String(msg)
      }
    }
    const rows: [string, string, RowType][] = [
      ...Object.entries(successes).map(([row, msg]) => {
        const message = parseMessage(msg)
        let type: RowType = 'fail'
        if (/导入成功/.test(message)) {
          type = 'success'
        } else if (/跳过导入/.test(message)) {
          type = 'warning'
        }
        return [row, message, type] as [string, string, RowType]
      }),
      ...Object.entries(failures).map(([row, msg]) => {
        const message = parseMessage(msg)
        return [row, message, 'fail'] as [string, string, RowType]
      }),
    ]
    const nodes = rows.map(([row, msg, type]) => {
      const colorMap = {
        success: 'green',
        warning: 'orange',
        fail: 'red',
      }

      const iconMap = {
        success: '✅',
        warning: '⚠️',
        fail: '❌',
      }

      return h('div', [
        h('span', {
          style: `color: ${colorMap[type]}; font-weight: 500; margin-right: 4px`,
        }, `${iconMap[type]} ${row}`),
        msg,
      ])
    })

    Modal.info({
      title: 'Import Results',
      width: 600,
      content: () => h('div', nodes),
      okText: 'OK',
    })
  }

</script>

<style scoped>

</style>
