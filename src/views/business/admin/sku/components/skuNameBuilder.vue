<template>
  <section class="w1/2 bg-white p-4">
    <header>
      <h2>3. SKU {{ t('data.sku.individualInformation') }}</h2>
    </header>
    <a-form
      ref="nameBuilderFormRef"
      layout="vertical"
      :model="formState"
      :rules="validatorRules"
    >
      <a-row class="flex gap-2 mb-4">
        <div class="w-auto" v-for="(value, _index) in Object.values(fieldMapByEnName)">
          <a-button
            type="primary"
            @click="handleAddFieldName(value)"
          >
            {{ value }}
          </a-button>
        </div>
      </a-row>
      <a-row :gutter="8">
        <a-col :span="12">
          <a-form-item>
            <template #label>
              <span class="font-semibold text-lg">{{ t('data.enName') }}</span>
            </template>
            <a-input
              v-model:value="formState.enName"
              placeholder="Name En"
              @blur="handleEnNameChange"
              @focus="handleFocus('enName')"
              required
              size="large"
              class="border-customGray"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item>
            <template #label>
              <span class="font-semibold text-lg">{{ t('data.zhName') }}</span>
            </template>
            <a-input
              v-model:value="formState.zhName"
              placeholder="Name Zh"
              @blur="handleZhNameChange"
              @focus="handleFocus('zhName')"
              required
              size="large"
              class="border-customGray"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="8">
        <a-col :span="12">
          <a-form-item>
            <template #label>
              <span class="font-semibold text-lg">{{ t('data.sku.declareEname') }}</span>
            </template>
            <a-input
              v-model:value="formState.declareEnName"
              placeholder="申报英文名称/Declare Name En"
              @blur="handleDeclareEnNameChange"
              @focus="handleFocus('declareEnName')"
              required
              size="large"
              class="border-customGray"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item>
            <template #label>
              <span class="font-semibold text-lg">{{ t('data.sku.declareName') }}</span>
            </template>
            <a-input
              v-model:value="formState.declareZhName"
              placeholder="申报中文名称/Declare Name Zh"
              @blur="handleDeclareZhNameChange"
              @focus="handleFocus('declareZhName')"
              required
              size="large"
              class="border-customGray"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="8">
        <a-col :span="12">
          <a-form-item>
            <template #label>
              <span class="font-semibold text-lg">{{ t('data.sku.supplier') }}</span>
            </template>
            <a-input
              v-model:value="formState.supplier"
              :placeholder="t('data.sku.supplierLink')"
              @blur="handleSupplierChange"
              required
              size="large"
              class="border-customGray"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item>
            <template #label>
              <span class="font-semibold text-lg">{{ t('data.sku.supplierLink') }}</span>
            </template>
            <a-input
              v-model:value="formState.supplierLink"
              :placeholder="t('data.sku.supplierLink')"
              @blur="handleSupplierLinkChange"
              required
              size="large"
              class="border-customGray"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row>
        <a-divider></a-divider>
      </a-row>
      <template v-for="(props, index) in codeBuildFormValue">
        <a-row :gutter="8">
          <a-col :span="24"><h3 class="font-bold">{{ index }}</h3></a-col>
          <a-col :span="12">
            <a-form-item
              required
              :name="index+'_enName'"
              v-bind="validateInfos.name"
            >
              <template #label>
                Name En
              </template>
              <a-input
                placeholder="Name En"
                :name="index + '_enName'"
                v-model:value="formState[index + '_enName']"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              required
              :name="index+'_zhName'"
              v-bind="validateInfos.name"
            >
              <template #label>
                Name Zh
              </template>
              <a-input
                placeholder="Name Zh"
                :name="index + '_zhName'"
                v-model:value="formState[index + '_zhName']"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              required
              :name="index+'_declareEnName'"
              v-bind="validateInfos.name"
            >
              <template #label>
                {{ t('data.sku.declareEname') }}
              </template>
              <a-input
                placeholder="Declare Name En"
                :name="index + '_declareEnName'"
                v-model:value="formState[index + '_declareEnName']"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              required
              :name="index+'_declareZhName'"
              v-bind="validateInfos.name"
            >
              <template #label>
                {{ t('data.sku.declareName') }}
              </template>
              <a-input
                placeholder="Declare Name Zh"
                :name="index + '_declareZhName'"
                v-model:value="formState[index + '_declareZhName']"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              required
              :name="index+'_supplierName'"
              v-bind="validateInfos.name"
            >
              <template #label>
                {{ t('data.sku.supplier') }}
              </template>
              <a-input
                :placeholder="t('data.sku.supplier')"
                :name="index + '_supplierName'"
                v-model:value="formState[index + '_supplierName']"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              required
              :name="index+'_supplierLink'"
              v-bind="validateInfos.name"
            >
              <template #label>
                {{ t('data.sku.supplierLink') }}
              </template>
              <a-input
                :placeholder="t('data.sku.supplierLink')"
                :name="index + '_supplierLink'"
                v-model:value="formState[index + '_supplierLink']"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-collapse :bordered="false" class="w-full mb-6">
          <a-collapse-panel key="1">
            <template #header>
              <div class="text-sm font-medium text-trueGray"> More info</div>
            </template>
            <a-row :gutter="8">
              <a-col v-for="(value, field) in props" :span="6">
                <a-form-item>
                  <template #label>
                    <span class="text-blueGray">{{ field }}</span>
                  </template>
                  <a-input
                    :value="value"
                    :placeholder="index + ' : ' + field"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-collapse-panel>
        </a-collapse>
      </template>
      <a-row>
        <a-col :span="24">
          <a-form-item>
            <a-button
              type="primary"
              aria-label="submit"
              @click="handleSubmit"
              :disabled="submitDisabled"
            >
              {{ t('common.operation.save') }}
            </a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </section>
