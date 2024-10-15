import {defHttp} from "/@/utils/http/axios";

export enum Api {
  list = "/business/platformOrder/shouman/list",
}

export const list = (params) => {
  return defHttp.get({ url: Api.list, params });
}
