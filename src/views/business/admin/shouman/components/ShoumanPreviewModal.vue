<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title"
              @ok="handleSubmit">
    <a-form ref="form" :model="model" :label-col="{span: 4}" :wrapper-col="{span: 20}">
      <table>
        <thead>
        <tr>
          <th>{{ t('component.table.index') }}</th>
          <th>{{ t('data.shouman.productName') }}</th>
          <th>{{ t('data.invoice.quantity') }}</th>
          <th>{{ t('data.shouman.comment') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in model" :key="item">
          <td>{{ model.indexOf(item) + 1 }}</td>
          <td>{{ item.productName }}</td>
          <td>{{ item.outboundNumder }}</td>
          <a-textarea v-model:value="item.comment" autoSize/>
        </tr>
        </tbody>
      </table>
    </a-form>
  </BasicModal>
</template>

<script lang="ts" setup>
import {ref, computed, inject, reactive, unref, Ref} from 'vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import {useI18n} from "/@/hooks/web/useI18n";

const {t} = useI18n();
// Emits声明
const emit = defineEmits(['register']);
const platformOrderId = inject('platformOrderId') as Ref<any>;
const allCustomComments = inject('allCustomComments') as Ref<Map<string, any>>;
const dataSource = ref<any[]>([]);
//表单modal
let model = reactive([]);

//表单赋值
const [registerModal, {setModalProps, closeModal}] = useModalInner(async (data) => {
  setModalProps({
    confirmLoading: false
  });
  // Clear previous model value
  model = [];
  dataSource.value = data.result;
  Object.assign(model, data.result);
  // Load locally stored custom comments over comments from API
  let customCommentsForCurrentOrder = allCustomComments.value.get(platformOrderId.value);
  if (customCommentsForCurrentOrder != null) {
    for (let i = 0; i < customCommentsForCurrentOrder.length; i++) {
      unref(model)[i].comment = customCommentsForCurrentOrder[i].comment;
    }
  }
});
//设置标题
const title = computed(() => (t('common.operation.edit')));

//表单提交事件
async function handleSubmit() {
  try {
    setModalProps({confirmLoading: true});
    allCustomComments.value.set(platformOrderId.value, [...model]);
    //关闭弹窗
    closeModal();
  } finally {
    setModalProps({confirmLoading: false});
  }
}
</script>

<style lang="less" scoped>
table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e2eaf9;
}

table th {
  text-align: center;
  background: #e2eaf9;
  color: #000;
  padding: 8px;
  min-width: 5px;
}

table td {
  text-align: center;
  padding: 8px;
  border-right: 1px solid #e2eaf9;
}

table td:last-child {
  border-right: none;
}

table tbody tr:nth-child(2n) td {
  background: #D4D8F9;
}
</style>
