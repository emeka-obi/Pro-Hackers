const express = require('express')
const axios = require('axios')
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
    var restName, restLoc, keyWord, tempName, zip, tempLoc,radius;
    for (const context of req.body.queryResult.outputContexts) {
        if (context.name.includes("zip") && !context.name.includes("followup")) {
            //Parse out restaurant name and location
            tempName = context.parameters.restaurant;
            tempLoc = context.parameters.address;
            var tempKeyWord = context.parameters.searchkeywords;
            var tempRad = context.parameters.unitlength;
            zip = context.parameters.zip;
            if (tempLoc && !tempLoc.includes(zip)) tempLoc += "-" + zip;
            //Remove whitespaces and commas
            if (tempName && tempName.length != 0) {
                restName = tempName.split(' ').join('-'); //trim whitespace for parsing
            }
            if (tempLoc) {
                restLoc = tempLoc.split(' ').join('-');
            }
            if(tempKeyWord){
                keyWord = tempKeyWord.split(' ').join('-');
            }
            if(tempRad){
                radius = tempRad.split(' ').join('-');
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

    //Yelp search
    var searchUrl = "https://api.yelp.com/v3/businesses/search?term=" + restName + "&location=" + restLoc;
    var config = {
        method: 'get',
        url: searchUrl,
        headers: {
            'Authorization': 'Bearer qxzauzGWC0i9v6BEJGzkV7kRCUBZE1FWJB16OGgn-XB-DdKIRuk-_4RFjNhJSbvD6VhttsdAMNU_broBe1ZpqgOLeqdyS7o9HXPz_bMZHyLOw6nxd4TmAQ37ZCD5XnYx'
        }
    };
    axios(config)
        .then(function (response) {
            var allRestaurants = JSON.stringify(response.data);
            var restObj = JSON.parse(allRestaurants);
            
            responseText += restObj.businesses[0].name;
            //responseText += restObj.businesses[0].display_address;
            //let responseText = req.body.queryResult.outputContexts.length;

            res.json({
                fulfillmentText: responseText,
                source: 'getmerchant'
            })
        })
        .catch(function (error) {
            console.log(error);
        });
    
})

    //var zip = 90007
//     var visaOptions = {
//       'method': 'POST',
//       'hostname': 'sandbox.api.visa.com',
//       'key': fs.readFileSync("key_ad1d3f5e-0d23-4610-9a28-6aca251871b0.pem"),
//       'cert': fs.readFileSync("cert.pem"),
//       'path': '/merchantlocator/v1/locator',
//       'headers': {
//         'Accept': 'application/json',
//         'Authorization': 'Basic WlRQREpYVjc2M1U1T09aWTIxUFIyMUEwdFFhY09kcGljN2VQVUxXelpJOERUMWdVYzoybFZiNTc3dURxcFh6VTNOZktGVG1xYno1TzY=',
//         'Content-Type': 'application/json'
//       },
//       'maxRedirects': 20
//     };
//     var apiRequest = https.request(visaOptions, function (apiResponse) {
//       var chunks = [];

//       apiResponse.on("data", function (chunk) {
//         chunks.push(chunk);
//       });

//       apiResponse.on("end", function (chunk) {
//         var body = Buffer.concat(chunks);
//         var jsonRes = JSON.parse(body);
//         var restaurantRes = jsonRes.merchantLocatorServiceResponse.response;
//         var restaurantNames = [];
//         //console.log(body.toString());
//       //  Below loop prints out each restaurant name
//       // to see all parameters change to restaurantRes[i]
//         for (var i = 0; i < restaurantRes.length; ++i) {
//           console.log(restaurantRes[i].responseValues.visaStoreName)
//           restaurantNames.push(restaurantRes[i].responseValues.visaStoreName)
//         }
//         res.json ({
//           fulfillmentText: restaurantNames,
//           location: zip,
//           requestedRestaurant: tempName,
//           addressLocation: restLoc
//         })
//       });

//       apiResponse.on("error", function (error) {
//         console.error(error);
//         res.json ({
//           fulfillmentText: "No restaurants found nearby",
//           location: zip,
//           requestedRestaurant: tempName,
//           addressLocation: restLoc
//         })
//       });
//   })

//   var postData = JSON.stringify({"header":{"messageDateTime":"2020-06-26T19:08:07.903","requestMessageId":"Request_001","startIndex":"0"},
//   "searchAttrList":{"merchantCategoryCode":["5812","5814"],"merchantCountryCode":"840","merchantPostalCode":zip,"distance":"2","distanceUnit":"M"},
//   "responseAttrList":["GNLOCATOR"],"searchOptions":{"maxRecords":"5","matchIndicators":"true","matchScore":"true"}})
//   apiRequest.write(postData);

//   apiRequest.end();
//   })


  const PORT = process.env.PORT || 3000

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
