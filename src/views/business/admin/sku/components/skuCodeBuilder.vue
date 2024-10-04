<template>
  <section class="w1/2 bg-white p-4">
    <h2>2. SKU {{ t('data.sku.codeBuilder') }}</h2>
    <BasicForm
      @register="register"
      @submit="handleSubmit"
      ref="formRef"
      class="flex-1"
    >
      <template #formHeader>
        <div class="bg-lightGray p-4 w-full mb-5 flex items-center gap-5 border rounded">
          <div class="flex-1 flex">
              <div v-for="(value, index) in erpCodeValues" :key="index" :style="`color: ${colors[index]}; font-size: 1.5rem; font-weight: bold`" class="flex flex-wrap flex-col">
                <span v-if="Object.keys(erpCodeValues).length > 0" v-for="(v, i) in value.split(',')" :key="i">
                  {{ v }}
                </span>
              </div>
          </div>
          <a-button type="primary" @click="handleCopy" preIcon="ic:baseline-content-paste" aria-label="copy code">
            {{ t('common.operation.copy') }}
          </a-button>
        </div>
      </template>
    </BasicForm>
  </section>
</template>
<script lang="ts" setup>
import {BasicForm, useForm} from "@/components/Form";
import {
  categoryListApi,
  clientListApi,
  criteriaListApi,
  criteriaValueListApi, productListApi,
  skuCodeBuilderFormSchema
} from "@/views/business/admin/sku/data";
import {onBeforeMount, ref, unref} from "vue";
import {SkuCriteria} from "@/views/business/admin/sku/skuCriteria.dto";
import {JSelectInputOptions} from "@/views/business/dto/JSelectInputOptions.dto";
import {v4 as uuidv4} from "uuid";
import {SkuCriteriaValue} from "@/views/business/admin/sku/skuCriteriaValue.dto";
import {useCopyToClipboard} from "@/hooks/web/useCopyToClipboard";
import {useI18n} from "vue-i18n";
import {useMessage} from "@/hooks/web/useMessage";

const { clipboardRef, copiedRef } = useCopyToClipboard();
const { t } = useI18n();
const { createMessage } = useMessage();

const emits = defineEmits(["submit"]);

onBeforeMount(async () => {
  await categoryListApi().then((res) => {
    categoryList.value = res.records.map((item) => {
      return {
        label: `${item.name} - (${item.code})`,
        value: item.code,
      };
    });
  });
  await clientListApi().then((res) => {
    clientList.value = res.map(
      customer => ({
        text: `${customer.firstName} ${customer.surname} (${customer.internalCode})`,
        value: customer.internalCode,
      })
    );
  });
});
const dupeCriteriaBaseName = 'criteria';
const categoryList = ref<Array<any>>([]);
const productList = ref<Array<any>>([]);
const clientList = ref<Array<any>>([]);
const criteriaList = ref<Array<SkuCriteria>>([]);

// list of criteria fields used in the form. The key is the ranking of the criteria
// if there are duplicated rankings, criteria will be stored in duplicateCriteriaList
// and a field will be added to choose between the duplicated criteria
const fieldList = ref<{[key:number]: SkuCriteria}>({});
const duplicateCriteriaList = ref<{[key:number]: SkuCriteria[]}>([]);
const pickedDupeCriteriaList = ref<{[key:number]: SkuCriteria}>({});

const erpCodeValues = ref<{[ke:number]: string}>({});

const colors = [
  '#f50',
  '#2db7f5',
  '#87d068',
  '#d4b106',
  '#eb2f96',
  '#722ed1',
  '#ad2102',
];

const [register, { getFieldsValue, setFieldsValue, appendSchemaByField, removeSchemaByFiled, resetFields, validateFields }] = useForm({
  submitButtonOptions: { text: t('common.operation.save'), preIcon: '' },
  showResetButton: false,
  schemas: skuCodeBuilderFormSchema(categoryList, clientList, updateErpCode),
});
const formRef = ref();

