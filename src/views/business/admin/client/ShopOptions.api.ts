import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";
import {ShopOptionsUpdateParam, ShopOptionsAddParam} from "@/views/business/dto";
import {useI18n} from "@/hooks/web/useI18n";

const { createConfirm } = useMessage();
const { t } = useI18n();

enum Api {
  list = '/shopOptions/list',
  save='/shopOptions/add',
  edit='/shopOptions/edit',
  deleteOne = '/shopOptions/delete',
  deleteBatch = '/shopOptions/deleteBatch',
  importExcel = '/shopOptions/importExcel',
  exportXls = '/shopOptions/exportXls',
}
/**
 * 导出api
 * @param params
 */
export const getExportUrl = Api.exportXls;
/**
 * 导入api
 */
export const getImportUrl = Api.importExcel;
/**
 * 列表接口
 * @param params
 */
export const list = (params) =>
  defHttp.get({url: Api.list, params});

/**
 * 删除单个
 */
export const deleteOne = (params,handleSuccess: Function) => {
  return defHttp.delete({url: Api.deleteOne, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
}
/**
 * 批量删除
 * @param params
 * @param handleSuccess
 */
export const batchDelete = (params, handleSuccess: Function) => {
  createConfirm({
    iconType: 'warning',
    title: t('common.operation.delete'),
    content: t('common.operation.deleteBatchConfirmation'),
    okText: t('common.okText'),
    cancelText: t('common.operation.cancel'),
    onOk: () => {
      return defHttp.delete({url: Api.deleteBatch, data: params}, {joinParamsToUrl: true}).then(() => {
        handleSuccess();
      });
    }
  });
}
/**
 * 保存或者更新
 * @param params
 * @param isUpdate
 */
export const saveOrUpdate = (params: ShopOptionsAddParam | ShopOptionsUpdateParam, isUpdate: boolean) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({url: url, params});
}
