<template>
  <div class="mx-auto my-32 pt-20 pb-4 bg-white rounded-3xl w-8/12 relative shadow-sm">
    <S5Icon v-if="bd" class="w-16 h-16 absolute -top-28 right-0 left-0 mx-auto z-10"/>
    <img :src="avatarImgUrl" alt="avatar" class="w-32 h-32 avatar absolute -top-16 right-0 left-0 mx-auto bg-gray">
    <h1 class="text-center text-2xl font-normal">Welcome back to <span class="text-yellow-500">WIA App</span><br/> <span class="text-primary">{{userStore.getUserInfo.realname}}</span></h1>
    <div v-if="bd" class="text-center text-2xl mt-4">
      <h2 class="text-[#b0d5d7]">{{ t('sys.bd')}}</h2>
      <SurpriseIcon class="w-42 m-auto"/>
    </div>
    <S1Icon v-if="bd" class="absolute top-0 left-8 w-16 h-16"/>
    <S1Icon v-if="bd" class="absolute top-0 right-8 w-16 h-16"/>
    <S2Icon v-if="bd" class="absolute bottom-0 left-0 w-16 h-16"/>
    <S3Icon v-if="bd" class="absolute bottom-0 right-0 w-16 h-16 -scale-x-100"/>
    <S4Icon v-if="bd" class="absolute -bottom-16 right-0 left-0 mx-auto w-16 h-16 infinite-rotate"/>
  </div>

  <IndexDef v-if="indexStyle === 0 && isEmployee" :isEmployee="isEmployee"></IndexDef>
<!--  <IndexChart v-if="indexStyle === 1 && isEmployee"></IndexChart>-->
<!--  <IndexBdc v-if="indexStyle == 2 && isEmployee"></IndexBdc>-->
<!--  <IndexTask v-if="indexStyle == 3 && isEmployee"></IndexTask>-->
  <div style="width: 100%; text-align: right; margin-top: 20px" v-if="isEmployee">
    {{ t('common.data.selectHomePageStyle') }}:
    <a-radio-group v-model:value="indexStyle">
      <a-radio :value="0">{{ t('common.default') }}</a-radio>
<!--      <a-radio :value="1">{{ t('common.data.salesStatistics') }}</a-radio>-->
<!--      <a-radio :value="2">{{ t('common.data.businessStatistics') }}</a-radio>-->
<!--      <a-radio :value="3">{{ t('common.data.myTasks') }}</a-radio>-->
    </a-radio-group>
  </div>
</template>
<script lang="ts" setup>
  import {onBeforeMount, onMounted, ref} from 'vue';
  import IndexDef from './homePage/IndexDef.vue';
  import IndexChart from './homePage/IndexChart.vue';
  import IndexBdc from './homePage/IndexBdc.vue';
  import IndexTask from './homePage/IndexTask.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {useUserStore} from "/@/store/modules/user";
  import {useGlobSetting} from "/@/hooks/setting";
  import {fetchIsEmployee} from "/@/views/dashboard/Analysis/api";
  import WiaIcon from "./components/Icons/WiaIcon.vue";
  import SurpriseIcon from "/@/views/dashboard/Analysis/components/Icons/SurpriseIcon.vue";
  import S5Icon from "/@/views/dashboard/Analysis/components/Icons/S5Icon.vue";
  import S1Icon from "/@/views/dashboard/Analysis/components/Icons/S1Icon.vue";
  import S2Icon from "/@/views/dashboard/Analysis/components/Icons/S2Icon.vue";
  import S3Icon from "/@/views/dashboard/Analysis/components/Icons/S3Icon.vue";
  import S4Icon from "/@/views/dashboard/Analysis/components/Icons/S4Icon.vue";

  const { t } = useI18n();
  const userStore = useUserStore();
  const indexStyle = ref(0);
  const bd = ref(false);

  const globSetting = useGlobSetting();
  const baseUploadUrl = globSetting.uploadUrl;
  const avatarDirUrl = `${baseUploadUrl}/sys/common/static/`;
  const avatarImgUrl = userStore.getUserInfo.avatar == null ? '/src/assets/images/header.jpg' : avatarDirUrl + userStore.getUserInfo.avatar;

  const isEmployee = ref(false);

  onBeforeMount(() => {
    checkIsEmployee();
    let now = new Date();
    let cbd = new Date(userStore.getUserInfo.birthday);
    if(now.getMonth() == cbd.getMonth() && now.getDate() == cbd.getDate()) {
      bd.value = true;
    }
  })
  async function checkIsEmployee() {
    await fetchIsEmployee(handleIsEmployee);
  }

  async function handleIsEmployee(res:any) {
    isEmployee.value = res;
  }
</script>
