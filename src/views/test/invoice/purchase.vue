<template>
<PageWrapper title="Purchase Invoice Test">
<a-form ref="formRef"
        :model="formState"
        layout="vertical"
        :rules="validatorRules"
>
  <a-row>
    <a-col :span="24">
      <a-form-item v-bind="validateInfos.name" name="input">
        <template #label>
          Number of lines in the invoice
        </template>
        <a-input-number v-model:value="formState.input"
                        placeholder="Number of lines"
                        allowClear
                        :min="5"
        />
      </a-form-item>
    </a-col>
  </a-row>
  <a-row>
    <a-col>
      <a-button type="primary" @click="handleGenerate">Generate</a-button>
    </a-col>
  </a-row>
</a-form>
</PageWrapper>
</template>
<script lang="ts" setup>
import {PageWrapper} from "/@/components/Page"
import { ref, reactive } from "vue";
import {Form} from "ant-design-vue";
import {makePurchaseTest} from "./data";

const formRef = ref();
const useForm = Form.useForm;
const validatorRules = ref({
  input: [{ required: true, message: 'Enter a number of lines', trigger: 'blur' }],
});
const formState = reactive<Record<string, string>>({
  input: '5',
});
const { validateInfos } = useForm(formState, validatorRules, { immediate: false });

async function handleGenerate() {
  await makePurchaseTest((+ formState.input)).then(res => {
    console.log("res", res);
  }).catch(e => {
    console.error(e);
  });
}
</script>
