const express = require("express");
const { createPayment, getCatalog, getCatalogItem } = require("../controllers/squareController");

const SquareRouter = express.Router();

SquareRouter.get("/catalog/:id", getCatalogItem);
SquareRouter.post("/catalog/search", getCatalog);
SquareRouter.post("/square-pay", createPayment);

module.exports = SquareRouter;
