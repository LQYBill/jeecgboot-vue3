<template>
  <section class="bg-white p-4 mb-4">
    <h2>1. Sku search by shop</h2>
    <a-form ref="formRef"
            :model="searchState"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="validatorRules"
    >
      <a-row :gutter =8>
        <a-col :span="10">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            v-bind="validateInfos.name"
            name="shop"
          >
            <template #label>
              {{ t('data.invoice.shop') }}
            </template>
            <JSelectInput
              :placeholder="t('component.searchForm.shopInputSearch')"
              :options="shopOptionList"
              @change="handleShopChange"
              v-model:value="searchState.shop"
              allowClear
            />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item>
            <a-button type="primary" preIcon="ant-design:search-outlined" @click="handleSearch"></a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </section>
</template>
<script lang="ts" setup>
import JSelectInput from "@/components/Form/src/jeecg/components/JSelectInput.vue";
import {useI18n} from "vue-i18n";
import {onMounted, reactive, Ref, ref} from "vue";
import {Form, SelectProps} from "ant-design-vue";
import type {FormActionType} from "@/components/Form";
import {shopListApi} from "@/views/business/admin/sku/data";
import {ShopByClient} from "@/views/business/dto/shop.dto";
const { t } = useI18n();

const shopMappedByClient: Ref<Record<string, ShopByClient>> = ref({});
const shopOptionList = ref<SelectProps['options']>([]);

onMounted(() => {
  shopListApi(handleFetchShops);
});

const useForm = Form.useForm;
const formRef = ref();
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 4 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 20 } });
const validatorRules = ref({
  shop: [{ required: true, message: 'Please select a shop', trigger: 'blur' }],
});
const searchState = reactive<Record<string, string>>({
  shop: '',
});
const { validateInfos } = useForm(searchState, validatorRules, { immediate: false });

/** shop functions */
function handleFetchShops(res: ShopResponse[]): void {
  const shopsMappedByClientTemp: Record<string, ShopByClient> = {};
  shopMappedByClient.value = res.reduce((acc, currentShop) => {
    if (!acc[currentShop.clientCode]) {
      acc[currentShop.clientCode] = {
        clientName: currentShop.clientName,
        clientCode: currentShop.clientCode,
        currency: currentShop.currency,
        shops: [],
      };
    }
    acc[currentShop.clientCode].shops.push(currentShop.shopCode);
    return acc;
  }, shopsMappedByClientTemp);
  createShopOptions();
}
function createShopOptions() {
  shopOptionList.value = Object.keys(shopMappedByClient.value).map((clientCode) => {
    if(!shopMappedByClient.value[clientCode])
      console.error('client has no shop', clientCode);
    return {
      label: shopMappedByClient.value[clientCode].clientName + ' (' + clientCode + ')',
      options: shopMappedByClient.value[clientCode].shops.map((shopCode) => {
        return {
          value: shopCode,
          label: shopCode,
        };
      }),
    };
  });
}
/** search */
async function handleSearch(state: Record<string, string>) {
  searchState.shop = state.shop;
  // await loadFeeList(1);
}
function handleShopChange(value: string) {
  searchState.shop = value;
  emit('search', searchState);
}
</script>
