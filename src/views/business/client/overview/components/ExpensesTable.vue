<template>
  <BasicTable v-if="props.client && props.currency" @register="registerTable">
    <template #tableTitle>
      <div style="width: 100%">
        <a-row class="balance-row" v-if="props.client.useBalance">
          <p>
            {{ t('data.client.accountBalance') }} :
          </p>
          <h1>
            {{ balance }} {{ CurrencyToken[props.currency] }}
          </h1>
          <p>
            {{ t('data.client.estimatedBalance') }} :
            <Tag
              :color="estimatedBalance >= 0 ? 'geekblue' : 'volcano'"
              class="num-tag balance-estimated"
            >
              {{ estimatedBalance }} {{ CurrencyToken[props.currency] }}
            </Tag>
          </p>
        </a-row>
        <a-row class="invoiceToolbar">
          <YearSelector
            v-model="selectedYear"
            :year-options="yearOptions"
            @change="handleYearChange"
            @previous-year="previousYear"
            @next-year="nextYear"
          />
        </a-row>
      </div>
    </template>
    <template #date="{ record }">
      <span :class="record.status === 0 ? 'line-through' : ''">
        {{
          dayjs(record.createTime).isValid() ? dayjs(record.createTime).format('DD/MM').toString() : record.createTime
        }}
      </span>
    </template>
    <template #transactionType="{ record }">
      <Tag
        :color="record.type === TransactionType.CREDIT ? 'green' : 'purple'"
        :class="record.status === 0 ? 'line-through' : ''"
      >
        {{ record.type }}
      </Tag>
    </template>
    <template #invoiceNumber="{ record }">
      <template
        v-if="(record.type == TransactionType.DEBIT || record.type == TransactionType.CREDIT) && !!record.invoiceNumber">
        <a-button
          v-if="record.status !== 0"
          type="primary"
          preIcon="ant-design:eye-outlined"
          @click="openInvoice(record)"
          shape="round"
        >
          {{ record.invoiceNumber }}
        </a-button>
        <span v-else class="line-through text-error">
          {{ record.invoiceNumber }}
        </span>
      </template>
    </template>
    <template #amount="{ record }">
      <span v-if="record.type == TransactionType.CREDIT" class="positive-balance">
        +{{ record.amount }}
      </span>
      <template v-else>
        <span v-if="record.createTime == 'Estimation' && estimationLoading">
          <loading :loading="estimationLoading" :absolute="true"
                   :size="SizeEnum.SMALL"></loading>
        </span>
        <span v-else :class="record.status === 0 ? 'line-through' : ''">
          - {{ record.amount }}
        </span>
      </template>
    </template>
    <template #shippingFee="{ record }">
      <template v-if="record.createTime == 'Estimation' && estimationLoading">
        <loading :loading="estimationLoading" :absolute="true" :size="SizeEnum.SMALL"></loading>
      </template>
      <span v-else-if="!!record.shippingFee" :class="record.status === 0 ? 'line-through' : ''">
        - {{ record.shippingFee }}
      </span>
    </template>
    <template #purchaseFee="{ record }">
      <template v-if="record.createTime == 'Estimation' && estimationLoading">
        <loading :loading="estimationLoading" :absolute="true" :size="SizeEnum.SMALL"></loading>
      </template>
      <span v-else-if="!!record.purchaseFee" :class="record.status === 0 ? 'line-through' : ''">
        - {{ record.purchaseFee }}
      </span>
    </template>
    <template #img="{ text, record }">
      <template v-if="record.type == TransactionType.CREDIT && !!record.paymentProofString">
        <TableImg
          :size="60"
          :imgList="[uploadUrl+record.paymentProofString]"
        />
      </template>
      <template v-else-if="record.type == TransactionType.DEBIT && !!record.invoiceNumber">
        <template v-if="text">
          <div style="display: inline-flex; align-items: center;">
            <TableImg :imgList="[uploadUrl + text]" :size="40"/>
            <JImageUpload
              :text="t('component.upload.reUpload')"
              :fileMax="1"
              listType="picture"
              bizPath="purchase_order/screenshots"
              @change="e => handleUploadChange(e, record)"
            />
          </div>
        </template>
        <template v-else>
          <JImageUpload
            :text="t('component.upload.upload')"
            :fileMax="1"
            listType="picture"
            bizPath="purchase_order/screenshots"
            @change="e => handleUploadChange(e, record)"
          />
        </template>
      </template>
      <template v-else>
        <span>-</span>
      </template>
    </template>
    <template #action="{ record }">
      <TableAction
        :actions="[
                  {
                    label: t('common.operation.cancel'),
                    icon: 'ic:outline-delete-outline',
                    popConfirm: {
                      title: t('common.operation.cancelConfirmation'),
                      confirm: handleDelete.bind(null, record),
                    },
                    disabled: record.createTime === 'Estimation'
                        || record.type === TransactionType.CREDIT
                        || (record.createBy !== props.client?.internalCode && record.createBy !== `${props.client.firstName} ${props.client.surname}`)
                        || record.createTime < dayjs().subtract(2, 'week').format('YYYY-MM-DD')
                        || record.status === 0
                        || record.ordered === 1,
                  },
                ]"
      />
    </template>
    <template #footer>
      <YearSelector
        v-model="selectedYear"
        :year-options="yearOptions"
        @change="handleYearChange"
        @previous-year="previousYear"
        @next-year="nextYear"
      />
    </template>
  </BasicTable>
