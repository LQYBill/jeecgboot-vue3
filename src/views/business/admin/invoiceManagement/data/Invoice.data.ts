import {BasicColumn} from "@/components/Table";
import {useI18n} from "@/hooks/web/useI18n";

const { t } = useI18n();
export enum CurrencyEnum {
  EUR = "€",
  USD = "$",
  RMB = "¥",
}
export const Api = {
  checkInvoiceValidity: '/shippingInvoice/checkInvoiceValidity',
  downloadInvoice: '/shippingInvoice/download',
  downloadCompleteInvoiceExcel: "/generated/shippingInvoice/downloadCompleteInvoiceExcel",
  invoiceData: '/shippingInvoice/invoiceData',
  purchaseInvoiceData: '/shippingInvoice/purchaseInvoiceData',
  creditInvoiceData: '/credit/invoiceData',
  downloadCompleteInvoicePdf: "/generated/shippingInvoice/downloadPdf",
  downloadCreditInvoicePdf: "/generated/shippingInvoice/downloadPdf",
  sendDetailsByEmail: "/generated/shippingInvoice/sendDetailsByEmail"
}

export const columns: BasicColumn[] =  [
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
    title: t("data.invoice.quantity"),
    align: 'center',
    dataIndex: 'quantity',
  },
  {
    title: t("data.invoice.subTotal"),
    align: 'center',
    dataIndex: 'total_amount',
  }
];
