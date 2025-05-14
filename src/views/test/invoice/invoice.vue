<template>
<PageWrapper title="Purchase Invoice Test">
<a-form ref="formRef"
        :model="formState"
        layout="vertical"
        :rules="validatorRules"
>
  <a-row>
    <a-col :span="24">
      <a-form-item v-bind="validateInfos.name" name="lines">
        <template #label>
          Number of lines in the invoice
        </template>
        <a-input-number v-model:value="formState.lines"
                        placeholder="Number of lines"
                        allowClear
                        :min="5"
        />
      </a-form-item>
    </a-col>
  </a-row>
  <a-row>
    <a-col>
      <a-button-group>
        <a-button type="primary" @click="handleGenerateShipping">Generate shipping</a-button>
        <a-button type="primary" @click="handleGeneratePurchase">Generate purchase</a-button>
        <a-button type="primary" @click="handleGenerateComplete">Generate complete</a-button>
      </a-button-group>
    </a-col>
  </a-row>
  <a-row>
    <a-col :span="24">
      <a-form-item v-bind="validateInfos.name" name="orderId">
        <template #label>
          Number of lines in the invoice
        </template>
        <a-input v-model:value="formState.orderId" placeholder="Order ID" allowClear/>
      </a-form-item>
    </a-col>
  </a-row>
  <a-row>
    <a-col>
      <a-button-group>
        <a-button type="primary" @click="handleEditOrder">Edit order</a-button>
      </a-button-group>
    </a-col>
  </a-row>
</a-form>
</PageWrapper>
</template>
<script lang="ts" setup>
import {PageWrapper} from "/@/components/Page"
import { ref, reactive } from "vue";
import {Form} from "ant-design-vue";
import {makePurchaseTest, makeShippingTest, makeCompleteTest, editOrderTest} from "./data";

const formRef = ref();
const useForm = Form.useForm;
const validatorRules = ref({
  lines: [{ required: true, message: 'Enter a number of lines', trigger: 'blur' }],
  orderId: [{ required: true, message: 'Enter an order id', trigger: 'blur' }],
});
const formState = reactive<Record<string, string>>({
  lines: '5',
  orderId: '',
});
const { validateInfos } = useForm(formState, validatorRules, { immediate: false });

async function handleGenerateShipping() {
  await makeShippingTest((+ formState.lines)).then(res => {
    console.log("res", res);
  }).catch(e => {
    console.error(e);
  });
}
async function handleGeneratePurchase() {
  await makePurchaseTest((+ formState.lines)).then(res => {
    console.log("res", res);
  }).catch(e => {
    console.error(e);
  });
}
async function handleGenerateComplete() {
  await makeCompleteTest((+ formState.lines)).then(res => {
    console.log("res", res);
  }).catch(e => {
    console.error(e);
  });
}
async function handleEditOrder() {
  await editOrderTest(formState.orderId);
}
</script>