</template>
<script setup lang="ts">
import {Tag} from "ant-design-vue";
import {Loading} from "@/components/Loading";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {TableAction, TableImg, useTable} from "/@/components/Table";
import JImageUpload from '/@/components/Form/src/jeecg/components/JImageUpload.vue';
import {SizeEnum} from "@/enums/sizeEnum";
import {useGlobSetting} from "@/hooks/setting";
import {useI18n} from "@/hooks/web/useI18n";
import {useMessage} from "@/hooks/web/useMessage";
import {reactive, ref, watch, defineEmits, PropType, onUnmounted} from "vue";
import {actionColumn, getColumns} from "/@/views/business/client/overview/data";
import {Client, JSelectMultipleOptions, Transaction} from "@/views/business/dto";
import {defHttp} from "@/utils/http/axios";
import {Api} from "@/views/business/client/client.api";
import {CurrencyEnum, CurrencyToken} from "@/views/business/enum";
import dayjs from "dayjs";
import {TransactionType} from "@/views/business/enum";
import {useRouter} from "vue-router";
import YearSelector from "@/views/business/client/overview/components/YearSelector.vue";

const globSetting = useGlobSetting();
const baseUploadUrl = globSetting.uploadUrl;
const uploadUrl = `${baseUploadUrl}/sys/common/static/`;

const {t} = useI18n();
const {createMessage} = useMessage();
const {resolve} = useRouter();

let ac = new AbortController();
let {signal} = ac;

onUnmounted(() => {
  ac.abort(t('sys.api.abortController.onUnmount'));
});

const props = defineProps({
  isEdit: Boolean,
  client: Object as PropType<Client>,
  currency: String as PropType<CurrencyEnum>,
});
const emits = defineEmits(["edit", "colorize"]);

const balance = ref(0);
const debit = ref<Transaction>();
const estimatedBalance = ref(0);
const estimationLoading = ref(true);

const selectedYear = ref<string>(dayjs().year().toString());
const yearOptions = ref<JSelectMultipleOptions[]>([]);
const previousYearDisabled = ref(true);
const nextYearDisabled = ref(true);

const tableLoading = ref(true);
const transactions = ref<Transaction[]>([]);

const editMode = ref(false);
watch(
  () => props.isEdit,
  (newVal) => {
    editMode.value = newVal;
  },
  {immediate: true});

watch(
  () => props.client,
  () => {
    ac.abort(t('sys.api.abortController.userCancel'));
    ac = new AbortController();
    signal = ac.signal;
    if (!props.client) {
      return;
    }
    if(!props.currency) {
      createMessage.error('No currency');
      return;
    }
    if (props.client?.useBalance) {
      loadBalance();
    }
    loadTransactions();
  }, {immediate: true});

const ipagination = reactive({
  current: 1,
  pageSize: 100,
  pageSizeOptions: ['50', '100'],
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  showTotal: (total: number, range: number[]) => {
    return range[0] + '-' + range[1] + ' of ' + total + ' items';
  },
});
const [registerTable] = useTable({
  dataSource: transactions,
  columns: getColumns(),
  pagination: ipagination,
  bordered: false,
  striped: true,
  showIndexColumn: false,
  indexColumnProps: {
    width: 60,
    title: "#"
  },
  rowKey: 'id',
  loading: tableLoading,
  scroll: {y: false},
  actionColumn,
  showActionColumn: editMode,
});

function loadBalance() {
  defHttp.get({
    url: Api.getBalance,
    params: {clientId: props.client?.id, currency: props.currency},
    signal: signal
  })
    .then(res => {
      balance.value = res;
    })
    .catch(e => {
      if (signal.aborted) {
        const {reason} = signal;
        console.warn(`Http request aborted : ${reason}`);
        createMessage.warn(reason);
      } else {
        console.error(e);
      }
    })
}

