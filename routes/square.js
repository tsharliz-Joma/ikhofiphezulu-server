const express = require("express");
const { body } = require("express-validator");
const createPayment = require("../controllers/squareController");

const SquareRouter = express.Router();

SquareRouter.post("/square-pay", createPayment);

module.exports = SquareRouter;
