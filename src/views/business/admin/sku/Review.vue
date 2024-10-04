<template>
  <h2>{{t('common.operation.review')}}</h2>
  <BasicTable @register="register"
  >
    <template #sensitiveAttribute="{record}">
        {{ sensitiveAttributes[record.sensitiveAttribute] }}
    </template>
    <template #shippingDiscount="{ record }">
        {{ discountDecimalToPercentage(record.shippingDiscount) }}
    </template>
    <template #status="{ record }">
      {{ skuStatus[record.status] }}
    </template>
  </BasicTable>
</template>
<script lang="ts" setup>
import { inject, onMounted, ref, Ref } from "vue";
import { Sku } from "@/views/business/dto/sku.dto";
import { sensitiveAttributeListApi, reviewColumns } from "@/views/business/admin/sku/data";
import {BasicTable, useTable} from "@/components/Table";
import {discountDecimalToPercentage, skuStatus} from "./data";
import {useI18n} from "vue-i18n";

const { t } = useI18n();

const skuList:Ref<Sku[]> = inject('skuList') as Ref<Sku[]>;

const [register] = useTable({
  columns: reviewColumns,
  dataSource: skuList,
  ellipsis: false,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
});

const sensitiveAttributes = ref<Record<string, string>>({});
onMounted(async () => {
  await sensitiveAttributeListApi().then((res) => {
    console.log('sensitiveAttributes', res);
    res.records.forEach((item) => {
      sensitiveAttributes.value = {
        ...sensitiveAttributes.value,
        [item.id]: item.zhName,
      };
    });
    console.log(sensitiveAttributes.value);
  });
})
</script>
