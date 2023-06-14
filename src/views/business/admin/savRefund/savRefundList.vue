<template>
  <BasicTable
    @register="registerTable"
    :rowSelection="rowSelection"
  >
    <template #toolbar>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">{{ t('common.operation.addNew') }}</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="handleExportXls('SAV Refund List', Api.exportXls, exportParams)"> {{ t("common.operation.export") }}</a-button>
      <a-upload name="file" :showUploadList="false" :customRequest="(file) => handleImportXls(file, Api.importExcelUrl, reload)">
        <a-button preIcon="ant-design:import-outlined" type="primary">{{ t('common.operation.import') }}</a-button>
      </a-upload>
    </template>
    <template v-slot:refundStatus="record">
      <a-tag v-if="record.text === null" color="yellow">{{ t('data.refund.notRefunded') }}</a-tag>
      <a-tag v-else color="green">{{ t('data.refund.refunded') }} {{record.text}}</a-tag>
    </template>
    <template v-slot:yesno="record">
      <a-tag v-if="record.text === 'Y'" color="green">{{ t('common.yes') }}</a-tag>
      <a-tag v-else color="red">{{ t('common.no') }}</a-tag>
    </template>
    <template v-slot:action="{ record, column }">
      <TableAction
        :actions="[
          {
            label: t('common.operation.edit'),
            onClick: handleEdit.bind(null, record),
          },
        ]"
        :dropDownActions="[
          {
            label: t('common.operation.details'),
            onClick: handleDetail.bind(null, record),
          },
            {
              label: t('common.operation.delete'),
              icon: 'ic:outline-delete-outline',
              popConfirm: {
                title: t('common.operation.deleteConfirmation'),
                confirm: handleDelete.bind(null, record),
              },
            },
          ]"
      />
    </template>
  </BasicTable>
  <SavRefundModal @register="registerModal" @success="reload" :isDisabled="isDisabled"/>
</template>
<script lang="ts" setup>
import {BasicColumn, BasicTable, FormSchema, TableAction, useTable} from "/@/components/Table";
import {defHttp} from '/@/utils/http/axios';
import {useMessage} from '/@/hooks/web/useMessage';
import {useI18n} from "/@/hooks/web/useI18n";
import {useMethods} from "/@/hooks/system/useMethods";
import {computed, reactive, ref, toRaw, unref, watch} from "vue";
import {filterObj} from "/@/utils/common/compUtils";
import {useModal} from "/@/components/Modal";

import SavRefundModal from './modules/SavRefundModal.vue';

const { createMessage:msg } = useMessage();
const { t } = useI18n();
const { handleExportXls, handleImportXls } = useMethods();
const [registerModal, { openModal }] = useModal();

enum Api {
  list = "/savRefund/savRefund/list",
  add = "/savRefund/savRefund/add",
  edit = "/savRefund/savRefund/edit",
  delete = "/savRefund/savRefund/delete",
  deleteBatch = "/savRefund/savRefund/deleteBatch",
  exportXls = "/savRefund/savRefund/exportXls",
  importExcelUrl = "savRefund/savRefund/importExcel",
}

const isDisabled = ref(false);

const dictOptions = ref<Object>({});
const columns: BasicColumn[] = [
  {
    title: t('data.invoice.createBy'),
    align:"center",
    sorter: true,
    dataIndex: 'createBy',
    fixed: 'left',
    width: 150,
  },
  {
    title: t('data.invoice.createDate'),
    align:"center",
    sorter: true,
    dataIndex: 'createTime',
    fixed: 'left'
  },
  {
    title:t('data.invoice.shop'),
    align:"center",
    sorter: true,
    dataIndex: 'erpCode',
    fixed: 'left',
    width: 80,
  },
  {
    title: t('data.invoice.platformOrderIDMabang'),
    align:"center",
    sorter: true,
    dataIndex: 'platformOrderId_dictText',
    fixed: 'left',
    width: 200,
  },
  {
    title: t('data.invoice.platformOrderNumber'),
    align:"center",
    sorter: true,
    dataIndex: 'platformOrderNumber',
    fixed: 'left'
  },
  {
    title: t("data.refund.refundStatus"),
    align:"center",
    sorter: true,
    dataIndex: 'invoiceNumber',
    fixed: 'left',
    slots: { customRender : 'refundStatus' }
  },
  {
    title: t('data.refund.purchaseRefund'),
    align:"center",
    sorter: true,
    dataIndex: 'purchaseRefund',
    width: 100,
    slots: { customRender : 'yesno'},
  },
  {
    title: t('data.refund.purchaseRefundAmount'),
    align:"center",
    dataIndex: 'purchaseRefundAmount',
    editComponent: 'InputNumber',
    width: 150,
  },
  {
    title: t('data.refund.shippingRefund'),
    align:"center",
    sorter: true,
    dataIndex: 'shippingRefund',
    width: 100,
    slots: { customRender : 'yesno'},
  },
  {
    title: t('data.refund.fretFeeRefundAmount'),
    align:"center",
    dataIndex: 'fretFee',
  },
  {
    title: t('data.refund.shippingRefundAmount'),
    align:"center",
    dataIndex: 'shippingFee',
  },
  {
    title: t('data.refund.tvaRefundAmount'),
    align:"center",
    dataIndex: 'vat',
  },
  {
    title: t('data.refund.serviceFeeRefundAmount'),
    align:"center",
    dataIndex: 'serviceFee',
  },
  {
    title: t('data.refund.totalRefundAmount'),
    align:"center",
    sorter: true,
    dataIndex: 'totalRefundAmount',
  },
  {
    title:  t('data.refund.refundReason'),
    align: "center",
    dataIndex: 'refundReason',
    editRow: true,
  },
  {
    title: t('data.refund.refundDate'),
    align:"center",
    sorter: true,
    dataIndex: 'refundDate',
  },
  {
    title: t('common.operation.action'),
    dataIndex: 'action',
    align:"center",
    fixed:"right",
    width:147,
    slots: { customRender: 'action' }
  }
];
const searchFormSchema: FormSchema[] = [
  {
    field: "createBy",
    label: t("data.invoice.createBy"),
    labelWidth: 20,
    component: 'Input',
    componentProps: {
      placeholder: t('component.searchForm.selectUser'),
    },
    disabledLabelWidth:true,
    itemProps: {
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 18
      }
    },
    colProps: { span: 5 },
  },
  {
    field: "erpCode",
    label: t("data.invoice.shop"),
    labelWidth: 20,
    component: 'Input',
    componentProps: {
      placeholder: t('component.searchForm.shopFilter'),
    },
    disabledLabelWidth:true,
    itemProps: {
      labelCol: {
        span: 4,
      },
      wrapperCol: {
        span: 18
      }
    },
    colProps: { span: 5 },
  },
];

