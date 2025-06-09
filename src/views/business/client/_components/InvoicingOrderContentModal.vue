<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="`${t('data.order.content')} : ${orderNumber}`" :width="800"
  @ok="handleSubmit">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" preIcon="ant-design:copy-outlined" @click="handleCopy" :disabled="copyDisabled">{{ t('common.operation.copy') + ' SKU '  + t('data.sku.erpCode')}}</a-button>
      </template>
      <template #isSynced="{ text }">
        <Tag :color="text === 0 ? 'volcano' : 'green'">
          {{ text === 0 ? t("common.no") : t("common.yes") }}
        </Tag>
      </template>
    </BasicTable>
  </BasicModal>
</template>
<script setup lang="ts">
import {BasicTable, useTable} from "@/components/Table";
import BasicModal from "@/components/Modal/src/BasicModal.vue";
import {useModalInner} from "@/components/Modal";
import {useI18n} from "@/hooks/web/useI18n";
import {ref, unref} from "vue";
import {defHttp} from "@/utils/http/axios";
import {Api} from "@/views/business/client/client.api";
import {pocColumns} from "@/views/business/client/invoicing/data";
import {Tag} from "ant-design-vue";
import {useCopyToClipboard} from "@/hooks/web/useCopyToClipboard";
import {useMessage} from "@/hooks/web/useMessage";

const {t} = useI18n();
const { clipboardRef, copiedRef } = useCopyToClipboard();
const { createMessage } = useMessage();
const emit = defineEmits(['success', 'guide', 'register']);

const orderNumber = ref();
const orderContent = ref([]);
const copyDisabled = ref(true);

const [registerModal, {setModalProps, closeModal}, ] = useModalInner(async (data) => {
  orderContent.value = [];
  orderNumber.value = data.orderNumber;
  setModalProps({
    defaultFullscreen: false,
    confirmLoading: false,
    showCancelBtn: false,
    showOkBtn: true,
    okText: t('component.modal.close'),
  });
  await fetchOrderContent(data.orderId);
});
const [registerTable, {getSelectRows}] = useTable({
  dataSource: orderContent,
  columns: pocColumns,
  rowSelection: {
    type: 'checkbox',
    onChange: handleSelectChange,
  },
  bordered: false,
  ellipsis: false,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  rowKey: 'id',
})
async function fetchOrderContent(orderId: string) {
  await defHttp.get({url: Api.getOrderContent, params: {id: orderId}})
    .then((res) => {
      orderContent.value = res.records;
    }).catch((err) => {
      console.error(err);
      orderContent.value = [];
    });
}
const handleSubmit = () => {
  emit('success');
  closeModal();
}
function handleSelectChange (_selectedRowKeys: (string | number)[], selectedRows: Recordable[]) {
  if(selectedRows.length > 0) {
    copyDisabled.value = false;
    return;
  }
  copyDisabled.value = true;
}
function handleCopy() {
  const selectedRows = getSelectRows();
  clipboardRef.value = selectedRows.map(row => row.skuId_dictText).join(',');
  if(unref(copiedRef)) {
    createMessage.warning(t('component.copy.success'));
  }
}
</script>
