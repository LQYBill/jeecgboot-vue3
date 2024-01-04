export default {

  billableOrders: {
    billableOrdersBreakdown: '可开票订单详细分解',
  },
  transaction: {
    accountTransactions: "账户交易",
    amount: "金额",
    attachments: "附件",
    credit: "Credit",
    debit: "Debit",
    paymentProof: "付款证明",
    type: "交易类型",
  },
  client: {
    familyName: "姓",
    firstName: "名",
    email: "邮箱",
    telephone: "电话",
    city: "城市",
    country: "国家",
    currency: "货币",
    preferredCurrency: "首选货币",
    postCode: "邮编",
    accountBalance: "账户余额",
    estimatedBalance: "预计账户余额",
  },
  order: {
    abnormalOrder: "异常订单",
    Content: "订单内容",
    deliveryTime: "交易时间",
    items: "项",
    inStock: "有货",
    normalOrder: "正常订单",
    Num: "订单编号",
    orders: "订单",
    ordered: "采购中",
    outOfStock: "缺货",
    pending: "待处理",
    shipped: "已发货",
    shippedUninvoicedOrdersVolume: "已发货未开票订单量",
    shippedUninvoicedOrdersAmountToBill: "已发货未开票应收款",
    preparing: "配货中",
    transNum: "订单交易号",
    transTime: "订单交易时间",
    trackingNum: "订单追踪号",
    unshippedOrdersVolume: "未发货订单量",
  },
  recipient: {
    recipient: "收件人",
    country: "目的国家",
    postalCode: "邮编"
  },
  logistics: {
    registerFee: "挂号费",
    invoiceNum: "物流发票号"
  },
  form: {
    SignIn: "登录",
    InsertUsername: "请输入帐户名",
    Password: "密码",
    Confirm: "确定",

    defaultAllShopSelected: "不选默认所有店铺",
    defaultAllWarehouseSelected: "不选默认所有仓库",
    invoiceMode: "发票模式",
    invoiceType: "发票类型",
    manualSelect: "手动选择",
    orderSelectMode: "选择模式",
  },
  invoice: {
    additionalFees: "额外费用",
    allShippingInvoice: "按店铺开发票",
    clientId: '客户ID',
    completeInvoice: "完整发票",
    country: "国家",
    createBy: "创建人",
    createDate: "创建日期",
    customer: "客户",
    customerCode: "客户代码",
    date: "日期",
    description: "描述",
    details: "明细",
    discountAmount: "减免金额",
    downloadDetails: "下载发票详情",
    downloadInvoice: "下载发票",
    effectiveDate: "生效日期",
    erpStatus: "ERP中状态",
    estimatedFeesForSelectedOrders: "当前已选择订单预计费用",
    export: "导出",
    finalAmount: "最终金额",
    fretFee: "挂号费",
    generateCompleteInvoice: "生成完整发票文件",
    generateDocument: "生成文件",
    generateInvoice: "生成发票文件",
    generateInvoice7post: "生成完整（物流收后+采购）发票文件",
    generateInvoice7pre: "生成完整（物流 + 采购）发票文件",
    generatePurchaseInvoice: "生成采购发票文件",
    generateShippingInvoice: "生成物流发票文件",
    invoiceNumber: "发票号码",
    invoiceType: "发票类型",
    invoiceMode: "发票模式",
    invoicingPage: "生成发票页",
    invoiceType: "发票类型",
    logisticChannel: "物流渠道",
    logisticChannelCode: "渠道代码",
    logisticChannelName: "渠道名称",
    noOrdersSelected: "尚未选择订单",
    orderQty: "订单数量",
    orderList: "订单列表",
    orderTime: "订单交易时间",
    paid: "已付费",
    paidAmount: "已付金额",
    platformOrderID: "平台订单号码",
    platformOrderIDMabang: "平台订单ID(马帮订单号)",
    platformOrderContentList: "平台订单内容内嵌列表",
    platformOrderNumber: "平台订单交易号",
    preShippingInvoice: "预收物流发票",
    productAvailable: "是否有货",
    purchaseFee: "T商品采购总费用",
    purchaseInvoice: "采购发票",
    quantity: "数量",
    receiveDetailsByEmail: "发送发票详情到电子邮箱",
    recipient: "订单收件人",
    recipientCountry: "订单收件人国家",
    serviceFee: "服务总费用",
    shippingFee: "运费",
    shippingFees: "运费",
    shippingFeesEstimationForSelectedOrders: "当前已选择订单预计物流费用",
    shippingInvoice: "物流发票",
    shippingTime: "订单发货时间",
    shop: "店铺",
    shopID: "店铺ID",
    skuPurchaseStatus: "SKU采购状态",
    skuQty: "SKU数量",
    startDate: "开始时间",
    storeID: "商店ID",
    subTotal: "小计",
    toReview: "待审核订单",
    total: "总数",
    totalAmount: "应付金额",
    totalAmountDue: "应付金额",
    totalShippingFee: "物流总费用",
    totalShippingFees: "总运费",
    trackingNumber: "物流跟踪号",
    unitPrice: "单价",
    vat: "增值税",
    warehouse: "发货仓库",
    warehouseInChina: "仅中国仓库",
    warehouseAbroad: "仅海外仓库",
    allWarehouse: "所有仓库",

    error: {
      noShopFoundForClient: "没有找到当前客户的相关店铺信息.",
    },
    purchase: {
      orderAttributionFail : "记录订单采购发票号时出错 : [%{var}]",
      orderAttributionSuccess : "订单采购发票号记录成功 : [%{var}]",
    },
  },
  refund: {
    notRefunded: '未退款',
    refunded: '已退款',
    fretFeeRefundAmount: "挂号费应退款金额",
    purchaseRefund: "采购退款",
    purchaseRefundAmount: "采购退款金额",
    refundDate: '退款日期',
    refundInvoiceNumber: '退款发票号',
    refundReason: '退款原因',
    refundStatus: "退款状态",
    serviceFeeRefundAmount: '服务费应退款金额',
    shippingRefund: "运费退款",
    shippingRefundAmount: '运费应退款金额',
    totalRefundAmount: '实际退款总金额',
    tvaRefundAmount: 'TVA应退款金额',
  },
  shipping: {
    destination: "目的地",
    weight: "重量",
    volume: "体积",
    width: "宽",
    height: "高",
    length: "长",
    gram: "克",
  },
  product: {
    productListPage: '商品列表',
    code: '代码',
  },
  upload: {
    inventoryRecap: "库存状态",
    noDocument: "无文件",
    xlsCsvPdfOnly: "只接受 Excel, CSV 和 PDF 文件."
  },
  tips : {
    invoiceModeTip: "物流发票: 已发货订单<br/>"+
                    "预收物流发票: 待处理和配货中的订单<br/>"+
                    "按店铺开发票: 待处理，配货中和已发货的订单",
    orderSelectModeTip: "从列表中勾选订单或自动选所有符合条件的订单",
  },
  Client: "客户",
  Invoice: "发票",
  abbreviation: "缩写",
  welcome: "欢迎",
  enName: '英文名称',
  zhName: '中文名称',
}
