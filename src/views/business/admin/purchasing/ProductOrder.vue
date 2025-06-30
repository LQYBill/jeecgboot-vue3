<template>
  <PageWrapper :title="t('data.pageTitle.productOrderPage')" v-if="hasMabangUsername">
    <a-card class="min-h-svh">
       <a-form v-if="internalUse" ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="validatorRules">
         <a-row>
           <a-col>
             <a-form-item
               :labelCol="labelCol"
               :wrapperCol="wrapperCol"
               v-bind="validateInfos.name"
               name="customer"
             >
               <template #label>
                 <span title="Customer">{{ t('data.invoice.customer') }}</span>
               </template>
               <JSearchSelect
                 :placeholder="t('component.searchForm.clientInputSearch')"
                 :dictOptions="customerSelectList"
                 @change="handleClientChange"
                 v-model:value="formState.customer"
                 allowClear
                 :disabled="customerListDisabled"
               />
             </a-form-item>
           </a-col>
         </a-row>
       </a-form>
      <BasicTable @register="registerTable" ref="tableRef">
        <template #tableTitle>
          <nav class="flex pt-4 gap-2">
            <a-button type="primary" @click="orderMenu" preIcon="ant-design:shopping-cart-outlined" :disabled="orderDisabled">
              {{ t('data.order.placeOrder') }}
            </a-button>
            <a-upload
              ref="uploadRef"
              :showUploadList="false"
              :beforeUpload="beforeUpload"
              :accept="'.xlsx,.xls'"
            >
            </a-upload>
            <a-button type="primary" @click="handlePlaceOrderByExcel" preIcon="ant-design:shopping-cart-outlined">
              {{ t('data.order.placeOrderByExcel') }}
            </a-button>
            <a-button  type="default" preIcon="ant-design:export-outlined" @click="handleSkuOrderExport"> {{ t("common.operation.export") }}</a-button>
            <a-tooltip>
              <template #title>
                Synchronize selected skus
              </template>
              <a-button type="success" @click="handleSync" preIcon="ant-design:reload-outlined" :loading="syncLoading" :disabled="syncDisabled" aria-label="synchronize selected skus">
                {{ t('common.operation.sync') }}
              </a-button>
            </a-tooltip>
            <transition-group name="fade" tag="div">
              <a-button v-if="selectAllVisible" type="warning" @click="handleSelectAllSkus" preIcon="ic:outline-library-add-check" :disabled="selectAllDisabled">
                {{ t('component.table.selectAll') }} Skus
              </a-button>
              <a-badge v-if="unselectAllVisible" :count="allSkus.length" show-zero>
                <a-button type="error" @click="handleUnselectAllSkus" preIcon="ic:outline-indeterminate-check-box" :disabled="unselectAllDisabled">
                  {{ t('component.table.unSelectAll') }}
                </a-button>
              </a-badge>
            </transition-group>
          </nav>
        </template>
        <template #availableAmount="{record}">
          {{ record?.availableAmount === null ? '--' : record?.availableAmount }} |
          {{ record?.purchasingAmount === null ? '--' : record?.purchasingAmount }} |
          {{ record?.qtyInOrdersNotShipped === null ? '--' : record?.qtyInOrdersNotShipped }}
        </template>

        <template #sales="{record}">
          {{ record?.salesLastWeek === null ? '0' : record?.salesLastWeek }} |
          {{ record?.salesFourWeeks === null ? '0' : record?.salesFourWeeks }} |
          {{ record?.salesSixWeeks === null ? '0' : record?.salesSixWeeks }}
        </template>
        <template #image="{text}">
          <span v-if="!text" class="italic text-cs">
            {{ t("data.upload.noDocument") }}
          </span>
          <TableImg v-else :size="60" :imgList="[text]"/>
        </template>
        <template #skuPrice="{record}">
          <span v-if="record?.skuPrice === null" class="italic text-red-500">{{ t('data.sku.missingPrice') }}</span>
          <span v-else>{{ record?.skuPrice }}</span>
        </template>

        <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
          <div class="p-2 flex flex-col items-center justify-start w-54 min-h-20 mb-1 gap-4">
            <div class="w-full flex flex-nowrap gap-1">
              <a-select
                v-model:value="formState[column?.dataIndex]"
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
          <span v-if="state.searchText.length > 0 && state.searchedColumn === column?.dataIndex">
            <template
              v-for="(fragment, i) in splitText(text)"
            >
              <mark
                v-if="state.searchText[0].some(item => fragment.toLowerCase().includes(item.toLowerCase()))"
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
    </a-card>
    <ProductOrderModal @register="registerModal" @success="handleModalSuccess"></ProductOrderModal>
  </PageWrapper>
  <Result v-else-if="!hasMabangUsername" :status="ExceptionEnum.PAGE_NOT_ACCESS" :title="t('sys.invoice.missingMabangUsername')">
    <template #extra>
      <a-button key="console" type="primary" @click="returnHome()"> {{ t('sys.exception.backHome') }} </a-button>
    </template>
  </Result>
