<template>
  <a-card :bordered='false' v-if="pageReady">
    <div class="table-operator">
      <!-- button to download invoice -->
      <a-button v-if="downloadReady" type='primary' shape="round" @click='downloadPdf()' preIcon="ant-design:download" size="large">
        {{ t("data.invoice.downloadInvoice") }}
      </a-button>

      <!-- button to download invoice details -->
      <a-button v-if="downloadReady && hasEmail" type='primary' shape="round" @click='sendEmail()' preIcon="ant-design:mail" size="large">
        {{ t("data.invoice.receiveDetailsByEmail") }}
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
          <div style="padding: 0 1em;">
            <h1 style='font-size: 2em'>{{ customer }} <span style='font-weight: 200'>({{ invoice_entity }})</span></h1>
            <a-row type="flex" justify='space-between' align-items='center'>
              <h2 >{{ t("data.invoice.invoiceNumber") }} : {{ invoice_number }}</h2>
              <h3>{{ t("data.client.currency") }} : {{ currency }}/{{ currencySymbol }}</h3>
            </a-row>
          </div>
        </template>
        <template #footer>
          <a-row type="flex" style="align-items: center; padding: 0em 1em;">
            <a-col :span="12"><h2>{{ t("data.invoice.total") }}</h2></a-col>
            <a-col :span="3"><h2 class='center'>{{ t("data.invoice.quantity") }} : </h2></a-col>
            <a-col :span="3"><div class='center' style='font-size: 1.5em;'>{{total_quantity}}</div></a-col>
            <a-col :span="3"><h2 class='center'>{{ t("data.invoice.totalAmount") }} : </h2></a-col>
            <a-col :span="3">
              <div class='center'  style='font-size: 1.5em;'>€{{final_total_euro}} EUR</div>
              <div class='center' v-if='currency !== "EUR"'>({{currencySymbol}}{{final_total_customer_curr}} {{currency}})</div>
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
import {defineComponent, onBeforeMount, onMounted, ref} from 'vue';
import {BasicColumn} from "/@/components/Table";
import { useRoute } from 'vue-router';
import {Result} from "ant-design-vue";
import {ExceptionEnum} from "/@/enums/exceptionEnum";
import {useGo} from "/@/hooks/web/usePage";

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

    onBeforeMount(()=> {
      checkInvoice();
    });
    const pageReady = ref<boolean>();
    const status = ref<any>();

    const dataSource = ref<any[]>([]);
    const index = ref(1);
    const customer = ref('');
    const email = ref('');
    const invoice_entity = ref('');
    const currency = ref();
    const currencySymbol = ref("$");
    const invoice_number = ref();
    const total_quantity = ref(0);
    const final_total_euro = ref(0);
    const final_total_customer_curr = ref(0);
    const invoice_type = ref();
    const invoiceContentLoading = ref<boolean>(false);
    const downloadReady = ref<boolean>(false);
    const hasEmail = ref();
    const failedPdfList = ref<any[]>([]);

    const Api = {
      checkInvoiceValidity: '/shippingInvoice/checkInvoiceValidity',
      downloadInvoice: '/shippingInvoice/download',
      invoiceData: '/shippingInvoice/invoiceData',
      purchaseInvoiceData: '/shippingInvoice/purchaseInvoiceData',
      downloadCompleteInvoicePdf: "/generated/shippingInvoice/downloadPdf",
      sendDetailsByEmail: "/generated/shippingInvoice/sendDetailsByEmail"
    }
    const columns: BasicColumn[] =  [
      {
        title: 'Reference',
        dataIndex: 'key',
        width: 60,
        align: 'center',
      },
      {
        title: t("data.invoice.description"),
        align: 'left',
        className: 'column_description',
        dataIndex: 'description',
      },
      {
        title: t("data.invoice.orderQty"),
        align: 'center',
        dataIndex: 'quantity',
      },
      {
        title: t("data.invoice.subTotal"),
        align: 'center',
        dataIndex: 'total_amount',
      }
    ];



    function checkInvoice() {
      invoiceContentLoading.value = true;
      pageReady.value = true;
      let param = {
        invoiceNumber: getInvoiceNum(),
      };
      defHttp.get({url: Api.checkInvoiceValidity, params: param}).then((res)=>{
        createMessage.success("Permission granted.");
        invoice_number.value = res.invoiceNumber;
        customer.value = res.name;
        email.value = res.email;
        hasEmail.value = !(email.value === "" || email.value === null);
        invoice_entity.value = res.invoiceEntity;
        if(res.currency === 'EUR' || res.currency === 'euro' || res.currency === 'eur' || res.currency === 'EURO') {
          currency.value = 'EUR';
          currencySymbol.value = "€"
        }
        if(res.currency === "USD" || res.currency === 'usd') {
          currency.value = 'USD'
        }
        if(res.currency === "RMB" || res.currency === "rmb") {
          currency.value = "RMB";
          currencySymbol.value = "¥";
        }
        loadInvoice();

      }).catch((e) => {
        console.error(e);
        invoiceContentLoading.value = false;
        pageReady.value = false;
        status.value = ExceptionEnum.PAGE_NOT_FOUND;
      });
    }
    function loadInvoice() {
      const param = {
        invoiceNumber: invoice_number.value,
        originalCurrency: "EUR",
        targetCurrency: currency.value
      };
      // on identifie le type de facture (1 : purchase, 2: shipping, 7: purchase + shipping
      invoice_type.value = getInvoiceType();
      if(invoice_type.value == null || ['1','2','7'].indexOf(invoice_type.value) == -1) {
        createMessage.error("Error : Resource not found.");
        pageReady.value = false;
        status.value = ExceptionEnum.PAGE_NOT_FOUND;
        return;
      }
      if(invoice_type.value === '1' || invoice_type.value === '7') {
        loadPurchaseInvoiceData(param);
      }
      if(invoice_type.value === '7' || invoice_type.value === '2') {
        loadInvoiceData(param);
      }
      invoiceContentLoading.value = false;
    } //end of loadInvoice()
    function loadInvoiceData(param) {
      defHttp.get({url: Api.invoiceData, params: param}).then(res => {
        if (res !== null) {
          downloadReady.value = true;
          for (let i in res.feeAndQtyPerCountry) {
            for (let key in res.feeAndQtyPerCountry[i]) {
              let subtotal = res.feeAndQtyPerCountry[i][key];
              final_total_euro.value += subtotal;
              total_quantity.value += Number(key);
              dataSource.value.push({
                key: index.value,
                description: "Total shipping cost for " + t("location.country." + i),
                quantity: key,
                total_amount: subtotal,
              });
              // incrémente la clé
              index.value += 1;
            }
          }
          // VAT
          dataSource.value.push({
            key: index.value,
            description: "Total VAT fee for " + t("location.continent.EuropeanUnion"),
            quantity: null,
            total_amount: res.vat
          });
          final_total_euro.value += res.vat;
          index.value += 1;

          // SERVICE FEE
          dataSource.value.push({
            key: index.value,
            description: "Total service fee",
            quantity: null,
            total_amount: res.serviceFee
          });
          index.value += 1;

          // PICKING FEE
          dataSource.value.push({
            key: index.value,
            description: "Total picking fee",
            quantity: null,
            total_amount: res.pickingFee
          });
          index.value += 1;

          // PACKAGING MATERIAL FEE
          dataSource.value.push({
            key: index.value,
            description: "Total packaging material fee",
            quantity: null,
            total_amount: res.packagingMaterialFee
          });
          index.value += 1;

          // REFUND
          if (res.refund > 0) {
            dataSource.value.push({
              key: index.value,
              description: 'Refund',
              quantity: null,
              total_amount: res.refund
            })
            final_total_euro.value -= res.refund;
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
            final_total_euro.value -= res.discount;
            index.value += 1;
          }
          final_total_euro.value = Number(final_total_euro.value.toFixed(2));
          if (currency.value !== "EUR") {
            final_total_customer_curr.value = res.finalAmount;
          }
        } else {
          createMessage.error("No data : " + invoice_number.value);
        }
      })
        .catch(e => {
          console.error(e);
        })
    }
    function loadPurchaseInvoiceData(param) {
      defHttp.get({url: Api.purchaseInvoiceData, params: param}).then(res=> {
        for(let sku in res.feeAndQtyPerSku) {
          for(let qty in res.feeAndQtyPerSku[sku]) {
            let subtotal = res.feeAndQtyPerSku[sku][qty];
            final_total_euro.value += subtotal;
            total_quantity.value += Number(qty);
            dataSource.value.push({
              key: index.value,
              description: sku,
              quantity: qty,
              total_amount: subtotal,
            });
            // incrémente la clé
            index.value+=1;
          }
        }
      })
    }
    function downloadPdf() {
      const param = {
        invoiceNumber: invoice_number.value
      }
      let filename = "Invoice N°" + invoice_number.value + " (" + customer.value + ").pdf";
      downloadFile(Api.downloadCompleteInvoicePdf, filename, param);
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
    function getInvoiceType() {
      let re = new RegExp('^[0-9]{4}-[0-9]{2}-([0-9])[0-9]{3}$');
      if (re.test(invoice_number.value)) {
        let match = re.exec(invoice_number.value);
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
      currency,
      currencySymbol,
      total_quantity,
      final_total_euro,
      final_total_customer_curr,
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
