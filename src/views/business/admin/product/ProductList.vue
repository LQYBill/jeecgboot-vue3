<template>
  <PageWrapper :title="t('data.product.productListPage')">
    <BasicTable @register="registerTable" ref="tableRef">
      <template #tableTitle>
      </template>
      <template #toolbar>
        <a-button type="warning" preIcon="ant-design:edit-outlined" @click="handleBatchEdit" :disabled="batchEditDisabled">{{ t('common.operation.edit') }}</a-button>
      </template>
      <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
        <div class="p-2 flex flex-col items-center justify-start w-54 min-h-20 mb-1 gap-4">
          <div class="w-full flex flex-nowrap gap-1">
            <a-select
              v-model:value="filters[column?.dataIndex]"
              ref="searchInput"
              mode="tags"
              :placeholder="`${t('common.operation.search')} ${column?.dataIndex}`"
              @change="e => handleFilterSelectChange(e, setSelectedKeys)"
              @pressEnter="handleSearch(selectedKeys, confirm, column?.dataIndex)"
              allowClear
              class="flex-1 w-42"
            >
              <a-select-opt-group>
                <template #label>{{ !!column?.customTitle ? column?.customTitle : !!column?.title ? column?.title : column?.dataIndex }}</template>
                <a-select-option v-if="column?.dataIndex === 'zhName'" v-for="optionZh in productListZh" :key="optionZh" :value="optionZh">
                  {{ optionZh }}
                </a-select-option>
                <a-select-option v-else-if="column?.dataIndex==='enName'" v-for="optionEn in productListEn" :key="optionEn" :value="optionEn">
                  {{ optionEn }}
                </a-select-option>
                <a-select-option v-else-if="column?.dataIndex==='erpCode'" v-for="erpCode in erpCodes" :key="erpCode" :value="erpCode">
                  {{ erpCode }}
                </a-select-option>
              </a-select-opt-group>
            </a-select>
            <a-button type="primary" @click="handleSearch(selectedKeys, confirm, column?.dataIndex)" preIcon="ant-design:search-outlined" class="w-8 h-8"/>
          </div>
          <div class="flex justify-between w-full">
            <a-button @click="handleReset(clearFilters)" preIcon="ic:baseline-restart-alt" class="flex-1"/>
          </div>
        </div>
      </template>
      <template #filterIcon="filtered">
        <SearchOutlined :style="{ color: filtered ? 'var(--primary-color)' : undefined }" />
      </template>
      <template #bodyCell="{ text, column }">
          <span v-if="filterState.searchText.length > 0 && filterState.searchedColumn === column?.dataIndex && isReady">
            <template
              v-for="(fragment, i) in splitText(text, column)"
            >
              <mark
                v-if="filterState.searchText[0].some(item => fragment.toLowerCase().includes(item.toLowerCase()))"
                :key="i"
                class="highlight px-0"
              >
                {{ fragment }}
              </mark>
              <template v-else>{{ fragment }}</template>
            </template>
          </span>
      </template>
    </BasicTable>
    <ProductListModal @register="registerModal" @success="reload" :isDisabled="isDisabled"/>
  </PageWrapper>
</template>
<script lang="ts" setup>
import {onMounted, reactive, ref} from "vue";
import { BasicTable, useTable } from "/@/components/Table";
import { useI18n } from "/@/hooks/web/useI18n";
import { getProductColumns } from "/@/views/business/admin/product/data";
import ProductListModal from './modules/ProductListModal.vue';
import {useModal} from "/@/components/Modal";
import {PageWrapper} from "/@/components/Page"
import {listSkus} from "@/views/business/admin/product/api";
import {filterObj} from "@/utils/common/compUtils";
import {SearchOutlined} from "@ant-design/icons-vue";

const { t } = useI18n();

const tableRef = ref();

const isDisabled = ref<boolean>(false);
const batchEditDisabled =ref<boolean>(true);

