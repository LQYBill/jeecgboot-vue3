<template>
    <BasicTable @register="registerTable" :rowSelection="rowSelection">
      <template #toolbar>
        <a-button type="primary" preIcon="ant-design:export-outlined" @click="handleExportXls('Invoice List', Api.exportXls, exportParams)"> {{ t("common.operation.export") }}</a-button>
        <a-button v-if="checkedKeys && checkedKeys.length > 0" type="primary" preIcon="ant-design:download-outlined" @click="downloadExcelInvoice('invoice')" :disabled = 'downloadInvoiceDisabled'> {{ t("data.invoice.downloadInvoice") }}</a-button>
        <a-button v-if="checkedKeys && checkedKeys.length > 0" type="primary" preIcon="ant-design:download-outlined" @click="downloadExcelInvoice('detail')" :disabled = 'downloadDetailDisabled'> {{ t("data.invoice.downloadDetails") }}</a-button>
      </template>
    </BasicTable>
</template>
<script async setup lang="ts">
import {BasicTable, FormSchema, useTable} from "/@/components/Table/";
import {BasicColumn} from '/@/components/Table/src/types/table';
import {downloadFile, getUserList} from '/@/api/common/api';
import {defHttp} from '/@/utils/http/axios';
import {useMessage} from '/@/hooks/web/useMessage';
import {useI18n} from "/@/hooks/web/useI18n";
import {useMethods} from "/@/hooks/system/useMethods";
import {computed, onMounted, ref} from "vue";
import {filterObj} from "/@/utils/common/compUtils";

const { createMessage } = useMessage();
const { t } = useI18n();
const { handleExportXls } = useMethods();

// options of the select menu in search menu
const userList = ref([]);
onMounted(async () => {
  fetchUserList();
})
// urls
enum Api {
  exportXls = '/generated/shippingInvoice/exportXls',
  list = "/generated/shippingInvoice/list",
  getClient = "/generated/shippingInvoice/getClient",
  downloadCompleteInvoiceExcel = "/generated/shippingInvoice/downloadCompleteInvoiceExcel",
}

const downloadInvoiceDisabled = ref(true);
const downloadDetailDisabled = ref(true);

