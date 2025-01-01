const { verify } = require("crypto");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
// const { bigint } = require("square/dist/types/schema");

const coffeeObject = (req) => {
  const ikhofi = {
    name: req.body.name,
    number: req.body.number,
    email: req.body.email,
    coffeeName: req.body.coffeeName,
    coffeeMilk: req.body.coffeeMilk,
    coffeeSize: req.body.coffeeSize,
    userId: req.body.userId,
    getValues() {
      return {
        name: this.name,
        number: this.number,
        email: this.email,
        coffeeName: this.coffeeName,
        coffeeMilk: this.coffeeMilk,
        coffeeSize: this.coffeeSize,
        userId: this.userId,
      };
    },
  };
  return ikhofi.getValues();
};

const encrypt = async (req, len) => {
  const encryptedInfo = {
    name: req.body.name,
    bcryptEmail: req.body.email,
    email: req.body.email,
    bcryptPassword: req.body.password,
    bcryptNumber: req.body.mobileNumber,
    async encryptData() {
      return {
        name: this.name,
        email: this.email,
        bcryptPassword: await bcrypt.hash(this.bcryptPassword, len),
        bcryptEmail: await bcrypt.hash(this.bcryptEmail, len),
        bcryptNumber: await bcrypt.hash(this.bcryptNumber, len),
      };
    },
  };
  return await encryptedInfo.encryptData();
};

const decrypt = async (req, user) => {
  const validatedInfo = {
    email: req.body.email,
    password: req.body.password,
    async compareValues() {
      return {
        email: await bcrypt.compare(this.email, user.hashedEmail),
        password: await bcrypt.compare(this.password, user.password),
      };
    },
  };
  return await validatedInfo.compareValues();
};

const verifyToken = (req, res, next) => {
  const token = req.header("admin-access-token");
  if (!token) return res.status(403).json({ status: "error", message: "Access Denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ status: "error", message: "Invalid Token" });
  }
};

const formatPriceAUD = (amountInCents) => {
  const amount = typeof amountInCents === "bigint" ? Number(amountInCents) : amountInCents;

  if (typeof amount !== "number" || isNaN(amount)) {
    return "$0.00"; // Fallback for invalid values
  }

  return `$${(amount / 100).toFixed(2)}`;
};

module.exports = { coffeeObject, encrypt, decrypt, verifyToken, formatPriceAUD };
