import {Currency} from "@/views/business/dto/currency.dto";

export interface ShopResponse {
  shopCode: string;
  clientCode: string;
  clientName: string;
  currency: Currency;
  defaultSkuZhName?: string;
}
export interface ShopByClient {
  clientCode: string;
  clientName: string;
  currency: Currency;
  shops: string[];
}
export interface Shop {
  id: string;
  erpCode: string;
  ownerId: string;
  name: string;
  website: string;
  shippingDiscount: number;
  orderServiceFee: number;
  active: "0" | "1";
  shopifyPrefix: string;
  shopifyToken: string;
  packagingMaterialFee: number;
  defaultSkuZhName: string;
}