const iSorter = ref({
  column: 'createBy',
  order: 'ascend'
});
const checkedKeys = ref<Array<string | number>>([]);
const selectRows = ref<Array<any>>([]);
const rowSelection = {
  type: 'checkbox',
  columnWidth: 30,
  selectedRowKeys: checkedKeys,
  onChange: onSelectChange,
};
const exportParams = computed(()=>{
  let paramsForm = {};
  let list = "";
  if (selectRows.value && selectRows.value.length > 0) {
    for(let item of selectRows.value) {
      list = list.concat(item.id, ',');
    }
  }
  paramsForm['selections'] = list.slice(0,-1);
  console.log("Export param : ", JSON.stringify(paramsForm));
  return filterObj(paramsForm)
});
const list = (params) => {
  return defHttp.get({ url: Api.list, params });
}
const [registerTable, { reload, setProps }] = useTable({
  title: 'SAV',
  api: list,
  // pagination: { current: 1, pageSize: 200, pageSizeOptions: ['100', '200'], total: 0 },
  columns,
  ellipsis: false,
  useSearchForm: true,
  formConfig: {
    schemas: searchFormSchema,
  },
  //自定义默认排序
  defSort: iSorter.value,
  bordered: true,
  striped: true,
  showTableSetting: true,
  showSummary: true,
  showIndexColumn: true,
  clickToRowSelect: false,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  tableSetting: { fullScreen: true },
  canResize: false,
  rowKey: 'platformOrderId_dictText',
});
function handleAdd() {
  openModal(true, {
    isUpdate: false,
  });
}
function handleEdit(record) {
  isDisabled.value = false;
  openModal(true, {
    record,
    isUpdate: true,
  });
}
function handleDetail(record) {
  isDisabled.value = true;
  openModal(true, {
    record,
    isUpdate: true,
  });
}
function onSelectChange(selectedRowKeys: (string | number)[], selectRow) {
  console.log("checkedKeys------>", selectedRowKeys);
  console.log(selectRow);
  checkedKeys.value = selectedRowKeys;
  selectRows.value = selectRow;
}
function handleDelete(record: Recordable) {
  console.log(record.id);
  defHttp.delete({ url: Api.delete, data: { id: record.id } }, { joinParamsToUrl: true }).then(()=> {
    reload();
  }).catch(e =>{
    console.error(e);
  });
}
function onEditChange({ column, value, record }) {
  // 本例
  if (column.dataIndex === 'id') {
    record.editValueRefs.name4.value = `${value}`;
  }
  console.log(column, value, record);
}
const superQueryConfig =
{
  createBy: {type: 'string', title: '创建人', dictCode: '', order: 1},
  createTime: {title: '创建日期', type: 'datetime', order: 2},
  platformOrderId: {
    type: 'sel_search',
    title: '平台订单ID',
    dictTable: 'platform_order',
    dictText: 'platform_order_id',
    dictCode: 'id', order: 3
  },
  purchaseRefund: {title: '采购退款', type: 'switch', order: 4},
  purchaseRefundAmount: {
    type: 'BigDecimal',
    title: '采购退款金额',
    dictCode: '', order: 5
  },
  shippingRefund: {title: '运费退款', type: 'switch', order: 6},
  invoiceNumber: {title: '退款发票号', type: 'string', order: 7},
  refundDate: {title: '退款日期', type: 'date', order: 8},
}
const customSearch = ref(false);
const queryParam = reactive({
  shop: '',
  platformOrderId: '',
});
watch(customSearch, () => {
  setProps({ useSearchForm: !unref(customSearch) });
});
function searchQuery() {
  setProps({ searchInfo: toRaw(queryParam) });
  reload();
}
function searchReset() {
  Object.assign(queryParam, { shop: '', platformOrderId: ''});
  reload();
}
function handleSuperQuery(value, model, field) {
  console.log(value)
  console.log(model)
  console.log(field)
  // if(value){
  //   let str = decodeURI(value.superQueryParams)
  //   console.log(str)
  //   model[field] = str
  // }
}
</script>
<style>
.alert.ant-alert.ant-alert-info{
  margin: 1em 0;
}
.jeecg-basic-form.jeecg-basic-form--compact {
  .ant-form-item {
    justify-content: flex-end;
  }
}
</style>
