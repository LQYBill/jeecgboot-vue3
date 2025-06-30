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
import {formSchema} from '../ShopOptions.data';
import {saveOrUpdate} from '../ShopOptions.api';
import {useI18n} from 'vue-i18n';
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const { t } = useI18n();
const [registerForm, {setProps, resetFields, setFieldsValue, validate}] = useForm({
  labelWidth: '100%',
  schemas: formSchema,
  showActionButtonGroup: false,
  baseColProps: {span: 24},
  layout: 'vertical',
});
const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
  await resetFields();
  setModalProps({
    confirmLoading: false,
    showCancelBtn: !!data?.showFooter,
    showOkBtn: !!data?.showFooter
  });
  isUpdate.value = !!data?.isUpdate;
  if (unref(isUpdate)) {
    await setFieldsValue({
      ...data.record,
    });
  }
  await setProps({disabled: !data?.showFooter})
});
const title = computed(() => (!unref(isUpdate) ? t('common.operation.add') : t('common.operation.edit')));

async function handleSubmit(_v) {
  try {
    let values = await validate();
    setModalProps({confirmLoading: true});
    await saveOrUpdate(values, isUpdate.value);
    closeModal();
    emit('success');
  } finally {
    setModalProps({confirmLoading: false});
  }
}
</script>

<style lang="less" scoped>
:deep(.ant-input-number) {
  width: 100%
}

:deep(.ant-calendar-picker) {
  width: 100%
}
</style>
