<template>
  <ShopOptionsSearch @search="handleSearch"/>
  <BasicTable @register="registerTable" :rowSelection="rowSelection" ref="tableRef">
    <template #toolbar>
      <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined">
        {{ t('common.operation.add') }}
      </a-button>
      <a-button type="ghost" @click="listShopWithOptions" preIcon="ant-design:reload-outlined"></a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="batchHandleDelete">
              <Icon icon="ant-design:delete-outlined"></Icon>
              {{ t('common.operation.delete') }}
            </a-menu-item>
          </a-menu>
        </template>
        <a-button>
          {{ t('common.operation.batchOperation') }}
          <Icon icon="mdi:chevron-down"></Icon>
        </a-button>
      </a-dropdown>
    </template>
    <template #action="{ record }">
      <TableAction :actions="getTableAction(record)"
                   :dropDownActions="getDropDownAction(record)"/>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex !== 'erpCode'
                      && column.dataIndex !== 'internalCode'
                      && column.key !== 'j-custom-selected-column'"
      >
        <Tag v-if="record[column.dataIndex] === true" color="green">
          {{ t('common.yes') }}
        </Tag>
        <Tag v-else-if="record[column.dataIndex] === false" color="red">
          {{ t('common.no') }}
        </Tag>
        <span v-else class="text-gray-300 italic">
          {{ t('data.noData')}}
        </span>
      </template>
      <template v-else-if="column.dataIndex === 'erpCode' || column.dataIndex === 'internalCode'">
        <span v-if="record[column.dataIndex] === null" class="text-gray-300 italic">
          {{ t('data.noData')}}
        </span>
        <template v-else-if="column">
          {{ record[column.dataIndex] }}
        </template>
      </template>
    </template>
  </BasicTable>
  <ShopOptionsModal @register="registerModal" @success="handleSuccess"></ShopOptionsModal>
</template>

<script lang="ts" setup>
import {ref, reactive, onMounted, provide} from 'vue';
import {Tag} from "ant-design-vue";
import {BasicTable, TableAction} from '/@/components/Table';
import {useModal} from '/@/components/Modal';
import {useListPage} from '/@/hooks/system/useListPage'
import {ShopOptionsModal, ShopOptionsSearch} from './components'
import {columns} from './ShopOptions.data';
import {list, deleteOne, batchDelete} from './ShopOptions.api';
import {useI18n} from "vue-i18n";
import {Icon} from "@/components/Icon";
import {ShopWithOptions, ShopWithOptionsListParam} from "@/views/business/dto";
import {filterObj} from "@/utils/common/compUtils";
import {useRoute} from "vue-router";
import {useMessage} from "@/hooks/web/useMessage";

const {t} = useI18n();
const { createMessage } = useMessage();
const [registerModal, {openModal}] = useModal();
const route = useRoute();

const shopWithOptionsList = ref<Array<ShopWithOptions>>([]);

/** table settings */
const tableRef = ref();
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(50);
const defSort = ref<{column: string, order: 'ASC' | 'DESC'}>({
  column: 'erp_code',
  order: 'ASC'
});
const pagination = reactive({
  showSizeChanger: true,
  showQuickJumper: true,
  currentPage,
  pageSize,
  pageSizeOptions: ['10', '50', '100'],
  total,
  showTotal: (total:number, range:[number, number]) => {
    return range[0] + '-' + range[1] + ' / ' + total
  },
  onChange: handlePaginationChange,
  onShowSizeChange: handleShowSizeChange,
});
const queryParam = ref<ShopWithOptionsListParam>({
  order: defSort.value.order,
  column: defSort.value.column,
  pageNo: currentPage.value,
  pageSize: pageSize.value,
  clientId: '',
  shopIds: [],
  shopIdsString: '',
  showAll: false,
  hasOptions: 1,
});
const {tableContext} = useListPage({
  tableProps: {
    title: t('data.shopOptions.shopOptionsList'),
    dataSource: shopWithOptionsList,
    columns,
    canResize: false,
    ellipsis: false,
    actionColumn: {
      width: 120,
      fixed: 'right',
      title: t('common.operation.action'),
    },
    useSearchForm: false,
    pagination,
    rowKey: 'shopId',
    showTableSetting: false,
  },
})

