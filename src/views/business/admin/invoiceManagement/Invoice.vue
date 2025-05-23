<template>
  <a-card :bordered='false' v-if="pageReady">
    <div class="table-operator" v-if="invoice_status !== 0">
      <!-- button to download invoice -->
      <a-button v-if="downloadReady" type='primary' shape="round" @click='downloadPdf()' preIcon="ant-design:download" size="large">
        {{ t("data.invoice.downloadInvoice") }}
      </a-button>

      <!-- button to download invoice details -->
      <a-button v-if="downloadReady && hasEmail && invoice_type !== '8'" type='primary' shape="round" @click='sendEmail()' preIcon="ant-design:mail" size="large">
        {{ t("data.invoice.receiveDetailsByEmail") }}
      </a-button>

      <!-- button to download invoice inventory -->
      <a-button v-if="downloadReady && (invoice_type === '1' || invoice_type === '7')" type='primary' shape="round" @click='downloadInvoiceInventory()' preIcon="ic:outline-inventory" size="large">
        {{ t("data.upload.inventoryRecap") }}
      </a-button>
    </div>
    <section>
      <a-table
                ref='table'
                size='middle'
                bordered
                rowKey='key'
                class="j-table-force-nowrap ant-table-striped"
                :scroll='{x:true}'
                :columns='columns'
                :dataSource='dataSource'
                :loading='invoiceContentLoading'
                :pagination='false'
      >
        <template #title>
          <header style="padding: 0 1em;">
            <h1 style='font-size: 2em'>{{ customer }} <span style='font-weight: 200'>({{ invoice_entity }})</span></h1>
            <a-row type="flex" justify='space-between' align-items='center'>
              <h2>{{ t("data.invoice.invoiceNumber") }} : <span :class="invoice_status === 0 ? 'line-through':''">{{ invoice_number }}</span></h2>
              <h3>{{ t("data.client.currency") }} : {{ clientCurrency }}/{{ clientCurrencySymbol }}</h3>
            </a-row>
          </header>
        </template>
        <template #footer>
          <a-row type="flex" style="align-items: center; padding: 0em 1em;">
            <a-col :span="12"><h2>{{ t("data.invoice.total") }}</h2></a-col>
            <a-col :span="3" v-if="invoice_type !== '8'"><h2 class='center'>{{ t("data.invoice.quantity") }} : </h2></a-col>
            <a-col :span="3" v-if="invoice_type !== '8'"><div class='center' style='font-size: 1.5em;'>{{total_quantity}}</div></a-col>
            <a-col :span="invoice_type !== '8' ? 3 : 6"><h2 class='center'>{{ t("data.invoice.totalAmount") }} : </h2></a-col>
            <a-col :span="invoice_type !== '8' ? 3 : 6">
              <div class='center'  style='font-size: 1.5em;'>{{ invoiceCurrencySymbol }}{{main_final_total.toFixed(2)}} {{ invoiceCurrency }}</div>
              <div class='center' v-if='targetCurrency !== invoiceCurrency'>({{targetCurrencySymbol}}{{final_total_converted.toFixed(2)}} {{targetCurrency}})</div>
            </a-col>
          </a-row>
        </template>
      </a-table>
    </section>
    <!-- table区域 end -->
  </a-card>
  <Result v-else-if="!pageReady" :status="Number(ExceptionEnum.PAGE_NOT_FOUND)" :title="status" :sub-title="t('sys.exception.subTitle404')">
    <template #extra>
      <a-button key="console" type="primary" @click="returnHome()"> {{ t('sys.exception.backHome') }} </a-button>
    </template>
  </Result>
</template>

<script lang="ts">
import {downloadFile} from '/@/api/common/api';
import { defHttp } from '/@/utils/http/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import {useI18n} from "/@/hooks/web/useI18n";
import {defineComponent, onBeforeMount, onUnmounted, ref} from 'vue';
import {Api, columns, CurrencyEnum} from './data/Invoice.data';
import { useRoute } from 'vue-router';
import {Result} from "ant-design-vue";
import {ExceptionEnum} from "/@/enums/exceptionEnum";
import {useGo} from "/@/hooks/web/usePage";
import {Fee} from "@/views/business/dto/fee.dto";
import {useWatermark} from "@/hooks/web/useWatermark";

