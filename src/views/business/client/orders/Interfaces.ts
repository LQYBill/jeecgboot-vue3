export interface PlatformOrderOption {
  value: string;
  label: string;
  erpStatus: string;
  disabled: boolean;
}
export interface PlatformOrderOptionsMap {
  [key: string]: PlatformOrderOption[];
}
export interface OrderActionParam {
  shopId: string;
  orderIds: string;
  action: string;
  reason?: string;
  recipient?: string;
  phone?: string;
  street1?: string;
  street2?: string;
}
export interface OrderActionResponse {
  failures: string[];
  successes: string[];
}
export enum OperationEnum {
  SUSPEND = 'Suspend',
  CANCEL = 'Cancel',
  EDIT = 'Edit',
}
export interface Recipient {
  recipient: string;
  phone: string;
  street1: string;
  street2: string;
}
