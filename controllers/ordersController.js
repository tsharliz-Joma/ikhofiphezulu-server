const CoffeeModel = require("../models/Coffee");
import sendText from "../clickSendApi";
import { coffeeObject } from "../helperFunctions";

const viewOrders = async (req, res) => {
  try {
    const orders = await CoffeeModel.find({});
    if (orders.length === 0) {
      return res.json({ status: "error", error: "No Coffee Orders" });
    } else {
      return res.json({ status: "ok", orders: orders });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", error: "Error Fetching Orders" });
  }
};

const createOrder = async (req, res) => {
  const coffee = new CoffeeModel(coffeeObject(req));
  try {
    const savedCoffee = await coffee.save();
    return res.json({ status: "ok", coffee: savedCoffee });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

const completeOrder = async (req, res) => {
  const coffee = coffeeObject(req);
  try {
    // sendTeamsMessage(token, Ikhofi.userId)
    const data = await sendText(coffee.number, coffee.coffeeName);
    if (data.response_code === "SUCCESS") {
      await CoffeeModel.deleteOne(coffee);
      res.json({ status: "ok", message: "Coffee sent and deleted" });
    } else {
      res.status(400).json({ status: "error", message: "Failed to send coffee" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

const updateStatus = async (req, res) => {
  const coffee = coffeeObject(req);
  try {
    // sendTeamsMessage(token, Ikhofi.userId)
    const data = await sendText(coffee.number, coffee.coffeeName);
    if (data.response_code === "SUCCESS") {
      await CoffeeModel.deleteOne(coffee);
      res.json({ status: "ok", message: "Coffee sent and deleted" });
    } else {
      res.status(400).json({ status: "error", message: "Failed to send coffee" });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { createOrder, viewOrders, completeOrder, updateStatus };
