<template>
  <PageWrapper title="Create Purchase Invoice">
    <a-card>
       <a-form ref="formRef" :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol" :rules="validatorRules">
         <a-row>
           <a-col :span="5">
             <a-form-item
               :labelCol="labelCol"
               :wrapperCol="wrapperCol"
               v-bind="validateInfos.name"
               name="customer"
             >
               <template #label>
                 <span title="Customer">{{ t('data.invoice.customer') }}</span>
               </template>
               <JSearchSelect
                 :placeholder="t('component.searchForm.clientInputSearch')"
                 :dictOptions="customerSelectList"
                 @change="handleClientChange"
                 v-model:value="formState.customer"
                 allowClear
                 :disabled="customerListDisabled"
               />
             </a-form-item>
           </a-col>
           <a-col :span="5">
             <a-form-item
               :labelCol="labelCol"
               :wrapperCol="wrapperCol"
               v-bind="validateInfos.name"
               name="shop"
             >
               <template #label>
                 <span title="Shop">{{ t('data.invoice.shop') }}</span>
               </template>
               <template #help>{{ t('data.form.defaultAllShopSelected') }}</template>
               <JSelectMultiple
                 :placeholder="t('component.searchForm.shopInputSearch')"
                 @change="handleShopChange"
                 v-model:value="formState.shop"
                 :options="shopList"
                 allowClear
                 :disabled="shopListDisabled"
               />
             </a-form-item>
           </a-col>
         </a-row>
       </a-form>
    </a-card>
  </PageWrapper>
</template>
<script lang="ts">

import {defineComponent, onBeforeMount, reactive, ref} from "vue";
import PageWrapper from "/@/components/Page/src/PageWrapper.vue";
import JSearchSelect from "/@/components/Form/src/jeecg/components/JSearchSelect.vue";
import {useI18n} from "/@/hooks/web/useI18n";
import {useMessage} from "/@/hooks/web/useMessage";
import {Form} from "ant-design-vue";
import {defHttp} from "/@/utils/http/axios";
import JSelectMultiple from "/@/components/Form/src/jeecg/components/JSelectMultiple.vue";

export default defineComponent({
  components: {JSelectMultiple, JSearchSelect, PageWrapper},
  setup () {
    const {t} = useI18n();
    const { createMessage } = useMessage();

    const useForm = Form.useForm;
    const formRef = ref();
    const labelCol = ref<any>({ xs: { span: 24 }, sm: { span: 2 } });
    const wrapperCol = ref<any>({ xs: { span: 24 }, sm: { span: 12 } });
    const validatorRules = ref({
      customer: [{ required: true, message: t('component.searchForm.clientInputSearch'), trigger: 'blur' }],
    });
    const formState = reactive<Record<string, any>>({
      customer: '',
      shop: '',
    });
    const { resetFields, validate, validateInfos } = useForm(formState, validatorRules, { immediate: false });

    const Api = {
      getClientList: "/client/client/all",
      getShopsByCustomerId: "/shippingInvoice/shopsByClient",
    };
    onBeforeMount(() => {
      loadCustomerList();
    });

    const customerSelectList = ref<any>();
    const customerList = ref<any>();
    const customerListDisabled = ref<boolean>(false);

    const shopList = ref<any>();
    const shopListDisabled = ref<boolean>(true);

    const client = ref<any>();
    function loadCustomerList() {
      defHttp.get({url: Api.getClientList})
        .then(res => {
          customerSelectList.value = res.map(
            customer => ({
              text: `${customer.firstName} ${customer.surname} (${customer.internalCode})`,
              value: customer.id,
            })
          );
          customerList.value = res.map(
            customer => {
              let list = {};
              list["id"] = `${customer.id}`;
              list["firstname"] = `${customer.firstName}`;
              list["lastname"] = `${customer.surname}`;
              list["internalCode"] = `${customer.internalCode}`;
              list["invoiceEntity"] = `${customer.invoiceEntity}`;
              return list;
            }
          );
        })
        .catch(e => {
          console.error(e);
        })
    }
    function handleClientChange(id) {
      client.value = [];
      shopList.value = [];
      shopListDisabled.value = true;

      let index = customerList.value.map(i => i.id).indexOf(id);
      client.value = customerList.value[index];
      if(id !== undefined) {
        loadShopList(client.value.id);
      }
    }
    function loadShopList(clientId) {
      defHttp.get({url: Api.getShopsByCustomerId, params : {clientID : clientId}})
        .then(res => {

        })
        .catch(e => {
          console.error(e);
        })
    }
    function handleShopChange() {

    }

    return {
      t,
      createMessage,
      formRef,
      labelCol,
      wrapperCol,
      validatorRules,
      validate,
      resetFields,
      formState,
      validateInfos,
      customerSelectList,
      customerListDisabled,
      shopList,
      shopListDisabled,
      handleClientChange,
      handleShopChange,
    }
  }
});
</script>
<style lang="less">

</style>
