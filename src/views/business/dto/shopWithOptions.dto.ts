export interface ShopWithOptions {
  id: string
  clientId: string;
  isClientActive: boolean;
  shopId: string;
  isShopActive: boolean;
  shopOptionsId: string;
  isAutoInvoice: boolean;
  isBreakdownInvoice: boolean;
  isCompleteInvoice: boolean;
  canSelfInvoice: boolean;
  canSelfP: boolean;
  canSelfL: boolean;
  canSelfPL: boolean;
  isSelfIgnoreStock: boolean;
  hasStock: boolean;
  hasPreshippingInvoiceRemark: boolean;
  hasPostshippingInvoiceRemark: boolean;
  hasShippingInvoiceRemark?: boolean;
  hasOptions: boolean;
}
