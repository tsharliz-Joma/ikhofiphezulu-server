import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import { ApiError, Client, Environment } from "square";
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const client = new Client({
  environment: Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

export { client, ApiError };
