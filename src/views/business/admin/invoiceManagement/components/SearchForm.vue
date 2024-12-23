<template>
  <div class="min-h-sm">
    <a-form ref="formRef"
            :model="searchState"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="validatorRules"
            class="bg-white rounded-5 pt-8 p-4 "
    >
      <a-row :gutter =8>
        <a-col :span="colSpan.client"
               v-if="internalUse">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            v-bind="validateInfos.name"
            name="client"
          >
            <template #label>
              {{ t('data.Client') }}
            </template>
            <JSearchSelect
              :placeholder="t('component.searchForm.clientInputSearch')"
              :dict-options="clientOptions"
              @change="handleClientChange"
              v-model:value="searchState.client"
              allowClear
            />
          </a-form-item>
        </a-col>
        <a-col :span="colSpan.shops">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            v-bind="validateInfos.name"
            name="shops"
          >
            <template #label>
              {{ t('data.invoice.shop') }}
            </template>
            <template #help>{{ t('data.form.defaultAllShopSelected') }}</template>
            <JSelectMultiple
              :placeholder="t('component.searchForm.shopsInputSearch')"
              @change="handleShopChange"
              v-model:value="searchState.shops"
              :options="shopOptions"
              allowClear
              :disabled="isShopDisabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="colSpan.type">
          <a-form-item
            :labelCol="largeLabelCol"
            :wrapperCol="largeWrapperCol"
            v-bind="validateInfos.name"
            name="type"
          >
            <template #label>
              {{ t('data.invoice.invoiceType') }}
            </template>
            <JSearchSelect
              :placeholder="t('component.searchForm.invoiceTypeInputSearch')"
              @change="handleTypeChange"
              v-model:value="searchState.type"
              :dict-options="typeOptions"
              allowClear
            />
          </a-form-item>
        </a-col>
        <a-col :span="colSpan.date">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            v-bind="validateInfos.name"
            name="date"
          >
            <template #label>
              {{ t('data.invoice.date') }}
            </template>
            <JRangeDate
              @change="handleDateChange"
              v-model:value="searchState.date"
              allowClear
              :disabled="isDateDisabled"
              :disabledDate="disabledDate"
            />
          </a-form-item>
        </a-col>
        <a-col :span="1">
          <a-form-item>
            <a-button type="primary" preIcon="ant-design:search-outlined" @click="handleSearch"></a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>
<script lang="ts" setup>
import {JSearchSelect, JSelectMultiple} from "@/components/Form";
import {inject, reactive, Ref, ref, watch} from "vue";
import {Form} from "ant-design-vue";
import {useI18n} from "vue-i18n";
import JRangeDate from "@/components/Form/src/jeecg/components/JRangeDate.vue";
import {fetchInvoicePeriod, fetchShopList, typeOptions} from "../data/ExportDetails.data";
import dayjs, {Dayjs} from "dayjs";
import {JSelectInputOptions} from "@/views/business/dto/JSelectInputOptions.dto";
import {JSearchSelectOption} from "@/views/business/dto/JSearchSelectOption.dto";
import {cloneDeep} from "lodash-es";

const { t } = useI18n();
const emit = defineEmits(['search']);

const clientOptions = inject('clientOptions') as Ref<JSearchSelectOption[]>;
const internalUse = inject('internalUse') as Ref<boolean>;

const shopOptions = ref<JSelectInputOptions[]>([]);
const isShopDisabled = ref<boolean>(internalUse.value);

watch(
  () => clientOptions.value,
  (newOptions) => {
    if (newOptions.length > 0 && !internalUse.value) {
      colSpan.value = cloneDeep(clientColSpan.value);
      handleClientChange(newOptions[0].value);
    }
  },
  { immediate: true }
);

const startDate = ref<Dayjs>(dayjs('2023-01-01').startOf("day"));
const endDate = ref<Dayjs>(dayjs().endOf("day"));
const isDateDisabled = ref(true);

const useForm = Form.useForm;
const formRef = ref();
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 4 } });
const largeLabelCol = ref<any>({ xs: { span: 24 }, sm: { span: 8 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 20 } });
const largeWrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 16 } });
const colSpan = ref({
  client: 5,
  shops: 5,
  type: 8,
  date: 5,
})
const clientColSpan = ref({
  client: 0,
  shops: 8,
  type: 8,
  date: 7,
})
const validatorRules = ref({
  client: [{ required: true, message: t('component.searchForm.clientInputSearch'), trigger: 'blur' }],
  shops: [{ required: true, message: t('component.searchForm.shopsInputSearch'), trigger: 'blur' }],
  date: [{ required: true, message: t('component.searchForm.dateInputSearch'), trigger: 'blur' }],
  type: [{ required: true, message: t('component.searchForm.invoiceTypeInputSearch'), trigger: 'blur' }],
});
const searchState = reactive<Record<string, string>>({
  client: '',
  shops: '',
  date: '',
  type: '',
});
const { validateInfos } = useForm(searchState, validatorRules, { immediate: false });

async function handleClientChange(value: string) {
  clearField('client');
  searchState.client = value;
  if(!value) return;
  await fetchShopList(value, handleFetchShopList);
}
function handleFetchShopList(res: Recordable[]) {
  shopOptions.value = res.map((shop) => ({
    label: shop.name,
    value: shop.id,
  }));
  isShopDisabled.value = false;
}
async function handleShopChange(value: string) {
  console.log('Shop change', value);
  clearField('shops');
  searchState.shops = value;
  if(!value) return;
  await fetchInvoicePeriod(value, handleFetchInvoicePeriod);
}
function handleFetchInvoicePeriod(res: Recordable) {
  startDate.value = dayjs(res.start).startOf("day");
  endDate.value = dayjs(res.end).endOf("day");
  isDateDisabled.value = false;
}
function handleDateChange(value: string) {
  console.log('Date change', value, searchState.date);
  clearField('date');
  searchState.date = value;
}
function handleTypeChange(value: string) {
  searchState.type = value;
}
function handleSearch() {
  formRef.value.validate().then(async () => {
    emit('search', searchState);
  }).catch((e) => {
    console.log('Error', e);
  });
}
function clearField(field: string) {
  switch (field) {
    case "client" :
      searchState.client = '';
      isShopDisabled.value = !internalUse;
      // falls through because we want to clear any other fields when we change client, except for invoice type
    case "shops" :
      searchState.shops = '';
      isDateDisabled.value = true;
      // falls through because when we change shops the date range changes
    case "date" :
      searchState.date = '';
      startDate.value = dayjs('2023-01-01').startOf("day");
      endDate.value = dayjs().endOf("day");
      // falls through to default case
    default :
      break;
  }
}
function disabledDate(current: Dayjs) {
  return current < dayjs(startDate.value) || current > dayjs(endDate.value);
}
</script>
