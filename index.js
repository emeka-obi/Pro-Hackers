const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
var request = require('request');
var fs = require('fs')
const path = require("path");
const { callbackify } = require("util");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'public')))


app.get('/',(req, res) => {
  res.sendfile("index.html");
});

app.post('/getmerchant',(req, res) => {

    var zip = req.body.user;
    console.log("Zip code is "+ zip);
    var options = {
        'method': 'POST',
        'key': fs.readFileSync("key_d0a3051c-5abf-4e3b-bd84-dfdcc5a72efa.pem"),
        'cert': fs.readFileSync("cert.pem"),
        'url': 'https://sandbox.api.visa.com/merchantlocator/v1/locator',
        'headers': {
            'Accept': 'application/json',
            'Authorization': 'Basic VjNHMUNPU1IxUFpBSFNSTVZTMUIyMW4zLTd0dF9ZV2tZVDhSRm1uaEYweDZUM0NwdzpTT29qMDRvQTU1OWNnZm11R1pkUXJENm1BZTg2QTE0cXMxNVdyeXI=',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"header":{"messageDateTime":"2020-06-26T19:08:07.903","requestMessageId":"Request_001","startIndex":"0"},
        "searchAttrList":{"merchantCategoryCode":["5812","5814"],"merchantCountryCode":"840","merchantPostalCode":zip,"distance":"2","distanceUnit":"M"},
        "responseAttrList":["GNLOCATOR"],"searchOptions":{"maxRecords":"5","matchIndicators":"true","matchScore":"true"}})
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
    });

    res.end("");
});


app.listen(5000,() => {
  console.log("Started on PORT 5000");
})