</template>
<script lang="ts" setup>

import { h, onMounted, reactive, ref } from 'vue';
import { Form, Modal, Result } from 'ant-design-vue';
import {PageWrapper} from "/@/components/Page";
import {JSearchSelect} from "/@/components/Form/";
import {useI18n} from "/@/hooks/web/useI18n";
import {useMessage} from "/@/hooks/web/useMessage";
import type {FormActionType} from "/@/components/Form";
import {useModal} from '/@/components/Modal';
import {BasicTable, SorterResult, TableImg, useTable} from "/@/components/Table";
import {
  downloadInventory,
  downloadInvoice, getAllSelectableSkus,
  getMabangUsername, getClient, listClientSkus,
  listCustomers, syncSkuQty, skuOrderExport, placeOrderByExcel,
} from './ProductOrder.api';
import { columns, clientColumns } from "./ProductOrder.data";
import ProductOrderModal from "./components/ProductOrder.modal.vue";
import {ExceptionEnum} from "/@/enums/exceptionEnum";
import {useGo} from "/@/hooks/web/usePage";
import {SearchOutlined} from "@ant-design/icons-vue";
import {filterObj} from "@/utils/common/compUtils";
import {InvoiceMetaData} from "@/views/business/dto/invoiceMetaData.dto";

const {t} = useI18n();
const { createMessage } = useMessage();
const go = useGo();

const tableRef = ref();
onMounted(() => {
  checkUser();
});
const useForm = Form.useForm;
const formRef = ref<Nullable<FormActionType>>(null);
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 2 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 12 } });
const validatorRules = ref({
  customer: [{ required: true, message: t('component.searchForm.clientInputSearch'), trigger: 'blur' }],
});
const formState = reactive<Record<string, any>>({
  customer: '',
  erpCode: [],
  zhName: [],
  enName: [],
});
const { validateInfos } = useForm(formState, validatorRules, { immediate: false });

const internalUse = ref(false);
const hasMabangUsername = ref<boolean>(false);

const customerSelectList = ref<any>();
const customerList = ref<any>();
const customerListDisabled = ref<boolean>(false);

const productListZh = ref<string[]>();
const productListEn = ref<string[]>();
const erpCodes = ref<string[]>();
const productListDisabled = ref<boolean>(true);

const allSelected = ref<boolean>(false);
const allSkus = ref<any>([]);

const client = ref<Recordable>();

const skuList = ref<any>([]);

const tableLoading = ref<boolean>(false);
const orderDisabled = ref<boolean>(true);
const syncLoading = ref<boolean>(false);
const syncDisabled = ref<boolean>(true);
const selectAllDisabled = ref<boolean>(true);
const selectAllVisible = ref<boolean>(true);
const unselectAllDisabled = ref<boolean>(true);
const unselectAllVisible = ref<boolean>(false);

const state = reactive({
  searchText: Array<any>(),
  searchedColumn: '',
});
const searchInput = ref();

