<template>
  <h2>{{t('common.operation.review')}}</h2>
  <BasicTable @register="register"
  >
    <template #action="{ record, column }">
      <TableAction :actions="createActions(record, column)" />
    </template>
    <template #sensitiveAttribute="{record}">
        {{ sensitiveAttributes[record.sensitiveAttribute] }}
    </template>
    <template #status="{ record }">
      {{ skuStatus[record.status] }}
    </template>
  </BasicTable>
</template>
<script lang="ts" setup>
import { inject, onMounted, ref, Ref } from "vue";
import { Sku } from "@/views/business/dto/sku.dto";
import { sensitiveAttributeListApi, reviewColumns, skuStatus } from "@/views/business/admin/sku/data";
import {
  ActionItem,
  BasicColumn,
  BasicTable,
  EditRecordRow,
  TableAction,
  useTable
} from "@/components/Table";
import {useI18n} from "vue-i18n";
import {useMessage} from "@/hooks/web/useMessage";
import {cloneDeep} from "lodash-es";

const { t } = useI18n();
const { createMessage: msg } = useMessage();

const emit = defineEmits(["update"]);

const skuList:Ref<Sku[]> = inject('skuList') as Ref<Sku[]>;
const currentEditKeyRef = ref('');

const [register] = useTable({
  columns: reviewColumns,
  dataSource: skuList,
  ellipsis: false,
  striped: true,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  actionColumn: {
    width: 160,
    title: 'Action',
    dataIndex: 'action',
    slots: { customRender: 'action' },
    fixed: 'right',
  },
});

const sensitiveAttributes = ref<Record<string, string>>({});
onMounted(async () => {
  await sensitiveAttributeListApi().then((res) => {
    res.records.forEach((item) => {
      sensitiveAttributes.value = {
        ...sensitiveAttributes.value,
        [item.id]: item.zhName,
      };
    });
  });
});

function handleEdit(record: EditRecordRow) {
  currentEditKeyRef.value = record.key;
  record.onEdit?.(true);
}

function handleCancel(record: EditRecordRow) {
  currentEditKeyRef.value = '';
  record.onEdit?.(false, false);
}

async function handleSave(record: EditRecordRow) {
  // 校验
  msg.loading({ content: t('component.form.saving'), duration: 0, key: 'saving' });
  const valid = await record.onValid?.();
  if (valid) {
    try {
      const data = cloneDeep(record.editValueRefs);
      emit('update', {id: record.id, data});
      const pass = await record.onEdit?.(false, true);
      if (pass) {
        currentEditKeyRef.value = '';
      }
      msg.success({ content: t('component.form.saveSuccess'), key: 'saving' });
    } catch (error) {
      msg.error({ content: t('component.form.saveError'), key: 'saving' });
    }
  } else {
    msg.error({ content: t('component.form.incorrectData'), key: 'saving' });
  }
}
function createActions(record: EditRecordRow, column: BasicColumn): ActionItem[] {
  if (!record.editable) {
    return [
      {
        label: t('common.operation.edit'),
        disabled: currentEditKeyRef.value ? currentEditKeyRef.value !== record.key : false,
        onClick: handleEdit.bind(null, record),
      },
    ];
  }
  return [
    {
      label: t('common.operation.save'),
      onClick: handleSave.bind(null, record, column),
    },
    {
      label: t('common.operation.cancel'),
      popConfirm: {
        title: t('common.operation.cancelConfirmation'),
        confirm: handleCancel.bind(null, record, column),
      },
    },
  ];
}
</script>
<style>

:where(.css-dev-only-do-not-override-19sa61n).ant-input-number-affix-wrapper {
  width: auto;
}
</style>
