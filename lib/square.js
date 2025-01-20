const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});
const {ApiError, Client, Environment} = require("square");
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const client = new Client({
  environment: process.env.SANDBOX_MODE ? Environment.Sandbox : Environment.Production,
  bearerAuthCredentials: {
    accessToken: process.env.SANDBOX_MODE
      ? process.env.SQUARE_SANDBOX_TOKEN
      : process.env.SQUARE_ACCESS_TOKEN,
  },
});

module.exports = {client, ApiError};
