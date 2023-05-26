<template>
  <div class="account-padding">
    <div class="user-setting-top">
      <div class="account-avatar">
        <CropperAvatar
          :uploadApi="uploadImg"
          :showBtn="false"
          :value="avatar"
          :btnProps="{ preIcon: 'ant-design:cloud-upload-outlined' }"
          @change="updateAvatar"
          width="80"
        />
        <div class="account-right">
          <div>
            <span class="font-size-17 account-name">{{ userInfo.realname }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="account-data">
      <!-- 详细资料 -->
      <div class="account-detail">
        <div class="font-size-15 font-bold" style="color: #333!important;margin-bottom: 16px">{{ t('sys.profile.detailedInformation') }}</div>
        <div class="margin-bottom-10 font-size-13">
          <span class="gray-75 item-label">{{ t('sys.profile.birthday') }}</span>
          <span class="gray-3">{{ userInfo.birthday }}</span>
        </div>
        <div class="margin-bottom-10 font-size-13">
          <span class="gray-75 item-label">{{ t('sys.profile.sex') }}</span>
          <span class="gray-3">{{ userInfo.sexText }}</span>
        </div>
        <div class="margin-bottom-10 nowarp font-size-13">
          <span class="gray-75 item-label">{{ t('sys.profile.jobTitle') }}</span>
          <span class="gray-3">{{ userInfo.postText ? userInfo.postText : t('common.status.notSpecified') }}</span>
        </div>
        <div class="font-size-13">
          <span class="item-label"></span>
          <span class="item-label pointer" style="color:#1e88e5" @click="openEditModal">{{ t('common.operation.edit') }}</span>
        </div>
      </div>
      <!-- 联系信息 -->
      <div class="account-info">
        <div class="font-size-15 font-bold" style="color: #333!important;margin-bottom: 16px">{{ t('sys.profile.contactInformation') }}</div>
        <div class="margin-bottom-10 font-size-13">
          <span class="gray-75 item-label">{{ t('sys.login.email') }}</span>
          <span class="gray-3">{{ userInfo.email ? userInfo.email : t('common.status.notSpecified') }}</span>
        </div>
        <div class="margin-bottom-10 font-size-13">
          <span class="gray-75 item-label">{{ t('common.data.phone') }}</span>
          <span class="gray-3">{{ userInfo.phone ? userInfo.phone : t('common.status.notSpecified') }}</span>
        </div>
      </div>
    </div>
  </div>
  <UserAccountModal @register="registerModal" @success="getUserDetail"></UserAccountModal>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { CollapseContainer } from "/@/components/Container";
import { CropperAvatar } from "/@/components/Cropper";
import { useMessage } from "/@/hooks/web/useMessage";
import headerImg from "/@/assets/images/header.jpg";
import { defHttp } from "/@/utils/http/axios";
import { useUserStore } from "/@/store/modules/user";
import { uploadImg } from "/@/api/sys/upload";
import { getFileAccessHttpUrl } from "/@/utils/common/compUtils";
import dayjs from "dayjs";
import { ajaxGetDictItems, getDictItemsByCode, initDictOptions } from "/@/utils/dict";
import { userEdit, getUserData, queryNameByCodes } from "./UserSetting.api";
import UserAccountModal from "./commponents/UserAccountModal.vue";
import { useModal } from "/@/components/Modal";
import { cloneDeep } from "lodash-es";
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

//TODO 当字典租户隔离时，数据会查不到，默认一个
const sexOption = getDictItemsByCode("sex") || [{text:t('sys.profile.male'),value:'1'},{text:t('sys.profile.male'),value:'2'}];
const { createMessage } = useMessage();
const userStore = useUserStore();
//用户信息
const userInfo = ref<any>({});
//编辑时input触发事件
const accountNameEdit = ref();
const [registerModal, { openModal }] = useModal();
//头像动态计算
const avatar = computed(() => {
  return getFileAccessHttpUrl(userInfo.value.avatar) || headerImg;
});

/**
 * 更新用户头像
 */
function updateAvatar(src: string, data: string) {
  const userinfo = userStore.getUserInfo;
  userinfo.avatar = data;
  userStore.setUserInfo(userinfo);
  if (data) {
    updateUserInfo({ avatar: data, id: userinfo.id });
  }
}

/**
 * 更新用户信息
 * @params 参数
 */
function updateUserInfo(params) {
  userEdit(params).then((res) => {
    if (!res.success) {
      createMessage.warn(res.message);
    }
  });
}

/**
 * 获取生日信息
 */
function getBirthDay(val) {
  if (val) {
    return dayjs(val).format("YYYY-MM-DD");
  } else {
    return t('common.status.notSpecified');
  }
}

/**
 * 获取性别
 * @param val
 */
function getSex(val) {
  let findOption = sexOption.find(item => parseInt(item.value) === val);
  let sex = t('common.status.notSpecified');
  if (findOption) {
    sex = findOption.text;
  }
  return sex === "男" ? t('sys.profile.male') : t('sys.profile.female');
}

/**
 * 打开编辑弹窗
 */
function openEditModal() {
  let value = cloneDeep(userInfo.value);
  openModal(true, {
    record: value
  });
}

/**
 * 获取用户信息
 */
function getUserDetail() {
  getUserData().then((async res => {
    if (res.success) {
      if (res.result) {
        res.result.sexText = getSex(res.result.sex);
        res.result.birthday = getBirthDay(res.result.birthday);
        res.result.createTimeText = getDiffDay(res.result.createTime);
        userInfo.value = res.result;
      } else {
        userInfo.value = {};
      }
    }
  }));
}

/**
 * 获取使用时间
 * @param date
 */
function getDiffDay(date) {
  // 计算两个日期之间的天数差值
  let totalDays, diffDate
  let createDate = Date.parse(date);
  let nowDate = new Date().getTime();
  // 将两个日期都转换为毫秒格式，然后做差
  diffDate = Math.abs(nowDate - createDate) // 取相差毫秒数的绝对值
  totalDays = Math.floor(diffDate / (1000 * 3600 * 24)) // 向下取整
  return totalDays+" 天";
}
onMounted(async () => {
  getUserDetail();
});
</script>

<style lang="less" scoped>
.user-setting-top {
  padding-top: 40px;
  width: 100%;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  padding-bottom: 40px;
}

.account-avatar {
  align-items: center;
  display: flex;
  margin-right: 30px;
  flex: 1;
}

.change-avatar {
  img {
    display: block;
    margin-bottom: 15px;
    border-radius: 50%;
  }
}

.account-right {
  margin-left: 25px !important;
}

.font-size-15 {
  font-size: 15px;
}

.font-size-17 {
  font-size: 17px;
}

.pointer {
  cursor: pointer;
}

.account-name {
  white-space: nowrap;
  overflow: hidden;
  width: 200px;
  text-overflow: ellipsis;
  line-height: 32px!important;
  color: #333;
  font-weight: 500;
}

.gray-bd {
  color: #bdbdbd
}

.account-icon {
  margin-left: 4px;
}

.account-data {
  width: 100% !important;
  display: flex;
  min-width: 0;
}

.account-detail {
  width: 40%;
  display: flex;
  flex-direction: column;
  padding: 40px 0;

  .item-label {
    display: inline-block;
    text-align: left;
    width: 80px;
  }
}

.font-bold {
  font-weight: 700 !important;
}

.margin-bottom-10 {
  margin-bottom: 10px;
}

.gray-75 {
  color: #757575 !important;
}

.gray-3 {
  color: #333333;
}

.account-info {
  width: 60%;
  display: flex;
  flex-direction: column;
  padding: 40px 0;
  box-sizing: border-box;
  margin-left: 10px;

  .item-label {
    display: inline-block;
    text-align: left;
    width: 80px;
  }
}

.nowarp {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.account-padding{
  padding-left: 20px !important;
  padding-right: 40px !important;
}

.use-day{
  color: #333;
  margin-top: 10px;
  font-size: 13px;
  span{
    color:#1e88e5;
    margin-left: 5px;
  }
}
.font-size-13{
  font-size: 13px;
}
</style>
