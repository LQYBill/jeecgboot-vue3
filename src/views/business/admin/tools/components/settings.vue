<template>
  <aside class="flex flex-col gap-4">
    <a-card title="Clean up" class="w-md">
      <nav class="flex flex-col gap-2">
        <a-button-group>
          <a-button type="primary">trim</a-button>
          <a-button type="primary">remove empty lines</a-button>
        </a-button-group>
      </nav>
    </a-card>
    <a-card title="Transformation" class="w-md">
      <nav>
        <a-button-group>
          <a-button type="primary">lowercase</a-button>
          <a-button type="primary">CamelCase</a-button>
          <a-button type="primary">snake_case</a-button>
          <a-button type="primary">kebab-case</a-button>
        </a-button-group>
      </nav>
    </a-card>
    <a-card title="Trasnformation" class="w-md">
      <a-form ref="formRef"
              :model="formState"
              layout="vertical"
              :rules="validatorRules">
        <a-row>
          <a-col :span="24">
            <a-form-item v-bind="validateInfos.name" name="separator">
              <template #label>Separator</template>
              <a-input v-model:value="formState.separator"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="8">
          <a-col :span="12">
            <a-form-item v-bind="validateInfos.name" name="itemPrefix">
              <template #label>Item prefix</template>
              <a-input v-model:value="formState.itemPrefix"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item v-bind="validateInfos.name" name="itemSuffix">
              <template #label>Item suffix</template>
              <a-input v-model:value="formState.itemSuffix" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="8">
          <a-col :span="12">
            <a-form-item v-bind="validateInfos.name" name="listPrefix">
              <template #label>List prefix</template>
              <a-input v-model:value="formState.listPrefix"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item v-bind="validateInfos.name" name="listSuffix">
              <template #label>List suffix</template>
              <a-input v-model:value="formState.listSuffix"/>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
    <a-card title="Multiple lines" class="w-md">
      <nav>
        <a-button-group >
          <a-button type="primary">one line</a-button>
          <a-button type="primary">multi lines</a-button>
        </a-button-group>
      </nav>
    </a-card>
  </aside>
</template>
<script lang="ts" setup>
import {Form} from "ant-design-vue";
import {reactive, ref} from "vue";

const useForm = Form.useForm;
const formRef = ref();
const validatorRules = ref({
});
const formState = reactive<Record<string, string>>({
  separator: '',
  itemPrefix: '',
  itemSuffix: '',
  listPrefix: '',
  listSuffix: '',
});
const { validateInfos } = useForm(formState, validatorRules, { immediate: false });

</script>
