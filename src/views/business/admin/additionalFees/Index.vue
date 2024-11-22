<template>
  <PageWrapper title="Additional Fees">
    <search-form @search="handleSearch"/>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleOpenAddModal">Add</a-button>
      </template>
      <template #toolBar>
      </template>
      <template #unitPrice="{ record }">
        <p class="font-semibold">{{ (record.unitPrice * record.quantity).toFixed(2) }}{{ getShopCurrency(record.shop) }}</p>
        <p class="text-gray-400 text-xs">
          {{ record.unitPrice }}{{ getShopCurrency(record.shop) }} / unit
        </p>
      </template>
      <template #feeName="{ record }">
        <template v-if="!!record.description">
          <p class="font-semibold">{{ record.description }}</p>
          <p class="font-normal text-xs">({{ record.enName }}/{{ record.zhName }})</p>
        </template>
        <p v-else class="font-semibold">{{ record.enName }}/{{ record.zhName }}</p>
      </template>
      <template #invoiceNumber="{ text }">
        <div v-if="!!text" class="flex flex-row flex-nowrap justify-between items-center">
          <a-button
            type="primary"
            preIcon="ant-design:eye-outlined"
            @click="openInvoice(text)"
            shape="round"
          >
            {{ text }}
          </a-button>
          <Icon icon="ant-design:copy-outlined" @click="handleCopy(text)" class="cursor-pointer"></Icon>
        </div>
        <span v-else class="italic text-gray-300">
          {{ t('data.noData')}}
        </span>
      </template>
      <template #action="{ record }">
        <TableAction :actions="getTableAction(record)"/>
      </template>
    </BasicTable>
  </PageWrapper>
  <ExtraFeesModal @register="registerModal" @submit="handleSubmit"></ExtraFeesModal>
</template>
<script setup lang="ts">
import { PageWrapper } from "/@/components/Page";
import {BasicTable, PaginationProps, SorterResult, TableAction, useTable} from "@/components/Table";
import {
  actionColumn,
  additionalFeesColumns,
  fetchExtraFeeList,
  fetchShopList
} from "./data";
import {onMounted, provide, reactive, Ref, ref, unref} from "vue";
import ExtraFeesModal from "@/views/business/admin/additionalFees/components/ExtraFeesModal.vue";
import {useModal} from "@/components/Modal";
import {filterObj} from "@/utils/common/compUtils";
import {ShopByClient, ShopResponse} from "@/views/business/dto/shop.dto";
import {SelectProps} from "ant-design-vue";
import SearchForm from "@/views/business/admin/additionalFees/components/SearchForm.vue";
import {useI18n} from "vue-i18n";
import {currencyToken} from "@/views/business/dto/currency.dto";
import {useRouter} from "vue-router";
import {useCopyToClipboard} from "@/hooks/web/useCopyToClipboard";
import {useMessage} from "@/hooks/web/useMessage";
import {Icon} from "@/components/Icon";

const {resolve}=useRouter();
const { t } = useI18n();
const { clipboardRef, copiedRef } = useCopyToClipboard();
const { createMessage } = useMessage();

const feeList = ref<Record<string, any>[]>([]);
const shopMappedByClient: Ref<Record<string, ShopByClient>> = ref({});
const shopOptionList = ref<SelectProps['options']>([]);

onMounted(async () => {
  await fetchShopList(handleFetchShops);
  await loadFeeList(1);
})

/** table setups */
const checkedKeys = ref<Array<string | number>>([]);
const selectRows = ref<Array<any>>([]);

