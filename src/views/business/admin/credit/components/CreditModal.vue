<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">
      <BasicForm @register="registerForm"/>
  </BasicModal>
</template>

<script lang="ts" setup>
    import {ref, computed, unref} from 'vue';
    import {BasicModal, useModalInner} from '/@/components/Modal';
    import {BasicForm, useForm} from '/@/components/Form/index';
    import {formSchema} from '../Credit.data';
    import {saveOrUpdate} from '../Credit.api';
    import {useI18n} from "/@/hooks/web/useI18n";
    import {useMessage} from "@/hooks/web/useMessage";
    import {InvoiceMetaData} from "@/views/business/dto/invoiceMetaData.dto";
    const { t } = useI18n();
    const { createMessage } = useMessage();
    const emit = defineEmits(['register','success']);
    const isUpdate = ref(true);
    const [registerForm, {setProps,resetFields, setFieldsValue, validate}] = useForm({
        //labelWidth: 150,
        schemas: formSchema,
        showActionButtonGroup: false,
        baseColProps: {span: 24}
    });
    const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
        await resetFields();
        setModalProps({confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter});
        isUpdate.value = !!data?.isUpdate;
        if (unref(isUpdate)) {
            await setFieldsValue({
                ...data.record,
            });
        }
       await setProps({disabled: !data?.showFooter})
    });
    const title = computed(() => (!unref(isUpdate) ? t('common.operation.addNew') : t('common.operation.edit')));
    async function handleSubmit() {
        try {
            let values = await validate();
            setModalProps({confirmLoading: true});
            await saveOrUpdate(values, isUpdate.value).then((res: InvoiceMetaData) => {
              closeModal();
              emit('success', res);
            }).catch(err => {
                setModalProps({confirmLoading: false});
                createMessage.error(err.message);
            });
        } finally {
            setModalProps({confirmLoading: false});
        }
    }
</script>

<style lang="less" scoped>
  :deep(.ant-input-number){
		width: 100%
	}

	:deep(.ant-calendar-picker){
		width: 100%
	}
</style>
