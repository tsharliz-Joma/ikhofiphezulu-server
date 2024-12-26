const express = require("express");
const {createPayment, getCatalog } = require("../controllers/squareController");

const SquareRouter = express.Router();

SquareRouter.get("/catalog", getCatalog)
SquareRouter.post("/square-pay", createPayment);

module.exports = SquareRouter;
