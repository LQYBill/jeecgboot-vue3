<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="896" @ok="handleSubmit">
    <BasicForm @register="registerForm" ref="formRef" />
    <!-- 子表单区域 -->
    <a-tabs v-model:activeKey="activeKey" animated @change="handleChangeTabs">
      <a-tab-pane :tab="t('data.shop.default')" key="shop" :forceRender="true">
        <JVxeTable
          keep-source
          resizable
          ref="shop"
          :loading="shopTable.loading"
          :columns="shopTable.columns"
          :dataSource="shopTable.dataSource"
          :height="340"
          :rowNumber="true"
          :rowSelection="true"
          :disabled="formDisabled"
          :toolbar="true"
        />
      </a-tab-pane>
      <a-tab-pane :tab="t('data.shopOptions.shopOptionsList')" key="shopOptions" :forceRender="true">
        <router-link :to="shopOptionsUrl" class="flex items-center justify-between p-4 bg-blue-100 hover:bg-blue-50 rounded-md mb-4">
          {{ t('data.shopOptions.default')}} <Icon icon="ic:round-arrow-outward" class="mx-1" />
        </router-link>
      </a-tab-pane>
    </a-tabs>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed, unref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { JVxeTable } from '/@/components/jeecg/JVxeTable';
  import { useJvxeMethod } from '/@/hooks/system/useJvxeMethods';
  import { formSchema, shopColumns } from '../Client.data';
  import { saveOrUpdate, shopList } from '../Client.api';
  import { useI18n } from '@/hooks/web/useI18n';
  import { Icon } from '@/components/Icon';
  const { t } = useI18n();
  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const formDisabled = ref(false);
  const refKeys = ref(['shop']);
  const activeKey = ref('shop');
  const shop = ref();
  const tableRefs = { shop };
  const shopOptionsUrl = ref('/business/admin/client/ShopOptionsList');
  const shopTable = reactive({
    loading: false,
    dataSource: [],
    columns: shopColumns,
  });
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue }] = useForm({
    //labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 12 },
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await reset();
    setModalProps({ confirmLoading: false, showCancelBtn: data?.showFooter, showOkBtn: data?.showFooter });
    isUpdate.value = !!data?.isUpdate;
    formDisabled.value = !data?.showFooter;
    if (unref(isUpdate)) {
      const record = { ...data.record };
      const ids = Array.isArray(record.salespersonIds)
        ? record.salespersonIds
        : [];
      //表单赋值
      await setFieldsValue({
        ...data.record,
        salespersonIds: ids.length === 1 ? ids : undefined,
      });
      shopOptionsUrl.value = data?.record?.id ? `/business/admin/client/ShopOptionsList?c=${data.record.id}` : '/business/admin/client/ShopOptionsList';
      requestSubTableData(shopList, { id: data?.record?.id }, shopTable);
    }
    // 隐藏底部时禁用整个表单
    setProps({ disabled: !data?.showFooter });
  });
  //方法配置
  const [handleChangeTabs, handleSubmit, requestSubTableData, formRef] = useJvxeMethod(
    requestAddOrEdit,
    classifyIntoFormData,
    tableRefs,
    activeKey,
    refKeys
  );

  //设置标题
  const title = computed(() => (!unref(isUpdate) ? t('common.operation.addNew') : t('common.operation.edit')));

  async function reset() {
    await resetFields();
    activeKey.value = 'shop';
    shopTable.dataSource = [];
  }

  function classifyIntoFormData(allValues) {
    let main = Object.assign({}, allValues.formValue);
    return {
      ...main, // 展开
      shopList: allValues.tablesValue[0].tableData,
    };
  }

  //表单提交事件
  async function requestAddOrEdit(values) {
    try {
      setModalProps({ confirmLoading: true });
      const submitValues = {
        ...values,
        salespersonIds: Array.isArray(values.salespersonIds)
          ? values.salespersonIds
          : typeof values.salespersonIds === 'string'
            ? values.salespersonIds.split(',').filter(Boolean)
            : [],
      };
      //提交表单
      await saveOrUpdate(submitValues, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success', values.shopList.length > 0 ? values.id : '');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped>
  /** 时间和数字输入框样式 */
  :deep(.ant-input-number) {
    width: 100%;
  }

  :deep(.ant-calendar-picker) {
    width: 100%;
  }
</style>
