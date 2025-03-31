<template>
  <PageWrapper title="Additional Fees">
    <search-form @search="handleSearch"/>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleOpenAddModal">Add</a-button>
      </template>
      <template #toolbar>
        <a-button type="default" preIcon="ant-design:reload-outlined" @click="loadFeeList">{{ t('common.redo') }}</a-button>
      </template>
      <template #unitPrice="{ record }">
        <p class="font-semibold">{{ (record.unitPrice * record.quantity).toFixed(2) }}€</p>
        <p class="text-gray-400 text-xs">
          {{ record.unitPrice }}€ / unit
        </p>
      </template>
      <template #feeName="{ record }">
        <template v-if="!!record.description">
          <p class="font-semibold">{{ record.description }}</p>
          <p class="font-normal text-xs mb-0">({{ record.enName }}/{{ record.zhName }})</p>
        </template>
        <p v-else class="font-semibold mb-0">{{ record.enName }}/{{ record.zhName }}</p>
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
      <template #createTime="{ text }">
        <time :datetime="text"><span>{{ text.split(' ')[0] }}</span><br/><span class="font-extralight">{{ text.split(' ')[1] }}</span></time>
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
  deleteById,
  fetchExtraFeeList,
  fetchShopList
} from "./data";
import {onMounted, provide, reactive, Ref, ref, unref} from "vue";
import ExtraFeesModal from "@/views/business/admin/additionalFees/components/ExtraFeesModal.vue";
import {useModal} from "@/components/Modal";
import {filterObj} from "@/utils/common/compUtils";
import {ShopByClient, ShopResponse} from "@/views/business/dto/shop.dto";
import {Modal, SelectProps} from "ant-design-vue";
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
const [registerTable, { reload, setLoading }] = useTable({
  title: 'Additional Fees',
  titleHelpMessage: 'This is the list of additional fees that can be added to the shipping invoice',
  dataSource: feeList,
  columns: additionalFeesColumns,
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
  tableSetting: {
    fullScreen: true,
    redo: false,
  },
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
  defSort.value.column = sorter.field;
  defSort.value.order = sorter.order === 'ascend' ? 'ASC' : 'DESC';
  await loadFeeList(1);
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
    {
      onClick: handleDeleteAction.bind(null, record),
      icon: 'clarity:trash-line',
      color: 'error',
    },
  ]
}
function handleEdit(record: Recordable) {
  openModal(true,  {
    record,
    isUpdate: true,
  })
}
function handleDeleteAction(record: Recordable) {
  if(!!record.invoiceNumber) {
    Modal.error({
      title: t('common.operation.delete'),
      content: t('data.fee.deleteErrorInvoiced'),
      centered: true,
      okText: t('component.drawer.okText'),
      cancelText: t('component.drawer.cancelText'),
      onOk: () => {
        Modal.destroyAll();
      }
    })
    return;
  }
  Modal.confirm({
    title: t('common.operation.delete'),
    content: t('common.operation.deleteConfirmation'),
    okText: t('component.drawer.okText'),
    cancelText: t('component.drawer.cancelText'),
    centered: true,
    onOk: async () => {
      await deleteById(record.id, handleDelete);
    }
  })
}
async function handleDelete(_res) {
  createMessage.success(t('common.result.deleteSuccessfully'));
  await reload();
  await loadFeeList(1);
}
function openInvoice(invoiceNumber:string) {
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
  }
  const params = getQueryParams();
  await fetchExtraFeeList(handleFetchFeeList, params);
}
function handleFetchFeeList(res) {
  feeList.value = res.records;
  setLoading(false);
}
async function handleSubmit() {
  await reload();
  await loadFeeList(1);
}

function handleOpenAddModal() {
  openModal(true, {
    isUpdate: false,
  });
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
