<template>
  <a-card :bordered='false'>
    <div class="table-operator">
      <!-- button to download invoice -->
      <a-button v-if="downloadReady" type='primary' shape="round" @click='downloadPdf()' preIcon="ant-design:download" size="large">
        {{ $t("data.invoice.downloadInvoice") }}
      </a-button>

      <!-- button to download invoice details -->
      <a-button v-if="downloadReady && hasEmail" type='primary' shape="round" @click='sendEmail()' preIcon="ant-design:mail" size="large">
        <template #icon>
          <mail-outlined />
        </template>
        {{ $t("data.invoice.receiveDetailsByEmail") }}
      </a-button>
    </div>
    <section>
      <a-table  v-if="invoice_type === '2'"
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
              <h2 >{{ $t("data.invoice.invoiceNumber") }} : {{ invoice_number }}</h2>
              <h3>{{ $t("data.client.Currency") }} : {{ currency }}/{{ currencySymbol }}</h3>
            </a-row>
          </div>
        </template>
        <template #footer>
          <a-row type="flex" style="align-items: center; padding: 0em 1em;">
            <a-col :span="12"><h2>{{ $t("data.invoice.total") }}</h2></a-col>
            <a-col :span="3"><h2 class='center'>{{ $t("data.invoice.quantity") }} : </h2></a-col>
            <a-col :span="3"><div class='center' style='font-size: 1.5em;'>{{total_quantity}}</div></a-col>
            <a-col :span="3"><h2 class='center'>{{ $t("data.invoice.totalAmount") }} : </h2></a-col>
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
</template>

<script>
import {downloadFile} from '/@/api/common/api';
import { defHttp } from '/@/utils/http/axios';
import { useUserStore } from "/@/store/modules/user";
import { useMessage } from '/src/hooks/web/useMessage';
import {useI18n} from "/@/hooks/web/useI18n";

const userStore = useUserStore();
const { createMessage } = useMessage();

const { t } = useI18n();