function loadTransactions() {
  const params = {
    clientId: props.client?.id as string,
    currency: props.currency,
    year: selectedYear.value,
  }
  tableLoading.value = true;
  loadAvailableYears({ clientId: params.clientId, currency: params.currency! });
  defHttp.get({url: Api.listTransactions, params, signal: signal})
    .then((res: Transaction[]) => {
      transactions.value = res;
      loadDebit();
      emits("colorize");
    })
    .catch(e => {
      if (signal.aborted) {
        const {reason} = signal;
        console.warn(`Http request aborted : ${reason}`);
        createMessage.warn(reason);
      } else {
        console.error(e);
      }
    })
    .finally(() => {
      tableLoading.value = false;
    });
}

function loadAvailableYears(params: { clientId: string, currency: CurrencyEnum }) {
  defHttp.get({url: Api.findEarliestInvoiceYear, params: params, signal: signal})
    .then((res: number) => {
      yearOptions.value = [];
      for (let year = dayjs().year(); year >= res; year--) {
        yearOptions.value.push({label: year.toString(), value: year.toString()});
      }
      disableYearButtons();
    })
    .catch(e => {
      console.error(e);
    });
}
function loadDebit() {
  estimationLoading.value = true;
  debit.value = {
    id: '0',
    createTime: 'Estimation',
    type: TransactionType.DEBIT,
    clientId: `${props.client?.id}`,
    paymentProofString: '',
    invoiceNumber: '',
    shippingFee: 0,
    purchaseFee: 0,
    amount: 0,
    currency: CurrencyEnum[props.currency!],
  }
  transactions.value.unshift(debit.value);
  emits("colorize");
  defHttp.get({url: Api.debit, params: { clientId: props.client?.id, currency: CurrencyEnum[props.currency!] }, signal: signal})
    .then(res => {
      debit.value = {
        id: '0',
        createTime: 'Estimation',
        type: TransactionType.DEBIT,
        clientId: `${props.client?.id}`,
        paymentProofString: '',
        invoiceNumber: '',
        shippingFee: res.shippingFeesEstimation,
        purchaseFee: res.purchaseEstimation,
        amount: res.totalEstimation,
        currency: CurrencyEnum[props.currency!],
      } as Transaction;
      // ajout de la ligne de début au début du tableau
      transactions.value[0] = debit.value;
      const debitEstimation: number = res.hasOwnProperty("totalEstimation") ? res.totalEstimation : 0;
      estimatedBalance.value = balance.value - debitEstimation;
      estimatedBalance.value = Number(estimatedBalance.value.toFixed(2));
    })
    .catch(e=> {
      if(signal.aborted) {
        const {reason} = signal;
        console.warn(`Http request aborted : ${reason}`);
        createMessage.warn(reason);
      }
      else {
        console.error(e);
      }
    })
    .finally(() => {
      estimationLoading.value = false;
      emits("colorize");
    });
}

function handleYearChange(year: string) {
  selectedYear.value = year;
  loadTransactions();
}
function previousYear() {
  const currentIndex = yearOptions.value.findIndex(item => item.value === selectedYear.value);
  if (currentIndex < yearOptions.value.length - 1) {
    selectedYear.value = yearOptions.value[currentIndex + 1].value as string;
    loadTransactions();
  }
  disableYearButtons();
}
function nextYear() {
  const currentIndex = yearOptions.value.findIndex(item => item.value === selectedYear.value);
  if (currentIndex > 0) {
    selectedYear.value = yearOptions.value[currentIndex - 1].value as string;
    loadTransactions();
  }
  disableYearButtons();
}
function disableYearButtons() {
  if (yearOptions.value.length > 0) {
    previousYearDisabled.value = selectedYear.value === yearOptions.value[yearOptions.value.length - 1].value;
    nextYearDisabled.value = selectedYear.value === yearOptions.value[0].value;
  }
}

function openInvoice(record) {
  const invoicePreviewRoute = resolve({
    name: 'invoice-preview',
    query: {invoice: record.invoiceNumber}
  });
  window.open(invoicePreviewRoute.href, '_blank');
}

function handleDelete(record: Recordable) {
  tableLoading.value = true;
  defHttp.delete({
    url: Api.cancelInvoice,
    data: {id: record.id, invoiceNumber: record.invoiceNumber, clientId: record.clientId}
  }, {joinParamsToUrl: true}).then(() => {

  }).catch(e => {
    console.error(e);
  }).finally(() => {
    loadTransactions();
    tableLoading.value = false;
  });
}
function handleUploadChange(imgPath, record) {
  if (!imgPath) {
    createMessage.error('Upload failed, no valid path returned');
    return;
  }
  const params = {
    invoiceNumber: record.invoiceNumber,
    paymentProofString: imgPath,
  };
  defHttp.post({
    url: Api.uploadPaymentProofAndNotify,
    data: params,
    headers: { 'Content-Type': 'application/json' },
  })
    .then(() => {
      record.paymentProofString = imgPath;
      loadTransactions();
    })
    .catch(() => {
      createMessage.error('Save failed, please try again');
    });
}
</script>
