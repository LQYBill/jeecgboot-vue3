<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800"
              @ok="handleSubmit">
    <BasicForm @register="registerForm"/>
  </BasicModal>
</template>

<script lang="ts" setup>
import {ref, computed, unref} from 'vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import {BasicForm, useForm} from '/@/components/Form/index';
import {formSchema, listFormatting} from '../PurchaseOrder.data';
import {saveOrUpdate} from '../PurchaseOrder.api';
import {useMessage} from "/@/hooks/web/useMessage";
import {useI18n} from "/@/hooks/web/useI18n";

const {t} = useI18n();
const {createMessage} = useMessage();
// Emits声明
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
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
    showOkBtn: !!data?.showFooter
  });
  isUpdate.value = !!data?.isUpdate;
  if (unref(isUpdate)) {
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
  }
  // 隐藏底部时禁用整个表单
  setProps({disabled: !data?.showFooter})
});
//设置标题
const title = computed(() => (!unref(isUpdate) ? t('common.operation.addNew') : t('common.operation.edit')));

//表单提交事件
async function handleSubmit(v) {
  try {
    let values = await validate();
    setModalProps({confirmLoading: true});
    console.log(values)
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
