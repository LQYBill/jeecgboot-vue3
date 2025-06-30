import {defHttp} from '/@/utils/http/axios';
import {downloadFile} from '/@/api/common/api';
import {InvoiceMetaData} from "@/views/business/dto/invoiceMetaData.dto";

enum Api {
  createOrder='/shippingInvoice/makeManualSkuPurchaseInvoice',
  getClientList = '/client/client/all',
  listClientSkus = '/sku/listWithFilters',
  listAllSelectableSkuIds = '/sku/listAllSelectableSkuIds',
  downloadInvoice = '/shippingInvoice/download',
  downloadInvoicePdf = '/generated/shippingInvoice/downloadPdf',
  downloadInvoiceInventory = '/shippingInvoice/downloadInvoiceInventory',
  downloadInventory = '/shippingInvoice/downloadInventory',
  getClient = '/userClient/getClient',
  getMabangUsername = '/sys/user/getMabangUsername',
  syncSkuQty = '/sku/syncSkuQty',
  skuOrderExport = '/sku/skuOrderExport',
  placeOrderByExcel = '/shippingInvoice/createOrderByExcel',
}
export const getClient = async () => {
  return await defHttp.get({url: Api.getClient});
}
export const getMabangUsername = async (handleSuccess:Function) => {
  return defHttp.get({url: Api.getMabangUsername})
    .then(res => {
      handleSuccess(res);
    }).catch(() => {
      handleSuccess(null);
    });
}
export const listCustomers = async (handleSuccess:Function) => {
  return defHttp.get({url: Api.getClientList})
    .then(res => {
      let customerSelectList = res.map(
        customer => ({
          text: `${customer.firstName} ${customer.surname} (${customer.internalCode})`,
          value: customer.id,
        })
      );
      let customerList = res.map(
        customer => {
          let list = {};
          list['id'] = `${customer.id}`;
          list['firstname'] = `${customer.firstName}`;
          list['lastname'] = `${customer.surname}`;
          list['internalCode'] = `${customer.internalCode}`;
          list['invoiceEntity'] = `${customer.invoiceEntity}`;
          return list;
        }
      );
      handleSuccess(customerSelectList, customerList);
    })
    .catch(e => {
      console.error(e);
    })
}
export const listClientSkus = async (params:any, handleSuccess:Function) => {
  return defHttp.get({url: Api.listClientSkus, params})
    .then(res => {
      handleSuccess(res);
    })
    .catch(e => {
      console.error(e);
    });
}
export const getAllSelectableSkus = async (params: Record<string, any>, handleSuccess:Function) => {
  return defHttp.get({url: Api.listAllSelectableSkuIds, params}).then(res => {
    handleSuccess(res);
  })
}
export const createPurchaseInvoice = (params:any) => {
  return defHttp.post({url: Api.createOrder, params});
}

export const downloadInvoice = (invoiceFilename:string, handleSuccess:Function) => {
  const param = {filename: invoiceFilename, type:'purchase'};
  downloadFile(Api.downloadInvoice, invoiceFilename, param).then(() => {
    handleSuccess();
  }).catch(e => {
    console.error(`Download invoice fail : ${e}`);
  });
}
export const downloadInvoicePdf = (metaData:InvoiceMetaData, handleSuccess:Function) => {
  const param = {invoiceNumber: metaData.invoiceCode};
  const filename = metaData.filename.endsWith('.xlsx') ? metaData.filename.slice(0,-5)+'.pdf' : metaData.filename.slice(0,-4)+'.pdf';
  downloadFile(Api.downloadInvoicePdf, filename, param).then(() => {
    handleSuccess();
  }).catch(e => {
    console.error(`Download invoice fail : ${e}`);
  });
}
export const downloadInvoiceInventory = (invoiceMetaData:any, handleSuccess:Function) => {
  const filename = invoiceMetaData.internalCode
    + '_(' + invoiceMetaData.invoiceEntity
    + ')_' + invoiceMetaData.invoiceCode
    + '_Inventaire_SKU.xlsx';
  downloadFile(Api.downloadInvoiceInventory, filename, invoiceMetaData).then(() => {
    handleSuccess();
  }).catch(e => {
    console.error(`Download inventory fail : ${e}`);
  });
}
export const downloadInventory = (invoiceMetaData: InvoiceMetaData, handleSuccess:Function) => {
  const filename = invoiceMetaData.internalCode
    + '_(' + invoiceMetaData.invoiceEntity
    + ')_' + invoiceMetaData.invoiceCode
    + '_Inventaire_SKU.xlsx';
  downloadFile(Api.downloadInventory, filename, invoiceMetaData).then(() => {
    handleSuccess();
  }).catch(e => {
    console.error(`Download inventory fail : ${e}`);
  });
}
export const syncSkuQty = (erpCodes: string[]) => {
  return defHttp.post({url: Api.syncSkuQty, params: erpCodes});
}
export const skuOrderExport = async (params: Record<string, any>) => {
  return defHttp.get(
    {
      url: Api.skuOrderExport,
      params,
      responseType: 'blob',
    },
    {
      isReturnNativeResponse: true,
    }
  );
}
export const placeOrderByExcel = async (formData: FormData) => {
  return defHttp.post({
    url: Api.placeOrderByExcel,
    params: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
