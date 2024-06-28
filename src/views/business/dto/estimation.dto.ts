export interface estimation {
  code: string;
  ordersToProcess: number;
  processedOrders: number;
  shippingFeesEstimation: number;
  purchaseEstimation: number;
  totalEstimation: number;
  currency: string;
  errorMessages: string[];
  shop?: string;
  shopIds: string[];
  startDate: string;
  endDate: string;
  isCompleteInvoiceReady: boolean;
  orderIds: string[];
}
