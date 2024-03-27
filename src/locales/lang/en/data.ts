export default {

  billableOrders: {
    billableOrdersBreakdown: 'Billable Orders Breakdown',
  },
  transaction: {
    accountTransactions: "Account Transactions",
    amount: "Amount",
    attachments: "Attachments",
    credit: "Credit",
    debit: "Debit",
    paymentProof: "Payment Proof",
    type: "Type",
  },
  client: {
    familyName: "Last Name",
    firstName: "First Name",
    email: "Email",
    telephone: "Telephone",
    city: "City",
    country: "Country",
    currency: "Currency",
    preferredCurrency: "Preferred Currency",
    postCode: "Postal Code",
    accountBalance: "Account Balance",
    estimatedBalance: "Estimated Balance",
  },
  order: {
    abnormalOrder: "Abnormal",
    Content: "Order Content",
    createOrder: "Create Order",
    createOrderConfirmation: "Confirm Creating Order ?",
    createSkuOrderConfirmationContent1: "You are about to order",
    createSkuOrderConfirmationContent2: ", for a total of",
    deliveryTime: "Delivery Time",
    items: "items",
    inStock: "In Stock",
    normalOrder: "Normal",
    Num: "Order Number",
    orders: "orders",
    ordered: "Ordered",
    outOfStock: "Out of Stock",
    pending: "Pending",
    placeOrder: "Place Order",
    preparing: "Preparing",
    shipped: "Shipped",
    shippedUninvoicedOrdersAmountToBill: "Shipped & Uninvoiced Orders Amount to Bill",
    shippedUninvoicedOrdersVolume: "Shipped & Uninvoiced Orders Volume",
    stock: "Stock",
    unshippedOrdersVolume: "Unshipped Orders Volume",
    transNum: "Transaction Number",
    transTime: "Transaction time",
    trackingNum: "Tracking Number",
  },
  recipient: {
    recipient: "Recipient",
    country: "Destination Country",
    postalCode: "zip code"
  },
  logistics: {
    registerFee: "FRET Fees",
    invoiceNum: "Shipping Invoice Number"
  },
  form: {
    SignIn: "Sign In",
    InsertUsername: "Login",
    Password: "Password",
    Confirm: "Confirm",

    defaultAllShopSelected: "Leave empty to select all shops",
    defaultAllWarehouseSelected: "Leave empty to select all warehouses",
    invoiceMode: "Invoice mode",
    invoiceType: "Invoice type",
    manualSelect: "Manual selection",
    orderSelectMode: "Order select Mode",
  },
  invoice: {
    additionalFees: "Additional Fees",
    allShippingInvoice: "All Shipping Invoice",
    clientId: 'Client ID',
    completeInvoice: "Complete Invoice",
    country: "Country",
    createBy: "Created By",
    createDate: "Create Time",
    customer: "Customer",
    customerCode: "Customer Code",
    date: "Date",
    description: "Description",
    details: "Details",
    discountAmount: "Discount Amount",
    downloadDetails: "Download Details",
    downloadInvoice: "Download Invoice",
    effectiveDate: "Effective Date",
    erpStatus: "ERP Status",
    estimatedFeesForSelectedOrders: "Estimated fees for selected orders",
    export: "Export",
    finalAmount: "Final Amount",
    fretFee: "Fret Fee",
    generateCompleteInvoice: "Generate Complete Invoice",
    generateDocument: "Generate Document",
    generateInvoice: "Generate Invoice",
    generateInvoice7pre: "Generate Invoice (Pre-Shipping + Purchase)",
    generateInvoice7post: "Generate Invoice (Post-Shipping + Purchase)",
    generatePurchaseInvoice: "Generate Purchase Invoice",
    generateShippingInvoice: "Generate Shipping Invoice",
    invoiced: 'Invoiced',
    invoiceNumber: "Invoice Number",
    invoiceType: "Invoice type",
    invoiceMode: "Invoice mode",
    logisticChannel:"Logistic Channel",
    logisticChannelCode: "Logistic Channel Code",
    logisticChannelName: "Logistic Channel Name",
    noOrdersSelected: "No Order Selected",
    orderQty: "Order Quantity",
    orderList: "Order List",
    orderTime:"Order Time",
    paid: "Paid",
    paidAmount: "Paid Amount",
    platformOrderID: "Platform Order ID",
    platformOrderIDMabang: "Platform Order ID (Mabang Order Number)",
    platformOrderContentList: "List of platform order content",
    platformOrderNumber: "Platform Order Number",
    preShippingInvoice: "Pre-Shipping Invoice",
    productAvailable: "In Stock",
    purchaseFee: "Purchase Fee",
    purchaseInvoice: "Purchase invoice",
    quantity: "Quantity",
    receiveDetailsByEmail: "Receive Details By Email",
    recipient:"Recipient",
    recipientCountry: "Recipient Country",
    serviceFee: "Service Fee",
    shippingFee: "Shipping Fee",
    shippingFees: "Shipping Fees",
    shippingFeesEstimationForSelectedOrders: "Shipping Fees estimation for selected orders",
    shippingInvoice: "Shipping Invoice",
    shippingTime: "Shipping Time",
    shop: "Shop",
    shopID: "Shop ID",
    skuPurchaseStatus: "SKU Purchase Status",
    skuQty: "SKU Quantity",
    startDate: "Start Date",
    storeID: "Store name",
    subTotal: "Sub-total",
    toReview: "Needs Review",
    total: "Total",
    totalAmount: "Total Amount",
    totalAmountDue: "Total Amount Due",
    totalShippingFee: "Total Shipping Fee",
    totalShippingFees: "Total Shipping Fees",
    trackingNumber: "Tracking Number",
    unitPrice: "Price per Unit",
    vat: "VAT",
    warehouse: "Warehouse",
    warehouseInChina: "Warehouse inside China",
    warehouseAbroad: "Warehouse outside China",
    allWarehouse: "All warehouses",

    error: {
      noShopFoundForClient: "No relevant store information was found for the current customer.",
    },
  },
  purchase: {
    orderAttributionFail : "Error while attributing purchase order to orders [%{var}]",
    orderAttributionSuccess : "Purchase order was successfully attributed to orders [%{var}]",
    mabangOrderCreateFailForInvoices : "Error while creating Mabang order for invoice(s) %{var}, please delete the orders corresponding to the invoices in Mabang.",
    mabangOrderCreateSuccessForInvoices : "Mabang order was successfully created for invoice(s) %{var}",
  },
  refund: {
    notRefunded: 'Not Settled',
    refunded: 'Settled',
    fretFeeRefundAmount: "Fret Free Refund Amount",
    purchaseRefund: "Purchase Refund",
    purchaseRefundAmount: "Purchase Refund Amount",
    refundDate: 'Refund Date',
    refundInvoiceNumber: 'Refund Invoice Number',
    refundReason: 'Refund Reason',
    refundStatus: "Refund Status",
    serviceFeeRefundAmount: 'Service Fee Refund Amount',
    shippingRefund: "Shipping Fee Refund",
    shippingRefundAmount: 'Shipping Fee Refund Amount',
    totalRefundAmount: 'Total Refund Amount',
    tvaRefundAmount: 'TVA Refund Amount',
  },
  shipping: {
    destination: "Destination",
    weight: "Weight",
    volume: "Volume",
    width: "Width",
    height: "Height",
    length: "Length",
    gram: "gram",
  },
  sku: {
    availableAmount: 'Available Amount',
    discountedPrice: 'Discounted Price',
    discountMOQ: 'Discount MOQ',
    erpCode: 'Erp Code',
    imageSource: 'Image Source',
    missingPrice: 'Missing Price',
    purchasingAmount: 'Purchasing Amount',
    quantityInOrders: 'Quantity In Orders',
    sales: 'Sales',
    serviceFee: 'Service Fee',
    shippingDiscount: 'Shipping Discount',
    skuPrice: 'Sku Price',
    volumeSoldDuringPeriod: "Volume sold during last [%{var}] days",

    availableAmountHelpMessage: "Available Amount - Purchasing Amount - Quantity In Orders",
    autoPickerHelpMessage: '(60% of the sales for the last 7 days) + (30% of the sales for the last 28 days) + (10% of the sales for the last 42 days) = quantities for 1 day',
  },
  product: {
    product: "Product",
    productListPage: 'Product List',
    code: 'Code',
  },
  upload: {
    inventoryRecap: "Inventory Recap",
    noDocument: "No Document",
    xlsCsvPdfOnly: "Only Excel sheets, CSV files and PDF files are accepted."
  },
  tips : {
    invoiceModeTip: "Shipping: shipped orders<br/>"+
                    "Pre-Shipping: pending orders and orders in preparation<br/>"+
                    "All Shipping Invoice: shipped, pending and in preparation orders",
    orderSelectModeTip: "You can manually select orders to invoice, or automatically select all available orders",
  },
  pageTitle: {
    invoicingPage: "Invoicing page",
    productOrderPage: "Product Order Page",
    purchaseOrderManagementPage : "Purchase Order Management",
  },
  Client: "Client",
  Invoice: "Invoice",
  abbreviation: "Abbreviation",
  welcome: "Welcome",
  enName: "En name",
  zhName: "Zh name",
  noData: "No Data",
}
