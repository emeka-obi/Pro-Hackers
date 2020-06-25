var https = require('follow-redirects').https;
var fs = require('fs');

var options = {
  'method': 'POST',
  'hostname': 'sandbox.api.visa.com',
  'path': '/merchantlocator/v1/locator',
  'headers': {
    'Authorization': 'Basic NFdNMVFCRFQ2Tk1QU0c0MEk3QjgyMWZTUzBsVUc0X2ZIdmZ1akdjc0ZKQ3RHWDY0MDo0YlZLcTV3MzE3TTNsNlo3QU81dFY=',
    'Content-Type': 'application/json'
  },
  'maxRedirects': 20
};

var req = https.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function (chunk) {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });

  res.on("error", function (error) {
    console.error(error);
  });
});

var postData = JSON.stringify({"header":{"messageDateTime":"2020-06-25T14:39:55.903","requestMessageId":"Request_001","startIndex":"0"},"searchAttrList":{"merchantName":"Starbucks","merchantCountryCode":"840","latitude":"37.363922","longitude":"-121.929163","distance":"2","distanceUnit":"M"},"responseAttrList":["GNLOCATOR"],"searchOptions":{"maxRecords":"5","matchIndicators":"true","matchScore":"true"}});

req.write(postData);

req.end();
