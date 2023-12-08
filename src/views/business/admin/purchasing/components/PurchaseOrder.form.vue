<template>
  <div style="min-height: 400px">
    <BasicForm @register="registerForm"></BasicForm>
    <div style="width: 100%;text-align: center" v-if="!formDisabled">
      <a-button @click="submitForm" pre-icon="ant-design:check" type="primary">提 交</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import {BasicForm, useForm} from '/@/components/Form/index';
import {computed, defineComponent} from 'vue';
import {defHttp} from '/@/utils/http/axios';
import {propTypes} from '/@/utils/propTypes';
import {getBpmFormSchema, listFormatting} from '../PurchaseOrder.data';
import {saveOrUpdate} from '../PurchaseOrder.api';
import {useMessage} from "/@/hooks/web/useMessage";

const {createMessage} = useMessage();

export default defineComponent({
  name: "PurchaseOrderForm",
  components: {
    BasicForm
  },
  props: {
    formData: propTypes.object.def({}),
    formBpm: propTypes.bool.def(true),
  },
  setup(props) {
    const [registerForm, {setFieldsValue, setProps, getFieldsValue}] = useForm({
      labelWidth: 150,
      schemas: getBpmFormSchema(props.formData),
      showActionButtonGroup: false,
      baseColProps: {span: 24}
    });

    const formDisabled = computed(() => {
      if (props.formData.disabled === false) {
        return false;
      }
      return true;
    });

    let formData = {};
    const queryByIdUrl = '/purchaseOrder/queryById';

    async function initFormData() {
      let params = {id: props.formData.dataId};
      const data = await defHttp.get({url: queryByIdUrl, params});
      formData = {...data}
      //设置表单的值
      await setFieldsValue(formData);
      //默认是禁用
      await setProps({disabled: formDisabled.value})
    }

    async function submitForm() {
      let data = getFieldsValue();
      let params = Object.assign({}, formData, data);
      params.platformOrderId = listFormatting(params.platformOrderId);
      await saveOrUpdate(params, true).then(res => {
        console.log(`Save or update res : ${JSON.stringify(res)}`);
        createMessage.success(`Purchase order was successfully attributed to orders [${res.success}]`);
        createMessage.error(`Error while attributing purchase order to orders [${res.fail}]`);
      });
    }

    initFormData();
    return {
      registerForm,
      formDisabled,
      submitForm,
    }
  }
});
</script>
