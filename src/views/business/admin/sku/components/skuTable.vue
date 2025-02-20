<template>
  <searchForm @search="handleSearch"></searchForm>
  <BasicTable @register="registerTable" ref="tableRef">
    <template #tableTitle>
      <a-button type="primary" @click="generateSkus" :disabled="checkedKeys.length == 0">Create Sku in Bulk </a-button>
    </template>
    <template #status="{ text }">
      <a-tag  :color="getStatusBadgeColor(text)">{{ getStatusNameByCode(text) }}</a-tag>
    </template>
    <template #isGift="{ text }">
      <a-tag  color="green">{{ text === 1 ? '是' : '否' }}</a-tag>
    </template>
    <template #image="{ text }">
            <span v-if="!text" class="italic text-cs">
              {{ t("data.upload.noDocument") }}
            </span>
      <TableImg v-else :size="60" :imgList="[text]"/>
    </template>
    <template #sensitiveAttribute="{ text }">
      <a-tag v-if="!text" color="error">Error</a-tag>
      <template v-else>
        {{ text }}
      </template>
    </template>
  </BasicTable>
</template>
<script lang="ts" setup>
import {BasicTable, TableImg, useTable} from "@/components/Table";
import {fetchLatestSkuCounter, listUnpairedSkus, SkuColumns} from "@/views/business/admin/sku/data";
import {ref, inject, watch, Ref} from "vue";
import {filterObj} from "@/utils/common/compUtils";
import SearchForm from "@/views/business/admin/sku/components/searchForm.vue";
import {getStatusNameByCode, Sku, SkuStatus} from "../../../dto/sku.dto";

const emit = defineEmits(['generate']);

const userCode = inject('userCode', ref('')) as Ref<string>;
const isAddMore = inject('isAddMore', ref(false)) as Ref<boolean>;
watch(isAddMore, (_val) => {
   handleAddMore();
});

const unpairedSkus = ref([]);

const client = ref<string>();
const shopCode = ref<string>();
const skuCounter = ref(1);

// table settings
const tableRef = ref();
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(50);
const iSorter = ref({
  column: 'erpCode',
  order: 'ASC'
});
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

const [registerTable, { getSelectRows, getSelectRowKeys, clearSelectedRowKeys, setLoading}] = useTable({
  title: 'Sku List',
  columns: SkuColumns,
  defSort: iSorter,
  pagination: iPagination,
  showTableSetting: true,
  bordered: false,
  striped: true,
  clickToRowSelect: true,
  showIndexColumn: true,
  ellipsis: false,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  dataSource: unpairedSkus,
  rowSelection: {
    type: 'checkbox',
    onChange: onSelectChange,
  },
  canResize: true,
  rowKey: 'id',
});

// table functions
function onSelectChange() {
  checkedKeys.value = getSelectRowKeys();
  selectRows.value = getSelectRows();
}
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

function getQueryParams() {
  let params = Object.assign(iSorter.value);
  params.pageNo = currentPage.value;
  params.pageSize = pageSize.value;
  params.order = iSorter.value.order;
  params.column = iSorter.value.column;
  params.shop = shopCode.value;
  return filterObj(params);
}
async function loadSkuList(arg?: number) {
  if(arg === 1) {
    currentPage.value = 1;
    clearSelectedRowKeys();
  }
  unpairedSkus.value = [];
  const params = getQueryParams();
  setLoading(true);
  await listUnpairedSkus(params, handleBuildSkuList);
}

function handleBuildSkuList(res: Recordable) {
  unpairedSkus.value = res.records;
  if(res.records.length === 0)
    return;
  total.value = res.total;
  currentPage.value = res.current;
  pageSize.value = res.size;
  tableRef.value.setPagination({
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
  });
  setLoading(false);
}

function handleSearch(data: Recordable) {
  shopCode.value = data.shop;
  client.value = data.client;
  if(data.shop === undefined) {
    unpairedSkus.value = [];
    currentPage.value = 1;
    total.value = 0;
    emit('generate', []);
    return;
  }
  loadSkuList(1);
}

function getStatusBadgeColor(status: number) {
  if(status === SkuStatus.AUTOMATIC.code) {
    return 'error';
  } else if(status === SkuStatus.PENDING.code) {
    return 'error';
  } else if(status === SkuStatus.NORMAL.code) {
    return 'green';
  } else if(status === SkuStatus.CLEARANCE.code) {
    return 'warning';
  } else {
    return 'warning';
  }
}
async function generateSkus() {
  const date = formatDate(new Date());
  await fetchLatestSkuCounter(userCode.value, client.value!, date).then(res => {
    skuCounter.value = Number(res);
  }).catch(e => {
    console.error('error while fetching latest sku counter', e);
  });
  let counter = 0;
  const selectedRows: Sku[] = selectRows.value.map(((row) => {
    return {
      id: row.erpCode,
      erpCode: date + userCode.value + skuCounterXLength(skuCounter.value + counter++, 3) + '-' + client.value,
      enName: row.enName,
      zhName: row.zhName,
      declareEname: row.declareEname,
      declareName: row.declareName,
      weight: row.weight,
      status: row.status,
      sensitiveAttribute: row.sensitiveAttribute,
      isGift: row.isGift,
      skuPrice: row.skuPrice,
      declaredValue: row.declaredValue,
      shippingDiscount: row.shippingDiscount,
      serviceFee: row.serviceFee,
      warehouse: row.warehouse,
      supplier: row.supplier,
      supplierLink: row.supplierLink,
      imageSource: row.imageSource,
      labelData: row.labelData,
    } as Sku
  }));
  emit('generate', selectedRows );
}

function handleAddMore() {
  if(isAddMore.value) {
    clearSelectedRowKeys();
    emit('generate', []);
  }
}
function skuCounterXLength(value: number, length: number) {
  let zeroes = new Array(length+1).join("0");
  return (zeroes + value).slice(-length);
}

const formatDate = (date:Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};
</script>