const [registerTable, {setLoading}, {rowSelection, selectedRowKeys, selectedRows}] = tableContext

onMounted(async () => {
  handleRouteQuery();
  await listShopWithOptions();
})
function handleRouteQuery() {
  const query = route.query;
  if (query.c) {
    queryParam.value.clientId = (query.c as string).trim();
    queryParam.value.shopIds = [];
    queryParam.value.shopIdsString = '';
    queryParam.value.showAll = true;
    queryParam.value.hasOptions = 2;
  }
}
function getQueryParams() {
  return filterObj(queryParam.value) as ShopWithOptionsListParam;
}

async function listShopWithOptions() {
  setLoading(true);
  const params: ShopWithOptionsListParam = getQueryParams();
  await list(params).then((res) => {
    shopWithOptionsList.value = res.records;
    total.value = res.total;
    currentPage.value = res.current;
    pageSize.value = res.size;
    tableRef.value.setPagination({
      current: currentPage.value,
      pageSize: pageSize.value,
      total: total.value,
    });
  }).finally(() => {
    setLoading(false);
  });
}
function handleSearch (values: ShopWithOptionsListParam) {
  queryParam.value = {
    ...queryParam.value,
    ...values,
   shopIds: !!values.shopIdsString ? values.shopIdsString.split(',').map((s: string) => s.trim()) : undefined,
  };
  listShopWithOptions();
}
function handlePaginationChange(p:number, pz:number) {
  currentPage.value = p;
  pageSize.value = pz;
  queryParam.value.pageNo = currentPage.value;
  queryParam.value.pageSize = pageSize.value;
  listShopWithOptions();
}
function handleShowSizeChange(current:number, size:number) {
  currentPage.value = current;
  pageSize.value = size;
  listShopWithOptions();
}

function handleAdd(_e: PointerEvent, shopId?: string) {
  if(shopId) {
    openModal(true, {
      shopIds: shopId,
      isUpdate: false,
      showFooter: true,
    });
    return;
  }
  if (selectedRowKeys.value.length === 0) {
    openModal(true, {
      isUpdate: false,
      showFooter: true,
    });
    return;
  }
  const shopIdsWithoutOptions = selectedRows.value.filter((item: Recordable) => item.canSelfInvoice === null).map((item: Recordable) => item.shopId);
  if(shopIdsWithoutOptions.length === 0) {
    createMessage.warn(t('data.shopOptions.help.noShopWithoutOptions'));
    return;
  }
  openModal(true, {
    shopIds: shopIdsWithoutOptions.join(','),
    isUpdate: false,
    showFooter: true,
  });
}

function handleEdit(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: true,
  });
}

function handleDetail(record: Recordable) {
  openModal(true, {
    record,
    isUpdate: true,
    showFooter: false,
  });
}

async function handleDelete(record) {
  await deleteOne({id: record.id}, handleSuccess);
}

async function batchHandleDelete() {
  await batchDelete({ids: selectedRowKeys.value}, handleSuccess);
}
function handleSuccess() {
  (selectedRowKeys.value = []) && listShopWithOptions();
}

function getTableAction(record: ShopWithOptions) {
  if(record.canSelfInvoice === null) {
    return [
      {
        label: t('common.operation.add'),
        onClick: handleAdd.bind(null, null, record.shopId),
      }
    ]
  }
  return [
    {
      label: t('common.operation.edit'),
      onClick: handleEdit.bind(null, record),
    }
  ]
}

function getDropDownAction(record) {
  return [
    {
      label: t('common.operation.details'),
      onClick: handleDetail.bind(null, record),
    }, {
      label: t('common.operation.delete'),
      popConfirm: {
        title: t('common.operation.deleteConfirmation'),
        confirm: handleDelete.bind(null, record),
        placement: 'topLeft',
      }
    }
  ]
}
provide('queryParam', queryParam);
</script>

<style scoped>

</style>
