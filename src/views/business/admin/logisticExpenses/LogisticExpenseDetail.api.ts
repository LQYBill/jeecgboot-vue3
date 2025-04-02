import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";

const { createConfirm } = useMessage();

export const Api = {
  LIST : '/logisticExpenseDetail/list',
  LIST_LOGISTIC_COMPANIES: '/logistic/',
  SAVE:'/logisticExpenseDetail/add',
  EDIT:'/logisticExpenseDetail/edit',
  DELETE_ONE : '/logisticExpenseDetail/delete',
  DELETE_BATCH : '/logisticExpenseDetail/deleteBatch',
  IMPORT_EXCEL : '/logisticExpenseDetail/importExcel',
  EXPORT_XLS : '/logisticExpenseDetail/exportXls',
}
export const list = (params) =>
  defHttp.get({url: Api.LIST, params});
export const deleteOne = async (params,handleSuccess: Function) => {
  return await defHttp.delete({url: Api.DELETE_ONE, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
}
export const batchDelete = (params, handleSuccess: Function) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: '是否删除选中数据',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      return defHttp.delete({url: Api.DELETE_BATCH, data: params}, {joinParamsToUrl: true}).then(() => {
        handleSuccess();
      });
    }
  });
}
export const saveOrUpdate = (params, isUpdate: boolean) => {
  let url = isUpdate ? Api.EDIT : Api.SAVE;
  return defHttp.post({url: url, params});
}
