const crypto = require("crypto");
const Password = require("./models/Password");
const cron = require("node-cron");

const generatePassword = (length = 16) => {
  return crypto.randomBytes(length).toString("hex");
};

const initializePassword = async () => {
  // Check if a password exists
  const exist = await Password.findOne({});
  if (!exist) {
    const password = generatePassword();
    await Password.create({ value: password });
  }
};

const rotatePassword = async () => {
  const newPassword = generatePassword();
  await Password.deleteMany({});
  await new Password({ value: newPassword }).save();
};

// Schedule password rotation
// rotates on the first day of every month
cron.schedule("0 0 1 * *", async () => {
  await rotatePassword();
});

const getCurrentPassword = async () => {
  const passwordDoc = await Password.findOne().sort({ createdAt: -1 });
  return passwordDoc ? passwordDoc.value : null;
};

module.exports = { initializePassword, getCurrentPassword };
