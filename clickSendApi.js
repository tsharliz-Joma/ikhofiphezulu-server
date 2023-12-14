require("dotenv").config({ path: "./config.env" });
var api = require("clicksend");

var smsMessage = new api.SmsMessage();

var smsApi = new api.SMSApi(
  process.env.CLICKSEND_EMAIL,
  process.env.CLICKSEND_API,
);

var smsCollection = new api.SmsMessageCollection();

smsCollection.messages = [smsMessage];

const sendText = (recipient, coffee) => {
  smsMessage.from = "CoffeeUp";
  smsMessage.to = `+61${recipient}`;
  smsMessage.body = `Yeah Buddy, ${coffee}, ready`;

  return smsApi
    .smsSendPost(smsCollection)
    .then(function (response) {
      console.log(response.body)
      return response.body;
    })
    .catch(function (err) {
      console.error(err.body);
      return err.body;
    });
};

module.exports = sendText;
