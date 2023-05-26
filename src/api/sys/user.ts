import { defHttp } from '/@/utils/http/axios';
import { LoginParams, LoginResultModel, GetUserInfoModel } from './model/userModel';

import { ErrorMessageMode } from '/#/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { useUserStoreWithOut } from '/@/store/modules/user';
import { setAuthCache } from '/@/utils/auth';
import { TOKEN_KEY } from '/@/enums/cacheEnum';
import { router } from '/@/router';
import { PageEnum } from '/@/enums/pageEnum';

const { createErrorModal } = useMessage();
enum Api {
  Login = '/sys/login',
  Logout = '/sys/logout',
  GetUserInfo = '/sys/user/getUserInfo',
  // 获取系统权限
  // 1、查询用户拥有的按钮/表单访问权限
  // 2、所有权限
  // 3、系统安全模式
  GetPermCode = '/sys/permission/getPermCode',
  //校验用户接口
  checkOnlyUser = '/sys/user/checkOnlyUser',
  //SSO登录校验
  validateCasLogin = '/sys/cas/client/validateLogin',
  //修改密码
  passwordChange = '/sys/user/passwordChange',
}

/**
 * @description: user login api
 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<LoginResultModel>(
    {
      url: Api.Login,
      params,
    },
    {
      errorMessageMode: mode,
    }
  );
}

/**
 * @description: getUserInfo
 */
export function getUserInfo() {
  return defHttp.get<GetUserInfoModel>({ url: Api.GetUserInfo }, {}).catch((e) => {
    // update-begin--author:zyf---date:20220425---for:【VUEN-76】捕获接口超时异常,跳转到登录界面
    if (e && (e.message.includes('timeout') || e.message.includes('401'))) {
      //接口不通时跳转到登录界面
      const userStore = useUserStoreWithOut();
      userStore.setToken('');
      setAuthCache(TOKEN_KEY, null);
      router.push(PageEnum.BASE_LOGIN);
    }
    // update-end--author:zyf---date:20220425---for:【VUEN-76】捕获接口超时异常,跳转到登录界面
  });
}

export function getPermCode() {
  return defHttp.get({ url: Api.GetPermCode });
}

export function doLogout() {
  return defHttp.get({ url: Api.Logout });
}

/**
 *校验用户是否存在
 * @param params
 */
export const checkOnlyUser = (params) => defHttp.get({ url: Api.checkOnlyUser, params }, { isTransformResponse: false });

/**
 *密码修改
 * @param params
 */
export const passwordChange = (params) => defHttp.get({ url: Api.passwordChange, params }, { isTransformResponse: false });

/**
 * SSO登录校验
 */
export async function validateCasLogin(params) {
  const url = Api.validateCasLogin;
  return defHttp.get({ url: url, params });
}
