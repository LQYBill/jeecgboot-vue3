<template>
  <a-card :bordered="false" :loading="!pageReady">
    <!-- search by sku's measure-->
    <a-form ref="formRef" :model="formState" :rules="validatorRules" layout="inline" class="center">
      <a-form-item
        :label="t('data.shipping.destination')"
        v-bind="validateInfos.name"
        name="country"
      >
        <JSelectMultiple
          :placeholder="t('component.searchForm.countrySelectSearch')"
          :options="countryList"
          v-model:value="formState.country"
          @change="handleCountryChange"
          allowClear
        />
        <div class="pool mt-2">
          <a-tag v-if="formState.country !== ''" v-for="item of formState.country.split(',')" :key="item"
            :closable="true"
            @close="() => deleteSelectedSku(item)"
            color="orange"
          >
            {{ item }}
          </a-tag>
        </div>
      </a-form-item>
      <a-form-item>
        <Divider type="vertical"/>
      </a-form-item>
      <a-form-item
        ref="weight"
        :label="t('data.shipping.weight')"
        v-bind="validateInfos.name"
        name="weight"
      >
        <a-input-number
          v-model:value="formState.weight"
          @change="handleWeightChange"
          :addon-after="t('data.shipping.gram')"
          :step="10"
        />
      </a-form-item>
<!--      <a-form-item>-->
<!--        <Divider type="vertical"/>-->
<!--      </a-form-item>-->
<!--      <a-form-item>-->
<!--        <span>{{ t('data.shipping.volume') }} : </span>-->
<!--      </a-form-item>-->
<!--      <a-form-item ref="long" style="text-align: center">-->
<!--        <template #extra>-->
<!--          <span>{{ t('data.shipping.length') }}(cm)</span>-->
<!--        </template>-->
<!--        <a-input v-model:value="formState.length" style="width:50px"/>-->
<!--      </a-form-item>-->
<!--      <a-form-item>-->
<!--        <span>X</span>-->
<!--      </a-form-item>-->
<!--      <a-form-item ref="width" style="text-align: center">-->
<!--        <template #extra>-->
<!--          <span>{{ t('data.shipping.width') }}(cm)</span>-->
<!--        </template>-->
<!--        <a-input v-model:value="formState.width" style="width:50px"/>-->
<!--      </a-form-item>-->
<!--      <a-form-item>-->
<!--        <span>X</span>-->
<!--      </a-form-item>-->
<!--      <a-form-item ref="height" style="text-align: center">-->
<!--        <template #extra>-->
<!--          <span>{{ t('data.shipping.height') }}(cm)</span>-->
<!--        </template>-->
<!--        <a-input v-model:value="formState.height" style="width:50px"/>-->
<!--      </a-form-item>-->
      <a-form-item>
        <Divider type="vertical"/>
      </a-form-item>
      <a-form-item>
        <a-button
          type="primary"
          htmlType="submit"
          @click="sendReqForSearchBySize"
          :loading="submitButtonLoading"
          :disabled="submitButtonDisabled"
        >
          {{ t('common.operation.search') }}
        </a-button>
      </a-form-item>
    </a-form>
    <Divider/>
    <BasicTable
      @register="register"
      :loading="dataTableLoading"
      bordered
      ref="tableRef"
    />
  </a-card>
</template>
<script lang="ts" setup>
import {onMounted, reactive, ref} from "vue";
import {defHttp} from "/@/utils/http/axios";
import {useMessage} from "/@/hooks/web/useMessage";
import {useI18n} from "/@/hooks/web/useI18n";
import {Form, Divider} from "ant-design-vue";
import BasicTable from "/@/components/Table/src/BasicTable.vue";
import {BasicColumn, useTable} from "/@/components/Table";
import JSelectMultiple from "/@/components/Form/src/jeecg/components/JSelectMultiple.vue";

onMounted (()=> {
  // load country list
  defHttp.get({url: Api.countries, params: {}}).then(
    res => {
      countryList.value = res.map(
        country => ({
          label: `(${country.code}) ${country.nameEn} : ${country.nameZh}`,
          value: country.code
        })
      );
      countryReady.value = true;
      // formState.country = 'United States,Germany,Poland';
      defHttp.get({url: Api.popularCountries}).then(
        res => {
          console.log(res);
          let allPopularCountriesList = res.splice(0, 5).map(item => item.code).toString();
          console.log(allPopularCountriesList);
          formState.country = allPopularCountriesList;
        }
      ).catch(e=> {
        console.error(e);
      }).finally(()=> {
        pageReady.value = true;
      });
    }
  ).catch(e => {
    console.error(e);
  });
});

const { t } = useI18n();
const { createMessage } = useMessage();

const Api = {
  countries: "/business/logisticChannel/countries",
  popularCountries: "/business/logisticChannel/popularCountries",
  shipSelect: "/business/logisticChannel/find",
  shipSelectBySku: "/business/logisticChannel/findBySku",
  shipSelectByCountriesAndSku: "/business/logisticChannel/findByCountriesAndSku"
}

