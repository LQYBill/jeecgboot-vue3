<template>
  <PageWrapper title='Client Management Page'>
    <!--引用表格-->
    <div v-if="clientIdWithShops.length > 0" class=" w-full rounded-md animate-fade-in-left">
      <router-link :to="`/business/admin/client/ShopOptionsList?c=${clientIdWithShops}`" class="flex items-center justify-between p-4 bg-blue-100 hover:bg-blue-50 rounded-md mb-4">
        {{ t('data.shopOptions.help.configure')}} <Icon icon="ant-design:arrow-right-outlined" class="mx-1" />
      </router-link>
    </div>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <!--插槽:table标题-->
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined"> {{ t('common.operation.addNew') }}</a-button>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="onExportXls"> {{ t('common.operation.export') }}</a-button>
        <j-upload-button type="primary" preIcon="ant-design:import-outlined" @click="onImportXls">{{ t('common.operation.import') }}</j-upload-button>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                {{ t('common.operation.delete') }}
              </a-menu-item>
            </a-menu>
          </template>
          <a-button v-if="username === 'admin' " type="error" class="ml-2">
            >{{ t('common.operation.batchOperation') }}
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
        <!-- 高级查询 -->
        <super-query :config="superQueryConfig" @search="handleSuperQuery" />
      </template>
      <!--操作栏-->
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)" :dropDownActions="getDropDownAction(record)" />
      </template>
    </BasicTable>
    <!-- 表单区域 -->
    <ClientModal @register="registerModal" @success="handleSuccess"></ClientModal>
  </PageWrapper>
</template>

<script lang="ts" name="client-client" setup>
  import {reactive, computed, Ref, ref} from 'vue';
  import { BasicTable,TableAction } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { useModal } from '/@/components/Modal';
  import ClientModal from './components/ClientModal.vue';
  import { columns, superQuerySchema } from './Client.data';
  import { list, deleteOne, batchDelete, getImportUrl, getExportUrl } from './Client.api';
  import { useUserStore } from '/@/store/modules/user';
  import { useI18n } from '@/hooks/web/useI18n';
  import { PageWrapper } from '@/components/Page';
  import {Icon} from "@/components/Icon";
  const { t } = useI18n();

  const queryParam = reactive<any>({});
  const userStore = useUserStore();
  //注册model
  const [registerModal, { openModal }] = useModal();
  //注册table数据
  const { tableContext, onExportXls, onImportXls } = useListPage({
    tableProps: {
      title: '客户',
      api: list,
      columns,
      canResize: false,
      useSearchForm: false,
      actionColumn: {
        width: 120,
        fixed: 'right',
        title: t('common.operation.action'),
      },
      beforeFetch: (params) => {
        return Object.assign(params, queryParam);
      },
    },
    exportConfig: {
      name: '客户',
      url: getExportUrl,
      params: queryParam,
    },
    importConfig: {
      url: getImportUrl,
      success: handleSuccess,
    },
  });

  const [registerTable, { reload }, { rowSelection, selectedRowKeys }] = tableContext;

  // after creating/editing a client, if the client has shops, we store the shops to show a link to the shop options page
  const clientIdWithShops: Ref<string> = ref('');

  // 高级查询配置
  const superQueryConfig = reactive(superQuerySchema);
  const username = computed(() => userStore.getUserInfo?.username);
  /**
   * 高级查询事件
   */
  function handleSuperQuery(params) {
    Object.keys(params).map((k) => {
      queryParam[k] = params[k];
    });
    reload();
    clientIdWithShops.value = '';
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
   * 编辑事件
   */
  function handleEdit(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: true,
    });
  }

  /**
   * 详情
   */
  function handleDetail(record: Recordable) {
    openModal(true, {
      record,
      isUpdate: true,
      showFooter: false,
    });
  }

  /**
   * 删除事件
   */
  async function handleDelete(record) {
    await deleteOne({ id: record.id }, handleSuccess);
  }

  /**
   * 批量删除事件
   */
  async function batchHandleDelete() {
    await batchDelete({ ids: selectedRowKeys.value }, handleSuccess);
  }

  /**
   * 成功回调
   */
  function handleSuccess(clientId: string) {
    clientIdWithShops.value = clientId;
    (selectedRowKeys.value = []) && reload();
  }

  /**
   * 操作栏
   */
  function getTableAction(record) {
    return [
      {
        label: t('common.operation.edit'),
        onClick: handleEdit.bind(null, record),
      },
    ];
  }

  /**
   * 下拉操作栏
   */
  function getDropDownAction(record) {
    return [
      {
        label: t('common.operation.details'),
        onClick: handleDetail.bind(null, record),
      },
      {
        label: t('common.operation.delete'),
        popConfirm: {
          title: t('common.operation.deleteConfirmation'),
          confirm: handleDelete.bind(null, record),
          placement: 'topLeft',
          okType: 'danger',
        },
        ifShow: ['admin'].includes(username.value),
      },
    ];
  }
</script>

<style scoped></style>
