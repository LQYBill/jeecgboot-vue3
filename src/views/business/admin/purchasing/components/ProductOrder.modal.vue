<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800"
              @ok="handleSubmit" >
    <slot>
      <div class="flex flex-row items-center flex-nowrap text-center min-h-8 mb-4">
        <div class="flex flex-row flex-1 border-b" v-for="n in 2" :class="n==2 ? 'border-l' : '' ">
          <h2 class="w-64 text-sm flex items-center justify-center">{{ t('data.product.product') }}</h2>
          <div class="grid grid-cols-6 flex-1">
            <h2 class="col-span-2 text-sm flex items-center justify-center">{{ t('data.sku.sales') }} 7 | 28 | 42</h2>
            <h2 class="text-sm flex items-center justify-center">{{ t('data.order.stock') }}</h2>
            <h2 class="col-span-2 text-sm flex items-center justify-center">{{ t('data.invoice.quantity') }}</h2>
            <h2 class=" text-sm flex items-center justify-center" :class="n==1 ? 'mr-4' : 'mr-0'">{{ t('data.invoice.subTotal') }}</h2>
          </div>
        </div>
      </div>
    </slot>
    <BasicForm @register="registerForm" @change="calculateTotal">
      <template #qty="{ model, field }">
        <div class="grid grid-cols-6 items-center">
          <!-- sales 7,14,42 -->
          <div class="flex text-sm items-center justify-center col-span-2">
            <div class="qtyPerPeriod w-full">
              <span class="flex-1 border-r">{{selectedSkuMap.get(field).salesLastWeek == null ? 0 : selectedSkuMap.get(field).salesLastWeek}}</span>
              <span class="flex-1 border-r">{{selectedSkuMap.get(field).salesFourWeeks == null ? 0 : selectedSkuMap.get(field).salesFourWeeks}}</span>
              <span class="flex-1">{{selectedSkuMap.get(field).salesSixWeeks == null ? 0 : selectedSkuMap.get(field).salesSixWeeks}}</span>
            </div>
          </div>
          <div class="flex items-center justify-center">
            <span v-if="selectedSkuMap.get(field).stock == 0" class="text-center text-red-500">{{ selectedSkuMap.get(field).stock }}</span>
            <span v-else-if="selectedSkuMap.get(field).stock < 0" class="text-center bg-red/60 rounded-md text-white px-1">{{ selectedSkuMap.get(field).stock }}</span>
            <span v-else class="text-center">{{ selectedSkuMap.get(field).stock }}</span>
          </div>
          <div class="flex flex-col items-center justify-center col-span-2 qtyEditor">
            <InputNumber
              class="qtyPicker"
              v-model:value="model[field]"
              :min="0"
              :controls="false"
              placeholder="Please enter the quantity"
              @change="calculateTotal"
            />
            <span :class="['priceOriginal', { priceHidden: !shouldShowOriginalPrice(field, model[field]) }]">
              {{ getOriginalUnitPrice(field) }}€/{{ selectedSkuMap.get(field).unit }}pcs
            </span>
            <span class="priceCurrent" :style="{ color: selectedSkuMap.get(field).unit > 1 ? '#EF4444' : '#9CA3AF' }">
              {{ getDisplayUnitPrice(field, model[field]) }}€/{{ selectedSkuMap.get(field).unit }}pcs
            </span>
          </div>
          <div class="flex flex-col text-center rounded-r-md subtotalCell">
            <span class="pricePerSku">{{ getDisplaySubtotal(field, model[field]) }}€</span>
            <span :class="['priceOriginal', 'subtotalOriginal', { priceHidden: !shouldShowOriginalPrice(field, model[field]) }]">
              {{ formatPrice(Number(model[field] || 0) * getOriginalUnitPrice(field)) }}€
            </span>
          </div>
        </div>
      </template>
    </BasicForm>
    <BasicForm @register="registerForm1" @change="calculateTotal" id="picker-form" style="padding: 6rem 6rem 0 6rem">
      <template #autoPicker="{ model, field }">
        <div class="flex w-full justify-start gap-4 flex-wrap">
          <div class="flex items-center justify-center gap-2 flex-wrap">
            <InputNumber class="autoPickerInput" style="width: 6rem" v-model:value="model[field]" :min="0" :placeholder="t('component.searchForm.enterNumberOfDays')" @change="handleSetSkuOrderQty" />
            <span>{{ t('component.searchForm.dayAutoPicker2') }}</span>
            <BasicHelp class="text-green-500" :text="t('data.sku.autoPickerHelpMessage')" />
          </div>
          <a-button v-if="!isAdjusted" type="primary" @click="handleAdjustQty">Adjust</a-button>
          <a-button v-else type="warning" @click="handleRevertQty">Revert</a-button>
          <a-tooltip>
            <template #title>
              Fill all negative stocks to missing amounts
            </template>
            <a-button type="primary" @click="handleFillNegativeStocks">Fill negative stocks</a-button>
          </a-tooltip>
        </div>
      </template>
      <template #setQtyToAll="{ model, field }">
        <div class="flex w-full">
          <div class="flex basis-full flex-1 items-center justify-center">
            <InputNumber class="autoPickerInput" style="width: 6rem" v-model:value="model[field]" :min="0" :placeholder="t('component.searchForm.qtyAutoPicker')" @change="handleSetQtyToAll" />
          </div>
        </div>
      </template>
    </BasicForm>
    <div class="total flex text-center basis-full flex-1 items-center text-lg w-1/2 max-w-2xl m-[auto]">
      <div class="block basis-full flex-1 w-full py-4 border border-r-0 rounded-l-full bg-blue-100">
        <span>Total</span>
      </div>
      <div class="block basis-full flex-1 price w-full py-4 border border-l-0 rounded-r-full">
        <div>
          <span>{{ !!orderTotal ? orderTotal : 0 }}</span>
          <span> €</span>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
