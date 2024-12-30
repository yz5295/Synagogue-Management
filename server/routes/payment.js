const express = require("express");
const router = express.Router();
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_ID);

router.get("/publishable-key", (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

const calculateOrderAmount = (items) => {
  let total = 100;
  items.forEach((item) => {
    total *= item.amount;
  });
  return total;
};

router.post("/create-payment-intent", async (req, res) => {
  const { items, customerDetails } = req.body;

  const customer = await stripe.customers.create({
    name: customerDetails.name,
    email: customerDetails.email,
    phone: customerDetails.phone,
    description: customerDetails.description,
    address: {
      country: "IL",
    },
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    metadata: {},
    currency: "ILS",
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
    dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
  });
});

module.exports = router;
