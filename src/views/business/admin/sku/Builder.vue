<template>
  <SkuSearch :search-disabled="searchDisabled" @copy="handleRecordCopy"/>
  <div class="flex flex-row flex-nowrap gap-5 sku-builder-div">
    <SkuCodeBuilder @submit="handleSubmitCode"/>
    <SkuNameBuilder @submit="handleSubmitName"/>
  </div>
  <div class="mt-4">
    <SkuCreator @submit="handleSubmitCodeCreation"></SkuCreator>
  </div>
  <div class="p-4 text-center">
    <a-button type="warning" @click="handleSubmit" :disabled="generateButtonDisabled">
      {{ t('common.operation.generate') }} SKU
    </a-button>
  </div>
</template>
<script setup lang="ts">
import SkuCodeBuilder from "@/views/business/admin/sku/components/skuCodeBuilder.vue";
import SkuCreator from "@/views/business/admin/sku/components/skuCreator.vue";
import SkuSearch from "@/views/business/admin/sku/components/skuSearch.vue";
import SkuNameBuilder from "@/views/business/admin/sku/components/skuNameBuilder.vue";
import {useMessage} from "@/hooks/web/useMessage";
import {computed, provide, ref} from "vue";
import {filterObj} from "@/utils/common/compUtils";
import {Sku} from "@/views/business/dto/sku.dto";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const { createMessage } = useMessage();
const emits = defineEmits(["submit"]);

const searchDisabled = ref(false);
const generateButtonDisabled = computed(() => {
  return !nameMappedByCode.value || !skuCommonFieldsInfo.value;
});

const copiedRecord = ref<Sku>();
const codeBuildFormValue = ref<Record<string, any>>({}); // {[code: string] : { [field:string]: string }}
const nameMappedByCode = ref<Record<string, Record<string, string>>>(); // {[code: string] : { [field:string]: string }}; fields = [enName, zhName, declareEnName, declareZhName, supplier, supplierLink]
const skuCommonFieldsInfo = ref<Record<string, string | number| Date>>();

function handleRecordCopy(record: Sku) {
  console.log('record', record);
  copiedRecord.value = record;
}
function handleSubmitCode(formValue: Record<string, string>) {
  console.log('formValue', formValue);
  codeBuildFormValue.value = formValue;
}
function handleSubmitName(formValue: Record<string, Record<string, string>>) {
  console.log('formValue', formValue);
  nameMappedByCode.value = formValue;
}
function handleSubmitCodeCreation(param: Record<string, string | number>) {
  skuCommonFieldsInfo.value = param;
}
function handleSubmit() {
  if(!nameMappedByCode.value || !skuCommonFieldsInfo.value) {
    createMessage.error('Please fill all fields');
    return;
  }
  buildAllSkus();
}
function buildAllSkus() {
  let skuList: Sku[] = [];
  if(!nameMappedByCode.value || !skuCommonFieldsInfo.value) {
    createMessage.error('Please fill all fields');
    return;
  }
  for(let code in nameMappedByCode.value) {
    let sku: Sku = {
      erpCode: code,
      enName: nameMappedByCode.value[code].enName,
      zhName: nameMappedByCode.value[code].zhName,
      declareEname: nameMappedByCode.value[code].declareEnName,
      declareName: nameMappedByCode.value[code].declareZhName,
      weight: skuCommonFieldsInfo.value.weight ? skuCommonFieldsInfo.value.weight as number: undefined,
      availableAmount: 0,
      purchasingAmount: 0,
      shippingDiscount: skuCommonFieldsInfo.value.shippingDiscount as number,
      serviceFee: skuCommonFieldsInfo.value.serviceFee as number,
      status: 3,
      sensitiveAttribute: skuCommonFieldsInfo.value.sensitiveAttribute as string,
      isGift: skuCommonFieldsInfo.value.isGift as number,
      skuPrice: skuCommonFieldsInfo.value.skuPrice as number,
      declaredValue: skuCommonFieldsInfo.value.declaredValue ? skuCommonFieldsInfo.value.declaredValue as number : undefined,
      supplier: nameMappedByCode.value[code].supplier,
      supplierLink: nameMappedByCode.value[code].supplierLink,
    };
    skuList.push(filterObj(sku));
  }
  console.log('skuList', skuList);

  createMessage.success('All skus built successfully');
  emits('submit', skuList);
}
provide('copiedRecord', copiedRecord);
provide('codeBuildFormValue', codeBuildFormValue);
</script>