const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(50);
const defSort = ref({
  column: 'createTime',
  order: 'DESC'
})
const pagination = ref({
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
const [registerTable, { reload, clearSelectedRowKeys, setLoading }] = useTable({
  title: 'Additional Fees',
  titleHelpMessage: 'This is the list of additional fees that can be added to the shipping invoice',
  dataSource: feeList,
  columns: additionalFeesColumns,
  rowSelection : {
    type: 'checkbox',
    columnWidth: 30,
    selectedRowKeys: checkedKeys,
    onChange: onSelectChange,
  },
  defSort,
  pagination,
  bordered: true,
  striped: true,
  ellipsis: false,
  useSearchForm: false,
  showTableSetting: true,
  showSummary: true,
  showIndexColumn: true,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  tableSetting: { fullScreen: true },
  canResize: false,
  rowKey: 'id',
  onChange: handleTableChange,
  actionColumn,
});
const [registerModal, {openModal}] = useModal();

const searchState = reactive<Record<string, string>>({
  shopId: '',
  status: '',
});

async function handleTableChange(_pagination: PaginationProps, _filters: Partial<Recordable<string[]>>, sorter: SorterResult) {
  console.group('Table change');
  console.log('Sorter : ', sorter)
  console.groupEnd();
  defSort.value.column = sorter.field;
  defSort.value.order = sorter.order === 'ascend' ? 'ASC' : 'DESC';
  await loadFeeList(1);
}
function onSelectChange(selectedRowKeys: Array<string | number>, selectedRows: Array<any>) {
  checkedKeys.value = selectedRowKeys;
  selectRows.value = selectedRows;
}
function getQueryParams() {
  let params = Object.assign(defSort.value);
  params.pageNo = currentPage.value;
  params.pageSize = pageSize.value;
  params.order = defSort.value.order;
  params.column = defSort.value.column;
  params.shopId = searchState.shopId.toString();
  params.status = searchState.status.toString();
  return filterObj(params);
}
function handlePaginationChange(p:number, pz:number) {
  currentPage.value = p;
  pageSize.value = pz;
  loadFeeList();
}
function handleShowSizeChange(current:number, size:number) {
  currentPage.value = current;
  pageSize.value = size;
  loadFeeList();
}
function getTableAction(record) {
  return [
    {
      onClick: handleEdit.bind(null, record),
      icon: 'clarity:note-edit-line',
    },
  ]
}
function handleEdit(record: Recordable) {
  openModal(true,  {
    record,
    isUpdate: true,
  })
}
function openInvoice(invoiceNumber) {
  const invoicePreviewRoute = resolve({name: 'invoice-preview', query: {invoice: invoiceNumber}});
  window.open(invoicePreviewRoute.href, '_blank');
}
function handleCopy(invoiceNumber:string) {
  if (!invoiceNumber) {
    createMessage.warning(t('component.copy.noValue'));
    return;
  }
  clipboardRef.value = invoiceNumber;
  if (unref(copiedRef)) {
    createMessage.warning(t('component.copy.success'));
  }
}
async function loadFeeList(arg?:number) {
  setLoading(true);
  if(arg === 1) {
    currentPage.value = 1;
    clearSelectedRowKeys();
  }
  const params = getQueryParams();
  await fetchExtraFeeList(handleFetchFeeList, params);
}
function handleFetchFeeList(res) {
  console.log('fetchList result', res)
  feeList.value = res.records;
  setLoading(false);
}
async function handleSubmit() {
  await reload();
  await loadFeeList(1);
}

function handleOpenAddModal() {
  openModal(true, {});
}
/** shop functions */
function handleFetchShops(res: ShopResponse[]): void {
  const shopsMappedByClientTemp: Record<string, ShopByClient> = {};
  shopMappedByClient.value = res.reduce((acc, currentShop) => {
    if (!acc[currentShop.clientCode]) {
      acc[currentShop.clientCode] = {
        clientName: currentShop.clientName,
        clientCode: currentShop.clientCode,
        currency: currentShop.currency,
        shops: [],
      };
    }
    acc[currentShop.clientCode].shops.push(currentShop.shopCode);
    return acc;
  }, shopsMappedByClientTemp);
  createShopOptions();
}
function createShopOptions() {
  shopOptionList.value = Object.keys(shopMappedByClient.value).map((clientCode) => {
    if(!shopMappedByClient.value[clientCode])
      console.error('client has no shop', clientCode);
    return {
      label: shopMappedByClient.value[clientCode].clientName + ' (' + clientCode + ')',
      options: shopMappedByClient.value[clientCode].shops.map((shopCode) => {
        return {
          value: shopCode,
          label: shopCode,
        };
      }),
    };
  });
}
function getShopCurrency(shop: string) {
  let currency: string = '';
  Object.keys(shopMappedByClient.value).forEach((clientCode) => {
    if(shopMappedByClient.value[clientCode].shops.includes(shop)) {
      currency = shopMappedByClient.value[clientCode].currency;
      return;
    }
  })
  return currencyToken[currency];
}
/** search */
async function handleSearch(state: Record<string, string>) {
  searchState.shop = state.shop;
  searchState.status = state.status;
  await loadFeeList(1);
}
provide('shopMappedByClient', shopMappedByClient);
provide('shopOptionList', shopOptionList);
</script>
