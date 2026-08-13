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
    import {saveOrUpdate, fetchInvoiceEntitiesByClientId} from '../Credit.api';
    import {useI18n} from "/@/hooks/web/useI18n";
    import {useMessage} from "@/hooks/web/useMessage";
    import {InvoiceMetaData} from "@/views/business/dto";
    const { t } = useI18n();
    const { createMessage } = useMessage();
    const emit = defineEmits(['register','success']);
    const isUpdate = ref(true);
    const [registerForm, {setProps,resetFields, setFieldsValue, validate, updateSchema}] = useForm({
        //labelWidth: 150,
        schemas: formSchema,
        showActionButtonGroup: false,
        baseColProps: {span: 24}
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
        const entities = extractInvoiceEntityRows(res);
        const options = entities.map((entity: Recordable) => ({
          label: [entity.invoiceEntity, entity.country, entity.currency].filter(Boolean).join(' / '),
          value: entity.id,
        }));
        await updateSchema([{ field: 'invoiceEntityId', componentProps: { options } }]);
        const defaultEntity = entities.find((entity: Recordable) => entity.isDefault === '1');
        if (defaultEntity && !unref(isUpdate)) {
          await setFieldsValue({ invoiceEntityId: defaultEntity.id });
        }
      } catch (error) {
        console.error('failed to load invoice entities', error);
      }
    }

    const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
        await resetFields();
        setModalProps({confirmLoading: false,showCancelBtn:!!data?.showFooter,showOkBtn:!!data?.showFooter});
        isUpdate.value = !!data?.isUpdate;
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
            await setFieldsValue({
                ...data.record,
            });
            if (data.record?.clientId) {
              await loadInvoiceEntityOptions(data.record.clientId);
              await setFieldsValue({ invoiceEntityId: data.record.invoiceEntityId });
            }
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