const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(50);
const iSorter = ref({
  column: 'stock',
  order: 'ASC',
});
const ipagination = ref({
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
const [registerTable, { reload, clearSelectedRowKeys, getSelectRows, setColumns }] = useTable({
  columns: clientColumns,
  dataSource: skuList,
  rowSelection: {
    type: 'checkbox',
    onChange: onSelectChange,
    getCheckboxProps: getCheckboxProps
  },
  pagination: ipagination,
  defSort: iSorter,
  bordered: false,
  striped: true,
  clickToRowSelect: false,
  showIndexColumn: true,
  ellipsis: false,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  canResize: true,
  rowKey: 'id',
  sortFn: handleSorterChange,
  loading: tableLoading,
});
const [registerModal, {openModal}] = useModal();

async function checkUser() {
  await getClient().then( async (res) => {
    if(!!res.internal) {
      internalUse.value = true;
    }
    else {
      client.value = res.client;
    }
    await checkUserMabangUsername();
  }).catch(err => {
    console.error("Error fetching client: ", err);
  });
}
async function checkUserMabangUsername() {
  await getMabangUsername(handleMabangUsername);
}
async function handleMabangUsername(username: string | null) {
  hasMabangUsername.value = username !== null;
  if(!hasMabangUsername.value) {
    createMessage.error(t('sys.invoice.missingMabangUsername'));
    return;
  }
  if(internalUse.value) {
    await loadCustomerList();
  } else {
    await loadSkuList(1);
  }
}
async function loadCustomerList() {
  await listCustomers(handleSetCustomer);
}
function handleSetCustomer(selectList, list) {
  customerSelectList.value = selectList;
  customerList.value = list;
  setColumns(columns);
}
async function handleClientChange(id) {
  client.value = {};
  skuList.value = [];
  state.searchText = [];
  formState.erpCode = [];
  formState.zhName = [];
  formState.enName = [];
  allSelected.value = false;
  allSkus.value = [];
  selectAllDisabled.value = true;
  selectAllVisible.value = true;
  unselectAllDisabled.value = true;
  unselectAllVisible.value = false;
  tableLoading.value = false;

  let index = customerList.value.map(i => i.id).indexOf(id);
  client.value = customerList.value[index];
  if(id !== undefined) {
    await loadSkuList(1);
  }
}
function handleSetFiltersSkus(res: {erpCode: string, zhName:string, enName:string}[]) {
  productListZh.value = [...new Set(res.map(i=> i.zhName))]; // to only get unique values
  productListEn.value = [...new Set(res.map(i=> i.enName))];
  erpCodes.value = [...new Set(res.map(i=> i.erpCode))];
  productListDisabled.value = false;

  loadSkuList(1);
}
function getQueryParams() {
  let params = Object.assign(iSorter.value);
  params.pageNo = currentPage.value;
  params.pageSize = pageSize.value;
  params.order = iSorter.value.order;
  params.column = iSorter.value.column;
  params.clientId = client.value?.id;
  params.erpCodes = formState.erpCode.toString();
  params.zhNames = formState.zhName.toString();
  params.enNames = formState.enName.toString();
  return filterObj(params);
}
async function loadSkuList(arg?:number) {
  if(arg === 1) {
    currentPage.value = 1;
    if(!!tableRef.value)
      clearSelectedRowKeys();
  }
  const params = getQueryParams();
  tableLoading.value =true;
  await listClientSkus(params, handleSetSkus).then(() => {
    selectAllDisabled.value = skuList.value.length <= 0;
  });
  tableLoading.value =false;
}

function handleSetSkus(res) {
  total.value = res.total;
  currentPage.value = res.current;
  pageSize.value = res.size;
  skuList.value = res.records;
  tableRef.value.setPagination({
    current: currentPage.value,
    pageSize: pageSize.value,
    total: total.value,
  });
}
function orderMenu() {
  openModal(true, {
    showFooter: true,
    selectedRows: allSelected.value ? allSkus.value : getSelectRows(),
    internalUse: internalUse.value,
  })
}
function handleModalSuccess (result:InvoiceMetaData) {
  downloadInvoice(result.filename, handleDownloadSuccess);
  downloadInventory(result, handleDownloadSuccess);
  clearSelectedRowKeys();
  reload();
}
function handleDownloadSuccess() {
  createMessage.info("Download successful.");
}
// table functions
function onSelectChange() {
  if(getSelectRows().length === 0) {
    if(allSelected.value) {
      selectAllDisabled.value = true;
      selectAllVisible.value = false;
      unselectAllDisabled.value = false;
      unselectAllVisible.value = true;
      orderDisabled.value = false;
      syncDisabled.value = false;
    } else {
      selectAllDisabled.value = false;
      selectAllVisible.value = true;
      unselectAllDisabled.value = true;
      unselectAllVisible.value = false;
      orderDisabled.value = true;
      syncDisabled.value = true;
    }
  } else {
    selectAllDisabled.value = false;
    selectAllVisible.value = true;
    unselectAllDisabled.value = true;
    unselectAllVisible.value = false;
    orderDisabled.value = false;
    syncDisabled.value = false;
    allSelected.value = false;
    allSkus.value = [];
  }
}
function getCheckboxProps(record: Recordable) {
  if(!!record.skuPrice) {
    return { disabled: false };
  } else {
    return { disabled: true }
  }
}
const handleFilterSelectChange = (e, setSelectedKeys) => {
  setSelectedKeys(e ? [e] : [])
}
const handleSearch = (selectedKeys, _confirm, dataIndex) => {
  // confirm();
  state.searchText = selectedKeys;
  state.searchedColumn = dataIndex;
  loadSkuList(1);
};
const handleReset = (clearFilters) => {
  clearFilters({ confirm: true });
  state.searchText = [];
  formState.erpCode = [];
  formState.zhName = [];
  formState.enName = [];
};
const splitText = (text) => {
  const regexPattern = new RegExp(
    state.searchText[0].map(keyword => `(?<=${keyword})|(?=${keyword})`).join('|'),
    'i'
  );
  return text.split(regexPattern);
};
function handlePaginationChange(p:number, pz:number) {
  currentPage.value = p;
  pageSize.value = pz;
  loadSkuList();
}
function handleSorterChange(sorter: SorterResult) {
  if(Object.keys(sorter).length === 0) {
    return;
  }
  const order = sorter.order === 'ascend' ? 'ASC' : 'DESC';
  if(iSorter.value.column === sorter.field && iSorter.value.order === order) {
    return;
  }
  iSorter.value.column = sorter.field;
  iSorter.value.order = order;
  loadSkuList(1);
}
function handleShowSizeChange(current:number, size:number) {
  currentPage.value = current;
  pageSize.value = size;
  loadSkuList(1);
}
async function handleSync() {
  syncLoading.value = true;
  const erpCodes = getSelectRows().map(i => i.erpCode);
  await syncSkuQty(erpCodes).then(() => {
    createMessage.success("Sync successful.");
    syncLoading.value = false;
    loadSkuList();
  });
}
async function handleSelectAllSkus() {
  allSelected.value = true;
  clearSelectedRowKeys();
  let params = getQueryParams();
  tableLoading.value =true;
  await getAllSelectableSkus(params, handleSetSelectedSkus);
}
async function handleUnselectAllSkus() {
  allSelected.value = false;
  clearSelectedRowKeys();
  allSkus.value = [];
}
function handleSetSelectedSkus(res) {
  allSkus.value = res;
  tableLoading.value =false;
}
async function handleSkuOrderExport() {
  const params = getQueryParams();
  try {
    const res = await skuOrderExport(params);
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const disposition = res.headers['content-disposition'];
    if (!disposition) {
      throw new Error('Content-Disposition cannot be found in response headers');
    }
    const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i);
    if (!match || !match[1]) {
      throw new Error('Content-Disposition header does not contain filename');
    }
    let filename;
    try {
      filename = decodeURIComponent(match[1]);
    } catch (err) {
      throw new Error('failed to decode filename from Content-Disposition header');
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

  } catch (e) {
    console.error('failed to export sku order', e);
  }
}
async function handlePlaceOrderByExcel() {
  if (!hasMabangUsername.value) {
    createMessage.error(t('sys.invoice.missingMabangUsername'));
    return;
  }
  if (!client.value?.id) {
    createMessage.error(t('data.invoice.selectClientFirst'));
    return;
  }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls';
  input.click();
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await placeOrderByExcel(formData);
      if (!Array.isArray(response)) {
        throw new Error('Invalid response from server');
      }
      // get the excel data and open the modal
      const mappedSkuList = response.map((sku: any) => ({
        erpCode: sku.erpCode,
        enName: sku.enName,
        zhName: sku.zhName,
        stock: sku.stock ?? 0,
        skuPrice: sku.skuPrice ?? 0,
        salesLastWeek: sku.sales7d ?? 0,
        salesFourWeeks: sku.sales28d ?? 0,
        salesSixWeeks: sku.sales42d ?? 0,
        quantity: sku.quantity ?? 0,
      }));
      const skusMissingPrice = mappedSkuList.filter(sku => !sku.skuPrice || sku.skuPrice <= 0);
      const validSkus = mappedSkuList.filter(sku => sku.skuPrice > 0);
      if (skusMissingPrice.length > 0) {
        const missingSkuCodes = skusMissingPrice.map(sku => sku.erpCode).join(', ');
        Modal.warning({
          title: 'SKUs with Missing Price',
          content: h('div', [
            h('p', 'The following SKUs have missing or zero price and will not be included in the order:'),
            h('p', { style: 'font-weight:bold;color:red;' }, missingSkuCodes),
          ]),
          centered: true,
          zIndex: 3000,
          width: 600,
          okText: 'Got it',
        });
      }
      openModal(true, {
        showFooter: true,
        selectedRows: validSkus,
        internalUse: internalUse.value,
      });
    } catch (e) {
      console.error('Failed to parse Excel', e);
      createMessage.error('Failed to parse Excel: ' + e);
    }
  };
}

// for 404
function returnHome() {
  go();
}
</script>
<style lang="less">
.ant-checkbox-disabled .ant-checkbox-inner{
  background-color: fade(@error-color, 10%);
  border-color: @error-color!important;
}
.fade-move, /* apply transition to moving elements */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.fade-leave-active {
  position: absolute;
}
</style>
