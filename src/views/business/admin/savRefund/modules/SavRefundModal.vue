<template>
  <BasicModal @register="registerModal" :title="title" @ok="handleSubmit" width="40%">
    <BasicForm @register="registerForm"  :disabled="isDisabled" />
  </BasicModal>
</template>
<script setup lang="ts">
import {BasicForm, FormSchema, useForm} from "/@/components/Form";
import {BasicModal, useModalInner} from "/@/components/Modal";
import {useI18n} from "/@/hooks/web/useI18n";
import {defHttp} from "/@/utils/http/axios";
import {computed, defineProps, ref, unref} from "vue";

const { t } = useI18n();

const emit = defineEmits(['register', 'success']);
const isUpdate = ref<boolean>(true);
const record = ref<any[]>([]);
//自定义接受参数
const props = defineProps({
  //是否禁用页面
  isDisabled: {
    type: Boolean,
    default: false,
  },
});
enum Api {
  add = "/savRefund/savRefund/add",
  edit = "/savRefund/savRefund/edit",
}
const formSchema: FormSchema[] = [
  {
    field: 'platformOrderId',
    label: t('data.invoice.platformOrderIDMabang'),
    component: 'JSearchSelect',
    required: true,
    componentProps: {
      dict: 'platform_order,platform_order_id,id',
      pageSize: 10,
      async: true,
    },
  },
  {
    field: 'purchaseRefund',
    label: t('data.refund.purchaseRefund'),
    component: 'Switch',
    required: true,
    defaultValue: 'N',
    componentProps: {
      checkedValue: 'Y',
      checkedChildren: t('common.yes'),
      unCheckedValue: 'N',
      unCheckedChildren: t('common.no'),
    },
  },
  {
    field: 'purchaseRefundAmount',
    label: t('data.refund.purchaseRefundAmount'),
    component: 'InputNumber',
    required: true,
    defaultValue: 1,
  },
  {
    field: 'shippingRefund',
    label: t('data.refund.shippingRefund'),
    component: 'Switch',
    required: true,
    defaultValue: 'N',
    componentProps: {
      checkedValue: 'Y',
      checkedChildren: t('common.yes'),
      unCheckedValue: 'N',
      unCheckedChildren: t('common.no'),
    },
  },
  {
    field: 'refundReason',
    label: t('data.refund.refundReason'),
    component: 'InputTextArea',
    required: true,
    componentProps: {
      placeholder: 'Sav Reason',
    }
  },
];
const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
  schemas: formSchema,
  showActionButtonGroup: false,
});
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  setModalProps({
    confirmLoading: false,
    showOkBtn: !props.isDisabled,
    okType: "danger",
    okText: t('common.operation.save')
  });
  isUpdate.value = !!data?.isUpdate;
  if (unref(isUpdate)) {
    // we fill the form with the current lines editable info
    await setFieldsValue({
      ...data.record,
    });
  }
  record.value = data.record;
  // console.log(`record : ${JSON.stringify(record.value)}`);
});
const title = computed(() => (!unref(isUpdate) ? t('common.operation.addNew') : props.isDisabled ? t('common.operation.details'): t('common.operation.edit')));
async function handleSubmit(v) {
  try {
    let values = await validate();
    console.log(`submit values : ${JSON.stringify(values)}`)
    setModalProps({ confirmLoading: true });
    //提交表单
    let url;
    let param = values;
    if(isUpdate.value) {
      url = Api.edit;
      param.id = record.value.id;
      await defHttp.put({url: url, params: param});
    }
    else {
      url = Api.add
      await defHttp.post({url: url, params: param});
    }
    // console.log(`submit param : ${JSON.stringify(param)}`);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', values);
  } catch (e) {
    console.error(e);
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>
<style>
.ant-modal-content {
  .ant-form {
    margin: 5px;
  }
  .ant-form-item-label {
    overflow: visible;
    flex: 0 1 30%;
    max-width: none;
    text-align: left;
  }
}
</style>
