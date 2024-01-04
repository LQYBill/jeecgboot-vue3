import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";
import {useI18n} from "/@/hooks/web/useI18n";

const { createConfirm } = useMessage();
const {t} = useI18n();

enum Api {
  list = '/purchaseOrder/list',
  // save='/purchaseOrder/add',
  save='/purchaseOrder/addPurchaseAndOrder',
  // edit='/purchaseOrder/edit',
  edit='/purchaseOrder/editPurchaseAndOrder',
  cancelInvoice = '/purchaseOrder/cancelInvoice',
  cancelBatchInvoice = '/purchaseOrder/cancelBatchInvoice',
  deleteOne = '/purchaseOrder/delete',
  deleteBatch = '/purchaseOrder/deleteBatch',
  importExcel = '/purchaseOrder/importExcel',
  exportXls = '/purchaseOrder/exportXls',
  duplicateInvoiceNumberCheck = '/shippingInvoice/duplicateInvoiceNumberCheck',
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
    title: t('common.operation.deleteConfirmation'),
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
 * 删除单个
 */
export const cancelInvoice = (params,handleSuccess) => {
  return defHttp.delete({url: Api.cancelInvoice, params}, {joinParamsToUrl: true}).then(() => {
    handleSuccess();
  });
}
/**
 * 批量删除
 * @param params
 */
export const batchCancel = (params, handleSuccess) => {
  createConfirm({
    iconType: 'warning',
    title: t('common.operation.deleteConfirmation'),
    content: t('common.operation.deleteBatchConfirmation'),
    okText: t('common.okText'),
    cancelText: t('common.operation.cancel'),
    onOk: () => {
      return defHttp.delete({url: Api.cancelBatchInvoice, data: params}, {joinParamsToUrl: true}).then(() => {
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
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({url: url, params});
}

export const duplicateInvoiceNumberCheck = (params) => {
  return defHttp.get({url: Api.duplicateInvoiceNumberCheck, params});
}
