require("dotenv").config({ path: "./config.env" });
const axios = require("axios");
const teamsApiEndpoint = "https://graph.microsoft.com/1.0/me/messages";

const getToken = async () => {
  const clientObj = {
    clientID: `${process.env.AZURE_CLIENT_ID}`,
    clientSecret: `${process.env.AZURE_CLIENT_SECRET}`,
    tenantID: `${process.env.AZURE_TENANT_ID}`,
    scope: `${process.env.AZURE_SCOPE}`,
  };

  const tokenEndpoint = `https://login.microsoftonline.com/${clientObj.tenantID}/oauth/v2.0/token`;

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", clientObj.clientID);
  params.append("client_secret", clientObj.clientSecret);
  params.append("scope", clientObj.scope);

  try {
    const response = await axios.post(tokenEndpoint, params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const accessToken = response.data.accessToken;
    console.log("Access Token", accessToken);
    return accessToken;
  } catch (error) {
    console.error(`Error getting access token:`, error.response.data);
    throw new Error(`Failed to obtain access token`);
  }
};



const sendTeamsMessage = async (accessToken, userId, message) => {

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const requestBody = {
    to: {
      user: {
        id: userId,
      },
    },
    body: {
      content: message,
    },
  };

  try {
    const response = await axios.post(teamsApiEndpoint, requestBody, {
      headers,
    });
    console.log(`Message send successfully`, response.data);
  } catch (error) {
    console.error(`Error sending message to Teams`, error.response.data);
    throw new Error(`Failed to send message to Teams`);
  }
};

module.exports = sendTeamsMessage, getToken;
