const MODIFYING_INVOICE_KEY = 'MODIFYING_INVOICE_KEY';

export function setModifyingInvoice(invoiceNumber: string) {
  localStorage.setItem(MODIFYING_INVOICE_KEY, invoiceNumber);
}

export function getModifyingInvoice(): string {
  return localStorage.getItem(MODIFYING_INVOICE_KEY) || '';
}

export function removeModifyingInvoice() {
  localStorage.removeItem(MODIFYING_INVOICE_KEY);
}
