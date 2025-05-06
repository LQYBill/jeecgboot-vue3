<template>
  <div style="display:flex;justify-content: space-between;align-items: center">
    <div style="display:flex; justify-content: flex-start; align-items: flex-start;">
      <div style="border-radius: 100%;overflow: hidden;width: 80px;height: 80px;">
        <img src="/src/assets/images/logo.png" alt="instructor">
      </div>
      <div class="instructionMessageBubble">
        <div class="instructionMainText">
          <Icon v-if="instructionMessageList[step].type ==='error'" icon="ant-design:warning-twotone"></Icon>
          <p :class="[instructionMessageList[step].type ==='error' ? 'instructionErrorText' : '']">
            {{ instructionMessageList[step].text }}
          </p>
        </div>
        <p class="instructionOptionalText" v-if="typeof instructionMessageList[step].option !== 'undefined'">
          {{ instructionMessageList[step].option }}
        </p>

        <div class="instructionTipText" v-if="typeof instructionMessageList[step].tip !== 'undefined'">
          <Icon icon="ant-design:bulb-twotone"></Icon>
          <p v-for="line in instructionMessageList[step].tip.split('-')" preIcon="ant-design:bulb-outlined">
            {{ line }}
          </p>
        </div>
      </div>
    </div>

    <a-col :span="2">
      <a-button class="mr-2" type="warning" preIcon="ant-design:clear-outlined" @click="clearField('all')">
        <a-tooltip title="reset all fields">{{ t("common.operation.clear") }}</a-tooltip>
      </a-button>
    </a-col>
  </div>
</template>
<script lang="ts" setup>
import { Ref } from "vue";
import Icon from "@/components/Icon";
import { instructionMessageList } from "../data"
import {inject} from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits(['clearField']);

const step = inject("step") as Ref<number>;

const clearField = (type: string) => {
  emit('clearField', type);
};
</script>
