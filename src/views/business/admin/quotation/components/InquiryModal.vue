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
    <BasicForm @register="registerForm">
      <template #inquiryLinks="{ model, field }">
        <InquiryLinkListInput v-model:value="model[field]" :disabled="!showFooter" />
      </template>
    </BasicForm>
  </BasicModal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form';
import { useUserStore } from '/@/store/modules/user';
import InquiryLinkListInput from './InquiryLinkListInput.vue';
import { inquiryFormSchema } from '../Inquiry.data';
import { getClientOptions, getCurrentClient, getInquiryClientSalespersons, getMergedCountryOptions, getSalespersons, inquiryAdd, inquiryEdit } from '../Inquiry.api';
import { useI18n } from '/@/hooks/web/useI18n';
import { useMessage } from '/@/hooks/web/useMessage';
const { t } = useI18n();
const { createMessage } = useMessage();

const emit = defineEmits(['success']);

const showFooter = ref(true);
const isUpdate = ref(false);
const currentId = ref<string | null>(null);
const userStore = useUserStore();
const clientOptionsRef = ref<any[]>([]);
let clientSalespersonsRequestId = 0;

const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
  labelWidth: 120,
  schemas: inquiryFormSchema,
  showActionButtonGroup: false,
  autoSetPlaceHolder: false,
});

const clientLockedFields = new Set(['inquiryClient', 'inquirySales']);
async function applyReadOnlyMode(readonly: boolean) {
  await updateSchema(
    inquiryFormSchema
      .filter((schema) => !clientLockedFields.has(String(schema.field || '')))
      .map((schema) => ({
        field: schema.field,
        dynamicDisabled: () => readonly,
        componentProps: {
          ...(schema.componentProps || {}),
          disabled: readonly,
        },
      }))
  );
}

function normalizePriorityMode(value?: string) {
  if (value === '一件代发') return 'dropShipping';
  if (value === '库存模式') return 'stockMode';
  return value;
}

function normalizeMultiValue(value: any): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function firstNonEmpty(...values: any[]) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') return value;
  }
  return undefined;
}

function isKnownOrEmptyClient(clientId?: string) {
  if (!clientId) return true;
  return clientOptionsRef.value.some((opt) => String(opt.value) === String(clientId));
}

function mapInquiryRecordToForm(record: Record<string, any>) {
  const mapped = { ...(record || {}) } as any;
  const clientId = firstNonEmpty(mapped.inquiryClient, mapped.clientId);
  const knownOrEmpty = isKnownOrEmptyClient(clientId);
  mapped.inquiryClientUnregistered = !!clientId && !knownOrEmpty;
  mapped.inquiryClient = knownOrEmpty ? clientId : '';
  mapped.inquiryClientText = knownOrEmpty ? '' : clientId;
  mapped.inquirySales = normalizeMultiValue(firstNonEmpty(mapped.inquirySalesList, mapped.inquirySales, mapped.salesId));
  const inquiryCountry = firstNonEmpty(mapped.inquiryCountry, mapped.countryId);
  if (Array.isArray(inquiryCountry)) {
    mapped.inquiryCountry = inquiryCountry.map(String).filter(Boolean);
  } else if (typeof inquiryCountry === 'string') {
    mapped.inquiryCountry = inquiryCountry
      ? inquiryCountry.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  } else if (inquiryCountry !== undefined) {
    mapped.inquiryCountry = [String(inquiryCountry)];
  } else {
    mapped.inquiryCountry = [];
  }
  mapped.inquiryLink = firstNonEmpty(mapped.inquiryLink, mapped.inquiryUrl, mapped.link);
  mapped.inquiryPhoto = firstNonEmpty(mapped.inquiryPhoto, mapped.photo);
  mapped.inquirySpec = firstNonEmpty(mapped.inquirySpec, mapped.specification);
  mapped.inquiryRemark = firstNonEmpty(mapped.inquiryRemark, mapped.remark);
  mapped.inquiryColor = firstNonEmpty(mapped.inquiryColor, mapped.color);
  mapped.priorityMode = normalizePriorityMode(mapped.priorityMode);
  return mapped;
}