export default defineComponent({
  name: 'Invoice',
  computed: {
    ExceptionEnum() {
      return ExceptionEnum
    }
  },
  components: {
    Result
  },
  setup() {
    const { createMessage } = useMessage();
    const { t } = useI18n();
    const route = useRoute();
    const go = useGo();
    const ac = new AbortController();
    const {signal} = ac;
    const { setWatermark, clear } = useWatermark();

    onBeforeMount(()=> {
      checkInvoice();
    });
    onUnmounted(() => {
      ac.abort(t('sys.api.abortController.onUnmount'));
      clear();
    });
    const pageReady = ref<boolean>();
    const status = ref<any>();

    const dataSource = ref<any[]>([]);
    const index = ref(1);
    const customer = ref('');
    const email = ref('');
    const invoice_entity = ref('');
    const clientCurrency = ref();
    const clientCurrencySymbol = ref("$");
    const invoiceCurrency = ref();
    const invoiceCurrencySymbol = ref("$");
    const targetCurrency = ref();
    const targetCurrencySymbol = ref("$");
    const invoice_number = ref();
    const total_quantity = ref(0);
    const main_final_total = ref(0);
    const final_total_converted = ref(0);
    const invoice_type = ref();
    const invoice_status = ref(1);
    const invoiceContentLoading = ref<boolean>(false);
    const downloadReady = ref<boolean>(false);
    const hasEmail = ref();
    const failedPdfList = ref<any[]>([]);

    function checkInvoice() {
      invoiceContentLoading.value = true;
      pageReady.value = true;
      const param = {
        invoiceNumber: getInvoiceNum(),
      };
      defHttp.get({url: Api.checkInvoiceValidity, params: param, signal:signal}).then((res: Recordable)=>{
        // createMessage.success("Permission granted.");
        invoice_number.value = res.invoiceNumber;
        customer.value = res.name;
        email.value = res.email;
        hasEmail.value = !(email.value === "" || email.value === null);
        invoice_entity.value = res.invoiceEntity;

        invoice_type.value = getInvoiceType();
        const displayCurrency = invoice_type.value === '8' ? res.invoiceCurrency : 'EUR';
        invoiceCurrency.value = displayCurrency;
        invoiceCurrencySymbol.value = CurrencyEnum[displayCurrency];
        clientCurrency.value = res.currency;
        clientCurrencySymbol.value =CurrencyEnum[res.currency];
        targetCurrency.value = displayCurrency !== 'EUR' ? 'EUR' : res.invoiceCurrency;
        targetCurrencySymbol.value = CurrencyEnum[targetCurrency.value];

        loadInvoice();

      }).catch((e) => {
        console.error(e);
        invoiceContentLoading.value = false;
        pageReady.value = false;
        status.value = ExceptionEnum.PAGE_NOT_FOUND;
      });
    }
    async function loadInvoice() {
      const param = {
        invoiceNumber: invoice_number.value,
        originalCurrency: invoice_type.value === '8' ? invoiceCurrency.value : 'EUR',
        targetCurrency: targetCurrency.value
      };
      // on identifie le type de facture (1 : purchase, 2: shipping, 7: purchase + shipping
      if (invoice_type.value == null || ['1', '2', '7', '8'].indexOf(invoice_type.value) == -1) {
        createMessage.error("Error : Resource not found.");
        pageReady.value = false;
        status.value = ExceptionEnum.PAGE_NOT_FOUND;
        return;
      }
      const promiseList: any[] = [];
      if (invoice_type.value === '1' || invoice_type.value === '7') {
        promiseList.push(loadPurchaseInvoiceData(param));
      }
      if (invoice_type.value === '7' || invoice_type.value === '2') {
        promiseList.push(loadInvoiceData(param));
      }
      if(invoice_type.value === '8') {
        promiseList.push(loadCreditInvoiceData(invoice_number.value));
      }
      await Promise.all(promiseList).then(() => {
        invoiceContentLoading.value = false;
      });
    } //end of loadInvoice()
    async function loadInvoiceData(param) {
      return new Promise<void>((resolve, reject) => {
        defHttp.get({url: Api.invoiceData, params: param, signal: signal})
          .then(res => {
            if (res !== null) {
              downloadReady.value = true;
              if(res.status === 0) {
                invoice_status.value = 0;
                setWatermark(t("common.status.cancelled"));
              }
              for (let i in res.feeAndQtyPerCountry) {
                const fee: Fee = res.feeAndQtyPerCountry[i];
                let subtotal = fee.unitPrice;
                main_final_total.value += subtotal;
                total_quantity.value += Number(fee.quantity);
                dataSource.value.push({
                  key: index.value,
                  description: "Total shipping cost for " + t("location.country." + i),
                  quantity: fee.quantity,
                  total_amount: subtotal,
                });
                // incrémente la clé
                index.value += 1;
              }
              // VAT
              dataSource.value.push({
                key: index.value,
                description: "Total VAT fee for " + t("location.continent.EuropeanUnion"),
                quantity: null,
                total_amount: res.vat
              });
              main_final_total.value += res.vat;
              index.value += 1;

              // SERVICE FEE
              dataSource.value.push({
                key: index.value,
                description: "Total service fee",
                quantity: null,
                total_amount: res.serviceFee
              });
              main_final_total.value += res.serviceFee;
              index.value += 1;

              // PICKING FEE
              dataSource.value.push({
                key: index.value,
                description: "Total picking fee",
                quantity: null,
                total_amount: res.pickingFee
              });
              main_final_total.value += res.pickingFee;
              index.value += 1;

              // PACKAGING MATERIAL FEE
              dataSource.value.push({
                key: index.value,
                description: "Total packaging material fee",
                quantity: null,
                total_amount: res.packagingMaterialFee
              });
              main_final_total.value += res.packagingMaterialFee;
              index.value += 1;

              // INSURANCE FEE
              dataSource.value.push({
                key: index.value,
                description: "Total product insurance fee",
                quantity: null,
                total_amount: res.insuranceFee
              });
              main_final_total.value += res.insuranceFee;
              index.value += 1;

              // REFUND
              if (res.refund > 0) {
                dataSource.value.push({
                  key: index.value,
                  description: 'Refund',
                  quantity: null,
                  total_amount: res.refund
                })
                main_final_total.value -= res.refund;
                index.value += 1;
              }

              // DISCOUNT (not used yet)
              if (res.discount > 0) {
                dataSource.value.push({
                  key: index.value,
                  description: 'Discount',
                  quantity: null,
                  total_amount: res.discount
                })
                main_final_total.value -= res.discount;
                index.value += 1;
              }

              // EXTRA FEES
              if (!!res.extraFees) {
                for (let i in res.extraFees) {
                  const fee: Fee = res.extraFees[i];
                  let subtotal: number = fee.unitPrice * fee.quantity;
                  main_final_total.value += subtotal;
                  total_quantity.value += fee.quantity;
                  dataSource.value.push({
                    key: index.value,
                    description: i,
                    quantity: fee.quantity,
                    total_amount: subtotal
                  });
                  index.value += 1;
                }
              }
              main_final_total.value = Number(main_final_total.value.toFixed(2));
              if (targetCurrency.value !== "EUR") {
                final_total_converted.value = res.finalAmount;
              }
            } else {
              createMessage.error("No data : " + invoice_number.value);
            }
            resolve();
          })
          .catch(e => {
            console.error(e);
            reject();
          });
      });

    }
    async function loadPurchaseInvoiceData(param) {
      return new Promise<void>((resolve, reject) => {
        defHttp.get({url: Api.purchaseInvoiceData, params: param, signal: signal})
          .then(res=> {
            if(res.status === 0) {
              setWatermark(t("common.status.cancelled"));
              invoice_status.value = 0;
            }
            for(let sku in res.feeAndQtyPerSku) {
              const fee: Fee = res.feeAndQtyPerSku[sku];
                let subtotal = fee.unitPrice;
                main_final_total.value += subtotal;
                total_quantity.value += fee.quantity;
                dataSource.value.push({
                  key: index.value,
                  description: sku,
                  quantity: fee.quantity,
                  total_amount: subtotal,
                });
                // incrémente la clé
                index.value+=1;
            }
            downloadReady.value = true;
            resolve();
          })
          .catch(e => {
            console.error(e);
            reject();
          });
      });
    }
    async function loadCreditInvoiceData(invoiceNumber: string) {
      return new Promise<void>((resolve, reject) => {
        defHttp.get({url: Api.creditInvoiceData, params: {invoiceNumber}, signal: signal})
          .then((res: Recordable) => {
            if(res.status === 0) {
              setWatermark(t("common.status.cancelled"));
              invoice_status.value = 0;
            }
            if(invoiceCurrency.value !== "EUR") {
              main_final_total.value = res.finalAmount;
            } else {
              main_final_total.value = res.finalAmountEur;
            }
            final_total_converted.value = res.finalAmountEur;
            dataSource.value.push({
              key: index.value,
              description: res.description,
              total_amount: main_final_total,
            });
            downloadReady.value = true;
            resolve();
          })
          .catch(e => {
            console.error(e);
            reject();
          });
      });
    }
    function downloadPdf() {
      const param = {
        invoiceNumber: invoice_number.value
      }
      const url = invoice_type.value === '8' ? Api.downloadCreditInvoicePdf : Api.downloadCompleteInvoicePdf;
      const filename = "Invoice N°" + invoice_number.value + " (" + invoice_entity.value + ").pdf";
      downloadFile(url, filename, param);
    } // end of DownloadPdf()
    function sendEmail(){
      const param = {
        invoiceNumber: invoice_number.value,
        email: email.value,
        invoiceEntity: invoice_entity.value,
      }
      defHttp.get({url: Api.sendDetailsByEmail, params: param})
        .then(res => {
          createMessage.success(res.result);
        })
        .catch((error) => {
          createMessage.error(error);
        });
    }
    function downloadInvoiceInventory() {
      const params = {
        invoiceNumber: invoice_number.value,
        filetype: "inventory"
      }
      const filename = invoice_number.value + "_Inventaire_SKU.xlsx";
      downloadFile(Api.downloadCompleteInvoiceExcel, filename, params);
    }
    function getInvoiceType() {
      const re = new RegExp('^[0-9]{4}-[0-9]{2}-([0-9])[0-9]{3}$');
      if (re.test(invoice_number.value)) {
        const match = re.exec(invoice_number.value);
        return match[1];
      }
      else {
        createMessage.error("Error : Resource not found.");
        return null;
      }
    } // end of getInvoiceType()

    function getInvoiceNum() {
      try {
        invoice_number.value = route.query.invoice;
        return invoice_number.value;
      } catch (e) {
        createMessage.error("Invoice ID required.");
        console.error("Invoice ID required.");
        pageReady.value = false;
        status.value = ExceptionEnum.PAGE_NOT_FOUND;
      }
    }
    function returnHome() {
      go();
    }
    return {
      downloadPdf,
      sendEmail,
      downloadInvoiceInventory,
      returnHome,
      status,
      pageReady,
      t,
      columns,
      dataSource,
      invoiceContentLoading,
      downloadReady,
      hasEmail,
      invoice_type,
      customer,
      invoice_number,
      invoice_entity,
      clientCurrency,
      clientCurrencySymbol,
      invoiceCurrency,
      invoiceCurrencySymbol,
      targetCurrency,
      targetCurrencySymbol,
      total_quantity,
      main_final_total,
      final_total_converted,
      invoice_status
    }
  },
})
</script>

<style scoped lang="less">

@geekBlue: #1d39c4;
@geekBlueBg : #F0F5FF;
@lightGeekBlue : lighten(@geekBlue, 15%);
.table-operator {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  button{
    margin: 1em;
  }
}
h2.center, div.center {
  text-align: center;
}
.ant-table-footer h2, .ant-table-title h2{
  margin: 0;
  font-size: 1.3rem;
}

.ant-btn-primary,.ant-pagination.mini .ant-pagination-item-active {
  border-color: @geekBlue !important;
  background-color: @geekBlue !important;
  color: @geekBlueBg !important;
  &:hover {
    background-color: @lightGeekBlue !important;
    border-color: @lightGeekBlue !important;
  }
}

</style>
<style>
.ant-table-wrapper .ant-table-thead th.ant-table-cell:hover {
  background: #eee!important;
}
</style>
