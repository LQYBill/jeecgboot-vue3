<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800"
              @ok="handleSubmit">
    <slot>
      <div class="flex flex-row flex-nowrap text-center h-8 mb-4">
        <div class="flex flex-row flex-1 border-b" v-for="n in 2" :class="n==2 ? 'border-l' : '' ">
          <h2 class="w-64 text-sm">{{ t('data.product.product') }}</h2>
          <div class="flex items-center w-full flex-1">
            <h2 class="flex-1 text-sm">{{ t('data.sku.sales') }} 7 | 14 | 42</h2>
            <h2 class="flex-0.5 text-sm">{{ t('data.order.stock') }}</h2>
            <h2 class="flex-1 text-sm">{{ t('data.invoice.quantity') }}</h2>
            <h2 class="flex-0.5 text-sm" :class="n==1 ? 'mr-4' : 'mr-0'">{{ t('data.invoice.subTotal') }}</h2>
          </div>
        </div>
      </div>
    </slot>
    <BasicForm @register="registerForm" @change="calculateTotal">
      <template #qty="{ model, field, schema }">
        <div class="flex items-center flex-nowrap">
          <!-- sales 7,14,42 -->
          <div class="flex flex-col text-sm flex-1">
            <span class="qtyPerPeriod ">
              <span class="flex-1 border-r">{{selectedSkuMap.get(field).salesLastWeek == null ? 0 : selectedSkuMap.get(field).salesLastWeek}}</span>
              <span class="flex-1 border-r">{{selectedSkuMap.get(field).salesFourWeeks == null ? 0 : selectedSkuMap.get(field).salesFourWeeks}}</span>
              <span class="flex-1">{{selectedSkuMap.get(field).salesSixWeeks == null ? 0 : selectedSkuMap.get(field).salesSixWeeks}}</span>
            </span>
          </div>
          <div class="flex items-center justify-center flex-0.5">
<!--            <StockIcon :status="selectedSkuMap.get(field).stock > 0 ? 'normal' : 'error'" class="basis-2/4 w-full block!important text-right!important" width="24px" height="24px"></StockIcon>-->
<!--            <Icon icon="ant-design:gold-outlined" :color="selectedSkuMap.get(field).stock > 0 ? 'black' : 'red'" class="basis-2/4 w-full block!important text-right!important"></Icon>-->
            <span v-if="selectedSkuMap.get(field).stock <= 0" class="text-center  text-red-500">{{selectedSkuMap.get(field).stock}}</span>
            <span v-else class="text-center ">{{selectedSkuMap.get(field).stock}}</span>
          </div>
          <div class="flex flex-col flex-1">
            <InputNumber class="qtyPicker" v-model:value="model[field]" :min="0" :style="{width: '100%',minWidth: '11rem'}" placeholder="Please enter the quantity" @change="calculateTotal">
              <template #addonAfter>
                <span style="color: #9CA3AF;">{{ selectedSkuMap.get(field).skuPrice }}€/pcs</span>
              </template>
            </InputNumber>
          </div>
          <div class="flex flex-col border-1 text-center flex-0.5 mr-4">
            <span class="pricePerSku">{{ Number((model[field] * selectedSkuMap.get(field).skuPrice).toFixed(2)) }}€</span>
          </div>
        </div>
      </template>
    </BasicForm>
    <BasicForm @register="registerForm1" @change="calculateTotal" id="picker-form" style="padding: 6rem 6rem 0 6rem">
      <template #autoPicker="{ model, field, schema }">
        <div class="flex w-full justify-start gap-4">
          <div class="flex items-center justify-center">
            <InputNumber class="" style="width: 6rem" v-model:value="model[field]" :min="0" :placeholder="t('component.searchForm.enterNumberOfDays')" @change="handleSetSkuOrderQty"/>
            <span class="pl-2">{{t('component.searchForm.dayAutoPicker2')}}</span>
            <BasicHelp class="text-green-500" :text="t('data.sku.autoPickerHelpMessage')" />
          </div>
          <a-button v-if="!isAdjusted" class="" type="primary" @click="handleAdjustQty">Adjust</a-button>
          <a-button v-else class="" type="warning" @click="handleRevertQty">Revert</a-button>

        </div>
      </template>
      <template #setQtyToAll="{ model, field, schema }">
        <div class="flex w-full">
          <div class="flex basis-full flex-1 items-center justify-center">
            <InputNumber class="" style="width: 6rem" v-model:value="model[field]" :min="0" :placeholder="t('component.searchForm.qtyAutoPicker')" @change="handleSetQtyToAll"/>
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
          <span>{{ !!orderTotal ? orderTotal : 0}}</span>
          <span> €</span>
        </div>
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
import {ref, h} from 'vue';
import {BasicModal, useModalInner} from '/@/components/Modal';
import {BasicForm, useForm} from '/@/components/Form/index';
import {formSchema} from '../ProductOrder.data';
import {createPurchaseInvoice} from '../ProductOrder.api';
import {useMessage} from "/@/hooks/web/useMessage";
import {useI18n} from "/@/hooks/web/useI18n";
import {Modal} from "ant-design-vue";
import {InputNumber} from "ant-design-vue";
import BasicHelp from "/@/components/Basic/src/BasicHelp.vue";
import StockIcon from "/@/views/business/admin/purchasing/components/Icons/StockIcon.vue";

