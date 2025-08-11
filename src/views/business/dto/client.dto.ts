import {Currency} from "@/views/business/dto";

export interface Client {
  id: string;
  surname: string;
  firstName: string;
  internalCode: string;
  invoiceEntity: string;
  email: string;
  useBalance: boolean;
  currency: Currency
  isCompleteInvoice: "0" | "1";
  isChronologicalOrder: "0" | "1";
}
