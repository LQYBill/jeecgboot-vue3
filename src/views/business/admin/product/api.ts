import {defHttp} from "@/utils/http/axios";
import {Api} from "@/views/business/admin/product/data";

export const listSkus = async (params, handler: Function) => {
  await defHttp.get({url: Api.listAll, params}).then(async (res) => {
    await handler(res);
  });
};