export default {
  name: 'Invoice',
  components: {
  },
  setup() {
    return {
    }
  },
  data() {
    return {
      index: 1,
      customer: '',
      email: '',
      invoice_entity: '',
      currency: null,
      currencySymbol: "$",
      invoice_number: null,
      invoiceID: null,
      total_quantity: 0,
      final_total_euro: 0,
      final_total_customer_curr: 0,
      invoice_type: null,
      invoiceContentLoading: true,
      downloadReady: false,
      hasEmail: false,
      failedPdfList:[],
      url: {
        checkInvoiceValidity: '/shippingInvoice/checkInvoiceValidity',
        downloadInvoice: '/shippingInvoice/download',
        invoiceData: '/shippingInvoice/invoiceData',
        downloadCompleteInvoicePdf: "/generated/shippingInvoice/downloadPdf",
        sendDetailsByEmail: "/generated/shippingInvoice/sendDetailsByEmail"
      },
      dataSource: [],
      columns: [
        {
          title: 'Reference',
          dataIndex: 'key',
          width: 60,
          align: 'center',
        },
        {
          title: this.$t("data.invoice.description"),
          align: 'left',
          className: 'column_description',
          dataIndex: 'description',
        },
        {
          title: this.$t("data.invoice.orderQty"),
          align: 'center',
          dataIndex: 'quantity',
        },
        {
          title: this.$t("data.invoice.subTotal"),
          align: 'center',
          dataIndex: 'total_amount',
        }
      ],
    }
  },
  created() {
    this.checkInvoice();
  },
  computed: {
    num: getInvoiceNum
  },
  methods: {

    checkInvoice() {
      let email = userStore.getUserInfo.email;
      let orgCode = userStore.getUserInfo.orgCode;
      console.log("User : " + email + " " + orgCode);
      if(orgCode.includes("A01") || orgCode.includes("A02") || orgCode.includes("A03") || orgCode.includes("A04")) {
        let param = {
          invoiceID: this.num,
          email: email,
          orgCode: orgCode
        };
        defHttp.get({url: this.url.checkInvoiceValidity, params: param}).then((res)=>{
          createMessage.success("Permission granted.");
          this.invoice_number = res.invoiceNumber;
          this.customer = res.name;
          this.email = res.email;
          this.hasEmail = !(this.email === "" || this.email === null);
          this.invoice_entity = res.invoiceEntity;
          let currency = res.currency;
          if(currency === 'EUR' || currency === 'euro' || currency === 'eur' || currency === 'EURO') {
            this.currency = 'EUR';
            this.currencySymbol = "€"
          }
          if(currency === "USD" || currency === 'usd') {
            this.currency = 'USD'
          }
          if(currency === "RMB" || currency === "rmb") {
            this.currency = "RMB";
            this.currency = "¥";
          }
          this.loadInvoice();

        }).catch((e) => {
          console.log("Error : " + e);
        });
      }
      else {
        createMessage.error("Not authorized to access this page.");
      }
    },
    loadInvoice() {
      let self= this;
      const param = {
        invoiceNumber: self.invoice_number,
        originalCurrency: "EUR",
        targetCurrency: self.currency
      };
      // on identifie le type de facture (1 : purchase, 2: shipping, 7: purchase + shipping
      self.invoice_type = self.getInvoiceType();
      if(self.invoice_type == null || self.invoice_type !== '2') {
        createMessage.error("Access refused : Invalid type.")
        return;
      }
      defHttp.get({url: self.url.invoiceData, params: param}).then(res=>{
        console.log("FIRST INDEX : " + self.index);
        self.invoiceContentLoading = true;
        if(res !== null) {
          self.downloadReady = true;
          for(let i in res.feeAndQtyPerCountry) {
            for(let key in res.feeAndQtyPerCountry[i]) {
              let subtotal = res.feeAndQtyPerCountry[i][key];
              self.final_total_euro += subtotal;
              self.total_quantity += Number(key);
              self.dataSource.push({
                key: self.index,
                description: "Total shipping cost for " + self.$t("location.country."+i),
                quantity: key,
                total_amount: subtotal,
              });
              // incrémente la clé
              self.index+=1;
              console.log("index 1 : " + self.index);
            }
          }
          // VAT
          self.dataSource.push({
            key: self.index,
            description: "Total VAT fee for " + self.$t("location.continent.EuropeanUnion"),
            quantity: null,
            total_amount: res.vat
          });
          self.final_total_euro += res.vat;
          self.index+=1;
          console.log("index : " + self.index);

          // SERVICE FEE
          self.dataSource.push({
            key: self.index,
            description: "Total service fee",
            quantity: null,
            total_amount: res.serviceFee
          });
          self.index+=1;
          console.log("index : " + self.index);

          // PICKING FEE
          self.dataSource.push({
            key: self.index,
            description: "Total picking fee",
            quantity: null,
            total_amount: res.pickingFee
          });
          self.index+=1;
          console.log("index : " + self.index);

          // PACKAGING MATERIAL FEE
          self.dataSource.push({
            key: self.index,
            description: "Total packaging material fee",
            quantity: null,
            total_amount: res.packagingMaterialFee
          });
          self.index+=1;
          console.log("index : " + self.index);

          // REFUND
          if(res.refund > 0) {
            self.dataSource.push({
              key: self.index,
              description: 'Refund',
              quantity: null,
              total_amount: res.refund
            })
            self.final_total_euro -= res.refund;
            self.index+=1;
            console.log("index : " + self.index);
          }

          // DISCOUNT (not used yet)
          if(res.discount > 0) {
            self.dataSource.push({
              key: self.index,
              description: 'Discount',
              quantity: null,
              total_amount: res.discount
            })
            self.final_total_euro -= res.discount;
            self.index+=1;
            console.log("index : " + self.index);
          }

          if(self.currency !== "EUR") {
            self.final_total_customer_curr = res.finalAmount;
          }
        }
        else {
          createMessage.error("No data : " + self.invoice_number);
        }
        self.invoiceContentLoading = false;
      })
    }, //end of loadInvoice()
    downloadPdf() {
      const param = {
        invoiceNumber: this.invoice_number
      }
      let filename = "Invoice N°" + this.invoice_number + " (" + this.customer + ").pdf";
      downloadFile(this.url.downloadCompleteInvoicePdf, filename, param);
    }, // end of DownloadPdf()
    sendEmail(){
      const param = {
        invoiceNumber: this.invoice_number,
        invoiceID: this.invoiceID,
        email: this.email,
        invoiceEntity: this.invoice_entity,
      }
      defHttp.get({url: this.url.sendDetailsByEmail, params: param})
        .then(res => {
          console.log(res);
          createMessage.success(res.result);
        })
        .catch((error) => {
          console.log(error);
          createMessage.error(error);
        });
    },
    getInvoiceType() {
      let re = new RegExp('^[0-9]{4}-[0-9]{2}-([0-9])[0-9]{3}$');
      if (re.test(this.invoice_number)) {
        let match = re.exec(this.invoice_number);
        return match[1];
      }
      else {
        createMessage.error("Invalid invoice number.");
        return null;
      }
    }, // end of getInvoiceType()
  }
}

function getInvoiceNum() {
  try {
    this.invoiceID = this.$route.query.invoiceID;
    console.log("Query : " + this.invoiceID);
    return this.invoiceID;
  }catch (e) {
    createMessage.error("Invoice ID required.");
    console.error("Invoice ID required.");
  }
}
</script>

<style scoped>
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
</style>
