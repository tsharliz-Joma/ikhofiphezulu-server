const express = require("express");
const {
  viewOrders,
  updateStatus,
  completeOrder,
  createOrder,
} = require("../controllers/ordersController");
const OrderRouter = express.Router();

OrderRouter.get("/orders", viewOrders);
OrderRouter.post("/orders", createOrder);
OrderRouter.post("/orders/updateStatus", updateStatus);
OrderRouter.post("/completeOrder", completeOrder);

module.exports = OrderRouter;
