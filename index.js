const express = require('express')
const http = require('http')
const path = require('path')
const hoganMiddleware = require('hogan-middleware') // Mustache templating engine
const fs = require('fs')
const request = require('request')

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
        'key': fs.readFileSync("key_ad1d3f5e-0d23-4610-9a28-6aca251871b0.pem"),
        'cert': fs.readFileSync("cert.pem"),
        'url': 'https://sandbox.api.visa.com/merchantlocator/v1/locator',
        'headers': {
            'Accept': 'application/json',
            'Authorization': 'Basic WlRQREpYVjc2M1U1T09aWTIxUFIyMUEwdFFhY09kcGljN2VQVUxXelpJOERUMWdVYzoybFZiNTc3dURxcFh6VTNOZktGVG1xYno1TzY=',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"header":{"messageDateTime":"2020-06-26T19:08:07.903","requestMessageId":"Request_001","startIndex":"0"},
        "searchAttrList":{"merchantCategoryCode":["5812","5814"],"merchantCountryCode":"840","merchantPostalCode":zip,"distance":"2","distanceUnit":"M"},
        "responseAttrList":["GNLOCATOR"],"searchOptions":{"maxRecords":"5","matchIndicators":"true","matchScore":"true"}})
      }
    request(options, function (error, response) {
      if (error) throw new Error(error)
      console.log(response.body)
      res.end(response.body)
      })
  //  res.end(" ")
})



const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
