const mongoose = require("mongoose");

const CoffeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    coffeeName: {
      type: String,
      required: true,
    },
    coffeeMilk: {
      type: String,
      required: false,
    },
    coffeeSize: {
      type: String,
      required: true,
    },
    extras: {
      type: Array,
      required: false,
    },
  },
  { collection: "orders" }
);

const Coffee = mongoose.model("orders", CoffeeSchema);

module.exports = Coffee;
