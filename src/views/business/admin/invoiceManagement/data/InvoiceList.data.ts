import {BasicColumn, FormSchema} from "/@/components/Table";
import {useI18n} from "/@/hooks/web/useI18n";
import {getUserList} from "/@/api/common/api";
import {reactive, ref} from "vue";

const {t} = useI18n()

// options of the select menu in search menu
const userList = ref([]);
export const columns: BasicColumn[] = [
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
    title: t("data.Client"),
    align: "center",
    sorter: true,
    dataIndex: 'clientId_dictText'
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
  },
  {
    title: t('data.client.currency'),
    align: "center",
    fixed:"right",
    width: 100,
    dataIndex: 'currencyId_dictText'
  },
  {
    title: t('data.invoice.invoiceType'),
    align: "center",
    dataIndex: 'type',
    fixed: "right",
    width: 100,
    slots: {customRender: 'type'}
  },
  {
    title: t('common.operation.action'),
    dataIndex: 'action',
    align: "center",
    fixed: "right",
    width: 147,
    slots: { customRender: 'action' }
  }
];
export const searchFormSchema: FormSchema[] = [
  {
    field: "createBy",
    label: t("data.invoice.createBy"),
    labelWidth: 'auto',
    component: 'JSearchSelect',
    componentProps: {
      placeholder: t('component.searchForm.userSelect'),
      dictOptions: userList
    },
    // disabledLabelWidth:true,
    itemProps: {
      labelCol: reactive({
        xs: { span: 8 },
        lg: { span: 6 },
      }),
      wrapperCol: reactive({
        xs: { span: 16 },
        sm: { span: 18 },
      }),
    },
    colProps: { span: 8 },
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
      labelCol: reactive({
        xs: { span: 12 },
        lg: { span: 12 },
      }),
      wrapperCol: reactive({
        xs: { span: 12 },
        lg: { span: 12 },
      }),
    },
    colProps: { span: 6 },
  }
];
export const  fetchUserList = () => {
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