import { ref, h } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form/index';
import { formSchema } from '../ProductOrder.data';
import { createPurchaseInvoice } from '../ProductOrder.api';
import { useI18n } from '/@/hooks/web/useI18n';
import { Modal, InputNumber } from 'ant-design-vue';
import BasicHelp from '/@/components/Basic/src/BasicHelp.vue';

const { t } = useI18n();
const emit = defineEmits(['register', 'success']);
const internalUse = ref(false);
const selectedSku = ref<any[]>([]);
const selectedSkuMap = ref(new Map());
const orderTotal = ref<number>(0);
const orderQty = ref<number>(0);
const isAdjusted = ref<boolean>(false);
const skuQtyToOrder = ref<any>({});
const skuQtyToOrderBeforeAdjust = ref<any>({});

const [registerForm, { appendSchemaByField, setProps, resetFields, setFieldsValue, validate, getFieldsValue }] = useForm({
  schemas: formSchema,
  labelWidth: 256,
  showActionButtonGroup: false,
  baseColProps: { span: 24 },
  showAdvancedButton: false,
  showResetButton: true,
  showSubmitButton: false,
});

const [registerForm1] = useForm({
  schemas: [
    { field: '', component: 'Divider', label: 'Auto-picker' },
    {
      field: 'days',
      component: 'InputNumber',
      label: ' ',
      colProps: { span: 24 },
      defaultValue: 0,
      dynamicRules: () => [
        {
          validator: (_, value) => {
            if (value >= 0) return Promise.resolve();
            return Promise.reject('Please enter a valid number of days');
          },
        },
      ],
      slot: 'autoPicker',
    },
    {
      field: 'allQty',
      component: 'InputNumber',
      label: ' ',
      colProps: { span: 24 },
      defaultValue: 0,
      dynamicRules: () => [
        {
          validator: (_, value) => {
            if (value >= 0) return Promise.resolve();
            return Promise.reject('Please enter a valid number');
          },
        },
      ],
      slot: 'setQtyToAll',
    },
  ],
  labelWidth: 0,
  showAdvancedButton: false,
  showResetButton: false,
  showSubmitButton: false,
});

