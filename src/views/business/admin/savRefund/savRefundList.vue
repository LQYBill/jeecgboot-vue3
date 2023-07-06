<template>
  <a-card>
    <BasicForm
      @register="registerForm"
      @submit="handleFilter"
    />

  </a-card>
  <BasicTable
    :columns="columns"
    :dataSource="dataSource"
    :rowSelection="rowSelection"
    :pagination="iPagination"
    :ellipsis="false"
    striped="striped"
    :click-to-row-select="false"
    :def-sort="iSorter"
    @change="handleTableChange"
    :loading="loading"
  >
    <template #toolbar>
      <a-button type="primary" preIcon="ant-design:plus-outlined" @click="handleAdd">{{ t('common.operation.addNew') }}</a-button>
      <a-button type="primary" preIcon="ant-design:export-outlined" @click="handleExportXls('SAV Refund List', Api.exportXls, exportParams)"> {{ t("common.operation.export") }}</a-button>
      <a-upload name="file" :showUploadList="false" :customRequest="(file) => handleImportXls(file, Api.importExcelUrl, loadList)">
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
  <SavRefundModal @register="registerModal" @success="loadList" :isDisabled="isDisabled"/>
</template>
<script lang="ts" setup>
import {BasicColumn, BasicTable, FormSchema, TableAction, useTable} from "/@/components/Table";
import {defHttp} from '/@/utils/http/axios';
import {useMessage} from '/@/hooks/web/useMessage';
import {useI18n} from "/@/hooks/web/useI18n";
import {useMethods} from "/@/hooks/system/useMethods";
import {computed, onMounted, reactive, ref, toRaw, unref, watch} from "vue";
import {filterObj} from "/@/utils/common/compUtils";
import {useModal} from "/@/components/Modal";

import SavRefundModal from './modules/SavRefundModal.vue';
import BasicForm from "/@/components/Form/src/BasicForm.vue";
import {useForm} from "/@/components/Form";
import {toUpper} from "lodash-es";

const { createMessage:msg } = useMessage();
const { t } = useI18n();
const { handleExportXls, handleImportXls } = useMethods();
const [registerModal, { openModal }] = useModal();

onMounted(()=> {
  loadList();
})
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
  {
    field: "platformOrderId",
    label: t("data.invoice.platformOrderID"),
    component: 'Input',
    componentProps: {
      placeholder: t('component.searchForm.platformOrderIDFilter'),
    },
    disabledLabelWidth:true,
    itemProps: {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 16,
      }
    },
    colProps: { span: 5 },
  },
];
const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
  schemas: searchFormSchema,
  showActionButtonGroup: true,
});
const iPagination = ref<any>({
  current: 1,
  pageSize: 100,
  pageSizeOptions: ['100', '200', '500'],
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
});
const iSorter = ref({
  column: 'invoiceNumber',
  order: 'asc'
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
  return filterObj(paramsForm)
});
const dataSource = ref<Recordable<any>[]>();
const filters = ref({});
const loading = ref<boolean>(false);
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
  checkedKeys.value = selectedRowKeys;
  selectRows.value = selectRow;
}
function handleDelete(record: Recordable) {
  defHttp.delete({ url: Api.delete, data: { id: record.id } }, { joinParamsToUrl: true }).then(()=> {
    loadList();
  }).catch(e =>{
    console.error(e);
  });
}
function onEditChange({ column, value, record }) {
  // 本例
  if (column.dataIndex === 'id') {
    record.editValueRefs.name4.value = `${value}`;
  }
}
function handleFilter(values) {
  filters.value = values;
  loadList(1);
}
function handleTableChange(pagination, filters, sorter) {
  console.log(pagination);
  console.log(sorter);
  iPagination.value = pagination;
  if (Object.keys(sorter).length > 0) {
    console.log("haha");
    iSorter.value.column = sorter.field
    iSorter.value.order = 'ascend' === sorter.order ? 'asc' : 'desc'
  }
  loadList();
}
function getQueryParams() {
  let params = Object.assign(iSorter.value);
  params.pageNo = iPagination.value.current;
  params.pageSize = iPagination.value.pageSize;
  params.order = toUpper(iSorter.value.order);
  params.column = iSorter.value.column;
  params.shop = filters.value.erpCode;
  params.orderID = filters.value.platformOrderId;
  return filterObj(params);
}
function loadList(arg?) {
  loading.value = true;
  if (arg === 1) {
    iPagination.value.current = 1;
  }
  let params = getQueryParams();
  console.log(`params : ${JSON.stringify(params)}`);
  defHttp.get({ url: Api.list, params: params }).then(res=> {
    console.log(res);
    dataSource.value = res.records;
    if (res.total) {
      iPagination.value.total = res.total;
    } else {
      iPagination.value.total = 0;
    }
  }).catch(e=> {
    console.error(e);
  }).finally(()=> {
    loading.value = false;
  });
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
