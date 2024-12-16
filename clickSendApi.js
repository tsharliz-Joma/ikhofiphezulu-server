require("dotenv").config({ path: "./config.env" });
var api = require("./clicksend-fix/api.js");

var smsMessage = new api.SmsMessage();

var smsApi = new api.SMSApi(process.env.CLICKSEND_EMAIL, process.env.CLICKSEND_API);

var smsCollection = new api.SmsMessageCollection();

smsCollection.messages = [smsMessage];

const sendText = async (recipient, coffee) => {
  smsMessage.from = "CoffeeUp";
  smsMessage.to = `+61${recipient}`;
  smsMessage.body = `Good Morning. Your ${coffee} is ready`;

  return smsApi
    .smsSendPost(smsCollection)
    .then(function (response) {
      return response.body;
    })
    .catch(function (err) {
      console.error(err.body);
      return err.body;
    });
};

module.exports = sendText;
