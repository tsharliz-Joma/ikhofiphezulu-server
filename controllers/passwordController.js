const PasswordModel = require("../models/Password");
const { getCurrentPassword } = require("../passwordManager");

const fetchPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const currentPwd = await getCurrentPassword();
    if (password === currentPwd) {
      return res.json({ status: "ok", message: "Password matched" });
    } else {
      return res.json({ status: "error", message: "Password does not match" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = fetchPassword;
