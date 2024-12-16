const mongoose = require("mongoose");

const PasswordSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Password = mongoose.model("Password", PasswordSchema);
module.exports = Password;
