var api = require("clicksend");

var smsMessage = new api.SmsMessage();

var smsApi = new api.SMSApi(
  "charlesjoma@yahoo.com",
  "D7CC8AFE-8E53-9178-0D42-CAC155ECEF01",
);

var smsCollection = new api.SmsMessageCollection();

smsCollection.messages = [smsMessage];

const sendText = (recipient, coffee) => {
  smsMessage.from = "CoffeeUp";
  smsMessage.to = `+61411111111`;
  smsMessage.body = `Yeah Buddy, ${coffee}, ready`;

  return smsApi
    .smsSendPost(smsCollection)
    .then(function (response) {
      return response.body
    })
    .catch(function (err) {
      console.error(err.body);
      return err.body
    });
};

module.exports = sendText
