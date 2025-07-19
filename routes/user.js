const express = require("express");
const { register, login } = require("../controllers/userController");
const { body } = require("express-validator");
const { limiter } = require("../lib/winston.js");
const userRouter = express.Router();

userRouter.use(limiter);
// Register Route
userRouter.post("/register", register);
// Login Route
userRouter.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  login
);

module.exports = userRouter;
