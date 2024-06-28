<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose title="How to invoice" :width="800"
              @ok="handleSubmit">
    <article class="px-4">
      <p>
        This page allows you to perform 3 main operations on your orders :  <b>Cancel</b>, <b>Suspend</b> and <b>Edit recipient information</b>
      </p>
      <h2>Cancel</h2>
      <p>Very intuitive, as the name suggests, it will allow you to cancel selected order.</p>
      <h2>Suspend</h2>
      <p>When you suspend orders, it will be put on hold and won't be processed until you decide to unsuspend it.</p>
      <p><small>If you decide to unsuspend one or multiple orders, please reach our sales team</small></p>
      <h2>Edit order's recipient information</h2>
      <p>To perform this action you must only select <b>one</b> order and the <b>Edit recipient's information</b> operation will be enabled.</p>
    </article>
    <a-button type="warning" @click="startGuide">Show guide</a-button>
  </BasicModal>
</template>
<script lang="ts" setup>

import {BasicModal, useModalInner} from "@/components/Modal";
import {useI18n} from "@/hooks/web/useI18n";
import {Tag} from "ant-design-vue";
import {useRouter} from "vue-router";

const {resolve}=useRouter();
const {t} = useI18n();
const emit = defineEmits(['success', 'guide', 'register']);

const [registerModal, {setModalProps, closeModal}, ] = useModalInner(async () => {
  setModalProps({
    defaultFullscreen: false,
    confirmLoading: false,
    showCancelBtn: false,
    showOkBtn: true,
    okText: t('component.modal.okText'),
  });
});

const handleSubmit = () => {
  emit('success');
  closeModal();
}
const startGuide = () => {
  emit('guide');
  closeModal();
}
</script>
<style>

</style>