const useForm = Form.useForm;
const formRef = ref();
const validatorRules = ref({
  country: [{required: true, message: t('component.searchForm.countryInputSearch'), trigger: 'change'}],
  weight: [{required: true, message: t('component.searchForm.weightInputSearch'), trigger: 'blur'}],
});
const formState = reactive<Record<string, any>>({
  country: '',
  weight: '',
  length: '',
  width: '',
  height: ''
});
const { resetFields, validate, validateInfos } = useForm(formState, validatorRules, { immediate: false });


const pageReady = ref<boolean>(false);
const submitButtonDisabled = ref<boolean>(true);
const submitButtonLoading = ref<boolean>(false);

const dataTableLoading = ref<boolean>(false);

const weight = ref<number>();

const selectedCountries = ref<any[]>([]);
const countryList = ref<any[]>([]);
const countryReady = ref<boolean>(false);

const priceList = ref<any[]>([]);
const columns:BasicColumn[] = [
  {
    title: t('data.invoice.country'),
    align: "center",
    dataIndex: "countryCode",
    width: 80,
    sorter: (a, b) => a['countryCode'].localeCompare(b['countryCode'])
  },
  {
    title: t('data.invoice.logisticChannelName'),
    align: "center",
    dataIndex: "logisticsChannelName",
    width: 180,
  },
  {
    title: t('data.invoice.logisticChannelCode'),
    align: "center",
    dataIndex: "logisticChannelCode",
    width: 180,
  },
  {
    title: t('data.invoice.shippingFees'),
    children: [
      {
        title: t('data.invoice.totalShippingFees') + "(€)",
        align: "center",
        dataIndex: "TotalCost",
        width: 80,
        sorter: (a, b) => a.TotalCost - b.TotalCost
      },
      {
        title: t('data.invoice.details'),
        children: [
          {
            title: t('data.invoice.shippingFee')+"(€)",
            align: "center",
            dataIndex: "shippingCost",
            width: 80,
            sorter: (a, b) => a.shippingCost - b.shippingCost
          },
          {
            title: t('data.invoice.fretFee')+"(€)",
            align: "center",
            dataIndex: "registrationCost",
            width: 80,
            sorter: (a, b) => a.registrationCost - b.registrationCost
          }, {
            title: t('data.invoice.additionalFees')+"(€)",
            align: "center",
            dataIndex: "additionalCost",
            width: 80,
            sorter: (a, b) => a.additionalCost - b.additionalCost
          },
        ]
      }
    ],
  },
  {
    title: t('data.invoice.effectiveDate'),
    align: "center",
    dataIndex: "effectiveDate",
    width: 120,
  }, {
    title: t('data.invoice.unitPrice')+"(€/g)",
    align: "center",
    dataIndex: "unitPrice",
    width: 80,
  }
]; // end columns
const [register, { reload }] = useTable({
  title: t(''),
  dataSource: priceList,
  columns,
  bordered: true,
  striped: true,
  showTableSetting: true,
  showSummary: true,
  showIndexColumn: false,
  canResize: false,
  rowKey: 'id',
});
function handleCountryChange(e) {
  selectedCountries.value = e;

}
function handleWeightChange(e) {
  if(typeof e === 'number')
    weight.value = e;
  else
    console.error("not number")
  submitButtonDisabled.value = formState.country === '' && formState.weight === '';
}
function deleteSelectedSku(item) {
  let countryArray = formState.country.split(',');
  countryArray.splice(countryArray.indexOf(item), 1);
  formState.country = countryArray.toString();
  console.log(formState.country);
}
function sendReqForSearchBySize () {
  formRef.value.validate().then(()=> {
    let requestParam = {
      countryList: formState.country.split(','),
      weight: formState.weight,
    };
    dataTableLoading.value = true;
    submitButtonLoading.value = true;
    defHttp.get({url: Api.shipSelect, params: requestParam})
      .then(res => {
        priceList.value = res;
        console.log(res);
      }).catch(e => {
        console.error(e);
      }).finally(()=> {
        dataTableLoading.value = false;
        submitButtonLoading.value = false;
      });
  })
}
</script>
<style>
form.center.ant-form-inline .ant-form-item {
  justify-content: flex-end;
}
.ant-select.ant-select-multiple{
  width: 60%;
  min-width: 280px;
}
.select-country {
  display: inline-block;
}
.ant-col.ant-form-item-label {
  width: auto;
}
.ant-form-inline .ant-form-item-with-help {
  margin-bottom: 0;
}
.pool {
  padding: 5px;
  border: solid lightgrey 1px;
  border-radius: 3px;
  width: 100%;
  max-width: 300px;
  min-height: 40px;
  .ant-tag {
    margin-bottom: 0.5em
  }
}
</style>
