import { useI18n } from '@/hooks/web/useI18n';
import {BasicColumn} from "@/components/Table";

const { t } = useI18n();

export const instructionMessageList = [
  {
    text: t('guide.invoice.step0'),
    step: 0,
  },
  {
    text: t('guide.invoice.step1'),
    step: 1,
  },
  {
    option: t('guide.invoice.option2'),
    text: t('guide.invoice.step2'),
    step: 2,
  },
  {
    text: t('guide.invoice.step3'),
    tip: t('guide.invoice.tip3'),
    step: 3,

  },
  {
    text: t('guide.invoice.step4'),
    step: 4,
  },
  {
    option: t('guide.invoice.option5'),
    text: t('guide.invoice.step5'),
    step: 5,
  },
  {
    text: t('guide.invoice.step6'),
    type: "error",
    step: 6,
  },
  {
    text: t('guide.invoice.step7'),
    tip: t('guide.invoice.tip7'),
    step: 7,
  },
  {
    option: t('guide.invoice.option2_1'),
    text: t('guide.invoice.step2_1'),
    step: 8,
  },
];

export const columns: BasicColumn[] = [
  {
    title: t("data.invoice.shopID"),
    align:"center",
    sorter: true,
    dataIndex: 'shopId_dictText',
  },
  {
    title: t("data.invoice.logisticChannel"),
    align:"center",
    sorter: true,
    dataIndex: 'logisticChannelName_dictText',
    slots: {customRender: 'logisticChannelName'}
  },
  {
    title: t("data.invoice.platformOrderID"),
    align:"center",
    sorter: true,
    dataIndex: 'platformOrderId'
  },
  {
    title: t("data.invoice.platformOrderNumber"),
    align:"center",
    sorter: true,
    dataIndex: 'platformOrderNumber'
  },
  {
    title: t("data.invoice.trackingNumber"),
    align:"center",
    sorter: true,
    dataIndex: 'trackingNumber'
  },
  {
    title: t("data.invoice.orderTime"),
    align:"center",
    sorter: true,
    dataIndex: 'orderTime'
  },
  {
    title: t("data.invoice.country"),
    align:"center",
    sorter: true,
    dataIndex: 'country'
  },
  {
    title: t("data.invoice.erpStatus"),
    align:"center",
    sorter: true,
    dataIndex: 'erpStatus',
    slots: {customRender: 'erpStatus'},
  },
  {
    title: t("data.order.inStock"),
    align:"center",
    sorter: true,
    dataIndex: 'productAvailable',
    slots: {customRender: 'productAvailability'},
  },
  {
    title: t("data.invoice.toReview"),
    align:"center",
    sorter: true,
    dataIndex: 'canSend',
    slots: {customRender: 'toReview'},
  },
  {
    title: t("data.order.hasDesyncedSku"),
    align:"center",
    sorter: true,
    dataIndex: 'hasDesyncedSku',
    slots: {customRender: 'hasDesyncedSku'},
  }
];


export const pocColumns: BasicColumn[] = [
  {
    title: t("data.invoice.platformOrderID"),
    align: 'center',
    dataIndex: 'platformOrderId_dictText'
  },
  {
    title: 'SKU ID',
    align: 'center',
    dataIndex: 'skuId_dictText'
  },
  {
    title: t("data.invoice.skuQty"),
    align: 'center',
    dataIndex: 'quantity',
  },
  {
    title: t("data.invoice.purchaseFee"),
    align: 'center',
    dataIndex: 'purchaseFee',
  },
  {
    title: t("data.invoice.shippingFee"),
    align: 'center',
    dataIndex: 'shippingFee',
  },
  {
    title: t("data.invoice.serviceFee"),
    align: 'center',
    dataIndex: 'serviceFee',
  },
  {
    title: t("data.invoice.vat"),
    align: 'center',
    dataIndex: 'vat',
  },
  {
    title: t("data.invoice.erpStatus"),
    align: 'center',
    dataIndex: 'erpStatus',
    slots: { customRender: 'erpStatus' },
  },
  {
    title: t("data.invoice.productAvailable"),
    align: 'center',
    dataIndex: 'productAvailable',
    slots: { customRender: 'productAvailable' },
  },
  {
    title: t('data.sku.isSynced'),
    align: 'center',
    dataIndex: 'isSynced',
    slots: { customRender: 'isSynced' },
  }
];
