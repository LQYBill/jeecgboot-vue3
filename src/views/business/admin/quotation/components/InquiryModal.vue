<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :width="860"
    :showCancelBtn="true"
    :showOkBtn="showFooter"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form';
import { inquiryFormSchema } from '../Inquiry.data';
import { inquiryAdd, inquiryEdit } from '../Quotation.api';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();

const emit = defineEmits(['success']);

const showFooter = ref(true);
const isUpdate = ref(false);
const currentId = ref<string | null>(null);

const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
  labelWidth: 120,
  schemas: inquiryFormSchema,
  showActionButtonGroup: false,
});

const [registerModal, { closeModal, setModalProps }] = useModalInner(async (data) => {
  await resetFields();

  isUpdate.value = !!data?.isUpdate;
  showFooter.value = data?.showFooter !== false;

  if (data?.record) {
    currentId.value = data.record.id ?? null;
    const r = { ...data.record };
    console.log('record data:', r);
    if (typeof r.inquiryCountry === 'string') {
      r.inquiryCountry = r.inquiryCountry
        ? r.inquiryCountry.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    } else if (!Array.isArray(r.inquiryCountry)) {
      r.inquiryCountry = [];
    }
    console.log('processed record data:', r);
    await setFieldsValue(r);
  } else {
    currentId.value = null;
  }

  setModalProps({ confirmLoading: false });
});

const modalTitle = computed(() => {
  if (!showFooter.value) return t('data.quotation.modalTitle.inquiryDetail');
  return isUpdate.value ? t('data.quotation.modalTitle.inquiryEdit') : t('data.quotation.modalTitle.inquiryAdd');
});

async function handleSubmit() {
  try {
    const values = await validate();
    console.log('submit values:', values);
    setModalProps({ confirmLoading: true });

    if (isUpdate.value) await inquiryEdit({ ...values, id: currentId.value });
    else await inquiryAdd(values);

    closeModal();
    emit('success');
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>
