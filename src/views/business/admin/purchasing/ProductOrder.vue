<template>
  <PageWrapper :title="t('data.pageTitle.productOrderPage')" v-if="hasMabangUsername">
    <a-card>
       <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="validatorRules">
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
      <BasicTable @register="registerTable">
        <template #tableTitle>
          <a-button type="primary" @click="orderMenu" preIcon="ant-design:shopping-cart-outlined" :disabled="orderDisabled">
            {{ t('data.order.placeOrder') }}
          </a-button>
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
          <div class="p-2 flex flex-col items-center justify-between w-48 min-h-20 mb-1 gap-4">
            <div class="w-full flex flex-nowrap gap-1">
              <a-select
                v-model:value="formState[column?.dataIndex]"
                ref="searchInput"
                mode="tags"
                :placeholder="`${t('common.operation.search')} ${column?.dataIndex}`"
                @change="e => handleFilterSelectChange(e, setSelectedKeys)"
                @pressEnter="handleSearch(selectedKeys, confirm, column?.dataIndex)"
                allowClear
                class="flex-1"
              >
                <a-select-opt-group>
                  <template #label>{{ !!column?.customTitle ? column?.customTitle : !!column?.title ? column?.title : column?.dataIndex }}</template>
                  <a-select-option v-if="column?.dataIndex === 'product'" v-for="optionZh in productListZh" :key="optionZh" :value="optionZh">
                    {{ optionZh }}
                  </a-select-option>
                  <a-select-option v-else-if="column?.dataIndex==='productEn'" v-for="optionEn in productListEn" :key="optionEn" :value="optionEn">
                    {{ optionEn }}
                  </a-select-option>
                  <a-select-option v-else-if="column?.dataIndex==='erpCode'" v-for="erpCode in erpCodes" :key="erpCode" :value="erpCode">
                    {{ erpCode }}
                  </a-select-option>
                </a-select-opt-group>
              </a-select>
              <a-button type="primary" @click="handleSearch(selectedKeys, confirm, column?.dataIndex)" preIcon="ant-design:search-outlined" class=""/>
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
  <Result v-else-if="!hasMabangUsername" :status="Number(ExceptionEnum.PAGE_NOT_ACCESS)" :title="t('sys.invoice.missingMabangUsername')">
    <template #extra>
      <a-button key="console" type="primary" @click="returnHome()"> {{ t('sys.exception.backHome') }} </a-button>
    </template>
  </Result>
</template>
<script lang="ts">

import {defineComponent, onMounted, reactive, ref} from "vue";
import {Form, Result} from "ant-design-vue";
import {PageWrapper} from "/@/components/Page";
import {JSearchSelect, JSelectMultiple} from "/@/components/Form/";
import {useI18n} from "/@/hooks/web/useI18n";
import {useMessage} from "/@/hooks/web/useMessage";
import type {FormActionType} from "/@/components/Form";
import {useModal} from '/@/components/Modal';
import {BasicTable, TableImg, useTable} from "/@/components/Table";
import {
  downloadInventory,
  downloadInvoice,
  getMabangUsername,
  listCustomers,
  listSkus
} from "./ProductOrder.api";
import { columns } from "./ProductOrder.data";
import ProductOrderModal from "./components/ProductOrder.modal.vue";
import {ExceptionEnum} from "/@/enums/exceptionEnum";
import {useGo} from "/@/hooks/web/usePage";
import {SearchOutlined} from "@ant-design/icons-vue";

