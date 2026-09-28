export interface Estimation {
  code: string;
  ordersToProcess: number;
  processedOrders: number;
  shippingFeesEstimation: number;
  purchaseEstimation: number;
  totalEstimation: number;
  domesticShippingFee?: number;
  shippingFeesEstimationEur?: number;
  purchaseEstimationEur?: number;
  domesticShippingFeeEur?: number;
  totalEstimationEur?: number;
  currency: string;
  errorMessages: string[];
  shop?: string;
  shopIds: string[];
  startDate: string;
  endDate: string;
  isCompleteInvoiceReady: boolean;
  orderIds: string[];
}
