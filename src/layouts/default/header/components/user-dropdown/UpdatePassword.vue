<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="t('sys.profile.changePassword')" @ok="handleSubmit" width="600px">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, unref, defineExpose } from 'vue';
  import { rules } from '/@/utils/helper/validator';
  import { defHttp } from '/@/utils/http/axios';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {useI18n} from "/@/hooks/web/useI18n";
  // 声明Emits
  const emit = defineEmits(['register']);
  const {t} = useI18n();
  const $message = useMessage();
  const formRef = ref();
  const username = ref('');
  //表单配置
  const [registerForm, { resetFields, validate, clearValidate }] = useForm({
    schemas: [
      {
        label: t('sys.profile.oldPassword'),
        field: 'oldpassword',
        component: 'InputPassword',
        required: true,
      },
      {
        label: t('sys.profile.newPassword'),
        field: 'password',
        component: 'StrengthMeter',
        componentProps: {
          placeholder: t('sys.profile.newPasswordPlaceholder'),
        },
        rules: [
          {
            required: true,
            message: t('sys.profile.newPasswordPlaceholder'),
          },
        ],
      },
      {
        label: t('sys.profile.confirmNewPassword'),
        field: 'confirmpassword',
        component: 'InputPassword',
        dynamicRules: ({ values }) => rules.confirmPassword(values, true),
      },
    ],
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner();

  //表单提交事件
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });
      //提交表单
      let params = Object.assign({ username: unref(username) }, values);
      defHttp.put({ url: '/sys/user/updatePassword', params }, { isTransformResponse: false }).then((res) => {
        if (res.success) {
          $message.createMessage.success(res.message);
          //关闭弹窗
          closeModal();
        } else {
          $message.createMessage.warning(res.message);
        }
      });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  async function show(name) {
    if (!name) {
      $message.createMessage.warning('当前系统无登录用户!');
      return;
    } else {
      username.value = name;
      await setModalProps({ visible: true });
      await resetFields();
      await clearValidate();
    }
  }

  defineExpose({
    show,
  });
</script>
