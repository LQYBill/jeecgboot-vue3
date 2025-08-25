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
import {ShopOptionsUpdateParam, ShopOptionsAddParam} from "@/views/business/dto";
const emit = defineEmits(['register', 'success']);
const { t } = useI18n();

const isUpdate = ref(true);
const [registerForm, {setProps, resetFields, setFieldsValue, validate, removeSchemaByFiled, appendSchemaByField}] = useForm({
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
    await removeSchemaByFiled('shopIds');
    await appendSchemaByField(
      {
        field: 'shopId',
        label: t('data.shop.default'),
        component: "JSearchSelect",
        componentProps: {
          dict: "shop,erp_code,id",
          placeholder: t('data.shop.default'),
        },
        dynamicDisabled: true,
      },
      '',
      true
    );
    await setFieldsValue({
      ...data.record,
    });
  } else {
    await setFieldsValue({
      shopIds: data.shopIds ? data.shopIds : '',
    })
  }
  await setProps({disabled: !data?.showFooter})
});
const title = computed(() => (!unref(isUpdate) ? t('common.operation.add') : t('common.operation.edit')));

async function handleSubmit() {
  try {
    const values = await validate();
    let param: ShopOptionsAddParam | ShopOptionsUpdateParam = {
      ...values,
    };
    if(isUpdate.value) Object.assign(param, {id: values.shopOptionsId})
    else Object.assign(param, {shopIds: values.shopIds.split(',').map((shopId: string) => shopId.trim())});
    setModalProps({confirmLoading: true});
    await saveOrUpdate(param, isUpdate.value);
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
