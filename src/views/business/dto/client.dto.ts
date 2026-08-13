import {CurrencyEnum} from "@/views/business/enum";

export interface InvoiceEntity {
  id: string;
  clientId?: string;
  invoiceEntity: string;
  country: string;
  currency: CurrencyEnum;
  email: string;
  phone: string;
  companyIdType: string;
  companyIdValue: string;
  iossNumber: string;
  vatPercentage: number;
  active: "0" | "1";
  isDefault?: "0" | "1";
  streetNumber: string;
  streetName: string;
  additionalAddress: string;
  postcode: string;
  city: string;
}

export interface Client {
  id: string;
  surname: string;
  firstName: string;
  internalCode: string;
  useBalance: boolean;
  isCompleteInvoice: "0" | "1";
  isChronologicalOrder: "0" | "1";
  displayBalance: boolean;
  receiveInvoiceByEmail: boolean;
  invoiceEntityList?: InvoiceEntity[];
}
