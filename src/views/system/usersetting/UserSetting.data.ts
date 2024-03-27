import { FormSchema } from '/@/components/Form/index';
import { rules } from '/@/utils/helper/validator';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export interface ListItem {
  key: string;
  title: string;
  description: string;
  extra?: string;
  avatar?: string;
  color?: string;
}

// tab的list
export const settingList = [
  {
    key: '1',
    name: t('sys.profile.myInformation'),
    component: 'BaseSetting',
    icon:'ant-design:user-outlined'
  },
   {
    key: '2',
    name: t('sys.profile.accountSecurity'),
    component: 'AccountSetting',
    icon:'ant-design:lock-outlined'
  },
];


/**
 * 用户表单
 */
export const formSchema: FormSchema[] = [
  {
    field: 'realname',
    component: 'Input',
    label: t('sys.profile.name'),
    colProps: { span: 24 },
    required:true,
    componentProps: {
      disabled: true,
    }
  },
  {
    field: 'birthday',
    component: 'DatePicker',
    label: t('sys.profile.birthday'),
    colProps: { span: 24 },
    defaultValue: ()=> {
      return new Date().toISOString().split('T')[0];
    },
    componentProps:{
      placeholder: t('sys.profile.birthday'),
      showTime:false,
      valueFormat:"YYYY-MM-DD",
      getPopupContainer: () => document.body,
    },
  },
  {
    field: 'sex',
    component: 'RadioGroup',
    label: t('sys.profile.sex'),
    colProps: { span: 24 },
    componentProps:{
      options: [
        {
          label: t('sys.profile.male'),
          value: 1,
        },
        {
          label: t('sys.profile.female'),
          value: 2,
        },
      ],
    }
  },
  {
    field: 'post',
    component: 'JDictSelectTag',
    label: t('sys.profile.jobTitle'),
    colProps: { span: 24 },
    componentProps:{
      mode:'multiple',
      dictCode:'sys_position,name,code',
      disabled:true
    }
  },
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
]

//密码弹窗
export const formPasswordSchema: FormSchema[] = [
  {
    label: t('sys.login.username'),
    field: 'username',
    component: 'Input',
    componentProps: { readOnly: true },
  },
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
    label: t('sys.profile.confirmPassword'),
    field: 'confirmpassword',
    component: 'InputPassword',
    dynamicRules: ({ values }) => rules.confirmPassword(values, true),
  },
];
