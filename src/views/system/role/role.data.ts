import { FormSchema } from '/@/components/Table';
import { isRoleExist } from './role.api';
export const columns = [
  {
    title: '角色名称',
    dataIndex: 'roleName',
    width: 100,
  },
  {
    title: '角色编码',
    dataIndex: 'roleCode',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 100,
  },
];
/**
 * 角色用户Columns
 */
export const userColumns = [
  {
    title: '用户账号',
    dataIndex: 'username',
    width: 100,
  },
  {
    title: '用户姓名',
    dataIndex: 'realname',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'status_dictText',
    width: 80,
  }
];
export const searchFormSchema: FormSchema[] = [
  {
    field: 'roleName',
    label: '角色名称',
    component: 'Input',
    colProps: { span: 6},
  }
];
/**
 * 角色用户搜索form
 */
export const searchUserFormSchema: FormSchema[] = [
  {
    field: 'username',
    label: '用户账号',
    component: 'Input',
    colProps: { span: 12 },
  }
];

export const formSchema: FormSchema[] = [
  {
    field: 'id',
    label: '',
    component: 'Input',
    show:false
  },
  {
    field: 'roleName',
    label: '角色名称',
    required: true,
    component: 'Input',
  },
  {
    field: 'roleCode',
    label: '角色编码',
    required: true,
    component: 'Input',
    dynamicDisabled: ({values}) => {
      return !!values.id;
    },
    dynamicRules: ({ values,model }) => {
      console.log("values:",values)
      return [
        {
          required: true,
          validator: (_, value) => {
            if (!value) {
              return Promise.reject('请输入角色编码');
            }
            if(values){
              return new Promise((resolve, reject) => {
                isRoleExist({id:model.id,roleCode:value})
                  .then((res) => {
                    res.success? resolve(): reject(res.message || '校验失败');
                  }).catch((err) => {
                  reject(err.message || '验证失败');
                });
              });
            }
            return Promise.resolve();
          },
        },
      ];
    },
  },
  {
    label: '备注',
    field: 'description',
    component: 'InputTextArea',
  }
];

export const formDescSchema = [
  {
    field: 'roleName',
    label: '角色名称',
  },
  {
    field: 'roleCode',
    label: '角色编码'
  },
  {
    label: '备注',
    field: 'description',
  }
];

