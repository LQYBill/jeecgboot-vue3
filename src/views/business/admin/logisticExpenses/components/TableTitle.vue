<template>
  <nav>
    <ul class="flex justify-between items-center gap-2 rounded px-2 mt-4 ">
      <li>
        <a-button type="primary" @click="handleAdd" preIcon="ant-design:plus-outlined">{{ t('common.operation.addNew') }}</a-button>
      </li>
      <li>
        <a-button type="primary"
                  preIcon="ant-design:export-outlined"
                  @click="handleExportXls('Sku Weight List', Api.EXPORT_XLS, exportParams)"
                  :disabled="selectedRowKeys.length === 0"
        >
          {{ t("common.operation.export") }}
        </a-button>
      </li>
      <li>
        <ul class="flex items-center gap-2 p-2 rounded border-gray-300 border shadow">
          <li class="flex gap-2">
            <a-tooltip>
              <template #title>
                <b>{{ t('common.operation.import') }}</b> : 选择导入哪一家物流公司的资料 ({{ t('component.form.required')}})
              </template>
              <a-icon type="question-circle" />
            </a-tooltip>
            <JSearchSelect
              :placeholder="t('data.logistics.company')"
              dict="logistic_company, name, name"
              allowclear
              v-model:value="logisticCompany"
              class="min-w-36"
            />
          </li>
          <li>
            <a-upload name="file"
                      :showUploadList="false"
                      :customRequest="(file) => importExcel(file)"
                      :disabled="!logisticCompany"
            >
              <a-button preIcon="ant-design:import-outlined"
                        type="primary"
                        :disabled="!logisticCompany">{{ t('common.operation.import') }}</a-button>
            </a-upload>
          </li>
        </ul>
      </li>
      <li>
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <template #overlay>
            <a-menu>
              <a-menu-item key="1" @click="batchHandleDelete">
                <Icon icon="ant-design:delete-outlined"></Icon>
                删除
              </a-menu-item>
            </a-menu>
          </template>
          <a-button>批量操作
            <Icon icon="mdi:chevron-down"></Icon>
          </a-button>
        </a-dropdown>
      </li>
    </ul>
  </nav>
</template>
<script setup lang="ts">
import {Api} from "@/views/business/admin/logisticExpenses/LogisticExpenseDetail.api";
import {JSearchSelect} from "@/components/Form";
import {useMethods} from "@/hooks/system/useMethods";
import {computed, inject, ref} from "vue";
import {useI18n} from "@/hooks/web/useI18n";
import {filterObj} from "@/utils/common/compUtils";
import {Icon} from "@/components/Icon";

const { handleImportLogisticXls, handleExportXls } = useMethods();
const { t } = useI18n();

const emit = defineEmits(['add', 'batchDelete']);

const selectedRowKeys: string[] = inject('selectedRowKeys', []);

const logisticCompany = ref<string>();

const exportParams = computed(()=>{
  let paramsForm = {};
  let list:string[] = [];
  if (selectedRowKeys.length > 0) {
    list = selectedRowKeys;
  }
  paramsForm['selections'] = list;
  return filterObj(paramsForm)
});
function importExcel(file) {
  const data = {
    ...file,
    logisticCompany: logisticCompany.value
  }
  handleImportLogisticXls(data, Api.IMPORT_EXCEL, handleImport)
}

function handleImport() {

}
function handleAdd() {
  emit('add');
}
function batchHandleDelete() {
  emit('batchDelete');
}
</script>
