const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const adminLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(500).json({ status: "error", errors: errors.array() });
  }

  try {
    const admin = await Admin.findOne({
      email: req.body.email,
    });
    if (!admin) {
      return res.status(404).json({ status: "error", error: "Incorrect Credentials" });
    }
    const isPasswordValid = await bcrypt.compare(req.body.password, admin.pwd);
    if (!isPasswordValid) {
      return res.status(404).json({ status: "error", error: "Incorrect Credentials" });
    }
    const token = jwt.sign(
      {
        id: admin._id,
        name: admin.user,
        email: admin.email,
        isAdmin: admin.admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRY || "7h" }
    );

    return res.json({ status: "ok", user: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { adminLogin };
