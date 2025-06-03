<template>
  <PageWrapper :title="t('data.product.productListPage')">
    <div v-if="showProgress" style="margin-bottom: 16px">
      <a-progress
        :percent="progress"
        :steps="5"
        :stroke-width="16"
        status="active"
      />
      <div style="margin-top: 8px">{{ msg }}</div>
    </div>
    <ProductListResults/>
    <BasicTable @register="registerTable" ref="tableRef">
      <template #tableTitle>
        <a-upload name="file" :showUploadList="false" :customRequest="(file) => handleImportXls(file, Api.importExcel, handleImport)">
          <a-button preIcon="ant-design:import-outlined" type="primary">{{ t('common.operation.import') }}</a-button>
        </a-upload>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="handleExportXls('Sku Weight List', Api.exportExcel, exportParams)">
          {{ t("common.operation.export") }}
        </a-button>
        <a-button v-if="username === 'admin' || username === 'Gauthier'|| username === '杨雪'" type="error" preIcon="ant-design:delete-outlined" @click="handleDeleteBatch" :disabled="batchEditDisabled">
          {{ t('common.operation.delete') }}
        </a-button>
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
    <ProductListModal @register="registerModal" @success="handleSuccess" :isDisabled="isDisabled"/>
  </PageWrapper>
</template>
<script lang="ts" setup>
import {computed, onMounted, provide, reactive, ref} from "vue";
import { BasicTable, useTable } from "/@/components/Table";
import { useI18n } from "/@/hooks/web/useI18n";
import { getProductColumns } from "/@/views/business/admin/product/data";
import ProductListModal from './modules/ProductListModal.vue';
import {useModal} from "/@/components/Modal";
import {PageWrapper} from "/@/components/Page"
import {listSkus} from "@/views/business/admin/product/api";
import {filterObj} from "@/utils/common/compUtils";
import {SearchOutlined} from "@ant-design/icons-vue";
import ProductListResults from "@/views/business/admin/product/modules/ProductListResults.vue";
import {useMethods} from "@/hooks/system/useMethods";
import {useUserStore} from "/@/store/modules/user";
import { Api } from "./data";
import { useMessage } from '/@/hooks/web/useMessage';
import {onWebSocket,offWebSocket} from '/@/hooks/web/useWebSocket';
import { Modal } from 'ant-design-vue';
import { h } from 'vue';
import {defHttp} from "@/utils/http/axios";

type RowType = 'success' | 'warning' | 'fail';
const showProgress = ref(false);
const progress = ref(0);
const msg = ref('');

const { t } = useI18n();
const { handleImportXls, handleExportXls } = useMethods();

const tableRef = ref();
const isDisabled = ref<boolean>(false);
const batchEditDisabled =ref<boolean>(true);
const isReady = ref(false);
const skuList = ref([]);
const productListZh = ref<string[]>();
const productListEn = ref<string[]>();
const erpCodes = ref<string[]>();
const userStore = useUserStore();
const username = ref<string>();
const { createMessage} = useMessage();

const results = reactive({ successes: {}, failures: {} });
const mabangResults = reactive({ successes: {}, failures: {} });
provide('results', results);
provide('mabangResults', mabangResults);


const exportParams = computed(()=>{
  let paramsForm = {};
  let list:any[] = [];
  if (selectRows.value && selectRows.value.length > 0) {
    for(let item of selectRows.value) {
      list.push(item.id);
    }
  }
  paramsForm['selections'] = list;
  return filterObj(paramsForm)
});
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
  offWebSocket(handleWsMessage);
  onWebSocket(handleWsMessage);
  username.value = userStore.getUserInfo.username;
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

