import {defHttp} from '/@/utils/http/axios';
import {downloadFile} from '/@/api/common/api';

enum Api {
  createOrder='/shippingInvoice/makeManualSkuPurchaseInvoice',
  getClientList = '/client/client/all',
  getSkusByClient = '/sku/skusByClient',
  downloadInvoice = '/shippingInvoice/download',
  downloadInventory = '/shippingInvoice/downloadInventory',
  getMabangUsername = '/sys/user/getMabangUsername',
}
export const getMabangUsername = (handleSuccess:any) => {
  return defHttp.get({url: Api.getMabangUsername})
    .then(res => {
      handleSuccess(res);
    }).catch(() => {
      handleSuccess(null);
    });
}
export const listCustomers = (handleSuccess:any) => {
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

export const listSkus = (params:any, handleSuccess:any) => {
  return defHttp.get({url: Api.getSkusByClient, params})
    .then(res => {
      let skuList = res.records;
      handleSuccess(skuList);
    })
    .catch(e => {
      console.error(e);
    });
}
export const createPurchaseInvoice = (params:any) => {
  return defHttp.post({url: Api.createOrder, params});
}

export const downloadInvoice = (invoiceFilename:string, handleSuccess:any) => {
  const param = {filename: invoiceFilename, type:'purchase'};
  downloadFile(Api.downloadInvoice, invoiceFilename, param).then(() => {
    handleSuccess();
  }).catch(e => {
    console.error(`Download invoice fail : ${e}`);
  });
}
export const downloadInventory = (invoiceMetaData:any, handleSuccess:any) => {
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
