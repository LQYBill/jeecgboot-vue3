<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="900" @ok="handleSubmit">
    <div class="client-form-shell">
      <BasicForm @register="registerForm" ref="formRef" class="client-main-form" />
    </div>
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
          :height="240"
          :rowNumber="true"
          :rowSelection="true"
          :disabled="formDisabled"
          :toolbar="true"
        />
      </a-tab-pane>
      <a-tab-pane :tab="t('data.InvoiceEntity')" key="invoiceEntity" :forceRender="true">
        <JVxeTable
          class="invoice-entity-table"
          keep-source
          resizable
          ref="invoiceEntity"
          :loading="invoiceEntityTable.loading"
          :columns="invoiceEntityTable.columns"
          :dataSource="invoiceEntityTable.dataSource"
          :height="240"
          :rowNumber="true"
          :rowSelection="true"
          :disabled="formDisabled"
          :toolbar="true"
          :showOverflow="false"
          :showHeaderOverflow="false"
          @valueChange="handleInvoiceEntityValueChange"
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
  import { formSchema, invoiceEntityColumns, shopColumns } from '../Client.data';
  import { queryById, saveOrUpdate, shopList } from '../Client.api';
  import { useI18n } from '@/hooks/web/useI18n';
  import { Icon } from '@/components/Icon';
  const { t } = useI18n();
  // Emits声明
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const formDisabled = ref(false);
  const refKeys = ref(['shop', 'invoiceEntity']);
  const activeKey = ref('shop');
  const shop = ref();
  const invoiceEntity = ref();
  const tableRefs = { shop, invoiceEntity };
  const shopOptionsUrl = ref('/business/admin/client/ShopOptionsList');
  const shopTable = reactive({
    loading: false,
    dataSource: [],
    columns: shopColumns,
  });
  const invoiceEntityTable = reactive({
    loading: false,
    dataSource: [],
    columns: invoiceEntityColumns,
  });

  function isDefaultFlag(value: any): boolean {
    return value === '1';
  }

  function handleInvoiceEntityValueChange({ col, value, rowIndex }: { col: any; value: any; rowIndex: number }) {
    if (col?.key !== 'isDefault' || !isDefaultFlag(value)) return;
    invoiceEntityTable.dataSource.forEach((row: any, index: number) => {
      if (index !== rowIndex) row.isDefault = '0';
    });
  }

  function normalizeSingleDefault(rows: any[]): any[] {
    const lastDefaultIndex = rows.map((row) => isDefaultFlag(row?.isDefault)).lastIndexOf(true);
    if (lastDefaultIndex === -1) return rows;
    return rows.map((row, index) => ({ ...row, isDefault: index === lastDefaultIndex ? '1' : '0' }));
  }

  function normalizeMultiValue(value: any): string[] {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue }] = useForm({
    labelWidth: 108,
    labelAlign: 'left',
    wrapperCol: {
      style: {
        width: '200px',
        flex: '0 0 200px',
      },
    },
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: { span: 12 },
    rowProps: { gutter: 20, justify: 'start' },
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await reset();
    setModalProps({ confirmLoading: false, showCancelBtn: data?.showFooter, showOkBtn: data?.showFooter });
    isUpdate.value = !!data?.isUpdate;
    formDisabled.value = !data?.showFooter;
    activeKey.value = data?.initialTabKey || 'shop';
    if (unref(isUpdate)) {
      const detail = await queryById({ id: data?.record?.id });
      const record = { ...data.record, ...detail };
      const salespersonIds = normalizeMultiValue(record.salespersonIds);
      //表单赋值
      await setFieldsValue({
        ...record,
        salespersonIds,
      });
      invoiceEntityTable.dataSource = normalizeSingleDefault(Array.isArray(record?.invoiceEntityList) ? record.invoiceEntityList : []);
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
    invoiceEntityTable.dataSource = [];
  }

  function classifyIntoFormData(allValues) {
    let main = Object.assign({}, allValues.formValue);
    return {
      ...main, // 展开
      shopList: allValues.tablesValue[0].tableData,
      invoiceEntityList: allValues.tablesValue[1].tableData,
    };
  }

  //表单提交事件
  async function requestAddOrEdit(values) {
    try {
      setModalProps({ confirmLoading: true });
      const submitValues = {
        ...values,
        salespersonIds: normalizeMultiValue(values.salespersonIds),
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

  .client-form-shell {
    padding: 14px 36px 6px;
  }

  :deep(.ant-form-item-label > label) {
    white-space: normal;
    line-height: 1.25;
    height: auto;
    text-align: left;
    justify-content: flex-start;
  }

  :deep(.client-main-form .ant-form-item-row) {
    align-items: center;
  }

  :deep(.client-main-form .ant-form-item-label) {
    min-width: 108px;
    padding-right: 12px;
  }

  :deep(.client-main-form .ant-form-item-control) {
    max-width: 200px;
  }

  :deep(.client-main-form .ant-form-item-control-input-content) {
    width: 200px;
    max-width: 200px;
  }

  :deep(.client-main-form .ant-form-item-control-input-content > *) {
    width: 100%;
    max-width: 100%;
  }

  :deep(.client-main-form .ant-switch) {
    margin-left: 0;
  }

  :deep(.invoice-entity-table .vxe-body--column),
  :deep(.invoice-entity-table .vxe-header--column) {
    height: auto !important;
  }

  :deep(.invoice-entity-table .vxe-cell) {
    white-space: normal !important;
    word-break: break-word;
    line-height: 1.5;
    max-height: none !important;
    overflow: visible !important;
    text-overflow: unset !important;
    padding-top: 8px;
    padding-bottom: 8px;
  }
</style>
