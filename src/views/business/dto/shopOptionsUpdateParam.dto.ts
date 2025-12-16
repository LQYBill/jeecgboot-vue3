export interface ShopOptionsUpdateParam {
  id: string;
  shopId: string;
  useBalance?: boolean;
  showBalance?: boolean;
  balanceThreshold?: number;
  isAutoInvoice?: boolean;
  isBreakdownInvoice?: boolean;
  isCompleteInvoice?: boolean;
  canSelfInvoice?: boolean;
  canSelfP?: boolean;
  canSelfL?: boolean;
  canSelfPL?: boolean;
  isSelfIgnoreStock?: boolean;
  hasStock?: boolean;
  hasSelfLogisticsRemark?: boolean;
  showUnassignedLogisticsOrders?: boolean;
}
