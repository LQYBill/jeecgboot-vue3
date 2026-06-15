<template>
  <div style="min-height: 400px">
    <BasicForm @register="registerForm" />
    <div style="width: 100%; text-align: center" v-if="!formDisabled">
      <a-button @click="submitForm" pre-icon="ant-design:check" type="primary">提 交</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import { BasicForm, useForm } from '/@/components/Form/index';
import { computed, defineComponent } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { propTypes } from '/@/utils/propTypes';
import { getBpmFormSchema } from '../Quotation.data';
import { quoteAdd, quoteEdit } from '../Quotation.api';

export default defineComponent({
  name: 'QuotationForm',
  components: { BasicForm },
  props: {
    formData: propTypes.object.def({}),
    formBpm: propTypes.bool.def(true),
  },
  setup(props) {
    const [registerForm, { setFieldsValue, setProps, getFieldsValue }] = useForm({
      labelWidth: 150,
      schemas: getBpmFormSchema(props.formData),
      showActionButtonGroup: false,
      baseColProps: { span: 24 },
    });

    const formDisabled = computed(() => {
      if (props.formData.disabled === false) return false;
      return true;
    });

    let formData: any = {};
    const queryByIdUrl = '/quotation/queryById';

    async function initFormData() {
      const params = { id: props.formData.dataId };
      const data = await defHttp.get({ url: queryByIdUrl, params });
      formData = { ...data };
      await setFieldsValue(formData);
      await setProps({ disabled: formDisabled.value });
    }

    async function submitForm() {
      const data = getFieldsValue();
      const params = Object.assign({}, formData, data);
      if (params.id) {
        await quoteEdit(params);
      } else {
        await quoteAdd(params);
      }
    }

    initFormData();

    return {
      registerForm,
      formDisabled,
      submitForm,
    };
  },
});
</script>
