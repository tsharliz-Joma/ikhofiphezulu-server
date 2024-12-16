const express = require("express");
const fetchPassword = require("../controllers/passwordController");
const PasswordRouter = express.Router();

PasswordRouter.post("/password", fetchPassword);

module.exports = PasswordRouter;
