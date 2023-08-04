<template>
  <BasicModal @register="registerModal" :title="title" @ok="handleSubmit">
    <BasicForm @register="registerForm"  :disabled="isDisabled" />
  </BasicModal>
</template>
<script lang="ts" setup>

import {defineComponent} from "vue";
import {BasicForm, useForm} from "/@/components/Form";
import {BasicModal, useModalInner} from "/@/components/Modal";
import {useI18n} from "/@/hooks/web/useI18n";
import {defHttp} from "/@/utils/http/axios";
import {computed, defineProps, ref, unref, defineEmits} from "vue";
import {getModalFormSchema} from "/@/views/business/admin/product/tableData";

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
  // edit = "/product/product/edit",
  edit = "/product/product/editBatch",
}

const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
  schemas: getModalFormSchema(),
  showActionButtonGroup: false,
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
  console.log(`record : ${JSON.stringify(record.value)}`);
});
const title = computed(() => (!unref(isUpdate) ? t('common.operation.addNew') : props.isDisabled ? t('common.operation.details'): t('common.operation.edit')));
async function handleSubmit() {
  try {
    let value = await validate();
    console.log(value)
    setModalProps({ confirmLoading: true });
    let param = {};
    if(isUpdate.value) {
      param.weight = value.weight;
      param.ids = record.value;
      console.log(`submit param : ${JSON.stringify(param)}`)
      await defHttp.post({url: Api.edit, params: param});
    }
    //关闭弹窗
    closeModal();
    //刷新列表
    emit('success', value);
  } catch (e) {
    console.error(e);
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>
<style>

</style>