const isReady = ref(false);
const skuList = ref([]);
const productListZh = ref<string[]>();
const productListEn = ref<string[]>();
const erpCodes = ref<string[]>();

// filters
const filters = reactive<Record<string, any>>({
  erpCode: [],
  zhName: [],
  enName: [],
});
const filterState = reactive({
  searchText: Array<any>(),
  searchedColumn: '',
});
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(50);
const iSorter = ref({
  column: 'erpCode',
  order: 'ASC'
});
// table settings
const checkedKeys = ref<Array<string | number>>([]);
const selectRows = ref<Array<any>>([]);
const iPagination = ref({
  current: currentPage,
  defaultPageSize: 50,
  pageSize,
  pageSizeOptions: ['50', '100', '200', '500'],
  showTotal: (total:number, range:[number, number]) => {
    return range[0] + '-' + range[1] + ' / ' + total
  },
  showQuickJumper: true,
  showSizeChanger: true,
  total,
  onChange: handlePaginationChange,
  onShowSizeChange: handleShowSizeChange,
});

onMounted(async () => {
  await loadSkuList(1);
});

const loadSkuList = async (arg?:number) => {
  isReady.value = false;
  if(arg === 1) {
    currentPage.value = 1;
    clearSelectedRowKeys();
  }
  let params = getQueryParams();
  setLoading(true);
  await listSkus(params, handleBuildSkuList);
}
const handleBuildSkuList = (data) => {
  skuList.value = data.records;
  total.value = data.total;
  currentPage.value = data.current;
  pageSize.value = data.size;
  tableRef.value.setPagination({
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
  });
  isReady.value = true;

  setLoading(false);
}
const [registerTable, { reload, getSelectRows, getSelectRowKeys, clearSelectedRowKeys, setLoading }] = useTable({
  title: 'Product List',
  dataSource: skuList,
  columns: getProductColumns(),
  defSort: iSorter,
  pagination: iPagination,
  showTableSetting: true,
  bordered: false,
  striped: true,
  clickToRowSelect: false,
  showIndexColumn: true,
  ellipsis: false,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  // onChange,
  rowSelection: {
    type: 'checkbox',
    onChange: onSelectChange
  },
  canResize: true,
  rowKey: 'id',
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

function onSelectChange() {
  checkedKeys.value = getSelectRowKeys();
  selectRows.value = getSelectRows();
  batchEditDisabled.value = checkedKeys.value.length <= 0;
}
// Filter actions
function getQueryParams() {
  let params = Object.assign(iSorter.value);
  params.pageNo = currentPage.value;
  params.pageSize = pageSize.value;
  params.order = iSorter.value.order;
  params.column = iSorter.value.column;
  params.erpCodes = filters.erpCode.toString();
  params.zhNames = filters.zhName.toString();
  params.enNames = filters.enName.toString();
  return filterObj(params);
}
const handleFilterSelectChange = (e, setSelectedKeys) => {
  setSelectedKeys(e ? [e] : [])
}
const handleSearch = async (selectedKeys, confirm, dataIndex) => {
  // confirm();
  filterState.searchText = selectedKeys;
  filterState.searchedColumn = dataIndex;
  await loadSkuList(1);
};
const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
  filterState.searchText = [];
  filters.erpCode = [];
  filters.zhName = [];
  filters.enName = [];
};
const splitText = (text, column) => {
  const regexPattern = new RegExp(
    filterState.searchText[0].map(keyword => `(?<=${keyword})|(?=${keyword})`).join('|'),
    'i'
  );
  return text.split(regexPattern);
};
function handlePaginationChange(p:number, pz:number) {
  currentPage.value = p;
  pageSize.value = pz;
  loadSkuList();
}
function handleShowSizeChange(current:number, size:number) {
  currentPage.value = current;
  pageSize.value = size;
  loadSkuList(1);
}
</script>
<style>

</style>
