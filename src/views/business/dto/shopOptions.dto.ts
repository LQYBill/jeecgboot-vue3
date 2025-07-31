export interface ShopOptions {
  id: string;
  clientId: string;
  isClientActive: boolean;
  shopId: string;
  isShopActive: boolean;
  useBalance: boolean;
  shopOptionsId: string;
  showBalance: boolean;
  balanceThreshold: number;
  isAutoInvoice: boolean;
  isChronologicalOrder: boolean;
  isBreakdownInvoice: boolean;
  isCompleteInvoice: boolean;
  canSelfInvoice: boolean;
  canSelfP: boolean;
  canSelfL: boolean;
  canSelfPL: boolean;
  isSelfIgnoreStock: boolean;
  hasStock: boolean;
  hasShippingInvoiceRemark: boolean;
}
