<template>
  <Card class="m-4 rounded-md">
    <BasicForm @register="registerForm" ref="formRef"/>
  </Card>
</template>
<script setup lang="ts">
import {Card} from "ant-design-vue";
import {BasicForm, FormSchema, useForm} from "@/components/Form";
import {useI18n} from "vue-i18n";
import {inject, onMounted, Ref, ref} from "vue";
import {ShopWithOptionsListParam} from "@/views/business/dto/ShopWithOptionsListParam.dto";

const {t} = useI18n();
const emit = defineEmits(['search']);

const formRef = ref();
const formDefaultValues = ref<ShopWithOptionsListParam>({
  clientId: '',
  shopIdsString: '',
  showAll: false,
  hasOptions: 1,
});
const queryParam = inject('queryParam') as Ref<ShopWithOptionsListParam>;

const compareParam = () => {
  if (!queryParam.value) {
    return true;
  }
  return formDefaultValues.value.clientId === queryParam.value.clientId &&
         formDefaultValues.value.shopIdsString === queryParam.value.shopIdsString &&
         formDefaultValues.value.showAll === queryParam.value.showAll &&
         formDefaultValues.value.hasOptions === queryParam.value.hasOptions;
}
onMounted(async () => {
  setTimeout( async () => {
    if (formRef.value && !compareParam()) {
      await handleShowAllChange(queryParam.value.showAll || false, false);
      await setFieldsValue({
        clientId: queryParam.value.clientId || '',
        shopIdsString: queryParam.value.shopIdsString || '',
        showAll: queryParam.value.showAll || false,
        hasOptions: queryParam.value.hasOptions || 1,
      });
      if(queryParam.value.clientId) {
        await handleClientChange(queryParam.value.clientId, queryParam.value, false);
      }
      if(queryParam.value.shopIdsString) {
        handleShopChange(false);
      }
      await handleChange();
    }
  }, 0);
})

const clientWhereDict = ref('WHERE active=1');// where clause only
const shopWhereDict = ref('WHERE active=1');// where clause only
const searchFormSchema: Ref<FormSchema[]> = ref([
  {
    field: 'clientId',
    label: t('data.Client'),
    component: 'JSearchSelect',
    componentProps:({formModel}) => {
      return {
        dict: `client ${clientWhereDict.value},internal_code,id`,
        placeholder: t('data.Client'),
        onChange: (v: string) => {
          handleClientChange(v, formModel as ShopWithOptionsListParam, true);
        }
      }
    },
    defaultValue: formDefaultValues.value.clientId,
  },
  {
    field: 'shopIdsString',
    label: t('data.shop.default'),
    component: 'JSelectMultiple',
    componentProps: () => {
      return {
        dictCode: `shop ${shopWhereDict.value},erp_code,id`,
        placeholder: t('data.shop.default'),
        onChange: () => {
          handleShopChange(true);
        },
      }
    },
    defaultValue: formDefaultValues.value.shopIdsString,
  },
  {
    field: 'showAll',
    label: t('common.operation.showAll') + ' ' + t('data.shop.shopList'),
    component: 'Switch',
    componentProps: () => {
      return {
        checkedChildren: t('common.yes'),
        unCheckedChildren: t('common.no'),
        onChange(checked: boolean) {
          handleShowAllChange(checked, true);
        }
      }
    },
    defaultValue: formDefaultValues.value.showAll,
  },
  {
    field: 'hasOptions',
    label: t('data.shopOptions.hasOptions'),
    component: 'RadioGroup',
    componentProps: () => {
      return {
        options: [
          { label: t('common.no'), value: 0 },
          { label: t('common.yes'), value: 1 },
          { label: t('common.all'), value: 2 }
        ],
        onChange() {
          handleHasOptionsChange(true);
        }
      }
    },
    defaultValue: formDefaultValues.value.hasOptions,
  },
]);
const [registerForm, {setFieldsValue, validate, updateSchema }] = useForm({
  labelWidth: '100%',
  schemas: searchFormSchema,
  showActionButtonGroup: false,
  baseColProps: {span: 12},
  layout: 'vertical',
});
async function handleClientChange (clientId: string, model: ShopWithOptionsListParam, immediate: boolean) {
  if(!clientId) {
    shopWhereDict.value = model.showAll ? '' : 'WHERE active=1';
  } else {
    shopWhereDict.value = model.showAll ? `WHERE owner_id='${clientId}'` : `WHERE active=1 AND owner_id=${clientId}`;
  }
  await setFieldsValue({
    shopId: '',
  });
  await updateSchema({
    field: 'shopIdsString',
    componentProps: () => {
      return {
        dictCode: 'shop '+shopWhereDict.value+',erp_code,id',
        placeholder: t('data.shop.default'),
        onChange: () => {
          handleShopChange(true);
        },
      }
    },
  });
  if (immediate) await handleChange();
}
function handleShopChange (immediate: boolean) {
  if (immediate) handleChange();
}
async function handleShowAllChange (checked: boolean, immediate: boolean) {
  if(checked) {
    clientWhereDict.value = '';
    shopWhereDict.value = '';
  } else {
    clientWhereDict.value = 'WHERE active=1';
    shopWhereDict.value = 'WHERE active=1';
  }
  await setFieldsValue({
    clientId: '',
    shopId: '',
  });
  await updateSchema({
    field: 'clientId',
    componentProps:({formModel}) => {
      return {
        dict: `client ${clientWhereDict.value},internal_code,id`,
        placeholder: t('data.Client'),
        onChange: (v: string) => {
          handleClientChange(v, formModel as ShopWithOptionsListParam, true);
        }
      }
    },
  });
  await updateSchema({
    field: 'shopIdsString',
    componentProps: () => {
      return {
        dictCode: `shop ${shopWhereDict.value},erp_code,id`,
        placeholder: t('data.shop.default'),
        onChange: () => {
          handleShopChange(true);
        },
      }
    },
  });
  if (immediate) await handleChange();
}
async function handleHasOptionsChange (immediate: boolean) {
  if(immediate)
    await handleChange();
}
async function handleChange () {
  const values: ShopWithOptionsListParam = await validate().catch((e) => {
    console.error('Validation failed:', e);
    return;
  });
  emit('search', values);
}
</script>