const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  await resetFields();
  selectedSku.value = [];
  selectedSkuMap.value = new Map();
  orderTotal.value = 0;
  orderQty.value = 0;
  setModalProps({
    defaultFullscreen: true,
    confirmLoading: false,
    showCancelBtn: !!data?.showFooter,
    showOkBtn: !!data?.showFooter,
    okText: t('data.order.createOrder'),
    okButtonProps: {
      disabled: true,
    },
    afterClose: () => {
      resetModalData();
    },
  });
  internalUse.value = data?.internalUse || false;
  selectedSku.value = data?.selectedRows || [];
  if (selectedSku.value.length > 0) {
    for (let i = 0; i < selectedSku.value.length; i++) {
      selectedSkuMap.value.set(selectedSku.value[i].erpCode, selectedSku.value[i]);
      await appendSchemaByField(
        {
          field: `${selectedSku.value[i].erpCode}`,
          component: 'InputNumber',
          label: h('div', { style: 'white-space: normal; word-break: break-all;' }, [
            h('div', selectedSku.value[i].erpCode),
            h('div', { class: 'text-xs text-gray-400' }, selectedSku.value[i].zhName || ''),
            h('div', { class: 'text-xs text-blue-400' }, selectedSku.value[i].enName || ''),
          ]),
          required: true,
          colProps: {
            span: 12,
          },
          dynamicRules: () => [
            {
              validator: (_, value) => {
                if (value >= 0) return Promise.resolve();
                return Promise.reject('Please enter a valid quantity');
              },
            },
          ],
          slot: 'qty',
        },
        ''
      );
      let defaultQty = 0;
      if (selectedSku.value[i].quantity !== undefined && selectedSku.value[i].quantity !== null) {
        defaultQty = Number(selectedSku.value[i].quantity);
      }
      const existingQty = skuQtyToOrder.value[selectedSku.value[i].erpCode];
      const useQty = existingQty !== undefined && existingQty !== null ? existingQty : defaultQty;
      setFieldsValue({
        [`${selectedSku.value[i].erpCode}`]: useQty,
      });
    }
    await calculateTotal();
  }
  setProps({ disabled: !data?.showFooter });
});

const title = t('data.order.placeOrder');

function resetModalData() {
  selectedSku.value = [];
  selectedSkuMap.value = new Map();
  orderTotal.value = 0;
  orderQty.value = 0;
  skuQtyToOrder.value = {};
  skuQtyToOrderBeforeAdjust.value = {};
  isAdjusted.value = false;
  resetFields();
}

async function handleSubmit(_v) {
  Modal.confirm({
    title: t('data.order.createOrderConfirmation'),
    content: h('span', {
      innerHTML:
        t('data.order.createSkuOrderConfirmationContent1') +
        ' <b>' +
        orderQty.value +
        '</b> skus' +
        t('data.order.createSkuOrderConfirmationContent2') +
        ' <b>' +
        orderTotal.value +
        '</b> €',
    }),
    okText: t('component.drawer.okText'),
    cancelText: t('component.drawer.cancelText'),
    centered: true,
    onOk: async () => {
      try {
        const values = await validate();
        const params = {};
        let result = {};
        setModalProps({ confirmLoading: true });
        for (const i in values) {
          if (values[i] > 0) params[i] = values[i];
        }
        await createPurchaseInvoice(params).then((res) => {
          result = res;
        });
        closeModal();
        emit('success', result);
      } finally {
        setModalProps({ confirmLoading: false });
      }
    },
  });
}

async function handleSetSkuOrderQty(days) {
  const range1 = 7;
  const range2 = 28;
  const range3 = 42;
  for (let i = 0; i < selectedSku.value.length; i++) {
    const qty = Math.ceil(
      ((0.6 * selectedSku.value[i].salesLastWeek) / range1 +
        (0.3 * selectedSku.value[i].salesFourWeeks) / range2 +
        (0.1 * selectedSku.value[i].salesSixWeeks) / range3) *
        days
    );
    setFieldsValue({
      [`${selectedSku.value[i].erpCode}`]: qty,
    });
  }
  await calculateTotal();
}

async function handleSetQtyToAll(qty) {
  for (let i = 0; i < selectedSku.value.length; i++) {
    setFieldsValue({
      [`${selectedSku.value[i].erpCode}`]: qty,
    });
  }
  await calculateTotal();
}

function formatPrice(price) {
  return Number(Number(price || 0).toFixed(2));
}

function hasDiscountPrice(field, qty) {
  const sku = selectedSkuMap.value.get(field);
  if (!sku) return false;
  const currentQty = Number(qty || 0);
  const discountMoq = Number(sku.discountMoq || 0);
  const discountedPrice = Number(sku.discountedPrice || 0);
  return discountMoq > 0 && discountedPrice > 0 && currentQty >= discountMoq;
}

function getOriginalUnitPrice(field) {
  const sku = selectedSkuMap.value.get(field);
  if (!sku) return 0;
  return formatPrice(sku.originalSkuPrice ?? sku.price ?? sku.skuPrice);
}

function shouldShowOriginalPrice(field, qty) {
  const sku = selectedSkuMap.value.get(field);
  if (!sku || !hasDiscountPrice(field, qty)) return false;
  return getOriginalUnitPrice(field) > 0;
}

