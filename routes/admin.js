const express = require("express");
const { body } = require("express-validator");
const { adminLogin } = require("../controllers/adminController");
const { adminLoginLimiter } = require("../server");
const AdminRouter = express.Router();

// Admin Login Route
AdminRouter.post(
  "/adminLogin",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  adminLogin
);

module.exports = AdminRouter;
