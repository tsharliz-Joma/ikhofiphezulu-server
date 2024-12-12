const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { encrypt } = require("../helperFunctions");
const { validationResult } = require("express-validator");

const register = async (req, res) => {
  try {
    const encryptdData = await encrypt(req.body.password);
    await User.create(encryptdData);
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Duplicate email" });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ status: "error", error: errors.array() });
  }

  try {
    const userFound = await User.findOne({
      email: req.body.email,
    });

    if (!userFound) {
      res.status(404).json({ status: "error", error: "No account found under these credentials" });
    }
    const data = await decrypt(req, userFound);
    if (data.email && data.password) {
      const token = jwt.sign(
        {
          name: userFound.name,
          email: userFound.email,
          number: userFound.number,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRY || "7h" }
      );
      return res.json({ status: "ok", user: token });
    } else {
      return res.json({ status: "error", user: false });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const adminLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
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
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { register, login, adminLogin };