function getDisplayUnitPrice(field, qty) {
  const sku = selectedSkuMap.value.get(field);
  if (!sku) return 0;
  return formatPrice(hasDiscountPrice(field, qty) ? sku.discountedPrice : sku.skuPrice);
}

function getDisplaySubtotal(field, qty) {
  return formatPrice(Number(qty || 0) * getDisplayUnitPrice(field, qty));
}

function calculateTotal() {
  return new Promise((resolve) => {
    setTimeout(() => {
      let sum = 0;
      let qty = 0;
      const skuQtyObj = getFieldsValue();
      selectedSkuMap.value.forEach((value, key) => {
        if (!!skuQtyObj[key]) {
          qty += skuQtyObj[key];
          if (skuQtyObj[key] >= value.discountMoq && value.discountMoq > 0) {
            sum += Number((skuQtyObj[key] * value.discountedPrice).toFixed(2));
          } else {
            sum += Number((skuQtyObj[key] * value.skuPrice).toFixed(2));
          }
        }
      });
      orderTotal.value = Number(sum.toFixed(2));
      orderQty.value = qty;
      if (orderTotal.value > 0) {
        setModalProps({ okButtonProps: { disabled: false } });
      } else {
        setModalProps({ okButtonProps: { disabled: true } });
      }
      skuQtyToOrder.value = skuQtyObj;
      resolve(true);
    }, 100);
  });
}

async function handleAdjustQty() {
  skuQtyToOrderBeforeAdjust.value = getFieldsValue();
  for (let i = 0; i < selectedSku.value.length; i++) {
    const sku = selectedSku.value[i];
    const qty = skuQtyToOrderBeforeAdjust.value[sku.erpCode] - (sku.stock < 0 ? 0 : sku.stock);
    await setFieldsValue({
      [`${sku.erpCode}`]: qty < 0 ? 0 : qty,
    });
  }
  await calculateTotal();
  isAdjusted.value = true;
}

async function handleRevertQty() {
  for (let i = 0; i < selectedSku.value.length; i++) {
    const sku = selectedSku.value[i];
    await setFieldsValue({
      [`${sku.erpCode}`]: skuQtyToOrderBeforeAdjust.value[sku.erpCode],
    });
  }
  await calculateTotal();
  isAdjusted.value = false;
}

async function handleFillNegativeStocks() {
  for (let i = 0; i < selectedSku.value.length; i++) {
    const sku = selectedSku.value[i];
    const qty = sku.stock < 0 ? Math.abs(sku.stock) : 0;
    await setFieldsValue({
      [`${sku.erpCode}`]: qty,
    });
  }
  await calculateTotal();
}
</script>

<style lang="less" scoped>
:deep(.autoPickerInput.ant-input-number) {
  width: 100%;
}

:deep(.qtyPicker.ant-input-number) {
  width: 56px !important;
  min-width: 56px !important;
  max-width: 56px !important;
}

:deep(.qtyPicker .ant-input-number-input) {
  height: 30px;
  padding: 0 6px;
  text-align: center;
  font-size: 12px;
}

:deep(.ant-calendar-picker) {
  width: 100%;
}
</style>

<style lang="less">
.qtyPerPeriod {
  color: #9CA3AF;
  text-align: center;
  @apply grid h-full py-0.5 grid-cols-3;
}

form {
  .ant-row.ant-form-item {
    align-items: center;
    line-height: normal;
  }

  div .ant-col-12 {
    &:nth-child(odd) {
      border-left: 1px solid @light-gray-color;
    }
  }
}

.jeecg-basic-form .ant-form-item-label > label[for="form_item_days"] {
  font-size: 14px;
}

span.jeecg-basic-help,
.jeecg-basic-table-header-cell__help {
  color: #4ad088 !important;
}

#picker-form {
  .ant-row .ant-row.ant-form-item {
    justify-content: center;
  }
}

.pricePerSku {
  color: @primary-color;
  font-weight: 600;
  min-height: 20px;
}

.qtyEditor {
  gap: 2px;
}

.priceCurrent {
  color: #9CA3AF;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
}

.priceOriginal {
  color: #9CA3AF;
  font-size: 12px;
  line-height: 16px;
  text-decoration: line-through;
  text-align: center;
  min-height: 16px;
}

.subtotalCell {
  min-width: 72px;
  gap: 2px;
}

.subtotalOriginal {
  min-height: 16px;
}

.priceHidden {
  visibility: hidden;
}

.jeecg-basic-form .ant-form-item-label > label {
  height: 64px;
}
</style>
