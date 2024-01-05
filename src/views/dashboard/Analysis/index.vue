<template>
  <a-divider>
    <img :src="avatarUrl + userStore.getUserInfo.avatar" alt="avatar" class="w-32">
  </a-divider>
  <h1 class="text-center text-2xl font-normal">Welcome back to <span class="text-yellow-500">WIA App</span><br/> <span class="text-blue-600">{{userStore.getUserInfo.realname}}</span></h1>
<!--  <IndexDef v-if="indexStyle === 0"></IndexDef>-->
<!--  <IndexChart v-if="indexStyle === 1"></IndexChart>-->
<!--  <IndexBdc v-if="indexStyle == 2"></IndexBdc>-->
<!--  <IndexTask v-if="indexStyle == 3"></IndexTask>-->
<!--  <div style="width: 100%; text-align: right; margin-top: 20px">-->
<!--    {{ t('common.data.selectHomePageStyle') }}:-->
<!--    <a-radio-group v-model:value="indexStyle">-->
<!--      <a-radio :value="0">{{ t('common.default') }}</a-radio>-->
<!--      <a-radio :value="1">{{ t('common.data.salesStatistics') }}</a-radio>-->
<!--      <a-radio :value="2">{{ t('common.data.businessStatistics') }}</a-radio>-->
<!--      <a-radio :value="3">{{ t('common.data.myTasks') }}</a-radio>-->
<!--    </a-radio-group>-->
<!--  </div>-->
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import IndexDef from './homePage/IndexDef.vue';
  import IndexChart from './homePage/IndexChart.vue';
  import IndexBdc from './homePage/IndexBdc.vue';
  import IndexTask from './homePage/IndexTask.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {useUserStore} from "/@/store/modules/user";
  import {useGlobSetting} from "/@/hooks/setting";

  const globSetting = useGlobSetting();
  const baseUploadUrl = globSetting.uploadUrl;
  const avatarUrl = `${baseUploadUrl}/sys/common/static/`;

  const { t } = useI18n();
  const userStore = useUserStore();
  const indexStyle = ref(0);
</script>
