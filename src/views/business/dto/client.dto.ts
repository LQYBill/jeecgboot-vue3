import {CurrencyEnum} from "@/views/business/enum";

export interface Client {
  id: string;
  surname: string;
  firstName: string;
  internalCode: string;
  invoiceEntity: string;
  email: string;
  useBalance: boolean;
  currency: CurrencyEnum
  isCompleteInvoice: "0" | "1";
  isChronologicalOrder: "0" | "1";
}
