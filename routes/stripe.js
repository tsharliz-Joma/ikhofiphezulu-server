const express = require("express");
const { createCheckoutSession } = require("../controllers/stripeController");
const StripeRouter = express.Router();

StripeRouter.post("/create-checkout-session", createCheckoutSession);

module.exports = StripeRouter;
