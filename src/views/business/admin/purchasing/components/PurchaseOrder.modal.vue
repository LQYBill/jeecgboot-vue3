<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800"
              @ok="handleSubmit">
    <BasicForm v-if="!isOrder" @register="registerForm">
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
import {createMabangPurchaseOrder, fetchInvoiceEntitiesByClientId, saveOrUpdate, setPaymentApproved} from '../PurchaseOrder.api';
import {useI18n} from "/@/hooks/web/useI18n";
import {Modal} from "ant-design-vue";
import { useMessage } from '/@/hooks/web/useMessage';

const {t} = useI18n();
const { createMessage } = useMessage();
// Emits声明
const emit = defineEmits(['register', 'success','start-create']);
const isUpdate = ref(true);
const showFooter = ref(false);
const isOrder = ref(false);
const selectedRows = ref<any[]>([]);
const props = defineProps<{ canApprove: boolean }>();
//表单配置
const [registerForm, {setProps, resetFields, setFieldsValue, validate, updateSchema}] = useForm({
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
    destroyOnClose: true,
    okType: computed(() => (isOrder.value ? "warning" : "primary")),
    okText: computed(() => (isOrder.value ? t('data.order.createOrder') : t('common.okText'))),
  });
  isUpdate.value = !!data?.isUpdate;
  showFooter.value = !!data?.showFooter;
  await updateSchema([
    {
      field: 'clientId',
      componentProps: {
        onChange: async (clientId: string) => {
          await setFieldsValue({ invoiceEntityId: undefined });
          await loadInvoiceEntityOptions(clientId);
        },
      },
    },
  ]);
  if (unref(isUpdate)) {
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
    if (data.record?.clientId) {
      await loadInvoiceEntityOptions(data.record.clientId);
      await setFieldsValue({ invoiceEntityId: data.record.invoiceEntityId });
    }
  }
  isOrder.value = !!data?.isOrder;
  if(unref(isOrder)) {
    selectedRows.value = data?.selectedRows;
  }
  // 隐藏底部时禁用整个表单
  await setProps({disabled: !data?.showFooter})
  // 更新表单schema
  await updateSchema([
    {
      field: 'paymentApproved',
      ifShow: props.canApprove,
      dynamicDisabled: () => !props.canApprove,
    },
    ]);
});
function extractInvoiceEntityRows(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result?.records)) return payload.result.records;
  if (Array.isArray(payload?.result?.data)) return payload.result.data;
  return [];
}
async function loadInvoiceEntityOptions(clientId?: string) {
  // updateSchema deep-merges componentProps.options by array index rather than replacing it,
  // so the old list must be cleared first or a shorter new list would leave stale trailing entries.
  await updateSchema([{ field: 'invoiceEntityId', componentProps: { options: [] } }]);
  if (!clientId) return;
  try {
    const res = await fetchInvoiceEntitiesByClientId({ id: clientId });
    const options = extractInvoiceEntityRows(res).map((entity: Recordable) => ({
      label: [entity.invoiceEntity, entity.country, entity.currency].filter(Boolean).join(' / '),
      value: entity.id,
    }));
    await updateSchema([{ field: 'invoiceEntityId', componentProps: { options } }]);
  } catch (error) {
    console.error('failed to load invoice entities', error);
  }
}
//设置标题
const title = computed(() => (unref(isOrder) ? 'Order' : !unref(isUpdate) ? t('common.operation.addNew') : t('common.operation.edit')));

const results = ref<Recordable>({});

//表单提交事件
async function handleSubmit() {
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
    const { invoiceNumber, clientId, paymentApproved } = values;
    if (!props.canApprove) {
      delete values.paymentApproved;
    } else if (typeof paymentApproved !== 'undefined') {
      await setPaymentApproved({
          invoiceNumber,
          clientId,
          approved: !!paymentApproved,
      });
    }
    if(!!values.platformOrderId)
      values.platformOrderId = listFormatting(values.platformOrderId);
    //提交表单
    await saveOrUpdate(values, isUpdate.value)
      .then(res => {
        results.value = res;
      });
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', results.value);
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
    await createMabangPurchaseOrder({invoiceNumbers: invoiceNumbers},handleCreateMabangPurchaseOrder);
  } finally {
    setModalProps({confirmLoading: false});
  }
}
function handleCreateMabangPurchaseOrder() {
  emit('start-create');
  createMessage.success( t('data.purchase.taskStarted'),10);
  closeModal();
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
