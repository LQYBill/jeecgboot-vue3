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
  cancelInvoice = '/invoice/cancelInvoice',
  cancelBatchInvoice = '/invoice/cancelBatchInvoice',
  importExcel = '/purchaseOrder/importExcel',
  exportXls = '/purchaseOrder/exportXls',
  duplicateInvoiceNumberCheck = '/shippingInvoice/duplicateInvoiceNumberCheck',
  createMabangPurchaseOrder = '/purchaseOrder/createMabangPurchaseOrder',
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
export const cancelInvoice = async (params: any, handleSuccess: () => void) => {
  await defHttp.delete({url: Api.cancelInvoice, params}, {joinParamsToUrl: true});
  handleSuccess();
}
/**
 * 批量删除
 * @param params
 * @param handleSuccess
 */
export const batchCancel = (params:any, handleSuccess: () => void) => {
  createConfirm({
    iconType: 'warning',
    title: t('common.operation.deleteConfirmation'),
    content: t('common.operation.deleteBatchConfirmation'),
    okText: t('common.okText'),
    cancelText: t('common.operation.cancel'),
    onOk: async () => {
      await defHttp.delete({ url: Api.cancelBatchInvoice, params }, { joinParamsToUrl: true });
      handleSuccess();
    }
  });
}
/**
 * 保存或者更新
 * @param params
 * @param isUpdate
 */
export const saveOrUpdate = (params: Recordable, isUpdate: boolean) => {
  let url = isUpdate ? Api.edit : Api.save;
  return defHttp.post({url: url, params});
}

export const duplicateInvoiceNumberCheck = (params: { id: any; invoiceNumber: any; invoiceType: string; }) => {
  return defHttp.get({url: Api.duplicateInvoiceNumberCheck, params});
}

export const createMabangPurchaseOrder = async (params: any, handleSuccess: (arg0: any) => void) => {
  const res = await defHttp.get({url: Api.createMabangPurchaseOrder, params: params});
  handleSuccess(res);
}
