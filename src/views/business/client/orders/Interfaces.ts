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
  reason: string;
}
export interface OrderActionResponse {
  failures: string[];
  successes: string[];
}
