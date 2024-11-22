<template>
  <BasicModal
    @register="registerModal"
    destroyOnClose
    :title="`${isUpdate ? t('common.operation.edit') : t('common.operation.add')} ${t('data.invoice.additionalFees')}`"
    @ok="handleSubmit"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="validatorRules"
      layout="vertical"
      class="p-4"
    >
      <a-form-item
        v-bind="validateInfos.name"
        name="shop"
      >
        <template #label>
          <a-tooltip title="Select a shop">
            {{ t('data.invoice.shop') }}
          </a-tooltip>
        </template>
        <JSelectInput
          ref="shopInput"
          placeholder="Select a shop"
          v-model:value="formState.shop"
          :options="shopOptionList"
          allowClear
          @change="handleShopChange"
          :disabled="isUpdate"
        />
      </a-form-item>
      <a-form-item
        v-bind="validateInfos.name"
        name="optionId"
      >
        <template #label>
          <a-tooltip title="Select a fee type">
            {{ t('data.fee.type') }}
          </a-tooltip>
        </template>
        <JSearchSelect
          placeholder="Select a fee type"
          v-model:value="formState.optionId"
          :dictOptions="typeOptionList"
          allowClear
          @change="handleTypeChange"
          :disabled="isFeeOptionDisabled || isUpdate"
        />
      </a-form-item>
      <a-form-item
        v-if="isOther"
        v-bind="validateInfos.name"
        name="description"
      >
        <template #label>
          <a-tooltip title="Describe the fee">
            {{ t('data.invoice.description') }}
          </a-tooltip>
        </template>
        <a-input
          placeholder="Describe the fee"
          v-model:value="formState.description"
          allowClear
          type="text"
          @change="handleDescriptionChange"
          :disabled="isDescriptionDisabled"
        ></a-input>
      </a-form-item>
      <a-form-item
        v-bind="validateInfos.name"
        name="quantity"
      >
        <template #label>
          <a-tooltip :title="t('data.invoice.quantity')">
            {{ t('data.invoice.quantity') }}
          </a-tooltip>
        </template>
        <a-input-number
          placeholder="Quantity"
          v-model:value="formState.quantity"
          :min="0"
          allowClear
          type="text"
          @change="handleQuantityChange"
          :disabled="isUpdate && !!formState.invoiceNumber"
          :precision="0"
        ></a-input-number>
      </a-form-item>
      <a-form-item
        v-bind="validateInfos.name"
        name="unitPrice"
      >
        <template #label>
          <a-tooltip title="Individual fee">
            {{ t('data.invoice.unitPrice') }}
          </a-tooltip>
        </template>
        <a-input-number
          placeholder="Unit Price"
          v-model:value="formState.unitPrice"
          :min="0"
          allowClear
          @change="handleAmountChange"
          :disabled="isUpdate && !!formState.invoiceNumber"
          :precision="2"
        >
          <template #addonAfter v-if="currentClient">
            {{ shopMappedByClient[currentClient].currency }}
          </template>
        </a-input-number>
      </a-form-item>
      <a-form-item
        v-bind="validateInfos.name"
        name="invoiceNumber"
      >
        <template #label>
          <a-tooltip :title="t('data.invoice.invoiceNumber')">
            {{ t('data.invoice.invoiceNumber') }}
          </a-tooltip>
        </template>
        <a-input
          placeholder="XXXX-XX-XXXX"
          v-model:value="formState.invoiceNumber"
          allowClear
          @change="handleInvoiceNumberChange"
          :disabled="isUpdate"
        />
      </a-form-item>
    </a-form>
    <a-divider></a-divider>
    <div>
      <span class="font-semibold text-lg">Total</span> : {{ (formState.quantity * formState.unitPrice).toFixed(2) }}{{ !!currentClient ? currencyToken[shopMappedByClient[currentClient].currency] : '' }}
    </div>
  </BasicModal>
</template>
<script setup lang="ts">
import {inject, onMounted, reactive, Ref, ref, unref} from "vue";
import { useI18n } from "vue-i18n";
import { Form, SelectProps } from "ant-design-vue";
import { BasicModal, useModalInner } from "@/components/Modal";
import JSelectInput from "@/components/Form/src/jeecg/components/JSelectInput.vue";
import { JSearchSelect } from "@/components/Form";
import {
  fetchTypeList,
  saveOrUpdateExtraFee
} from "@/views/business/admin/additionalFees/data";
import { ShopByClient } from "@/views/business/dto/shop.dto";
import { useMessage } from "@/hooks/web/useMessage";
import { extraFeesOption } from "@/views/business/dto/extraFeesOption.dto";
import { JSearchSelectOption } from "@/views/business/dto/JSearchSelectOption.dto";
import {currencyToken} from "../../../dto/currency.dto";

const { t } = useI18n();
const { createMessage } = useMessage();

const emit = defineEmits(['submit', 'register']);

const isUpdate = ref(true);
const feeId = ref<string>();