function handleWsMessage(data: any) {
  console.log('%c[WebSocket] handleWsMessage-Received raw message:', 'color: #0af;', data);
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    const { cmd, type, data: msgData = {}, msgTxt } = parsed;
    console.log('parsed?.cmd ==', parsed?.cmd,'parsed?.data', parsed?.data);
    if (['import-result', 'update-result'].includes(cmd) && msgData) {
      const { successes, failures } = msgData;
      if (successes || failures) {
        Object.assign(results.successes, successes || {});
        Object.assign(results.failures, failures || {});
        handleUpdateResponse(parsed);
      }
    }
    if(['mabang-result'].includes(cmd) && msgData) {
      const { successes, failures } = msgData;
      if (successes || failures) {
        Object.assign(mabangResults.successes, successes || {});
        Object.assign(mabangResults.failures, failures || {});
        handleUpdateResponse(parsed);
      }
      showProgress.value = true;
      if (type === 'progress' || type === 'complete') {
        const progressNum = msgData?.progress || 0;
        progress.value = progressNum;
        if (progressNum >= 100 || type === 'complete') {
          msg.value = '马帮重量全部更新完成！';
          const { success, failure } = msgData;
          if (type === 'complete') {
            console.log(`马帮更新完成，成功 ${success} 条，失败 ${failure} 条`);
          }
        } else {
          msg.value = msgTxt || '马帮重量更新中...';
        }
      }
    }
  } catch (e) {
    console.error('%c[WebSocket] Failed to parse message:', 'color: red;', e);
    console.warn('Original data:', data);
  }
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
const [registerTable, { getSelectRows, getSelectRowKeys, clearSelectedRowKeys, setLoading }] = useTable({
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
  rowKey: 'weightId',
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
const handleSearch = async (selectedKeys: string[], _confirm: Function, dataIndex: string) => {
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
const splitText = (text: string, _column: string) => {
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
function handleSuccess(res: Recordable) {
  Object.assign(results.successes, res.successes || {});
  Object.assign(results.failures, res.failures || {});
  loadSkuList();
}
function handleImport(res) {
  Object.assign(results.successes, res.result.successes || {});
  Object.assign(results.failures, res.result.failures || {});
  loadSkuList();
}
async function handleDeleteBatch() {
  const ids = checkedKeys.value;
  if (!ids || ids.length === 0) {
    createMessage.warning('请选择至少一项进行删除');
    return;
  }

  Modal.confirm({
    title: t('common.operation.deleteBatchConfirmation'),
    content: `确定要删除这 ${ids.length} 项吗？`,
    okText: t('common.operation.confirm'),
    cancelText: t('common.operation.cancel'),
    onOk: async () => {
      try {
        await defHttp.delete({ url: Api.deleteBatch, data: ids });
        createMessage.success('删除成功');
        await loadSkuList(1);
        clearSelectedRowKeys();
      } catch (error) {
        createMessage.error('删除失败');
      }
    },
  });
}

function handleUpdateResponse(parsed: any) {
  const { msgTxt = '导入完成', data = {} } = parsed;
  const successes = JSON.parse(JSON.stringify(data.successes || {}));
  const failures = JSON.parse(JSON.stringify(data.failures || {}));
  const parseMessage = (msg: any): string => {
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg[0] || '';
    if (typeof msg === 'object' && msg.message) return msg.message;
    return String(msg);
  };
  const rows: [string, string, RowType][] = [];
  for (const [row, msg] of Object.entries(successes)) {
    const message = parseMessage(msg);
    const type: RowType = /跳过/.test(message) ? 'warning' : 'success';
    console.log('Row:', row, 'Type:', type, 'Message:', message);
    const displayRow = row.trim() === '' ? '无行号' : row;
    rows.push([displayRow, message, type]);
  }
  for (const [row, msg] of Object.entries(failures)) {
    const message = parseMessage(msg);
    const displayRow = row.trim() === '' ? '无行号' : row;
    rows.push([displayRow, message, 'fail']);
  }
  const shouldSort = rows.length > 0 && rows.every(item => item[0] !== '无行号');
  if (shouldSort) {
    rows.sort((a, b) => {
      const aNum = parseInt(a[0].replace(/\D/g, ''), 10);
      const bNum = parseInt(b[0].replace(/\D/g, ''), 10);
      return aNum - bNum;
    });
  }
  const nodes = rows.map(([row, msg, type]) => {
    const colorMap = {
      success: 'green',
      warning: 'orange',
      fail: 'red',
    };
    const iconMap = {
      success: '✅',
      warning: '⚠️',
      fail: '❌',
    };
    return h('div', [
      h('span', {
        style: `color: ${colorMap[type]}; font-weight: 500; margin-right: 4px`,
      }, `${iconMap[type]} ${row}`),
      msg,
    ]);
  });
  Modal.info({
    title: msgTxt,
    width: 600,
    content: () => h('div', nodes),
    okText: '知道了',
  });
}
</script>
<style>

</style>
