<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose title="How to invoice" :width="800"
              @ok="handleSubmit">
    <article>
      <p>There's 3 types of invoicing available : <span class="text-primary font-bold">Shipping</span>, <span class="text-success font-bold">Purchase</span> or <span class="font-bold">Both</span></p>
      <h2>Shipping Invoice</h2>
      <p>To invoice shipping fees, make sure to only select orders with the column "<span class="text-primary font-bold">Shipping Invoice</span>" displaying <Tag color="green">{{ t("common.available") }}</Tag>.<br/>
      Otherwise the button will stay <a-button disabled>disabled</a-button>
      </p>
      <h2>Purchase Invoice</h2>
      <p>Same as for shipping fees but this time make sure to only select orders with column "<span class="text-success font-bold">Purchase Invoice</span>" with value displaying
        <Tag color="green">{{ t("common.available") }}</Tag>.
      </p>
      <h2>Shipping + Purchase</h2>
      <p>To generate this type of invoice, make sure that both columns "<span class="text-primary font-bold">Shipping Invoice</span>" and "<span class="text-success font-bold">Purchase Invoice</span>" are displaying <Tag color="green">{{ t("common.available") }}</Tag>!</p>
      <h2>Generated files</h2>
      <p>Once you've selected the orders you want to invoice, click on the button <a-button type="primary">Generate</a-button> to download the invoice files.<br/>
      Note that 2 files are generated, the first file should be the <b>Invoice</b> itself and the second should be a <b>detailed Excel sheet</b> file. The detail file will take a bit more time to be generated than the invoice.</p>
      <p>If you need to download the files again, you can visit <a :href="resolve({name: 'expenses-overview'}).href" target="_blank">this page</a></p>
      <ADivider></ADivider>
      <small>Note : Use the sorting button to help you find orders with the criteria you need !</small>
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
