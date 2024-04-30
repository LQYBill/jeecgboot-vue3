<!--字典下拉多选-->
<template>
  <a-select
    :value="arrayValue"
    @change="onChange($event, $el)"
    mode="multiple"
    :filter-option="filterOption"
    :disabled="disabled"
    :placeholder="placeholder"
    allowClear
    :getPopupContainer="getParentContainer"
    :maxTagCount="1"
  >
    <template #dropdownRender="{menuNode: menu}">
      <v-nodes :vnodes='menu' />
      <a-divider style='margin: 4px 0;' />
      <a-checkbox class="checkAll" @change="selectAll($event, $el)" style="width: 100%; padding: 4px 8px;">
        {{t('component.table.selectAll')}}
      </a-checkbox>
    </template>
    <a-select-option v-for="(item, index) in dictOptions" :key="index" :getPopupContainer="getParentContainer" :value="item.value">
      <span :class="[useDicColor && item.color ? 'colorText' : '']" :style="{ backgroundColor: `${useDicColor && item.color}` }">{{ item.text || item.label }}</span>
    </a-select-option>
  </a-select>
</template>
<script lang="ts">
  import { computed, defineComponent, onMounted, ref, nextTick, watch } from 'vue';
  import { useRuleFormItem } from '/@/hooks/component/useFormItem';
  import { propTypes } from '/@/utils/propTypes';
  import { useAttrs } from '/@/hooks/core/useAttrs';
  import { getDictItems } from '/@/api/common/api';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n'
  const { t } = useI18n();

  const { createMessage, createErrorModal } = useMessage();
  export default defineComponent({
    name: 'JSelectMultiple',
    methods: {
      t,
    },
    components: {
      VNodes: (_, { attrs }) => {
        return attrs.vnodes;
      },
    },
    inheritAttrs: false,
    props: {
      value: propTypes.oneOfType([propTypes.string, propTypes.array]),
      placeholder: {
        type: String,
        default: '请选择',
        required: false,
      },
      readOnly: {
        type: Boolean,
        required: false,
        default: false,
      },
      options: {
        type: Array,
        default: () => [],
        required: false,
      },
      triggerChange: {
        type: Boolean,
        required: false,
        default: true,
      },
      spliter: {
        type: String,
        required: false,
        default: ',',
      },
      popContainer: {
        type: String,
        default: '',
        required: false,
      },
      dictCode: {
        type: String,
        required: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      useDicColor: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['options-change', 'change', 'input', 'update:value'],
    setup(props, { emit, refs }) {
      //console.info(props);
      const emitData = ref<any[]>([]);
      const arrayValue = ref<any[]>(!props.value ? [] : props.value.split(props.spliter));
      const dictOptions = ref<any[]>([]);
      const attrs = useAttrs();
      const [state] = useRuleFormItem(props, 'value', 'change', emitData);

      onMounted(() => {
        if (props.dictCode) {
          loadDictOptions();
        } else {
          dictOptions.value = props.options;
        }
      });

      watch(
        () => props.value,
        (val) => {
          if (!val) {
            arrayValue.value = [];
          } else {
            arrayValue.value = props.value.split(props.spliter);
          }
        }
      );

      //适用于 动态改变下拉选项的操作
      watch(()=>props.options, ()=>{
        if (props.dictCode) {
          // nothing to do
        } else {
          dictOptions.value = props.options;
        }
      });

      function onChange(selectedValue, el) {
        console.log("selected values : " + selectedValue);
        if (props.triggerChange) {
          emit('change', selectedValue.join(props.spliter));
          emit('update:value', selectedValue.join(props.spliter));
        } else {
          emit('input', selectedValue.join(props.spliter));
          emit('update:value', selectedValue.join(props.spliter));
        }
        /**
         *  if we cleared the input, but previously selected all option with the checkbox
         * we make sure to clear the values and uncheck the checkbox
        **/
        if(selectedValue.length === 0) {
          arrayValue.value = [];
          const checkbox = el.getElementsByClassName('ant-checkbox-input')[0];
          checkbox.checked = false;
          checkbox.parentElement?.classList.remove("ant-checkbox-checked");
        }
      }

      function getParentContainer(node) {
        if (!props.popContainer) {
          return node?.parentNode;
        } else {
          return document.querySelector(props.popContainer);
        }
      }

      // 根据字典code查询字典项
      function loadDictOptions() {
        //update-begin-author:taoyan date:2022-6-21 for: 字典数据请求前将参数编码处理，但是不能直接编码，因为可能之前已经编码过了
        let temp = props.dictCode || '';
        if (temp.indexOf(',') > 0 && temp.indexOf(' ') > 0) {
          // 编码后 是不包含空格的
          temp = encodeURI(temp);
        }
        //update-end-author:taoyan date:2022-6-21 for: 字典数据请求前将参数编码处理，但是不能直接编码，因为可能之前已经编码过了
        getDictItems(temp).then((res) => {
          if (res) {
            dictOptions.value = res.map((item) => ({ value: item.value, label: item.text, color:item.color }));
            //console.info('res', dictOptions.value);
          } else {
            console.error('getDictItems error: : ', res);
            dictOptions.value = [];
          }
        });
      }

      //update-begin-author:taoyan date:2022-5-31 for: VUEN-1145 下拉多选，搜索时，查不到数据
      function filterOption(input, option) {
        return option.children()[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      }
      //update-end-author:taoyan date:2022-5-31 for: VUEN-1145 下拉多选，搜索时，查不到数据
      function selectAll(e, el) {
        let checked = e.target.checked;
        if (checked) {
          let data = []
          dictOptions.value.map(item => {
            data.push(item.value)
          });
          const checkbox = el.getElementsByClassName('ant-checkbox-input')[0];
          checkbox.parentElement?.classList.add("ant-checkbox-checked");
          arrayValue.value = data;
          onChange(data, el);
        }
        else {
          onChange([], el);
        }
      }
      return {
        state,
        attrs,
        dictOptions,
        onChange,
        arrayValue,
        getParentContainer,
        filterOption,
        selectAll,
      };
    },
  });
</script>
<style scoped lang='less'>
.colorText{
  display: inline-block;
    height: 20px;
    line-height: 20px;
    padding: 0 6px;
    border-radius: 8px;
    background-color: red;
    color: #fff;
    font-size: 12px;
}
</style>