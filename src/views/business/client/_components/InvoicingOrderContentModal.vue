<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="`${t('data.order.content')} : ${orderNumber}`" :width="800"
  @ok="handleSubmit">
    <BasicTable @register="registerTable">
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
import {ref} from "vue";
import {defHttp} from "@/utils/http/axios";
import {Api} from "@/views/business/client/client.api";
import {pocColumns} from "@/views/business/client/invoicing/data";
import {Tag} from "ant-design-vue";

const {t} = useI18n();
const emit = defineEmits(['success', 'guide', 'register']);

const orderNumber = ref();
const orderContent = ref([]);

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
const [registerTable] = useTable({
  dataSource: orderContent,
  columns: pocColumns,
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
</script>
