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
