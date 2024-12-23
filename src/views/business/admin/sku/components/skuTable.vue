<template>
  <BasicTable @register="registerTable">

  </BasicTable>
</template>
<script lang="ts" setup>
import {BasicTable, useTable} from "@/components/Table";
import {SkuColumns} from "@/views/business/admin/sku/data";

const [registerTable, {reload}] = useTable({
  columns: SkuColumns,
});
</script>
