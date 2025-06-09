import {InvoicingMethod} from "@/views/business/enum/InvoicingMethodEnum";

export interface ManualInvoiceParam {
  clientID: string;
  orderIds: string[];
  type: InvoicingMethod;
  start: string;
  end: string;
  ordersWithStock?: string[];//order ids
}