export default defineComponent({
  computed: {
    ExceptionEnum() {
      return ExceptionEnum
    }
  },
  components: {
    SearchOutlined,
    Result,
    TableImg,
    BasicTable,
    PageWrapper,
    JSelectMultiple,
    JSearchSelect,
    ProductOrderModal,
  },
  setup () {
    const {t} = useI18n();
    const { createMessage } = useMessage();
    const go = useGo();

    onMounted(() => {
      checkUserMabangUsername();
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
      product: [],
      productEn: [],
    });
    const { resetFields, validate, validateInfos } = useForm(formState, validatorRules, { immediate: false });

    const hasMabangUsername = ref<boolean>(false);

    const customerSelectList = ref<any>();
    const customerList = ref<any>();
    const customerListDisabled = ref<boolean>(false);

    const productListZh = ref<any>();
    const productListEn = ref<any>();
    const erpCodes = ref<any>();
    const productListDisabled = ref<boolean>(true);
    const productListVisible = ref<boolean>(false);

    const client = ref<any>();

    const skuList = ref<any>([]);

    const orderDisabled = ref<boolean>(true);

    const state = reactive({
      searchText: Array<any>(),
      searchedColumn: '',
    });
    const searchInput = ref();

    const iSorter = ref({
      field: 'erpCode',
      order: 'ascend'
    });
    let ipagination = ref({
      current: 1,
      defaultPageSize: 50,
      pageSize: 50,
      pageSizeOptions: ['50', '100', '200', '500'],
      showTotal: (total, range) => {
        return range[0] + '-' + range[1] + ' / ' + total
      },
      showQuickJumper: true,
      showSizeChanger: true,
      total: 0,
    });
    const [registerTable, { reload, clearSelectedRowKeys, getSelectRows, getSelectRowKeys, setLoading }] = useTable({
      columns: columns,
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
    });
    const [registerModal, {openModal}] = useModal();
    async function checkUserMabangUsername() {
      await getMabangUsername(handleMabangUsername);
    }
    function handleMabangUsername(username: string) {
      hasMabangUsername.value = username !== null;
      if(hasMabangUsername.value) {
        loadCustomerList();
      }
    }
    async function loadCustomerList() {
      await listCustomers(handleSetCustomer);
    }
    function handleSetCustomer(selectList, list) {
      customerSelectList.value = selectList;
      customerList.value = list;
    }
    function handleClientChange(id) {
      client.value = [];
      skuList.value = [];
      setLoading(false);

      let index = customerList.value.map(i => i.id).indexOf(id);
      client.value = customerList.value[index];
      if(id !== undefined) {
        loadSkuList();
      }
    }
    async function loadSkuList() {
      setLoading(true);
      await listSkus({clientId : client.value.id}, handleSetSkus);
      setLoading(false);
    }
    function handleSetSkus(skus) {
      skuList.value = skus;
      productListZh.value = skuList.value.map(i=> i.product);
      productListEn.value = skuList.value.map(i=> i.productEn);
      erpCodes.value = skuList.value.map(i=> i.erpCode);
      productListVisible.value = skuList.value.length > 0;
    }
    function orderMenu() {
      openModal(true, {
        showFooter: true,
        selectedRows: getSelectRows(),
      })
    }
    function onSelectChange() {
      orderDisabled.value = getSelectRows().length <= 0;
    }
    function getCheckboxProps(record: Recordable) {
      if(!!record.skuPrice) {
        return { disabled: false };
      } else {
        return { disabled: true }
      }
    }
    function handleModalSuccess (result:{filename: string, invoiceCode: string, invoiceEntity: string, internalCode: string, errorMsg: string}) {
      downloadInvoice(result.filename, handleDownloadSuccess);
      downloadInventory(result, handleDownloadSuccess);
      clearSelectedRowKeys();
      reload();
    }
    function handleDownloadSuccess() {
      createMessage.info("Download successful.");
    }
    function returnHome() {
      go();
    }
    const handleFilterSelectChange = (e, setSelectedKeys) => {
      setSelectedKeys(e ? [e] : [])
    }
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();
      state.searchText = selectedKeys;
      state.searchedColumn = dataIndex;
    };
    const handleReset = (clearFilters) => {
      clearFilters({ confirm: true });
      state.searchText = [];
      formState.product = [];
      formState.productEn = [];
    };
    const splitText = (text) => {
      const regexPattern = new RegExp(
        state.searchText[0].map(keyword => `(?<=${keyword})|(?=${keyword})`).join('|'),
        'i'
      );
      return text.split(regexPattern);
    };
    return {
      reload, clearSelectedRowKeys, getSelectRows, getSelectRowKeys, setLoading,
      registerTable, registerModal,
      handleModalSuccess,
      handleClientChange,
      handleFilterSelectChange,
      orderMenu,
      returnHome,
      handleReset,
      handleSearch,
      splitText,
      t,
      createMessage,
      formRef,
      labelCol,
      wrapperCol,
      validatorRules,
      formState,
      validateInfos,
      hasMabangUsername,
      customerSelectList,
      productListZh,
      productListEn,
      erpCodes,
      customerListDisabled,
      productListDisabled,
      orderDisabled,
      productListVisible,
      searchInput,
      state,
    }
  }
});
</script>
<style lang="less">
.ant-checkbox-disabled .ant-checkbox-inner{
  background-color: fade(@error-color, 10%);
  border-color: @error-color!important;
}
</style>