const columns: BasicColumn[] = [
  {
    title: t("data.invoice.createBy"),
    align:"center",
    sorter: true,
    dataIndex: 'createBy'
  },
  {
    title: t("data.invoice.createDate"),
    align:"center",
    sorter: true,
    dataIndex: 'createTime'
  },
  {
    title: t("data.invoice.invoiceNumber"),
    align:"center",
    sorter: true,
    dataIndex: 'invoiceNumber'
  },
  {
    title: t("data.invoice.totalAmountDue"),
    align:"center",
    dataIndex: 'totalAmount'
  },
  {
    title: t("data.invoice.discountAmount"),
    align:"center",
    dataIndex: 'discountAmount'
  },
  {
    title: t("data.invoice.finalAmount"),
    align:"center",
    dataIndex: 'finalAmount'
  },
  {
    title: t("data.invoice.paidAmount"),
    align:"center",
    dataIndex: 'paidAmount'
  }
];
const searchFormSchema: FormSchema[] = [
  {
    field: "createBy",
    label: t("data.invoice.createBy"),
    labelWidth: 20,
    component: 'JSearchSelect',
    componentProps: {
        placeholder: t('component.searchForm.selectUser'),
        dictOptions: userList
    },
    disabledLabelWidth:true,
    itemProps: {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    },
    colProps: { span: 5 },
  },
  {
    field: "invoiceNumber",
    label: " " + t("data.invoice.invoiceNumber"),
    component: 'Input',
    componentProps: {
      placeholder: t('component.searchForm.enterInvoiceNumber'),
    },
    disabledLabelWidth:true,
    itemProps: {
      labelCol: {
        span: 6,
        offset: 1
      },
      wrapperCol: {
        span: 12
      }
    },
    colProps: { span: 6 },
  }
];
// get the list of all shipping invoice
const list = (params) => {
  return defHttp.get({ url: Api.list, params });
}
// creating table
const [registerTable, { reload }] = useTable({
  title: 'Invoice List',
  titleHelpMessage: "You can view and download all shipping invoices on this page.",
  api: list,
  columns,
  formConfig: {
    schemas: searchFormSchema,
  },
  //自定义默认排序
  defSort: {
    column: 'createTime',
    order: 'desc',
  },
  bordered: true,
  striped: true,
  useSearchForm: true,
  showTableSetting: true,
  showSummary: true,
  clickToRowSelect: true,
  showIndexColumn: true,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  tableSetting: { fullScreen: true },
  canResize: false,
  rowKey: 'invoiceNumber',
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
  let list:any[] = [];
  if (selectRows.value && selectRows.value.length > 0) {
    for(let item of selectRows.value) {
      list.push(item.id);
    }
  }
  paramsForm['selections'] = list;
  console.log("Export param : ", JSON.stringify(paramsForm));
  return filterObj(paramsForm)
});
function fetchUserList() {
  let param = {
    pageNo: 1,
    pageSize: 50
  };
  getUserList(param).then(res => {
    userList.value = res.records.map(
      user => ({
        text: user.username,
        value: user.username,
      })
    );
    if (res.pages > 1) {
      for (let i = 2; i <= res.pages; i++) {
        getUserList({pageNo: i, pageSize: 50}).then(r => {
          let oldUserList = userList.value;
          let newUserList = r.records.map(
            user => ({
              text: user.username,
              value: user.username,
            })
          );
          for(let item of oldUserList) {
            newUserList.push(item);
          }
          userList.value = newUserList;
        });
      }
    }
  });
}
function downloadExcelInvoice(type) {
  if(checkedKeys.value.length === 0) {
    downloadInvoiceDisabled.value = true;
    downloadDetailDisabled.value = true;
    return;
  }
  let today = new Date();
  let month = today.getMonth()+1 < 10 ? '0'+(today.getMonth()+1) : today.getMonth()+1;
  let day = today.getDate() < 10 ? '0'+today.getDate() : today.getDate();
  let date = today.getFullYear()+'-'+ month +'-'+ day;

  for( let invoiceNum of checkedKeys.value) {
    console.log("invoice : " + invoiceNum);
    const param = {
      invoiceNumber: invoiceNum,
      filetype: type
    }
    defHttp.get({url: Api.getClient, params: param})
      .then(res => {
        console.log("Get res : " + JSON.stringify(res));
        let filename = "";
        if(type === "invoice") {
          filename = "Invoice N°" + invoiceNum + " (" + res.invoiceEntity + ").xlsx";
        }
        else {
          filename = res.internalCode + "_" + invoiceNum + '_Détail_calcul_de_facture_' + date + '.xlsx';
        }
        console.log("Filename : " + filename);
        downloadFile(Api.downloadCompleteInvoiceExcel, filename, param).then(() => {
          console.log("Download param : " + JSON.stringify(param));
        }).catch((err) => {
          console.error(err);
          createMessage.error(invoiceNum + " : " + err);
        });
      }).catch((e) => {
        console.error("Failed to find the shop owner ! Check if invoice is valid : " + invoiceNum);
        createMessage.error(e);
      })
  }
}
function onSelectChange(selectedRowKeys: (string | number)[], selectRow) {
  checkedKeys.value = selectedRowKeys;
  selectRows.value = selectRow;
  console.log("checkedKeys------>", checkedKeys.value);
  console.log("selectRows------>", selectRows.value);
  downloadInvoiceDisabled.value = false;
  downloadDetailDisabled.value = false;
}
</script>
<style>
.alert.ant-alert.ant-alert-info{
  margin: 1em 0;
}
</style>