const {t} = useI18n();
const {createMessage} = useMessage();
// Emits声明
const emit = defineEmits(['register', 'success']);
const selectedSku = ref<any>([]);
const selectedSkuMap = ref(new Map());
const orderTotal = ref<number>(0);
const orderQty = ref<number>(0);
const isAdjusted = ref<boolean>(false);
const skuQtyToOrder = ref<any>({});
const skuQtyToOrderBeforeAdjust = ref<any>({});
//表单配置
const [registerForm, {appendSchemaByField, removeSchemaByFiled, setProps, resetFields, setFieldsValue, validate, getFieldsValue}] = useForm({
  //labelWidth: 150,
  schemas: formSchema,
  labelWidth: 256,
  showActionButtonGroup: false,
  baseColProps: {span: 24},
  showAdvancedButton: false,
  showResetButton: true,
  showSubmitButton: false,
});
const [registerForm1] = useForm({
  schemas: [
    { field: '', component: 'Divider', label: 'Auto-picker' },
    {
      field: 'days',
      component: "InputNumber",
      label: t('component.searchForm.dayAutoPicker1'),
      colProps: {
        span: 10,
      },
      defaultValue: 0,
      // componentProps: {
      //   addonAfter: 'days',
      //   onChange: (e:any) => {
      //     handleSetSkuOrderQty(e);
      //   },
        // min: 0,
        // placeholder: 'Please enter the number of days',
      // },
      dynamicRules: ({ values }) => {
        return [
          {
            validator: (_, value) => {
              if (value >= 0) {
                return Promise.resolve();
              }
              return Promise.reject('Please enter a valid number of days');
            }
          }
        ]
      },
      slot: 'autoPicker',
    },
    {
      field: 'allQty',
      component: "InputNumber",
      label: t('component.searchForm.qtyAutoPicker'),
      colProps: {
        span: 10,
      },
      defaultValue: 0,
      dynamicRules: ({ values }) => {
        return [
          {
            validator: (_, value) => {
              if (value >= 0) {
                return Promise.resolve();
              }
              return Promise.reject('Please enter a valid number');
            }
          }
        ]
      },
      slot: 'setQtyToAll',
    },
  ],
  labelWidth: 'auto',
  showAdvancedButton: false,
  showResetButton: false,
  showSubmitButton: false,
})
//表单赋值
const [registerModal, {setModalProps, closeModal}, ] = useModalInner(async (data) => {
  //重置表单
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
    okButtonProps:{
      disabled: true,
    }
  });
  selectedSku.value = data?.selectedRows;
  if(selectedSku.value.length > 0) {
    for(let i = 0; i < selectedSku.value.length; i++) {
      selectedSkuMap.value.set(selectedSku.value[i].erpCode, selectedSku.value[i]);
      appendSchemaByField(
        {
          field: `${selectedSku.value[i].erpCode}`,
          component: 'InputNumber',
          label: h('span', {'innerHTML': selectedSku.value[i].erpCode + '<br/><span class="text-xs text-gray-400 leading-none">(' + selectedSku.value[i].product + ')</span>'}),
          // subLabel: `${selectedSku.value[i].erpCode}`,
          required: true,
          colProps: {
            span: 12,
            // span: i%2==0 ? 11 : 12,
          },
          itemProps: {
            // extra: `${selectedSku.value[i].product}`,
          },
          // componentProps: {
            // addonAfter: `${selectedSku.value[i].skuPrice}€/pcs`,
            // placeholder: 'Please enter the quantity',
            // onChange: () => {
            //   calculateTotal();
            // },
            // min: 0,
            // style: {width: '11rem'}
          // },
          dynamicRules: ({ values }) => {
            return [
              {
                validator: (_, value) => {
                  if (value >= 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Please enter a valid quantity');
                }
              }
            ]
          },
          slot: 'qty',
        },
        ''
      );
      setFieldsValue({
        [`${selectedSku.value[i].erpCode}`]: !!skuQtyToOrder.value[selectedSku.value[i].erpCode] ? skuQtyToOrder.value[selectedSku.value[i].erpCode] : 0
      })
    }
    await calculateTotal();
  }


    // 隐藏底部时禁用整个表单
    setProps({disabled: !data?.showFooter})
});
//设置标题
const title = t('data.order.placeOrder');