</template>
<script lang="ts" setup>

import {computed, inject, reactive, ref, Ref, watch} from "vue";
import {
  translatedProductNameApi,
  translatedValueByCriteriaApi
} from "@/views/business/admin/sku/data";
import {Form} from "ant-design-vue";
import {Rule} from "@/components/Form";
import {useI18n} from "vue-i18n";
import {useMessage} from "@/hooks/web/useMessage";

const { t } = useI18n();
const { createMessage } = useMessage();

const emits = defineEmits(["submit"]);

const nameBuilderFormRef = ref();
const useForm = Form.useForm;

const submitDisabled = computed(() => {
  return Object.keys(formState).length <= 6 || !formState.enName || !formState.zhName || !formState.declareEnName || !formState.declareZhName || !formState.supplier || !formState.supplierLink;
});
const codeBuildFormValue: Ref<Record<string, Record<string, string>>> = inject('codeBuildFormValue') as Ref<Record<string, Record<string, string>>>;
const formState = reactive({
  enName: '',
  zhName: '',
  declareEnName: '',
  declareZhName: '',
  supplier: '',
  supplierLink: '',
});
const validatorRules =  reactive<Record<string, Rule[]>> ({});
const { validateInfos } = useForm(formState, validatorRules, { immediate: true });

const lastFocusedField = ref<string>('');
const fieldMapByEnName = ref<Record<string,string>>({}); // eg : 产品/Produit => { 'Produit': '产品/Produit' }

