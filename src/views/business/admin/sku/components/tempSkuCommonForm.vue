<template>
  <section class="bg-white p-4 rounded-2 mb-6">
    <h2>SKU {{ t('data.sku.commonInformation') }}</h2>
    <BasicForm @register="register"/>
  </section>
</template>
<script lang="ts" setup>
import {BasicForm, useForm} from "@/components/Form";
import {tempSkuCommonSchema} from "@/views/business/admin/sku/data";
import {useI18n} from "vue-i18n";

const { t } = useI18n();

const emit = defineEmits(['update']);

const [register, {  validateFields }] = useForm({
  baseColProps: {
    span: 12,
  },
  labelWidth: 200,
  showResetButton: false,
  showSubmitButton: false,
  schemas: tempSkuCommonSchema(updateFieldsValue),
  layout: 'vertical',
  labelAlign: 'left',
});
async function updateFieldsValue(field: string, value: string) {
  await validateFields([field]).then(() => {
    emit('update', { field, value });
  }).catch((e) => {
    console.error('error', e);
  });
}
</script>