const [registerModal, {setModalProps, closeModal}, ] = useModalInner(async (data) => {
  resetFields();
  setModalProps({
    defaultFullscreen: false,
    confirmLoading: false,
    showCancelBtn: true,
    showOkBtn: true,
    okText: t('common.operation.submit'),
  });
  isUpdate.value = !!data?.isUpdate;
  if (unref(isUpdate)) {
    //表单赋值
    setFieldsValue({
      ...data.record,
    });
    verifyShopExistence(data.record.shop);
    setIsOtherType(typeList.value.find((type) => type.enName === data.record.enName)?.id!);
  } else {
    feeId.value = data?.id;
  }
});

const shopMappedByClient = inject('shopMappedByClient') as Ref<Record<string, ShopByClient>>;
const shopOptionList = inject('shopOptionList') as Ref<SelectProps['options']>;
const typeList = ref<extraFeesOption[]>([]);
const typeOptionList = ref<JSearchSelectOption[]>([]);
const currentClient = ref<string>('');

const otherEnName = "Autres";

const isOther = ref<boolean>(false);
const isFeeOptionDisabled = ref<boolean>(true);
const isDescriptionDisabled = ref<boolean>(true);

const useForm = Form.useForm;
const formRef = ref();
const shopInput = ref();
const validatorRules = ref({
  shop: [{required: true, message: t('component.searchForm.shopInputSearch'), trigger: 'change'}],
  optionId: [{required: true, message: 'choose a type of item', trigger: 'change'}],
  description: [{required: true, message: 'describe the fee', trigger: 'blur'}],
  quantity: [{required: true, message: 'enter a quantity', trigger: 'blur'}],
  unitPrice: [{required: true, message: 'enter an unit price', trigger: 'blur'}],
  invoiceNumber: [{required: false}, { pattern: '^[0-9]{4}-[0-9]{2}-[127][0-9]{3}$', message: 'Wrong format !', trigger: 'blur' }],
});
const formState = reactive<Record<string, any>>({
  shop: '',
  optionId: '',
  description: '',
  quantity: null,
  unitPrice: null,
  invoiceNumber: '',
});
const { validateInfos, resetFields,  } = useForm(formState, validatorRules, { immediate: true });

function handleFetchTypes(res: Record<string, any>): void {
  typeList.value = res.records;
  typeOptionList.value = res.records.map((option: extraFeesOption) => {
    return {
      text: option.zhName + '/' + option.enName,
      value: option?.id
    }
  });
}
onMounted(async () => {
  await fetchTypeList(handleFetchTypes);
});

function handleShopChange(value: string) {
  resetFields();
  isFeeOptionDisabled.value = true;
  if(!value) return;
  if(verifyShopExistence(value)) {
    formState.shop = value;
    isFeeOptionDisabled.value = false;
  } else {
    createMessage.error('Shop does not exist');
  }
}
function handleTypeChange(typeId: string) {
  formState.optionId = typeId;
  setIsOtherType(typeId);
}
function setIsOtherType(typeId: string) {
  if(typeId === typeList.value.find((type) => type.enName === otherEnName)?.id){
    isDescriptionDisabled.value = false;
    isOther.value = true;
  } else {
    isDescriptionDisabled.value = true;
    isOther.value = false;
  }
}
function handleDescriptionChange(event: Event) {
  formState.description = (event.target as HTMLInputElement).value;
}
function handleQuantityChange(value: number) {
  formState.quantity = value;
}
function handleAmountChange(value: number) {
  formState.unitPrice = value;
}
function handleInvoiceNumberChange(event: Event) {
  formState.invoiceNumber = (event.target as HTMLInputElement).value;
}
function verifyShopExistence(shopCode: string) {
  let shopExists = false;
  Object.keys(shopMappedByClient.value).forEach((clientCode) => {
    if(shopMappedByClient.value[clientCode].shops.includes(shopCode)) {
      currentClient.value = clientCode;
      shopExists = true;
      return;
    }
  });
  return shopExists;
}
function handleSaveOrUpdate() {
  emit('submit');
  closeModal();
}
function buildParam() {
  if(isUpdate.value) {
    if (!feeId.value) {
      console.error('Fee ID is not defined');
      return;
    }
    // TODO : test this
    if(isOther) {
      return {
        id: feeId.value,
        description: formState.description,
        quantity: formState.quantity,
        unitPrice: formState.unitPrice,
      };
    }
    return {
      id: feeId.value,
      quantity: formState.quantity,
      unitPrice: formState.unitPrice,
    };
  }
  return {
    ...formState,
  };
}
async function handleSubmit() {
  formRef.value.validate().then(async () => {
    const params = buildParam();
    if(!params) return;
    await saveOrUpdateExtraFee(params, isUpdate.value, handleSaveOrUpdate);
  }).catch((err) => {
    console.error('error', err);
  });
}
function setFieldsValue(value: Record<string, any>) {
  formState.shop = value.shop;
  formState.optionId = typeList.value.find((type) => type.enName === value.enName)?.id;
  formState.description = value.description;
  formState.quantity = value.quantity;
  formState.unitPrice = value.unitPrice;
  formState.invoiceNumber = value.invoiceNumber;
}
</script>
