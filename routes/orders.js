const express = require("express");
const {
  viewOrders,
  updateOrder,
  sendOrder,
  createOrder,
} = require("../controllers/ordersController");
const OrderRouter = express.Router();

OrderRouter.get("/orders", viewOrders);
OrderRouter.post("/orders", createOrder);
OrderRouter.post("/orders/updateStatus", updateOrder);
OrderRouter.post("/completeOrder", sendOrder);

module.exports = OrderRouter;
