export interface Sku {
  id?: string,
  erpCode: string,
  zhName: string,
  enName: string,
  weight?: number,
  weightEffectiveDate?: Date | string,
  availableAmount: number,
  purchasingAmount: number,
  qtyOrdered?: number,
  qtyInOrdersNotShipped?: number,
  stock?: number,
  imageSource?: string,
  shippingDiscount: number,
  serviceFee: number,
  /**
   * Status
   * 1:自动创建;2:待开发;3:正常;4:清仓;5:停止销售"
   * default : 3
   */
  status: 1 | 2 | 3 | 4 | 5,
  moq?: number,
  sensitiveAttribute?: string,
  isGift: number,
  skuPrice?: number,
  skuPriceEffectiveDate?: Date | string,
  declareEname?: string,
  declareName?: string,
  declaredValue?: number,
  declaredValueEffectiveDate?: Date | string,
  salesLastWeek?: number,
  salesFourWeeks?: number,
  salesSixWeeks?: number,

  supplier?:string,
  supplierLink?:string,
}
