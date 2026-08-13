export interface shippingInvoiceParam {
  clientID: string;
  invoiceEntityId?: string;
  balance?: number;
  shopIDs: string[];
  start: string;
  end: string;
  erpStatuses?: string[];
  warehouses: string[];
}
