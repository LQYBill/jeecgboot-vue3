<template>
  <div class="account-padding">
    <div class="my-account">{{ t('sys.profile.account') }}</div>
    <div class="account-row-item clearfix">
      <div class="account-label gray-75">{{ t('sys.login.email')}}</div>
      <span class="gray">{{ userDetail.email ? userDetail.email : t('common.status.notSpecified') }}</span>
    </div>
    <div class="account-row-item">
      <div class="account-label gray-75">{{ t('sys.login.password') }}</div>
      <Icon icon="ant-design:lock-outlined" style="color: #9e9e9e"/>
      <span class="pointer blue-e5" style="margin-left: 10px" @click="updatePassWord">{{ t('common.operation.edit') }}</span>
    </div>
  </div>

  <UserPasswordModal @register="registerPassModal" @success="initUserDetail" />
</template>
<script lang="ts" setup>
import { onMounted, ref, reactive } from "vue";
import { getUserData } from "./UserSetting.api";
import { useUserStore } from "/@/store/modules/user";
import UserPasswordModal from "./commponents/UserPasswordModal.vue";
import { useModal } from "/@/components/Modal";
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

const userDetail = ref<any>([]);
const userStore = useUserStore();
const [registerModal, { openModal }] = useModal();
const [registerPassModal, { openModal: openPassModal }] = useModal();

/**
 * 初始化用户数据
 */
function initUserDetail() {
  //获取用户数据
  getUserData().then((res => {
    if (res.success) {
      userDetail.value = res.result;
    }
  }));
}

/**
 * 密码修改
 */
function updatePassWord() {
  openPassModal(true, {
    record: { username: userDetail.value.username }
  });
}

onMounted(() => {
  initUserDetail();
});
</script>
<style lang="less" scoped>
.account-row-item {
  align-items: center;
  border-bottom: 1px solid #eaeaea;
  box-sizing: border-box;
  display: flex;
  height: 71px;
  position: relative;
}

.account-label {
  text-align: left;
  width: 160px;
}

.gray-75 {
  color: #757575 !important;
}

.pointer {
  cursor: pointer;
}

.blue-e5 {
  color: #1e88e5;
}

.phone-margin {
  margin-left: 24px;
  margin-right: 24px;
}

.clearfix:after {
  clear: both;
}

.clearfix:before {
  content: "";
  display: table;
}
.account-padding{
  padding: 30px 40px 0 20px;
}
.my-account{
  font-size: 17px;
  font-weight: 700!important;
  color: #333!important;
  margin-bottom: 20px;
}
</style>
