const { ApiError, client: square } = require("../square");
const { v4: uuidv4 } = require("uuid");

const createPayment = async (req, res) => {
  try {
    console.log(req.body);
    const idempotencyKey = req.idempotencyKey || uuidv4(); // This checks if there is a idempotencyKey created if not it uses nanoid to generate one
    const order = {
      idempotencyKey,
      order: req.body,
    };
    const response = await square.checkoutApi.createPaymentLink(order);
    return res.json({ status: "ok", data: response });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
  //   idempotencyKey: "6ee87123-22c3-4dbc-8115-301b7a46e88c",
  //   order: {
  //     locationId: "L8H7QF5J9J07J",
  //     customerId: "charles",
  //     lineItems: [
  //       {
  //         name: "Latte",
  //         quantity: "1",
  //         itemType: "ITEM",
  //         metadata: {
  //           milk: "full cream",
  //         },
  //         basePriceMoney: {
  //           amount: 500,
  //           currency: "AUD",
  //         },
  //       },
  //       {
  //         name: "Latte",
  //         quantity: "1",
  //         itemType: "ITEM",
  //         metadata: {
  //           milk: "full cream",
  //         },
  //         basePriceMoney: {
  //           amount: 750,
  //           currency: "AUD",
  //         },
  //       },
  //     ],
  //   },
  // });

  // console.log(response.result.relatedResources);
};

module.exports = createPayment;
