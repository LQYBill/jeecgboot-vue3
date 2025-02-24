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
                            :rows="10"
                ></a-textarea>
              </a-form-item>
            </a-col>
            <a-col>
              <a-button-group>
                <a-button type="primary" preIcon="ant-design:copy-outlined" @click="handleCopy(formState.output)">
                  {{ t('common.operation.copy') }}
                </a-button>
                <a-button type="success" @click="handleDownloadExcel">
                  {{ `${t('common.operation.download')} Excel` }}
                </a-button>
              </a-button-group>
            </a-col>
          </a-row>
        </a-form>
      </a-card>
      <settings @update="handleUpdate"></settings>
    </div>
</PageWrapper>
</template>
<script lang="ts" setup>
import {PageWrapper} from "/@/components/Page"
import {ref, reactive, provide, unref} from "vue";
import {Form} from "ant-design-vue";
import Settings from "./components/settings.vue";
import {useMessage} from "@/hooks/web/useMessage";
import {useI18n} from "@/hooks/web/useI18n";
import {useCopyToClipboard} from "@/hooks/web/useCopyToClipboard";
import {downloadFile} from "@/api/common/api";
import {Api} from "@/views/business/admin/tools/data";
const {t} = useI18n();
const { clipboardRef, copiedRef } = useCopyToClipboard();
const { createMessage } = useMessage();

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

function handleUpdate(res: string) {
  formState.output = res;
}
function handleCopy(numbers:string) {
  if (!numbers) {
    createMessage.warning(t('component.copy.noValue'));
    return;
  }
  clipboardRef.value = numbers;
  if (unref(copiedRef)) {
    createMessage.warning(t('component.copy.success'));
  }
}
function handleDownloadExcel() {
  const params = {
    input: formState.output,
  }
  const filename = "Feuille.xlsx";
  downloadFile(Api.EXCEL, filename, params);
}
provide('state', formState);
</script>
