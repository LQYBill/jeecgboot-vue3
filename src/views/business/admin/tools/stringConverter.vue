<template>
  <PageWrapper title="String tool">
    <div class="flex justify-evenly">
      <a-card title="String converter" class="w-xl">
        <a-form ref="formRef"
                :model="formState"
                layout="vertical"
                :rules="validatorRules"
        >
          <a-row>
            <a-col :span="24">
              <a-form-item v-bind="validateInfos.name" name="input">
                <template #label>
                  Enter text to convert
                </template>
                <a-textarea id="input"
                            v-model:value="formState.input"
                            placeholder="Input string"
                            allowClear
                            @blur="handleInputBlur"
                            :rows="10"
                ></a-textarea>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="24">
              <a-form-item v-bind="validateInfos.name" name="output">
                <template #label>
                  Result
                </template>
                <a-textarea id="output"
                            v-model:value="formState.output"
                            placeholder="Output string"
                            class="disabled:cursor-text"
                            disabled
                ></a-textarea>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>
      <settings></settings>
    </div>
</PageWrapper>
</template>
<script lang="ts" setup>
import {PageWrapper} from "/@/components/Page"
import { ref, reactive } from "vue";
import {Form} from "ant-design-vue";
import Settings from "./components/settings.vue";

const formRef = ref();
const useForm = Form.useForm;
const validatorRules = ref({
  input: [{ required: true, message: 'Enter a text to convert', trigger: 'blur' }],
});
const formState = reactive<Record<string, string>>({
  input: '',
  output: '',
});
const { validateInfos } = useForm(formState, validatorRules, { immediate: false });

function handleInputBlur() {
  console.log('input:', formState.input);
}
</script>
