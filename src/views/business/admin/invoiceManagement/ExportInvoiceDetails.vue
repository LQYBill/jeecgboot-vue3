<template>
  <PageWrapper title="Export details">
    <BasicForm
      ref="formRef"
      @register="registerForm"
      @submit="handleSubmit"
    >
      <template #formHeader>

      </template>
    </BasicForm>
  </PageWrapper>
</template>
<script setup lang="ts">
import {PageWrapper} from "@/components/Page";
import {BasicForm, useForm} from "@/components/Form";
import {onMounted, ref} from "vue";
import {
  exportDetailsFormSchema
} from "./data/ExportDetails.data";

onMounted(() => {

})
const formRef = ref();
const [registerForm, { getFieldsValue, setFieldsValue, resetFields, validateFields}] = useForm({
  schemas: exportDetailsFormSchema,
})
</script>
