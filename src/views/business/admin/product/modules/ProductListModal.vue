<template>
  <BasicModal @register="registerModal" :title="title" @ok="handleSubmit" :height="350">
    <BasicForm @register="registerForm"  :disabled="isDisabled" class="pt-8 px-10"/>
  </BasicModal>
</template>
<script lang="ts" setup>

import {BasicForm, useForm} from "/@/components/Form";
import {BasicModal, useModalInner} from "/@/components/Modal";
import {useI18n} from "/@/hooks/web/useI18n";
import {defHttp} from "/@/utils/http/axios";
import {computed, defineProps, ref, unref, defineEmits} from "vue";
import {Api, getModalFormSchema} from "/@/views/business/admin/product/data";

const { t } = useI18n();

const emit = defineEmits(['register', 'success']);
const isUpdate = ref<boolean>(true);
const record = ref<any[]>([]);

const results = ref<Recordable>({});
//自定义接受参数
const props = defineProps({
  //是否禁用页面
  isDisabled: {
    type: Boolean,
    default: false,
  },
});

const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
  schemas: getModalFormSchema(),
  showActionButtonGroup: false,
  labelWidth: 120,
  labelAlign: 'left',
});
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  setModalProps({
    confirmLoading: false,
    showOkBtn: !props.isDisabled,
    okType: "warning",
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
});
const title = computed(() => (!unref(isUpdate) ? t('common.operation.addNew') : props.isDisabled ? t('common.operation.details'): t('common.operation.edit')));
async function handleSubmit() {
  try {
    let value = await validate();
    setModalProps({ confirmLoading: true });
    if(isUpdate.value) {
      let params: Recordable = {};
      params.weight = value.weight;
      params.effectiveDate = value.effectiveDate;
      params.ids = record.value;
      await defHttp.post({url: Api.updateBatch, params}).then((res) => {
        results.value = res;
      });
    }
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', results.value);
  } catch (e) {
    console.error(e);
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>
<style>

</style>
