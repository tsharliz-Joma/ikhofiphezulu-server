const express = require("express");
const { adminLogin } = require("../controllers/adminController");
const { body } = require("express-validator");
const { adminLimiter } = require("../winston.js");
const AdminRouter = express.Router();

AdminRouter.use(adminLimiter);
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
