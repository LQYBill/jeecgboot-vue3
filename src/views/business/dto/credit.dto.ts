export interface Credit {
  id?: string;
  clientId: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  invoiceNumber?: string;
  description?: string;
  paymentProofString: string;
  amount: number;
  currencyId: string;
  rowNum: number;
}
