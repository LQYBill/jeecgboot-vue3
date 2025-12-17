import {defHttp} from '/@/utils/http/axios';
import { useMessage } from "/@/hooks/web/useMessage";
import {useI18n} from "/@/hooks/web/useI18n";

const { createConfirm } = useMessage();
const {t} = useI18n();

enum Api {
  list = '/purchaseOrder/list',
  paymentProofReviewList = '/purchaseOrder/paymentProofReview/list',
  setPaymentApproved = '/purchaseOrder/paymentProofReview/setPaymentApproved',
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
 * 获取支付凭证审核列表
 * @param params
 */
export const paymentProofReviewList = (params) =>
  defHttp.get({url: Api.paymentProofReviewList, params});
/**
 * 设置支付审核通过
 */
export const setPaymentApproved = (params: any, handleSuccess?: () => void) => {
  return defHttp.post({ url: Api.setPaymentApproved, data: params }).then(() => {
    handleSuccess?.();
  });
};

/**
 * 删除单个
 */
export const cancelInvoice = async (params: any, record: Recordable, handleSuccess: (record: Recordable) => void) => {
  await defHttp.delete({url: Api.cancelInvoice, params}, {joinParamsToUrl: true});
  handleSuccess(record);
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

export const createMabangPurchaseOrder = async (params: any, handleSuccess?: (arg0: any) => void) => {
  const res = await defHttp.post({url: Api.createMabangPurchaseOrder, params});
  if (handleSuccess && typeof handleSuccess === 'function') {
    handleSuccess(res);
  }
  return res;
};