//表单提交事件
async function handleSubmit(v) {
  Modal.confirm({
    title: t('data.order.createOrderConfirmation'),
    content: h('span', {'innerHTML': t('data.order.createSkuOrderConfirmationContent1') + ' <b>' + orderQty.value + '</b> skus' + t('data.order.createSkuOrderConfirmationContent2') + ' <b>' + orderTotal.value + '</b> €'}),
    okText: t('component.drawer.okText'),
    cancelText: t('component.drawer.cancelText'),
    centered: true,
    onOk: async () => {
      try {
        let values = await validate();
        let params = {};
        let result = {};
        setModalProps({confirmLoading: true});
        for (let i in values) {
          params[i] = values[i];
        }
        await createPurchaseInvoice(params)
          .then(res => {
            result = res;
          });
        closeModal();
        //刷新列表
        emit('success', result);
      } finally {
        setModalProps({confirmLoading: false});
      }
    },
  });
}
async function handleSetSkuOrderQty(days) {
  let range1 = 7;
  let range2 = 28;
  let range3 = 42;
  for(let i = 0; i < selectedSku.value.length; i++) {
    // (vente 7 jours * 0.6) + (ventes 28 jours * 0.3) + (ventes 42 jours * 0.1) = qty pour 1 jour
    let qty = Math.ceil(((0.6*selectedSku.value[i].salesLastWeek/range1) + (0.3*selectedSku.value[i].salesFourWeeks/range2) + (0.1*selectedSku.value[i].salesSixWeeks/range3)) * days);
    setFieldsValue({
      [`${selectedSku.value[i].erpCode}`]: qty
    });
  }
  await calculateTotal();
}
async function handleSetQtyToAll(qty) {
  for(let i = 0; i < selectedSku.value.length; i++) {
    setFieldsValue({
      [`${selectedSku.value[i].erpCode}`]: qty
    });
  }
  await calculateTotal();
}

function calculateTotal() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let sum:number = 0;
      let qty:number = 0;
      let skuQtyObj = getFieldsValue();
      selectedSkuMap.value.forEach((value, key) => {
        if(!!skuQtyObj[key]) {
          qty += skuQtyObj[key];
          if( skuQtyObj[key] >= value.discountMoq && value.discountMoq > 0)
            sum += Number((skuQtyObj[key] * value.discountedPrice).toFixed(2));
          else
            sum += Number((skuQtyObj[key] * value.skuPrice).toFixed(2));
        }
      })
      orderTotal.value = Number(sum.toFixed(2));
      orderQty.value = qty;
      if(orderTotal.value > 0)
        setModalProps({okButtonProps: {disabled: false}});
      else
        setModalProps({okButtonProps: {disabled: true}});
      skuQtyToOrder.value = skuQtyObj;
      resolve(true);
    }, 100);
  })
}
async function handleAdjustQty() {
  skuQtyToOrderBeforeAdjust.value = getFieldsValue();
  for(let i = 0; i < selectedSku.value.length; i++) {
    let sku = selectedSku.value[i];
    let qty = skuQtyToOrderBeforeAdjust.value[sku.erpCode] - (sku.stock < 0 ? 0 : sku.stock);
    setFieldsValue({
      [`${sku.erpCode}`]: qty < 0 ? 0 : qty
    });
  }
  await calculateTotal();
  isAdjusted.value = true;
}
async function handleRevertQty() {
  for(let i = 0; i < selectedSku.value.length; i++) {
    let sku = selectedSku.value[i];
    setFieldsValue({
      [`${sku.erpCode}`]: skuQtyToOrderBeforeAdjust.value[sku.erpCode]
    });
  }
  await calculateTotal();
  isAdjusted.value = false;
}
</script>

<style lang="less" scoped>
/** 时间和数字输入框样式 */
:deep(.ant-input-number) {
  width: 100%
}

:deep(.ant-calendar-picker) {
  width: 100%
}
</style>
<style lang="less">
.ant-input-number-group-addon {
  width: 5rem;
  max-width: 5rem;
}
.qtyPerPeriod {
  color: #9CA3AF;
  text-align: center;
  //@apply flex border rounded-full h-full py-0.5 mr-1 bg-primary bg-opacity-10;
  @apply flex h-full py-0.5 mr-1;
  //span:nth-child(1) {
  //  color: @warning-color;
  //}
  //span:nth-child(2) {
  //  color: @success-color;
  //}
  //span:nth-child(3) {
  //  color: @primary-color;
  //}
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
span.jeecg-basic-help, .jeecg-basic-table-header-cell__help {
  color: #4ad088!important;
}
#picker-form {
  .ant-row .ant-row.ant-form-item {
    justify-content: center;
  }
}
.pricePerSku {
  color: @primary-color;
}
</style>
