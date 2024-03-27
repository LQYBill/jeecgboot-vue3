<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800"
              @ok="handleSubmit">
    <BasicForm v-if="!isOrder" @register="registerForm">
      <template #paidAmount="{record, model, field}">
        <div class="flex flex-row ">
          <a-input-number v-model:value="model[field]" :placeholder="t('data.invoice.paidAmount')" :min="0" :precision="2" class="w-10/12"/>
          <a-button  v-if="isUpdate" type="primary" @click="autofill(model)">Auto-fill</a-button>
        </div>
      </template>
    </BasicForm>
    <div v-else class="">
      <ul class="flex flex-col rounded-md overflow-hidden">
        <li v-for="item in selectedRows" :key="item" class=" even:bg-lightGray odd:bg-white flex py-4">
          <span class="flex-1 text-center">{{ item?.clientId_dictText }}</span><span class="flex-1 text-center">{{ item?.invoiceNumber }}</span><span class="flex-1 text-center">{{ item?.finalAmount }} {{ item?.currencyId_dictText }}</span>
        </li>
      </ul>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
import {ref, computed, unref} from 'vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import {BasicForm, useForm} from '/@/components/Form/index';
import {formSchema, listFormatting} from '../PurchaseOrder.data';
import {createMabangPurchaseOrder, saveOrUpdate} from '../PurchaseOrder.api';
import {useMessage} from "/@/hooks/web/useMessage";
import {useI18n} from "/@/hooks/web/useI18n";
import {Modal} from "ant-design-vue";

const {t} = useI18n();
const {createMessage} = useMessage();
// Emits声明
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const isOrder = ref(false);
const selectedRows = ref<any[]>([]);
//表单配置
const [registerForm, {setProps, resetFields, setFieldsValue, validate}] = useForm({
  //labelWidth: 150,
  schemas: formSchema,
  showActionButtonGroup: false,
  baseColProps: {span: 24}
});
//表单赋值
const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  setModalProps({
    confirmLoading: false,
    showCancelBtn: !!data?.showFooter,
    showOkBtn: !!data?.showFooter,
    okType: computed(() => (isOrder.value ? "warning" : "primary")),
    okText: computed(() => (isOrder.value ? t('data.order.createOrder') : t('common.okText'))),
  });
  isUpdate.value = !!data?.isUpdate;
  if (unref(isUpdate)) {
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
  }
  isOrder.value = !!data?.isOrder;
  if(unref(isOrder)) {
    selectedRows.value = data?.selectedRows;
  }
  // 隐藏底部时禁用整个表单
  setProps({disabled: !data?.showFooter})
});
//设置标题
const title = computed(() => (unref(isOrder) ? 'Order' : !unref(isUpdate) ? t('common.operation.addNew') : t('common.operation.edit')));

//表单提交事件
async function handleSubmit(v) {
  if(unref(isOrder)) {
    Modal.confirm({
      title: t('data.order.createOrderConfirmation'),
      content: t('data.order.createOrderConfirmation'),
      okText: t('component.drawer.okText'),
      cancelText: t('component.drawer.cancelText'),
      centered: true,
      onOk: async () => {
        await submitMabangPurchaseOrder();
      }
    })
  }
  else {
    await submitPurchaseOrder();
  }
}
async function submitPurchaseOrder() {
  try {
    let values = await validate();
    setModalProps({confirmLoading: true});
    if(!!values.platformOrderId)
      values.platformOrderId = listFormatting(values.platformOrderId);
    //提交表单
    await saveOrUpdate(values, isUpdate.value)
      .then(res => {
        if(!!res.success)
          createMessage.success(t('data.purchase.orderAttributionSuccess', {var : res.success}));
        if(!!res.fail)
          createMessage.error(t(`data.purchase.orderAttributionFail`, {var: res.fail}));
      });
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success');
  } finally {
    setModalProps({confirmLoading: false});
  }
}
async function submitMabangPurchaseOrder() {
  try {
    setModalProps({confirmLoading: true});
    // params = selectedRows value concat invoiceNumbers
    let invoiceNumbers = "";
    for(let i = 0; i < selectedRows.value.length; i++) {
      invoiceNumbers += selectedRows.value[i].invoiceNumber;
      if(i < selectedRows.value.length - 1)
        invoiceNumbers += ",";
    }
    // await createMabangPurchaseOrder([invoiceNumbers]);
    await createMabangPurchaseOrder({invoiceNumbers: invoiceNumbers}, handleCreateMabangPurchaseOrder);
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success');
  } finally {
    setModalProps({confirmLoading: false});
  }
}
function handleCreateMabangPurchaseOrder(data:any) {
  if(data.success.length > 0)
    createMessage.success(t('data.purchase.mabangOrderCreateSuccessForInvoices', {var: data.success}));
  if(data.fail.length > 0)
    createMessage.error(t('data.purchase.mabangOrderCreateFailForInvoices', {var: data.fail}));
}
function autofill(model) {
  setFieldsValue({
    paidAmount: model.finalAmount,
  });
}
</script>

<style lang="less" scoped>
/** 时间和数字输入框样式 */
:deep(.ant-input-number) {
  width: 100%
}

:deep(.ant-calendar-picker) {
  width: 100%
}
</style>
