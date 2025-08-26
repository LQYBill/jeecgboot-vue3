export default {
  invoice: {
    step0: "Please select the status of orders you want to invoice.",

    step1: "Please select a customer.",
    tip1: "You can filter by customer initials or customer code",

    option2: "(Optional : You can also filter by shop, by default all shops are selected.)",
    step2: "Please select a shipping time period and at least 1 warehouse location.",

    option2_1: "(Optional : You can also filter by shop, by default all shops are selected.)",
    step2_1: "Please select an order time period and least 1 warehouse location.",

    step3: "Please choose how you want to select orders.",
    tip3: "\"Manual selection\" : you can view and pick each order you want to invoice -" +
  "\"Select All\" : to invoice all available orders",

    step4: "Click on the search button to load available orders",

    option5: "(Optional : You can sync orders by pressing the sync button.)",
    step5: "Select orders to be invoiced and the type of invoice.",

    step6: "Nothing to invoice, press clear all to start over.",
    type6: "error",

    step7: "Finally, select the type of invoice to generate.",
    tip7: "\"Shipping Invoice\" : to generate 2xxx type invoice-" +
  "\"Complete Invoice\" : to generate 7xxx type invoice.",
  },
  purchaseInvoice: {
    line1 :"All the purchase orders are listed here.",
    line2: "You can create an entry for manually created purchase orders, using the following button : ",
    line3: "You can also create an order on Mabang if the selected orders have already been paid with proofs deposited with the following button : ",
  },
  paymentReview: {
    line1: 'This page lists purchase and shipping orders that require payment review.',
    line2: "You can create an entry for manually created purchase  or shipping orders, using the following button : ",
    line3: 'If an order is fully paid and the payment proof has been uploaded, setting Payment Review to "Approved" will automatically set all platform orders linked to 2/7 invoices to "Preparing" in Mabang. You can also select orders (multi-select supported) and click this button to create purchase orders in Mabang.',
  },
  verifyingSkus: "Verifying SKUs consistency"
}


