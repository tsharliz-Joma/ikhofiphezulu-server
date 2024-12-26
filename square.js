const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const { ApiError, Client, Environment } = require("square");
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const client = new Client({
  environment: Environment.Production,
  bearerAuthCredentials: {
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
  },
});

module.exports = { client, ApiError };