function initializeFormState() {
  // Clear any previous dynamic fields to avoid residual data
  Object.keys(formState).forEach((key) => {
    if (key !== "enName" && key !== "zhName") {
      delete formState[key];
    }
  });

  // Add dynamic fields based on the injected codeBuildFormValue
  Object.keys(codeBuildFormValue.value).forEach((key) => {
    formState[key + "_enName"] = "";
    formState[key + "_zhName"] = "";
    formState[key + "_declareEnName"] = "";
    formState[key + "_declareZhName"] = "";
    formState[key + "_supplierName"] = "";
    formState[key + "_supplierLink"] = "";
    validatorRules[key + "_enName"] = [{ required: true, message: "Name En is required", trigger: "blur" }];
    validatorRules[key + "_zhName"] = [{ required: true, message: "Name Zh is required", trigger: "blur" }];
    validatorRules[key + "_declareEnName"] = [{ required: true, message: "Declare Name En is required", trigger: "blur" }];
    validatorRules[key + "_declareZhName"] = [{ required: true, message: "Declare Name Zh is required", trigger: "blur" }];
    validatorRules[key + "_supplierName"] = [{ required: true, message: "Supplier is required", trigger: "blur" }];
    validatorRules[key + "_supplierLink"] = [{ required: true, message: "Supplier Link is required", trigger: "blur" }];
  });
}
async function listFields() {
  const fields:string[] = [];
  for (let key in codeBuildFormValue.value) {
    for (let field in codeBuildFormValue.value[key]) {
      if (!fields.includes(field)) {
        fields.push(field);
      }
    }
  }
  fields.map((field:string) => {
    if(field.includes('/')) {
      const key = field.split('/')[1];
      fieldMapByEnName.value[key] = field;
    } else {
      fieldMapByEnName.value[field] = field;
    }
  });
}
watch(
  () => codeBuildFormValue.value,
  (newVal) => {
    if (newVal) {
      initializeFormState();
      listFields();
    }
  },
  { immediate: true } // Ensures it runs immediately if values are already present
);
function handleFocus(field: string) {
  lastFocusedField.value = field;
}
async function handleEnNameChange() {
  lastFocusedField.value = 'enName';

  for(let key in formState) {
    if(key.includes('_enName'))
      formState[key] = formState.enName;
  }
  await parseVarInFormState();
}
async function handleZhNameChange() {
  lastFocusedField.value = 'zhName';

  for(let key in formState) {
    if(key.includes('_zhName'))
      formState[key] = formState.zhName;
  }
  await parseVarInFormState();
}
async function handleDeclareEnNameChange() {
  lastFocusedField.value = 'declareEnName';
  for(let key in formState) {
    if(key.includes('_declareEnName'))
      formState[key] = formState.declareEnName;
  }
  await parseVarInFormState();
}
async function handleDeclareZhNameChange() {
  lastFocusedField.value = 'declareZhName';
  for(let key in formState) {
    if(key.includes('_declareZhName'))
      formState[key] = formState.declareZhName;
  }
  await parseVarInFormState();
}
async function handleSupplierChange() {
  for(let key in formState) {
    if(key.includes('_supplierName'))
      formState[key] = formState.supplier;
  }
}
async function handleSupplierLinkChange() {
  for(let key in formState) {
    if(key.includes('_supplierLink'))
      formState[key] = formState.supplierLink;
  }
}
async function parseVarInFormState() {
  for(let key in formState) {
    if (!(key.includes('_enName') || key.includes('_zhName') || key.includes('_declareEnName') || key.includes('_declareZhName'))) {
      continue;
    }
    let value = formState[key];
    if(!value) {
      continue;
    }
    if (!value.includes('$')) {
      continue;
    }
    const wordRegex = RegExp('(\\$[A-zÀ-ú]+\\b)', 'g');
    const matches = value.match(wordRegex);
    if (!matches) {
      continue;
    }
    for (let i = 0; i < matches.length; i++) {
      const match: string = matches[i];
      let newValue = '';
      await matchVariableByName(match, key).then((res) => {
        newValue = res[0];
      });
      formState[key] = formState[key].replace(match, newValue);
    }
  }
}
async function matchVariableByName(name: string, formStateKey:string):Promise<string> {
  const varName = name.replace('$', '');
  const erpCode = formStateKey.replace('_enName', '').replace('_zhName', '').replace('_declareEnName', '').replace('_declareZhName', '');
  const language = (formStateKey.includes('_enName') || formStateKey.includes('_declareEnName')) ? 'enName' : 'zhName';
  const fieldName = fieldMapByEnName.value[varName];
  let fieldValueFromForm = codeBuildFormValue.value[erpCode][fieldName];
  if(varName === 'product') {
    const categoryCode = codeBuildFormValue.value[erpCode]['category'];
    return getTranslatedProductName(language, categoryCode, fieldValueFromForm);
  }
  return getTranslatedValue(varName, language, fieldValueFromForm);
}
async function getTranslatedProductName(field: string, categoryCode: string, value: string) {
  return await translatedProductNameApi(field, categoryCode, value);
}
async function getTranslatedValue(criteria:string, field:string, value:string) {
  return await translatedValueByCriteriaApi(criteria, field, value);
}
async function handleAddFieldName(fieldName:string) {
  const fieldVarName = Object.keys(fieldMapByEnName.value).find(key => fieldMapByEnName.value[key] === fieldName);
  if(lastFocusedField.value === 'enName') {
    formState.enName += '$' + fieldVarName + ' ';
    await handleEnNameChange();
  } else if(lastFocusedField.value === 'zhName') {
    formState.zhName += '$' + fieldVarName;
    await handleZhNameChange();
  } else if(lastFocusedField.value === 'declareEnName') {
    if(!formState.declareEnName) {
      formState.declareEnName = '$' + fieldVarName + ' ';
    } else {
      formState.declareEnName += '$' + fieldVarName + ' ';
    }
    await handleDeclareEnNameChange();
  } else if(lastFocusedField.value === 'declareZhName') {
    if(!formState.declareZhName) {
      formState.declareZhName = '$' + fieldVarName;
    } else {
      formState.declareZhName += '$' + fieldVarName;
    }
    await handleDeclareZhNameChange();
  }
}
function handleSubmit() {
  nameBuilderFormRef.value.validate().then(() => {
    const skuMappedByCode: Record<string, Record<string, string>> = { ...codeBuildFormValue.value };
    for(let key in formState) {
      if(key === 'enName' || key === 'zhName' ||
        key === 'declareEnName' || key === 'declareZhName' ||
        key === 'supplier' || key === 'supplierLink'
      ) {
        continue;
      }
      const erpCode = key.replace('_enName', '').replace('_zhName', '')
        .replace('_declareEnName', '').replace('_declareZhName', '')
        .replace('_supplierLink', '').replace('_supplierName', '');
      if(key.includes('_enName')) {
        skuMappedByCode[erpCode] = {
          ...skuMappedByCode[erpCode],
          enName: formState[key].trim()
        };
      }
      if(key.includes('_zhName')) {
        skuMappedByCode[erpCode] = {
          ...skuMappedByCode[erpCode],
          zhName: formState[key].trim()
        };
      }
      if(key.includes('_declareEnName')) {
        skuMappedByCode[erpCode] = {
          ...skuMappedByCode[erpCode],
          declareEnName: formState[key].trim()
        };
      }
      if(key.includes('_declareZhName')) {
        skuMappedByCode[erpCode] = {
          ...skuMappedByCode[erpCode],
          declareZhName: formState[key].trim()
        };
      }
      if(key.includes('_supplierName')) {
        skuMappedByCode[erpCode] = {
          ...skuMappedByCode[erpCode],
          supplier: formState[key].trim()
        };
      }
      if(key.includes('_supplierLink')) {
        skuMappedByCode[erpCode] = {
          ...skuMappedByCode[erpCode],
          supplierLink: formState[key].trim()
        };
      }
    }
    emits('submit', skuMappedByCode);
    createMessage.success('Saved');
  });

}
</script>
