const express = require('express')
const http = require('http')
const https = require('follow-redirects').https;
const path = require('path')
const fs = require('fs')


const app = express()
app.set('views', path.join(__dirname, 'views'))
app.use(express.json())

app.post('/getmerchant', (req, res) => {
    //Get data from dialogflow

    var responseText = '';
    var restName, restLoc, keyWord;
    for (const context of req.body.queryResult.outputContexts) {
        if (context.name.includes("zip") && !context.name.includes("followup")) {
            //Parse out restaurant name and location
            var tempName = context.parameters.restaurant;
            var tempLoc = context.parameters.address;
<<<<<<< HEAD
            var zip = context.parameters.zip;
            if (tempLoc && !tempLoc.includes(zip)) tempLoc += "-" + zip;
=======
            var inZip = context.parameters.zip;
            if (!tempLoc.includes(zip)) tempLoc += "-" + inZip;
>>>>>>> 313f4abed0ed369b30f954cf14764be1df4fd0bf
            //Remove whitespaces and commas
            if (tempName && tempName.length != 0) {
                restName = tempName.split(' ').join('-'); //trim whitespace for parsing
            }
            if (restLoc) {
                restLoc = tempLoc.split(' ').join('-');
            }

            break;
        }
    }

    //Carry out option based on which intent - NEEDS TO BE MOVED
    /*//Option 1: specific restaurant
    if (req.body.queryResult.intent.displayName.includes("list-options - 1 - checkapi")) {
    }
    //Option 2: multiple restaurants, sort by wait time
    else if (req.body.queryResult.intent.displayName.includes("list-options - 2 - checkapi")) {
    }*/

    //yelp search
    /* var myPath = '/v3/businesses/search?term=' + restName + "&location=" + restLoc;
    var options = {
        'method': 'GET',
        'hostname': 'api.yelp.com',
        'path': myPath,
        'headers': {
        'Authorization': 'Bearer qxzauzGWC0i9v6BEJGzkV7kRCUBZE1FWJB16OGgn-XB-DdKIRuk-_4RFjNhJSbvD6VhttsdAMNU_broBe1ZpqgOLeqdyS7o9HXPz_bMZHyLOw6nxd4TmAQ37ZCD5XnYx'
        },
        'maxRedirects': 20
    };*/
    //call Visa merchant locator API
  //  var zip = 90007
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
          location: zip,
          requestedRestaurant: tempName,
          addressLocation: tempLoc
        })
      });

      apiResponse.on("error", function (error) {
        console.error(error);
        res.json ({
          fulfillmentText: "No restaurants found nearby",
          location: zip,
          requestedRestaurant: tempName,
          addressLocation: tempLoc
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
