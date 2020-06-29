const express = require('express')
const http = require('http')
const https = require('follow-redirects').https;
const path = require('path')
const hoganMiddleware = require('hogan-middleware') // Mustache templating engine
const fs = require('fs')

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'mustache')
app.engine('mustache', hoganMiddleware.__express)
app.use(express.static(path.join(__dirname, 'public'))) // Find all static assets in public directory
app.use(express.json())

app.get('/', (req, res) => {
  res.send('TESTING 123')
})

app.post('/getdata', (req, res) => {
  // Check that data exists, set variable dataFound to the data if it does
  const dataFound = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.restaurant
  ? req.body.queryResult.parameters.restaurant : 'No restaurant entered'
  res.json({
    fulfillmentText: dataFound,
    source: 'getdata'
  })
})

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
    });

    apiResponse.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      var jsonRes = JSON.parse(body);
      var restaurantRes = jsonRes.merchantLocatorServiceResponse.response;
      var restaurantNames = [];
      //console.log(body.toString());
    //  Below loop prints out each restaurant name
    // to see all parameters change to restaurantRes[i]
      for (var i = 0; i < restaurantRes.length; ++i) {
        console.log(restaurantRes[i].responseValues.visaStoreName)
        restaurantNames.push(restaurantRes[i].responseValues.visaStoreName)
      }
      res.json ({
        fulfillmentText: restaurantNames,
        location: zip
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


const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