async function updateErpCode(field: string, value: any){
  console.log('updateErpCode', field, value)
  if (field === 'category') {
    setTimeout(async () => {
      const categoryValue = getFieldsValue().category;
      await updateCategory(categoryValue);
      if(!categoryValue) {
        erpCodeValues.value = {};
      }
      else erpCodeValues.value[0] = categoryValue;
    }, 100);
  } else if(field === 'product') {
    erpCodeValues.value[1] = value.toString();
    console.log('productList', productList.value)
    console.log('erpCodeValues', erpCodeValues.value);
  } else if (field === 'client') {
    setTimeout(async () => {
      // there shouldn't be 20 criteria fields, so we can use 20 as the client field to make sure it's the last field
      erpCodeValues.value[20] = !!getFieldsValue().client ? '-' + getFieldsValue().client : '';
    }, 100);
  } else {
    setTimeout(async () => {
      if(field.startsWith(dupeCriteriaBaseName)) {
        await updateCriteriaSchemaForDupe(field, value);
      }
      let min = Object.keys(fieldList.value).reduce((a, b) => a < b ? a : b);
      let dupeMin = objectIsEmpty(pickedDupeCriteriaList.value) ? min : Object.keys(pickedDupeCriteriaList.value).reduce((a, b) => a < b ? a : b);
      min = min < dupeMin ? min : dupeMin;
      let max = Object.keys(fieldList.value).reduce((a, b) => a > b ? a : b);
      let dupeMax = objectIsEmpty(pickedDupeCriteriaList.value) ? max : Object.keys(pickedDupeCriteriaList.value).reduce((a, b) => a > b ? a : b);
      max = max > dupeMax ? max : dupeMax;

      for(let i = parseInt(min); i <= parseInt(max); i++) {
        let fieldValue = '';
        if (fieldList.value[i]) {
          console.log('fieldList', fieldList.value[i]);
          const enName = normalizeString(fieldList.value[i].enName);
          const zhName = fieldList.value[i].zhName;
          console.log('getFieldsValue', getFieldsValue());
          if(!!getFieldsValue()[`${zhName}/${enName}`]) {
            if(!fieldList.value[i].enName.startsWith(dupeCriteriaBaseName)) {
              console.log('criteria doesn\'t start with criteria');
              fieldValue = getFieldsValue()[`${zhName}/${enName}`];
              console.log('fieldValue', fieldValue);
              erpCodeValues.value[i+2] = fieldValue;
            }
            // doublons
            else {
              console.log('criteria starts with criteria');
              const enName = normalizeString(pickedDupeCriteriaList.value[i].enName);
              const zhName = pickedDupeCriteriaList.value[i].zhName;
              console.log('name', `${zhName}/${enName}`);
              fieldValue = !!pickedDupeCriteriaList.value[i] ? !!getFieldsValue()[`${zhName}/${enName}`] ? getFieldsValue()[`${zhName}/${enName}`] : '' : '';
              erpCodeValues.value[i+2] = fieldValue;
            }
          } else {
            delete erpCodeValues.value[i+2];
          }
        }
      }
    }, 100);
  }
}
async function updateCategory(category: string) {
  await resetFields();
  await resetCriteria();
  // if(!category) {
  //   await updateSchema({
  //     field: 'subcategory',
  //     componentProps: {
  //       dictOptions: [],
  //     },
  //     dynamicDisabled: true,
  //   });
  //   await setFieldsValue({
  //     category: '',
  //   });
  //   return;
  // }
  await updateCriteria(category);
}
async function updateCriteria(category: string) {
  await removeSchemaByFiled(['product']);
  await resetCriteria();
  await setFieldsValue({
    category,
  });
  if(!category) {
    return;
  }
  await criteriaListApi(category).then(async (res) => {
    criteriaList.value = res;
    console.log('criteriaList', criteriaList.value);
    await createProductSchema();
    await createCriteriaSchemas();
  });
}
async function createProductSchema() {
  console.log('createProductSchema', getFieldsValue().category);
  await productListApi(getFieldsValue().category).then((res) => {
    if(res == null) return;
    productList.value = res.map((item) => {
      return {
        label: `${item.zhName}/${item.enName}`,
        value: item.code,
      };
    });
  });
  await appendSchemaByField({
    field: 'product',
    label: 'Product',
    component: 'JSelectInput',
    itemProps: {
      id: 'product',
      labelAlign: 'left',
      extra: t('component.tips.skuProductLatestCode', {var: getLatestCode()}),
    },
    componentProps: {
      style: { borderLeft: `4px solid ${colors[1]}` },
      valueType: 'string',
      placeholder: 'Please select a product',
      options: productList.value,
      onChange(e: any) {
        updateErpCode('product', e);
      },
    },
    rules: [
      {
        required: true,
        validator: async (rule, value) => {
          if (!value) {
            return Promise.reject('值不能为空');
          }
          return Promise.resolve();
        },
        trigger: 'change',
        type: 'string',
      },
    ],
  }, '')
}
async function createCriteriaSchemas () {
  let promiseList: any[] = [];
  let criteriaWithoutDupRanking = filterCriteriaRankingDupes();

  // create schema for criteria, that doesn't have multiple criteria choice for same sku code position
  // eg : [category code][color | pattern | ...][size | brightness |...][material]-[client code]
  // in the example above, only the meterial criterion will be created as a schema
  for (const criteria of criteriaWithoutDupRanking) {
    let options: JSelectInputOptions[] = [];
    await criteriaValueListApi(criteria.id).then((res) => {
      options = createOptionsWithGroup(res);
    });
    const normalizedEnName = normalizeString(criteria.enName);
    fieldList.value[criteria.ranking] = criteria;
    promiseList.push(
      appendSchemaByField({
        field: `${criteria.zhName}/${normalizedEnName}`,
        label: `${criteria.zhName}${criteria.enName}`,
        component: 'JSelectInput',
        itemProps: {
          id: `${normalizedEnName}`,
          labelAlign: 'left',
        },
        componentProps: {
          valueType: `${criteria.isMultiple ? 'object' : 'string'}`,
          style: { borderLeft: `4px solid ${colors[criteria.ranking + 2]}` },
          placeholder: `Please select a ${criteria.enName}`,
          mode: `${criteria.isMultiple ? 'multiple' : ''}`,
          maxTagCount: 2,
          options,
          onChange(e: any) {
            updateErpCode(normalizedEnName, e);
          },
        },
        rules: [
          {
            required: true,
            validator: async (rule, value) => {
              if (!value) {
                return Promise.reject('值不能为空');
              }
              return Promise.resolve();
            },
            trigger: 'change',
            type: `${criteria.isMultiple ? 'object' : 'string'}`,
          },
        ],
      }, '')
    );
  }
  // In practice this will not be used, but it's here for scalability
  // create schema for criteria, that have multiple criteria choice for same sku code position
  // Note : to allow multiple criteria choice for same sku code position, just give a criteria the same position in db
  Object.keys(duplicateCriteriaList.value).forEach((ranking) => {
    const name = dupeCriteriaBaseName + ranking;
    const options: JSelectInputOptions[] = duplicateCriteriaList.value[ranking].map((criteria: SkuCriteria) => {
      return {
        label: `${criteria.zhName}${criteria.enName}`,
        value: criteria.id,
      };
    });
    promiseList.push(
      appendSchemaByField({
        field: `${name}/${name}`,
        label: `${name}`,
        component: 'JSelectInput',
        itemProps: {
          id: `${name}`,
          labelAlign: 'left',
        },
        componentProps: {
          style: { borderLeft: `4px solid ${colors[parseInt(ranking) + 2]}` },
          placeholder: `Please select a ${name}`,
          options,
          onChange(e: any) {
            updateErpCode(name, e);
          }
        },
        required: true,
      }, '')
    );
    fieldList.value[ranking] = {
      id: uuidv4(),
      zhName: name,
      enName: name,
      ranking: ranking,
    };
  });
  for (const promise of promiseList) {
    await promise.then(() => {});
  }
}
async function updateCriteriaSchemaForDupe(field: string, criteriaId: string | undefined) {
  console.log('updateCriteriaSchemaForDupe', field, criteriaId);
  if(!criteriaId) {
    const rank = Object.keys(fieldList.value).find(key => fieldList.value[key].enName === field);
    await deleteDupeSchemaByRanking(parseInt(rank!));
    delete erpCodeValues.value[parseInt(rank!) + 2];
    return;
  }
  let criterion = criteriaList.value.find(item => item.id === criteriaId);
  console.log('criterion', criterion);
  let options:JSelectInputOptions[] = [];
  await criteriaValueListApi(criterion!.id).then((res) => {
    options = createOptionsWithGroup(res);
  });
  let rank = criterion!.ranking;
  await deleteDupeSchemaByRanking(rank);
  let enName = normalizeString(criterion!.enName);
  let zhName = criterion!.zhName;
  await appendSchemaByField({
    field: `${zhName}/${enName}`,
    label: `${zhName}${criterion!.enName}`,
    component: 'JSelectInput',
    itemProps: {
      id: `${enName}`,
      labelAlign: 'left',
    },
    componentProps: {
      style: { borderLeft: `4px solid ${colors[rank + 2]}` },
      placeholder: `Please select a ${criterion!.enName}`,
      options,
      onChange(e: any) {
        updateErpCode(enName, e);
      }
    },
  }, '');
  pickedDupeCriteriaList.value[criterion!.ranking] = criterion!;
}
async function deleteDupeSchemaByRanking(rank: number) {
  console.log('Deleting Dupe schema by ranking : ', rank)
  let dupeFields = Object.values(pickedDupeCriteriaList.value).filter(item => item.ranking === rank).map(item => `${item.zhName}/${normalizeString(item.enName)}`);
  await removeSchemaByFiled(dupeFields);
  delete pickedDupeCriteriaList.value[rank];
}
function filterCriteriaRankingDupes() {
  const duplicatedRankings = criteriaList.value
    .map(item => item.ranking)
    .filter((ranking, index, self) => self.indexOf(ranking) !== index && self.lastIndexOf(ranking) === index);
  // duplicateCriteriaList.value = criteriaList.value.filter(item => duplicatedRankings.includes(item.ranking));
  duplicatedRankings.forEach((ranking) => {
    duplicateCriteriaList.value[ranking] = criteriaList.value.filter(item => item.ranking === ranking);
  });
  console.log('duplicateCriteriaList', duplicateCriteriaList.value);
  return criteriaList.value.filter(item => !duplicatedRankings.includes(item.ranking));
}
async function resetCriteria() {
  let fields: string[] = [];
  Object.values(fieldList.value).forEach((criteria) => {
    fields.push(criteria.zhName + '/' + normalizeString(criteria.enName));
  });
  console.log('resetCriteria', fields);
  await removeSchemaByFiled(fields);
}
async function handleSubmit() {
  try {
    console.log('getFieldsValue', getFieldsValue());
    await validateFields(Object.keys(getFieldsValue()));
    const values:Record<string, any> = generateErpCodesProperties();
    emits("submit", values);
  } catch(e) {
    console.log('error', e);
  }
}
function normalizeString(s:string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}
function objectIsEmpty(obj: any) {
  return Object.keys(obj).length === 0;
}
function handleCopy() {
  console.group('handlecopy');
  console.log('copy', erpCodeValues.value);
  const resToString: string = generateErpCodes();
  if (!resToString) {
      createMessage.warning(t('component.copy.noValue'));
      return;
    }
    clipboardRef.value = resToString;
    if (unref(copiedRef)) {
      createMessage.warning(t('component.copy.success'));
    }
  console.log('resToString', resToString);
}
function generateErpCodes():string {
  let res:string[] = [''];
  for(let key in erpCodeValues.value) {
    let criterionValue = erpCodeValues.value[key];
    if(criterionValue.split(',').length > 1) {
      res = createCopy(res, criterionValue.split(',').length);
      res = concatCriteriaValue(res, criterionValue.split(','));
    } else {
      for(let i = 0; i < res.length; i++) {
        res[i] += criterionValue;
      }
    }
  }
  return res.join(',');
}
function generateErpCodesProperties(): Record<string, any> {
  let codeJson = {};
  let min = Object.keys(fieldList.value).reduce((a, b) => a < b ? a : b);
  let dupeMin = objectIsEmpty(pickedDupeCriteriaList.value) ? min : Object.keys(pickedDupeCriteriaList.value).reduce((a, b) => a < b ? a : b);
  min = min < dupeMin ? min : dupeMin;
  let max = Object.keys(fieldList.value).reduce((a, b) => a > b ? a : b);
  let dupeMax = objectIsEmpty(pickedDupeCriteriaList.value) ? max : Object.keys(pickedDupeCriteriaList.value).reduce((a, b) => a > b ? a : b);
  max = max > dupeMax ? max : dupeMax;


  codeJson = createPropCopy(codeJson, 'category', erpCodeValues.value[0].split(','));
  codeJson = createPropCopy(codeJson, 'product', erpCodeValues.value[1].split(','));
  for(let i = parseInt(min); i <= parseInt(max); i++) {
    if(!fieldList.value[i]) {
      continue;
    }
    let enName = normalizeString(fieldList.value[i].enName);
    let zhName = fieldList.value[i].zhName;
    let criterionValue = getFieldsValue()[`${zhName}/${enName}`];
    if(enName.startsWith(dupeCriteriaBaseName)) {
      let dupeCriteria = pickedDupeCriteriaList.value[i];
      enName = normalizeString(dupeCriteria.enName);
      zhName = dupeCriteria.zhName;
      criterionValue = getFieldsValue()[`${zhName}/${enName}`];
    }
    codeJson = createPropCopy(codeJson, fieldList.value[i].enName, criterionValue.split(','));
  }
  codeJson = createPropCopy(codeJson, 'client', erpCodeValues.value[20].split(','));
  // wrong cuz it doesn't handle the order of criteria
  // for(let field in getFieldsValue()) {
  //   if(field.startsWith(dupeCriteriaBaseName)) {
  //     continue;
  //   }
  //   let criterionValue = getFieldsValue()[field];
  //   codeJson = createPropCopy(codeJson, field, criterionValue.split(','));
  // }
  console.log('codeJson', codeJson);
  return codeJson
}
function createPropCopy(codeJson: {[key:string]: {}}, field:string, criterionValue: string[]) {
  let res = {};
  for (let i = 0; i < criterionValue.length; i++) {
    if(Object.keys(codeJson).length === 0) {
      let fieldJson = {};
      fieldJson[field] = criterionValue[i];
      res[criterionValue[i]] = fieldJson;
      continue;
    }
    for (let key in codeJson) {
      let codeFieldsValueJson = {...codeJson[key]};
      // if(field === 'client') {
      //   codeFieldsValueJson[field] = criterionValue[i];
      //   res[key + '-' + criterionValue[i]] = codeFieldsValueJson;
      //   continue;
      // }
      codeFieldsValueJson[field] = field === 'client' ?  criterionValue[i].slice(1) : criterionValue[i];
      res[key + criterionValue[i]] = codeFieldsValueJson;
    }
  }
  return res;
}
function createCopy(erpCodes: string[], nbOfCopy: number): string[] {
  let res: string[] = [];
  for(let i = 0; i < nbOfCopy; i++) {
    res.push(...erpCodes);
  }
  console.log('creating copies', res);
  return res;
}
function concatCriteriaValue(erpCodes: string[], criterionValue: string[]): string[] {
  let res: string[] = [];
  for(let i = 0; i < erpCodes.length; i++) {
    res.push(erpCodes[i] + criterionValue[i%criterionValue.length]);
  }
  return res;
}
/**
 * creates options for select input with groups
 * usually if an option doesn't have a group it means the option is a default option
 * example :
 *   // options in a group
 *   {
 *     label: 'Manager',
 *     options: [
 *       {
 *         value: 'jack',
 *         label: 'Jack',
 *       },
 *       {
 *         value: 'lucy',
 *         label: 'Lucy',
 *       },
 *     ],
 *   },
 *   // option without group
 *   {
 *     value: 'yiminghe',
 *     label: 'Yiminghe',
 *   },
 *
 * @param res
 */
function createOptionsWithGroup(res: SkuCriteriaValue[]): JSelectInputOptions[] {
  let options:JSelectInputOptions[] = [];
  let valueByCategory:{[key:string]:{label: string, value:string}[]} = {};
  res.forEach((item: SkuCriteriaValue) => {
    if(!!item.category) {
      if(!valueByCategory[item.category]) {
        valueByCategory[item.category] = [];
      }
      valueByCategory[item.category].push({
        label: `${item.zhName}/${item.enName}`,
        value: item.code,
      });
    } else options.push ({
      label: `${item.zhName}${item.enName}`,
      value: item.code,
    });
  });
  let optionsWithGroup = Object.keys(valueByCategory).map((key) => {
    return {
      label: key,
      options: valueByCategory[key],
    };
  });
  options = options.concat(optionsWithGroup);
  return options;
}
function getLatestCode() {
  let codes = productList.value.map(item => item.value as number);
  if(codes.length === 0) {
    return "none";
  }
  return Math.max(...codes);
}
</script>
