<template>
  <ScrollContainer>
    <div ref="wrapperRef" class="user-account-setting" :class="[prefixCls]">
      <Tabs tab-position="left" :tabBarStyle="tabBarStyle" @tabClick="componentClick" v-model:activeKey="activeKey">
        <template v-for="item in componentList" :key="item.key">
          <TabPane v-if="canView(item.role)" :key="item.key">
            <template #tab>
                <span style="display:flex;align-items: center;cursor: pointer">
                  <Icon :icon="item.icon" class="icon-font-color"/>
                  {{item.name}}
                </span>
            </template>
            <component :is="item.component" v-if="activeKey === item.key && !item.isSlot" />
            <slot name="component" v-if="activeKey === item.key && item.isSlot" />
          </TabPane>
        </template>
      </Tabs>
    </div>
  </ScrollContainer>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref} from "vue";
import {Tabs} from "ant-design-vue";
import {ScrollContainer} from "/@/components/Container";
import {settingList} from "./UserSetting.data";
import BaseSetting from "./BaseSetting.vue";
import AccountSetting from "./AccountSetting.vue";
import PreferencesSetting from "./PreferencesSetting.vue";
import {useRouter} from "vue-router";
import {useDesign} from '/@/hooks/web/useDesign';
import {useRootSetting} from "/@/hooks/setting/useRootSetting";
import {ThemeEnum} from "/@/enums/appEnum";
import {Icon} from "@/components/Icon";
import {useUserStore} from "@/store/modules/user";
import {RoleEnum} from "@/views/business/enum/RoleEnum";

export default defineComponent({
  components: {
    Icon,
    ScrollContainer,
    Tabs,
    TabPane: Tabs.TabPane,
    BaseSetting,
    AccountSetting,
    PreferencesSetting
  },
  props:{
    componentList:{
      type:Array,
      default:settingList
    }
  },
  setup() {
    const { prefixCls } = useDesign('user-account-setting-container');
    const { getDarkMode} = useRootSetting();
    const isDark = computed(() => getDarkMode.value === ThemeEnum.DARK);
    const activeKey = ref<string>('1');
    //是否为vip
    const showVip = ref<boolean>(false);
    //vip编码
    const vipCode = ref<string>('');
    const router = useRouter();
    const componentList = computed(()=>{
      if(showVip.value){
        return settingList;
      }
      return settingList.filter((item)=> item.component != 'MyVipSetting');
    })
    const isEmployee = ref(true);
    const userStore = useUserStore();

    onMounted(async () => {
      isEmployee.value = userStore.getIsEmployee;
    });
    function canView (role: RoleEnum) {
      switch (role) {
        case RoleEnum.ALL:
          return true;
        case RoleEnum.CLIENT:
          return !isEmployee.value;
        case RoleEnum.EMPLOYEE:
          return isEmployee.value;
        default:
          return false;
      }
    }
    /**
     * 组件标题点击事件,解决第二次不加载数据
     * @param key
     */
    function componentClick(key) {
      activeKey.value = key;
    }

    return {
      prefixCls,
      settingList,
      tabBarStyle: {
        width: "220px",
        marginBottom: "200px"
      },
      componentClick,
      activeKey,
      isDark,
      canView
    };
  }
});
</script>
<style lang="less" scoped>
.user-account-setting {
  margin: 20px;

  .base-title {
    padding-left: 0;
  }

  //tabs弹窗左边样式
  :deep(.ant-tabs-nav){
    height: 260px;
  }
  //tabs弹窗右边边样式
  :deep(.ant-tabs-content-holder){
    position: relative;
    left: 12px;
    height: auto !important;
  }
}
//tab点击样式
:deep(.ant-tabs-tab-active){
  border-radius: 0 20px 20px 0;
  background-color: #1294f7!important;
  color: #fff!important;
  .icon-font-color{
    color: #fff;
  }
}
:deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn){
  color: white !important;
}
:deep(.ant-tabs-ink-bar){
  visibility: hidden;
}
:deep(.ant-tabs-nav-list){
  padding-top:14px;
  padding-right:14px;
}

.vip-height{
  //tabs弹窗左边样式
  :deep(.ant-tabs-nav){
    height: 310px !important;
  }
}
.vip-background{
  :deep(.ant-tabs-content-holder){
    background: transparent;
  }
  :deep(.ant-tabs-tabpane){
    padding-left: 0 !important;
  }
}
</style>

<style lang="less">
@prefix-cls: ~'@{namespace}-user-account-setting-container';

.@{prefix-cls} {
  .ant-tabs-tab-active {
    background-color: @item-active-bg;
  }
  //tabs弹窗左边样式
 .ant-tabs-nav{
    background-color: @component-background;
  }
  //tabs弹窗右边边样式
  .ant-tabs-content-holder{
    background: @component-background;
  }
}
</style>
