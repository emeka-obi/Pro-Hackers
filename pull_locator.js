// var request = require('request');
// var req = request.defaults();
// var fs = require('fs');

// req.post({
//     uri : "https://sandbox.api.visa.com/",

//     headers: {
//       'Content-Type' : 'application/json',
//       'Accept' : 'application/json',
//       'Authorization' : 'Basic ' + new Buffer(userId + ':' + password).toString('base64')
//     },
//     body: data
//   }, function(error, response, body) {
//   }
// );

var request = require('request');
var fs = require('fs')
var options = {
  'method': 'POST',
  'url': 'https://sandbox.api.visa.com/visaqueueinsights/v1/queueinsights',
  'key': fs.readFileSync("key_2023928c-0c6a-4108-b260-d99709d8bd62.pem"),
  'cert': fs.readFileSync("cert.pem"),
  'headers': {
    'Accept': 'application/json',
    'Authorization': 'Basic RFRPSVRBTFdWV1pXRFE2U1FNMTAyMXl5eHB5T1R2RmYxR3BXenIwRmNxTWN6YjMxTTpaczVCNzBVSDEz:',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({"requestHeader":{"messageDateTime":"2020-06-26T19:09:18.327","requestMessageId":"6da60e1b8b024532a2e0eacb1af58581"},"requestData":{"kind":"predict"}})

};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
