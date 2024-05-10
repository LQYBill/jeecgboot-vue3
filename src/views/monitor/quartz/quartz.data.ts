import { BasicColumn, FormSchema } from '/@/components/Table';
import { render } from '/@/utils/common/renderUtils';
import { JCronValidator } from '/@/components/Form';
import {useI18n} from "/@/hooks/web/useI18n";

const { t } = useI18n();

export const columns: BasicColumn[] = [
  {
    title: t('job.jobClassName'),
    dataIndex: 'jobClassName',
    width: 200,
    align: 'left',
    slots: {customRender: 'jobName'},
  },
  {
    title: t('job.cronExpression'),
    dataIndex: 'cronExpression',
    width: 200,
  },
  {
    title: t('job.parameter'),
    dataIndex: 'parameter',
    width: 200,
  },
  {
    title: t('data.invoice.description'),
    dataIndex: 'description',
    width: 200,
  },
  {
    title: t('common.Status'),
    dataIndex: 'status',
    width: 100,
    customRender: ({ text }) => {
      const color = text == '0' ? 'green' : text == '-1' ? 'red' : 'gray';
      return render.renderTag(render.renderDict(text, 'quartz_status'), color);
    },
  },
];

export const searchFormSchema: FormSchema[] = [
  {
    field: 'jobClassName',
    label: t('job.jobClassName'),
    component: 'Input',
    colProps: { span: 8 },
  },
  {
    field: 'status',
    label: t('job.jobStatus'),
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'quartz_status',
      stringToNumber: true,
    },
    colProps: { span: 8 },
  },
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: 'id',
    component: 'Input',
    show: false,
  },
  {
    field: 'jobClassName',
    label: t('job.jobClassName'),
    component: 'Input',
    required: true,
  },
  {
    field: 'cronExpression',
    label: t('job.cronExpression'),
    component: 'JEasyCron',
    defaultValue: '* * * * * ? *',
    rules: [{ required: true, message: '请输入Cron表达式' }, { validator: JCronValidator }],
  },
  {
    field: 'parameterType',
    label: t('job.parameterType'),
    component: 'Select',
    defaultValue: 'string',
    componentProps: {
      options: [
        { label: t('variable.string'), value: 'string' },
        { label: t('variable.jsonObject'), value: 'json' },
      ],
    },
  },
  {
    field: 'parameter',
    label: t('job.parameter'),
    component: 'InputTextArea',
    ifShow: ({ values }) => {
      return values.parameterType == 'string';
    },
    componentProps : {
      rows: 10,
    },
  },
  {
    field: 'parameter',
    label: t('job.parameter'),
    component: 'JAddInput',
    helpMessage: t('job.helpMessage.json'),
    ifShow: ({ values }) => {
      return values.parameterType == 'json';
    },
  },
  {
    field: 'status',
    label: t('common.Status'),
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'quartz_status',
      type: 'radioButton',
      stringToNumber: true,
      dropdownStyle: {
        maxHeight: '6vh',
      },
    },
  },
  {
    field: 'description',
    label: t('data.invoice.description'),
    component: 'InputTextArea',
  },
];