function mapFormValuesToInquiryPayload(values: Record<string, any>) {
  const inquiryCountry = Array.isArray(values.inquiryCountry)
    ? values.inquiryCountry.map(String).filter(Boolean)
    : normalizeMultiValue(values.inquiryCountry);
  const inquirySales = Array.isArray(values.inquirySales)
    ? values.inquirySales.map(String).filter(Boolean)
    : normalizeMultiValue(values.inquirySales);

  const clientId = values.inquiryClientUnregistered
    ? firstNonEmpty(values.inquiryClientText, '')
    : firstNonEmpty(values.inquiryClient, values.clientId);

  return {
    clientId,
    salesId: inquirySales.join(','),
    countryId: inquiryCountry.join(','),
    link: firstNonEmpty(values.inquiryLink, values.inquiryUrl, values.link),
    expectedSales: values.expectedSales,
    photo: firstNonEmpty(values.inquiryPhoto, values.photo, ''),
    specification: firstNonEmpty(values.inquirySpec, values.specification, ''),
    attachments: firstNonEmpty(values.attachments, ''),
    remark: firstNonEmpty(values.inquiryRemark, values.remark, ''),
    color: firstNonEmpty(values.inquiryColor, values.color, ''),
    priorityMode: normalizePriorityMode(values.priorityMode),
  };
}

async function onInquiryClientChange(clientId?: string) {
  const requestId = ++clientSalespersonsRequestId;
  await setFieldsValue({ inquirySales: [] });
  if (!clientId) return;

  try {
    const salesIds = await getInquiryClientSalespersons(String(clientId));
    if (requestId !== clientSalespersonsRequestId) return;
    await setFieldsValue({ inquirySales: salesIds });
  } catch (error) {
    console.warn('[inquiry-modal] failed to load client salespersons', error);
  }
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

async function applySalespersonOptions(isEmployee: boolean, readonly: boolean) {
  const disabled = readonly || !isEmployee;
  try {
    const options = await getSalespersons();
    await updateSchema({
      field: 'inquirySales',
      dynamicDisabled: () => disabled,
      componentProps: {
        options,
        showSearch: true,
        mode: 'multiple',
        maxTagCount: 'responsive',
        allowClear: !disabled,
        disabled,
      },
    });
  } catch (error) {
    console.warn('[inquiry-modal] failed to load salesperson options', error);
  }
}

async function resolveCurrentClientContext() {
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
  return { isEmployee, currentClientId };
}

async function applyInquiryClientDisplayScope(isAdd: boolean, isEmployee: boolean, currentClientId: string, readonly: boolean) {
  const disabled = readonly || !isEmployee;
  let clientOptions: any[] = [];
  try {
    clientOptions = await getClientOptions();
    clientOptionsRef.value = clientOptions;
  } catch (error) {
    console.warn('[inquiry-modal] failed to load client options', error);
  }

  await updateSchema({
    field: 'inquiryClient',
    dynamicDisabled: () => disabled,
    componentProps: {
      options: clientOptions,
      showSearch: true,
      disabled,
      allowClear: !disabled,
      onChange: onInquiryClientChange,
    },
  });

  if (!isEmployee && isAdd && currentClientId) {
    await setFieldsValue({
      inquiryClient: currentClientId,
    });
    await onInquiryClientChange(currentClientId);
  }
}

const [registerModal, { closeModal, setModalProps }] = useModalInner(async (data) => {
  await resetFields();

  isUpdate.value = !!data?.isUpdate;
  showFooter.value = data?.showFooter !== false;
  const readonly = !showFooter.value;
  const { isEmployee, currentClientId } = await resolveCurrentClientContext();
  await Promise.all([
    applyReadOnlyMode(readonly),
    applyCountryOptions(),
    applySalespersonOptions(isEmployee, readonly),
    applyInquiryClientDisplayScope(!data?.record, isEmployee, currentClientId, readonly),
  ]);

  if (data?.record) {
    currentId.value = data.record.id ?? null;
    const r = mapInquiryRecordToForm(data.record);
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
    const payload = mapFormValuesToInquiryPayload(values);
    setModalProps({ confirmLoading: true });

    if (isUpdate.value) await inquiryEdit({ ...payload, id: currentId.value });
    else await inquiryAdd(payload);

    closeModal();
    emit('success');
  } catch (error: any) {
    if (error?.errorFields) return;
    const msg = error?.response?.data?.message || error?.message || t('component.form.saveError');
    createMessage.error(msg);
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>
