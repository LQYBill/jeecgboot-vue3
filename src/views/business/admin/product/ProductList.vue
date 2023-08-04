<template>
  <PageWrapper :title="t('data.product.productListPage')">
    <BasicTable @register="registerTable" @edit-end="handleEditEnd" @edit-cancel="handleEditCancel" :beforeEditSubmit="beforeEditSubmit" >
      <template #tableTitle>
        <super-query :config="superQueryConfig" @search="handleSuperQuery"/>
      </template>
      <template #toolbar>
        <a-button type="warning" preIcon="ant-design:edit-outlined" @click="handleBatchEdit" :disabled="batchEditDisabled">{{ t('common.operation.edit') }}</a-button>
      </template>
    </BasicTable>
    <ProductListModal @register="registerModal" @success="reload" :isDisabled="isDisabled"/>
  </PageWrapper>
</template>
<script lang="ts">
import {defineComponent, reactive, ref, toRaw, unref, watch} from "vue";
  import {BasicTable, useTable, TableAction} from "/@/components/Table";
  import {defHttp} from "/@/utils/http/axios";
  import { useMessage } from '/@/hooks/web/useMessage';
  import {useI18n} from "/@/hooks/web/useI18n";
  import {getProductColumns, superQueryConfig} from "/@/views/business/admin/product/tableData";
  import ProductListModal from './modules/ProductListModal.vue';
import SavRefundModal from "/@/views/business/admin/savRefund/modules/SavRefundModal.vue";
import {useModal} from "/@/components/Modal";
import {PageWrapper} from "/@/components/Page";

  export default defineComponent({
    components: {PageWrapper, SavRefundModal, TableAction, BasicTable, ProductListModal },
    setup() {
      const { t } = useI18n();
      const { createMessage } = useMessage();
      const Api = {
        list: '/product/product/list',
        delete: '',
        editBatch: '/product/product/editBatch',
      };
      const isDisabled = ref<boolean>(false);
      const batchEditDisabled =ref<boolean>(true);
      const checkedKeys = ref<Array<string | number>>([]);
      const selectRows = ref<Array<any>>([]);
      const list = (params) => {
        return defHttp.get({ url: Api.list, params });
      }
      const [registerTable,
        {
          reload,
          getSelectRows,
          getSelectRowKeys,
          setProps,
        },
      ] = useTable({
        title: 'Product List',
        api: list,
        columns: getProductColumns(),
        defSort: {
          field: 'createTime',
          order: 'ascend',
        },
        pagination: {
          current: 1,
          pageSize: 100,
          pageSizeOptions: ['10', '50', '100', '200'],
          total: 0
        },
        rowKey: 'id',
        showTableSetting: true,
        bordered: true,
        striped: true,
        clickToRowSelect: false,
        showIndexColumn: true,
        indexColumnProps: {
          width: 60,
          title: "#"
        },
        // onChange,
        rowSelection: {
          type: 'checkbox',
          onChange: onSelectChange
        },
      });
      const [registerModal, { openModal }] = useModal();

      /**
       * Modal actions
       */
      function handleBatchEdit() {
        let record = checkedKeys.value;
        isDisabled.value = false;
        openModal(true, {
          record,
          isUpdate: true,
        });
      }
      /**
       * Inline actions
       */
      function handleEditCancel() {
        createMessage.info("Edit canceled");
      }
      function handleEditEnd({ record, index, key, value }: Recordable) {
        console.log(record, index, key, value);
        return false;
      }
      async function beforeEditSubmit({ record, index, key, value }) {
        console.log('Saving ...', { record, index, key, value });
        return await save({ id: record.id, column: key, value });
      }
      function save({ value, column, id }) {
        createMessage.loading({
          content: `Saving ${column} for ${id}`,
          key: '_save_data',
          duration: 0,
        });
        return new Promise((resolve) => {
          if (!!parseInt(value)) {
            defHttp.post({url: Api.editBatch, params: {ids: [id], weight: value}})
              .then(res => {
                console.log(res);
              })
              .catch(e => {
                console.error(e);
              })
              .finally(()=> {
                reload();
              });
            createMessage.success({
              content: `Save Successful (${id}) ${column} : ${value}`,
              key: '_save_data',
              duration: 2,
            });
            resolve(true);
          }
          else {
            createMessage.error({
              content: 'Please fill the field.',
              key: '_save_data',
            });
            resolve(false);
          }
        });
      }
      function onSelectChange() {
        checkedKeys.value = getSelectRowKeys();
        selectRows.value = getSelectRows();
        batchEditDisabled.value = checkedKeys.value.length <= 0;
      }

      /**
       * search
       */
      const customSearch = ref(false);
      const queryParam = reactive({
        name: '',
        age_begin: '',
        age_end: '',
        sex: '',
        id: '',
      });
      watch(customSearch, () => {
        setProps({ useSearchForm: !unref(customSearch) });
      });
      function searchQuery() {
        setProps({ searchInfo: toRaw(queryParam) });
        reload();
      }
      function searchReset() {
        Object.assign(queryParam, { name: '', age_begin: '', age_end: '', sex: '', id: '' });
        reload();
      }
      //自定义查询----end---------


      function handleSuperQuery(params) {
        Object.keys(params).map(k=>{
          queryParam[k] = params[k]
        });
        searchQuery();
      }
      return {
        registerTable,
        registerModal,
        reload,
        handleBatchEdit,
        handleEditEnd,
        handleEditCancel,
        beforeEditSubmit,
        onSelectChange,
        searchReset,
        superQueryConfig,
        handleSuperQuery,
        t,
        createMessage,
        isDisabled,
        batchEditDisabled,
      }
    }
  })
</script>
<style>

</style>
