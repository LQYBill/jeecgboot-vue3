import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";
import { useI18n } from '@/hooks/web/useI18n';
const { t } = useI18n();

const { createConfirm } = useMessage();

enum Api {
  list = '/client/client/list',
  save='/client/client/add',
  edit='/client/client/edit',
  deleteOne = '/client/client/delete',
  deleteBatch = '/client/client/deleteBatch',
  importExcel = '/client/client/importExcel',
  exportXls = '/client/client/exportXls',
  shopList = '/client/client/queryShopByMainId',
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
 * 查询子表数据
 * @param params
 */
export const shopList = Api.shopList;
/**
 * 列表接口
 * @param params
 */
export const list = (params) =>
  defHttp.get({url: Api.list, params});

/**
 * 删除单个
 */
export const deleteOne = (params,handleSuccess) => {
  return defHttp.delete({url: Api.deleteOne, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
}
/**
 * 批量删除
 * @param params
 */
export const batchDelete = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: '确认删除',
    content: t('common.operation.deleteBatchConfirmation'),
    okText: t('common.operation.confirm'),
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
 */
export const saveOrUpdate = (params, isUpdate) => {
  const url = isUpdate ? Api.edit : Api.save;
  const method = isUpdate ? 'patch' : 'post';
  return defHttp.request({
    url,
    method,
    data: params,
  });
}
