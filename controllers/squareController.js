const { ApiError, client: square } = require("../square");
const { nanoid } = require("nanoid");
const { json } = require("micro");

const createPayment = async (req, res) => {
  const payload = await json(req);
  try {
    const idempotencyKey = payload.idempotencyKey || nanoid(); // This checks if there is a idempotencyKey created if not it uses nanoid to generate one
    const order = {
      idempotencyKey,
      locationId: payload.locationId,
      customerId: payload.customerId,
      lineItems: [req.body],
    };
    const response = await square.checkoutApi.createPaymentLink(order);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
  const response = await square.checkoutApi.createPaymentLink({
    idempotencyKey: "6ee87123-22c3-4dbc-8115-301b7a46e88c",
    order: {
      locationId: "L8H7QF5J9J07J",
      customerId: "charles",
      lineItems: [
        {
          name: "Latte",
          quantity: "1",
          itemType: "ITEM",
          metadata: {
            milk: "full cream",
          },
          basePriceMoney: {
            amount: 500,
            currency: "AUD",
          },
        },
        {
          name: "Latte",
          quantity: "1",
          itemType: "ITEM",
          metadata: {
            milk: "full cream",
          },
          basePriceMoney: {
            amount: 750,
            currency: "AUD",
          },
        },
      ],
    },
  });

  console.log(response.result.relatedResources);
};

createPayment();
