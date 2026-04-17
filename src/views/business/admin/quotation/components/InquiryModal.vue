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
import { useUserStore } from '/@/store/modules/user';
import { inquiryFormSchema } from '../Inquiry.data';
import { getCurrentClient, getMergedCountryOptions, inquiryAdd, inquiryEdit } from '../Quotation.api';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();

const emit = defineEmits(['success']);

const showFooter = ref(true);
const isUpdate = ref(false);
const currentId = ref<string | null>(null);
const userStore = useUserStore();

const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
  labelWidth: 120,
  schemas: inquiryFormSchema,
  showActionButtonGroup: false,
  autoSetPlaceHolder: false,
});

function normalizePriorityMode(value?: string) {
  if (value === '一件代发') return 'dropShipping';
  if (value === '库存模式') return 'stockMode';
  return value;
}

async function applyCountryOptions() {
  try {
    const options = await getMergedCountryOptions();
    await updateSchema({
      field: 'inquiryCountry',
      componentProps: {
        options,
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 'responsive',
        allowClear: true,
      },
    });
  } catch (error) {
    console.warn('[inquiry-modal] failed to load country options', error);
  }
}

async function applyInquiryClientDisplayScope(isAdd: boolean) {
  let isEmployee = userStore.getIsEmployee;
  let currentClientId = '';
  try {
    const res = await getCurrentClient();
    if (res?.internal) {
      isEmployee = true;
    } else if (res?.client?.id) {
      isEmployee = false;
      currentClientId = String(res.client.id);
    }
  } catch (error) {
    console.warn('[inquiry-modal] failed to load current client', error);
  }

  await updateSchema({
    field: 'inquiryClient',
    componentProps: {
      dictCode: 'client,internal_code,id',
      showSearch: true,
      disabled: !isEmployee,
      allowClear: isEmployee,
    },
  });

  if (!isEmployee && isAdd && currentClientId) {
    await setFieldsValue({
      inquiryClient: currentClientId,
    });
  }
}

const [registerModal, { closeModal, setModalProps }] = useModalInner(async (data) => {
  await resetFields();

  isUpdate.value = !!data?.isUpdate;
  showFooter.value = data?.showFooter !== false;
  await applyCountryOptions();
  await applyInquiryClientDisplayScope(!data?.record);

  if (data?.record) {
    currentId.value = data.record.id ?? null;
    const r = { ...data.record };
    if (typeof r.inquiryCountry === 'string') {
      r.inquiryCountry = r.inquiryCountry
        ? r.inquiryCountry.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
    } else if (!Array.isArray(r.inquiryCountry)) {
      r.inquiryCountry = [];
    }
    r.priorityMode = normalizePriorityMode(r.priorityMode);
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
    values.priorityMode = normalizePriorityMode(values.priorityMode);
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
