import { defHttp } from '/@/utils/http/axios';

enum Api {
  loginfo = '/sys/loginfo',
  visitInfo = '/sys/visitInfo',
  clienKpi = '/client/client/kpi',
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

export const fetchIsEmployee = (handleSucess) => {
  return defHttp.get({ url: '/security/isEmployee' }).then((res) => {handleSucess(res);});
}
export const fetchKpis = (isEmployee, handleSuccess) => {
  return defHttp.get({ url: isEmployee ? Api.employeeKpi : Api.clienKpi }).then((res) => {handleSuccess(res);});
}
