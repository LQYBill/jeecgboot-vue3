import {CurrencyEnum, TransactionType} from "@/views/business/enum";

export interface Transaction {
  id: string;
  clientId: string;
  currency: CurrencyEnum;
  amount: number;
  createTime: string;
  invoiceNumber: string;
  ordered?: 0 | 1;
  paymentProof?: string;
  paymentProofString?: string;
  purchaseFee: number;
  shippingFee: number;
  status?: number;
  type: TransactionType
}
