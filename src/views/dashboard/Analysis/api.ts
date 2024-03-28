import { defHttp } from '/@/utils/http/axios';
import {ComputedRef} from "vue";

enum Api {
  loginfo = '/sys/loginfo',
  visitInfo = '/sys/visitInfo',
  clientKpi = '/client/client/kpi',
  employeeKpi = '/admin/kpis',
}
/**
 * 日志统计信息
 * @param params
 */
export const getLoginfo = (params) => defHttp.get({ url: Api.loginfo, params }, { isTransformResponse: false });
/**
 * 访问量信息
 * @param params
 */
export const getVisitInfo = (params) => defHttp.get({ url: Api.visitInfo, params }, { isTransformResponse: false });

export const fetchIsEmployee = async (handleSuccess: (arg0: any) => void) => {
  const res = await defHttp.get({url: '/security/isEmployee'});
  handleSuccess(res);
}
export const fetchKpis = async (isEmployee: ComputedRef<boolean>, period:string, handleSuccess: (arg0: any) => void) => {
  const res = await defHttp.get({url: isEmployee ? Api.employeeKpi : Api.clientKpi, params: {period: period}});
  handleSuccess(res);
}
