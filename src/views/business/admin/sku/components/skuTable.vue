<template>
  <searchForm @search="handleSearch"></searchForm>
  <BasicTable @register="registerTable" ref="tableRef" class="min-h-[500px]">
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
import {ref, inject, watch, Ref, onMounted} from "vue";
import {filterObj} from "@/utils/common/compUtils";
import SearchForm from "@/views/business/admin/sku/components/searchForm.vue";
import {getStatusNameByCode, Sku, SkuStatus} from "../../../dto/sku.dto";
import { useMessage } from "@/hooks/web/useMessage";
import { useI18n } from "vue-i18n";

const emit = defineEmits(['generate', 'selectionChange']);
const { createMessage } = useMessage();
const { t } = useI18n();

const userCode = inject('userCode', ref('')) as Ref<string>;
const isAddMore = inject('isAddMore', ref(false)) as Ref<boolean>;
const persistedSearchState = inject('tempSkuSearchState', ref<Recordable | null>(null)) as Ref<Recordable | null>;
const persistedSelectedRowKeys = inject('selectedSourceRowKeys', ref<Array<string | number>>([])) as Ref<Array<string | number>>;
watch(isAddMore, (_val) => {
   handleAddMore();
});

const unpairedSkus = ref<Recordable[]>([]);

const client = ref<string>();
const shopCode = ref<string>();
const skuList = ref([]);
const skuCounter = ref(1);
const defaultSkuZhName = ref('');
const generatedBuildSkuMap = ref(new Map<string, Sku>());
const nextSkuCounter = ref<number | null>(null);

// table settings
const tableRef = ref();
const checkedKeys = ref<Array<string | number>>([]);
const selectRows = ref<Array<any>>([]);

const [registerTable, { getSelectRows, getSelectRowKeys, clearSelectedRowKeys, setSelectedRowKeys, setLoading}] = useTable({
  title: 'Sku List',
  columns: SkuColumns,
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
  minHeight: 1000,
});

async function ensureSkuCounterInitialized() {
  if (nextSkuCounter.value !== null) {
    return;
  }
  const date = formatDate(new Date());
  const latestCounter = await fetchLatestSkuCounter(userCode.value, client.value!, date);
  nextSkuCounter.value = Number(latestCounter);
}

function createBuildSku(row: Recordable) {
  const sourceKey = String(row.id);
  const cachedSku = generatedBuildSkuMap.value.get(sourceKey);
  if (cachedSku) {
    return cachedSku;
  }
  const date = formatDate(new Date());
  const generatedSku = {
    id: row.erpCode,
    erpCode: date + userCode.value + skuCounterXLength(nextSkuCounter.value!, 3) + '-' + client.value,
    enName: row.enName,
    zhName: `${defaultSkuZhName.value ?  defaultSkuZhName.value + ' ' + row.zhName : row.zhName}`,
    declareEname: row.enName,
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
    saleUrl: row.saleUrl,
    specifics: row.specifics,
  } as Sku;
  generatedBuildSkuMap.value.set(sourceKey, generatedSku);
  nextSkuCounter.value = nextSkuCounter.value! + 1;
  return generatedSku;
}

async function buildSelectedRows(rows: Array<any>) {
  if (rows.length === 0) {
    return rows;
  }
  await ensureSkuCounterInitialized();
  return rows.map((row) => ({
    ...row,
    __buildSku: createBuildSku(row),
  }));
}

// table functions
async function onSelectChange(selectedRowKeys?: Array<string | number>, _selectedRows?: Array<any>) {
  checkedKeys.value = selectedRowKeys ? [...selectedRowKeys] : getSelectRowKeys();
  persistedSelectedRowKeys.value = [...checkedKeys.value];
  const selectedKeySet = new Set(checkedKeys.value.map((key) => String(key)));
  selectRows.value = unpairedSkus.value.filter((row) => selectedKeySet.has(String(row.id)));
  const rowsWithBuildSku = await buildSelectedRows(selectRows.value);
  emit('selectionChange', rowsWithBuildSku);
}

function getQueryParams() {
  let params = {
    skus: skuList.value,
    shop: shopCode.value,
  }
  return filterObj(params);
}
async function loadSkuList(arg?: number) {
  if(arg === 1) {
    clearSelectedRowKeys();
    checkedKeys.value = [];
    selectRows.value = [];
    persistedSelectedRowKeys.value = [];
    generatedBuildSkuMap.value = new Map();
    nextSkuCounter.value = null;
    emit('selectionChange', []);
  }
  unpairedSkus.value = [];
  const params = getQueryParams();
  setLoading(true);
  await listUnpairedSkus(params, handleBuildSkuList).catch(() => {
    setLoading(false);
  });
}

function handleBuildSkuList(res: Recordable[]) {
  unpairedSkus.value = res;
  if(res.length === 0) {
    checkedKeys.value = [];
    selectRows.value = [];
    persistedSelectedRowKeys.value = [];
    emit('selectionChange', []);
    setLoading(false);
    createMessage.warn('无未配对的SKU, 是否已同步客户订单？');
    return;
  }
  const nextSelectedRowKeys = persistedSelectedRowKeys.value.filter((key) =>
    res.some((row) => String(row.id) === String(key))
  );
  persistedSelectedRowKeys.value = [...nextSelectedRowKeys];
  if (nextSelectedRowKeys.length > 0) {
    setSelectedRowKeys(nextSelectedRowKeys);
  }
  setLoading(false);
}

function handleSearch(data: Recordable, resetSelection = true) {
  persistedSearchState.value = data;
  shopCode.value = data.shop;
  client.value = data.client;
  skuList.value = data.skuNames.split(/\r?\n/).map((item: string) => item.trim()).filter((item: string) => item !== '');
  defaultSkuZhName.value = data.defaultSkuZhName;
  if(data.shop === undefined) {
    unpairedSkus.value = [];
    checkedKeys.value = [];
    selectRows.value = [];
    persistedSelectedRowKeys.value = [];
    emit('selectionChange', []);
    emit('generate', []);
    return;
  }
  loadSkuList(resetSelection ? 1 : undefined);
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
  const rowsWithBuildSku = await buildSelectedRows(selectRows.value);
  const selectedRows: Sku[] = rowsWithBuildSku.map((row) => row.__buildSku as Sku);
  emit('selectionChange', rowsWithBuildSku);
  emit('generate', selectedRows);
}

function handleAddMore() {
  if(isAddMore.value) {
    clearSelectedRowKeys();
    checkedKeys.value = [];
    selectRows.value = [];
    persistedSelectedRowKeys.value = [];
    generatedBuildSkuMap.value = new Map();
    nextSkuCounter.value = null;
    emit('selectionChange', []);
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

onMounted(() => {
  if (persistedSearchState.value?.shop) {
    handleSearch(persistedSearchState.value, false);
  }
});
</script>
