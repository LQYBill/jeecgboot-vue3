<template>
  <section class="bg-white p-4 mb-4">
    <h2>1. Sku search by shop</h2>
    <a-form ref="formRef"
            :model="searchState"
            :rules="validatorRules"
            layout="vertical"
    >
      <a-row :gutter=8>
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
      </a-row>
      <a-row :gutter=8>
        <a-col :span="22">
          <a-form-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            v-bind="validateInfos.name"
            name="skuNames"
          >
            <template #label>
              Sku {{ t('data.sku.enName') }}
            </template>
            <a-textarea id="output"
                        v-model:value="searchState.skuNames"
                        placeholder="Sku english names"
                        allowClear
                        :rows="10"
            ></a-textarea>
          </a-form-item>
        </a-col>
        <a-col :span="2">
          <a-form-item>

            <template #label>
            </template>
            <a-button preIcon="ic:outline-search"
                      type="primary"
                      @click="handleSearch"
                      :disabled="!searchState.shop"
            ></a-button>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </section>
</template>
<script lang="ts" setup>
import JSelectInput from "@/components/Form/src/jeecg/components/JSelectInput.vue";
import {useI18n} from "vue-i18n";
import {inject, onMounted, reactive, Ref, ref} from "vue";
import {Form, SelectProps} from "ant-design-vue";
import {shopListApi} from "@/views/business/admin/sku/data";
import {ShopByClient, ShopResponse} from "@/views/business/dto/shop.dto";
const { t } = useI18n();

const emit = defineEmits(['search']);
const persistedSearchState = inject('tempSkuSearchState', ref<Recordable | null>(null)) as Ref<Recordable | null>;

const shopMappedByClient: Ref<Record<string, ShopByClient>> = ref({});
const shopOptionList = ref<SelectProps['options']>([]);
const shopList: Ref<ShopResponse[]> = ref([]);

onMounted(() => {
  shopListApi(handleFetchShops);
  if (persistedSearchState.value) {
    searchState.shop = persistedSearchState.value.shop || '';
    searchState.skuNames = persistedSearchState.value.skuNames || '';
  }
});

const useForm = Form.useForm;
const formRef = ref();
const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 24 } });
const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 24 } });
const validatorRules = ref({
  shop: [{ required: true, message: 'Please select a shop', trigger: 'blur' }],
  skuNames: [{ required: false }]
});
const searchState = reactive<Record<string, string>>({
  shop: '',
  skuNames: '',
});
const { validateInfos } = useForm(searchState, validatorRules, { immediate: false });

/** shop functions */
function handleFetchShops(res: ShopResponse[]): void {
  shopList.value = res;
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
function handleShopChange(value: string) {
  searchState.shop = value;
}
function handleSearch() {
  const payload = {
    shop: searchState.shop,
    client: Object.keys(shopMappedByClient.value).find(clientCode => shopMappedByClient.value[clientCode].shops.includes(searchState.shop)),
    skuNames: searchState.skuNames,
    defaultSkuZhName: shopList.value.find(shop => shop.shopCode === searchState.shop)?.defaultSkuZhName || '',
  };
  persistedSearchState.value = payload;
  emit('search', payload);
}
</script>
