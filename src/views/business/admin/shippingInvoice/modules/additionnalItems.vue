<template>
  <h2>Optional</h2>
  <a-form ref="formRef"
    :model="formState"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
    :rules="validatorRules"
    class="bg-gray-100 p-4 flex gap-4 w-full"
  >
    <a-form-item
      v-bind="validateInfos.name"
      name="additionalItems"
      class="flex-1"
    >
      <template #label>
        <a-tooltip title="Select a type">
        </a-tooltip>
        Add additionnal items ?
      </template>
      <a-cascader
        v-model:value="formState.additionalItems"
        multiple
        max-tag-count="responsive"
        :options="options"
        placeholder="Select a value"
        :show-checked-strategy="Cascader.SHOW_CHILD"
        expand-trigger="hover"
      />
    </a-form-item>
    <a-form-item>
      <a-button type="primary" @click="handleAddItems">Add selected items</a-button>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {inject, reactive, Ref, ref} from "vue";
import {Cascader, Form} from "ant-design-vue";
import type {CascaderProps} from "ant-design-vue";

const emits = defineEmits(['submit']);

const useForm = Form.useForm;
const formRef = ref();
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 4 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 20 } });
const validatorRules = ref({
  additionalItems: [{ required: false }],
});
const formState = reactive<Record<string, any>>({
  additionalItems: '',
});
const {validateInfos } = useForm(formState, validatorRules, { immediate: false });
const { t } = useI18n();
const client = inject('client');

const options:Ref<CascaderProps['options']> = ref([
  {
    label: "Refund",
    value: "refund",
    children: [
      {
        label: "Refund 1",
        value: 100,
      },
      {
        label: "Refund 2",
        value: 200,
      },
      {
        label: "Refund 3",
        value: 300,
      },
    ],
  },
  {
    label: "Gift",
    value: "gift",
    children: [
      {
        label: "Gift 1",
        value: 100,
      },
      {
        label: "Gift 2",
        value: 200,
      },
      {
        label: "Gift 3",
        value: 300,
      },
    ],
  },
]);

function handleAddItems() {
  console.log(formState.additionalItems);
  emits('submit', formState.additionalItems);
}
</script>
