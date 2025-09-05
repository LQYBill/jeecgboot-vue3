import { defineStore } from 'pinia';
import {
  setModifyingInvoice,
  getModifyingInvoice,
  removeModifyingInvoice,
} from '/@/utils/cache/modifyingInvoice';

export const useInvoiceStore = defineStore('invoice', {
  state: () => ({
    modifyingInvoiceNumber: getModifyingInvoice(),
  }),
  actions: {
    setModifyingInvoiceNumber(invoiceNumber: string) {
      this.modifyingInvoiceNumber = invoiceNumber;
      setModifyingInvoice(invoiceNumber);
    },
    clearModifyingInvoiceNumber() {
      this.modifyingInvoiceNumber = '';
      removeModifyingInvoice();
    },
  },
});
