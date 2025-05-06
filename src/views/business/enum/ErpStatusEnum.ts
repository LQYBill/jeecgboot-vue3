import {useI18n} from "@/hooks/web/useI18n";

const { t } = useI18n();

export const ErpStatusEnum = Object.freeze({
  PENDING: { text: t('data.erpStatus.pending'), value: 1 },
  PREPARING: { text: t('data.erpStatus.preparing'), value: 2 },
  SHIPPED: { text: t('data.erpStatus.shipped'), value: 3 },
  COMPLETED: { text: t('data.erpStatus.COMPLETED'), value: 4 },
  CANCELLED: { text: t('data.erpStatus.cancelled'), value: 5 },
})

export const getErpStatusFromCode = (code: string) => {
  const status = Object.values(ErpStatusEnum).find((status) => status.value === Number(code));
  return status ? status.text : code;
}
