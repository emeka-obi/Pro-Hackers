const express = require('express')
const http = require('http')
const https = require('follow-redirects').https;
const path = require('path')
const fs = require('fs')


const app = express()
app.set('views', path.join(__dirname, 'views'))

app.post('/getmerchant', (req, res) => {
    var zip = 90007
    var options = {
      'method': 'POST',
      'hostname': 'sandbox.api.visa.com',
      'key': fs.readFileSync("key_ad1d3f5e-0d23-4610-9a28-6aca251871b0.pem"),
      'cert': fs.readFileSync("cert.pem"),
      'path': '/merchantlocator/v1/locator',
      'headers': {
        'Accept': 'application/json',
        'Authorization': 'Basic WlRQREpYVjc2M1U1T09aWTIxUFIyMUEwdFFhY09kcGljN2VQVUxXelpJOERUMWdVYzoybFZiNTc3dURxcFh6VTNOZktGVG1xYno1TzY=',
        'Content-Type': 'application/json'
      },
      'maxRedirects': 20
    };
  
    var apiRequest = https.request(options, function (apiResponse) {
      var chunks = [];
  
      apiResponse.on("data", function (chunk) {
        chunks.push(chunk);
        })
      });
  
      apiResponse.on("error", function (error) {
        console.error(error);
        res.json ({
          fulfillmentText: "No restaurants found nearby",
          location: zip
        })
      });
  })
  
  var postData = JSON.stringify({"header":{"messageDateTime":"2020-06-26T19:08:07.903","requestMessageId":"Request_001","startIndex":"0"},
  "searchAttrList":{"merchantCategoryCode":["5812","5814"],"merchantCountryCode":"840","merchantPostalCode":zip,"distance":"2","distanceUnit":"M"},
  "responseAttrList":["GNLOCATOR"],"searchOptions":{"maxRecords":"5","matchIndicators":"true","matchScore":"true"}})
  apiRequest.write(postData);
  
  apiRequest.end();
  })
  

  const PORT = process.env.PORT || 3000

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`)) 
