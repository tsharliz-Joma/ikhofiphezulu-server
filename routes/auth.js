const express = require("express");
const { register, login, adminLogin } = require("../controllers/authController");
const { body } = require("express-validator");
const adminLoginLimiter = require("../server");
const AuthRouter = express.Router();

// Register Route
AuthRouter.post("/register", register);

// Login Route
AuthRouter.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  login
);

module.exports = AuthRouter;
