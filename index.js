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

    var responseText = "";
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
    // Defining Visa API parameters
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

    //Carry out option based on which intent - NEEDS TO BE MOVED
    //Option 1: specific restaurant
    var restaurantRes;
    if (req.body.queryResult.intent.displayName.includes("list-options - 1 - checkapi")) {
      var postData = JSON.stringify({"header":{"messageDateTime":"2020-06-26T19:08:07.903","requestMessageId":"Request_001","startIndex":"0"},
      "searchAttrList":{"merchantName": tempName,"merchantCountryCode":"840","merchantPostalCode":zip,"distance":"2","distanceUnit":"M"},
      "responseAttrList":["GNLOCATOR"],"searchOptions":{"maxRecords":"5","matchIndicators":"true","matchScore":"true"}})

      var apiRequest = https.request(options, function (apiResponse) {
        var chunks = [];

        apiResponse.on("data", function (chunk) {
          chunks.push(chunk);
        });

        apiResponse.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          var jsonRes = JSON.parse(body);
          restaurantRes = jsonRes.merchantLocatorServiceResponse.response;
          var resultArray = [];
          // Check if 0 results
          if (!restaurantRes) {
            // responseText += "no results from Visa"
            // res.json({
            //   message: responseText,
            //   zipCode: zip,
            //   requestedRestaurantName: tempName,
            //   requestedRestaurantAddress: tempLoc
            // })
          }
          else {
            // Loop through each restaurant returned from the api search
            // Grab specific parameters we want such as name, paymentAcceptanceMethods, address etc
            // Store each restaurant and its specific parameteres in a variable resultArray
            console.log(restaurantRes[0].responseValues)
            var temp = new Object()
            temp.name = restaurantRes[0].responseValues.visaStoreName
            temp.paymentAcceptanceMethods = restaurantRes[0].responseValues.paymentAcceptanceMethod
            temp.terminalType = restaurantRes[0].responseValues.terminalType
            temp.address = restaurantRes[0].responseValues.merchantStreetAddress
            temp.zipCode = restaurantRes[0].responseValues.merchantPostalCode
            temp.city = restaurantRes[0].responseValues.merchantCity
            if (restaurantRes[0].responseValues.merchantState) {
              temp.state = restaurantRes[0].responseValues.merchantState
            }
            temp.url = restaurantRes[0].responseValues.merchantUrl

            resultArray.push(temp)

            // Take resultArray, return it as JSON
            // res.json(resultArray)

            // TODO: Reformat the same as Yelp
            responseText += "You should go to " + temp.name.toProperCase() + " at " + temp.address.toProperCase() + " " + temp.zipCode + " " + temp.city.toProperCase + ". They accept " + temp.paymentAcceptanceMethods + " and use " + temp.terminalType.toProperCase + ". You can reach them at " + temp.url

            var splitLoc = temp.address + "-" + temp.zipCode + "-" + temp.city;
            restLoc = splitLoc.split(' ').join('-')

            var splitName = temp.name
            restName = splitName.split(' ').join('-')


            

          }
          searchYelp(restLoc, restName, responseText, restaurantRes).then(function(response) {
            responseText += response;

            res.json({
              fulfillmentText: responseText,
              source: 'getmerchant'
            }).catch(function (error) {
                console.log(error);
            })
          });
        });

        apiResponse.on("error", function (error) {
          console.error(error);
          res.json ({
            message: "No restaurants were found with the given requirements.",
            zipCode: zip,
            requestedRestaurantName: tempName,
            requestedRestaurantAddress: tempLoc
          })
        });
    })
    apiRequest.write(postData);

    apiRequest.end();



    }

    //Option 2: multiple restaurants, sort by wait time
    else if (req.body.queryResult.intent.displayName.includes("list-options - 2 - checkapi")) {
      if(!radius){
        radius = 5;
      }
      var postData = JSON.stringify({"header":{"messageDateTime":"2020-06-26T19:08:07.903","requestMessageId":"Request_001","startIndex":"0"},
      "searchAttrList":{"merchantCategoryCode":["5812","5814"],"merchantCountryCode":"840","merchantPostalCode":zip,"distance":radius,"distanceUnit":"M"},
      "responseAttrList":["GNLOCATOR"],"searchOptions":{"maxRecords":"5","matchIndicators":"true","matchScore":"true"}})

      var apiRequest = https.request(options, function (apiResponse) {
        var chunks = [];

        apiResponse.on("data", function (chunk) {
          chunks.push(chunk);
        });

        apiResponse.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          var jsonRes = JSON.parse(body);
          restaurantRes = jsonRes.merchantLocatorServiceResponse.response;
          var resultArray = [];
          // Check if 0 results
          if (!restaurantRes) {
            responseText += "no results from Visa"
            res.json({
              message: responseText,
              zipCode: zip,
              requestedRestaurantName: tempName,
              requestedRestaurantAddress: tempLoc
            })
          }
          else {
            // Loop through each restaurant returned from the api search
            // Grab specific parameters we want such as name, paymentAcceptanceMethods, address etc
            // Store each restaurant and its specific parameteres in a variable resultArray
            responseText += "Here is a list of restaurants you could go to!"
            for (var i = 0; i < restaurantRes.length; ++i) {
              console.log(restaurantRes[i].responseValues)
              var temp = new Object()
              temp.name = restaurantRes[i].responseValues.visaStoreName
              temp.paymentAcceptanceMethods = restaurantRes[i].responseValues.paymentAcceptanceMethod
              temp.terminalType = restaurantRes[i].responseValues.terminalType
              temp.address = restaurantRes[i].responseValues.merchantStreetAddress
              temp.zipCode = restaurantRes[i].responseValues.merchantPostalCode
              temp.city = restaurantRes[i].responseValues.merchantCity
              if (restaurantRes[i].responseValues.merchantState) {
                temp.state = restaurantRes[i].responseValues.merchantState
              }
              temp.url = restaurantRes[i].responseValues.merchantUrl
              resultArray.push(temp)
              responseText += (i + 1) + ". " + temp.name.toProperCase() + " at " + temp.address.toProperCase() + "            "
            }
            temp.url = restaurantRes[0].responseValues.merchantUrl

            resultArray.push(temp)

            // Take resultArray, return it as JSON
            // res.json(resultArray)

            res.json({
              fulfillmentText: responseText,
              source: 'getmerchant'
            })

          }
        });

        apiResponse.on("error", function (error) {
          console.error(error);
          res.json ({
            message: "No restaurants were found with the given requirements.",
            zipCode: zip,
            requestedRestaurantName: tempName,
            requestedRestaurantAddress: tempLoc
          })
        });
    })
    apiRequest.write(postData);

    apiRequest.end();

    }


  })

  async function searchYelp(restLoc, restName, responseText, restaurantRes){
     //Yelp search

     var searchUrl = "https://api.yelp.com/v3/businesses/search?location=" + restLoc + "&term=" + restName;
     var config = {
         method: 'get',
         url: searchUrl,
         headers: {
             'Authorization': 'Bearer qxzauzGWC0i9v6BEJGzkV7kRCUBZE1FWJB16OGgn-XB-DdKIRuk-_4RFjNhJSbvD6VhttsdAMNU_broBe1ZpqgOLeqdyS7o9HXPz_bMZHyLOw6nxd4TmAQ37ZCD5XnYx'
         }
     };

        return axios(config)
         .then(function (response) {

             var allRestaurants = JSON.stringify(response.data);
             var restObj = JSON.parse(allRestaurants);

             //Case where Visa API has no results
           //  if(responseText.localeCompare("")){ //TODO: Add variables
             if(!restaurantRes){ //TODO: Add variables to responsetext
              responseText += "You should go to " + response.data.businesses[0].name + " at " + response.data.businesses[0].location.displayAddress +". Their number is " + response.data.businesses[0].phone +". Try their webpage at " + response.data.businesses[0].url + ". They are currently using " 
              for(var i = 0; i < response.data.businesses[0].transactions.length; i++){
               responseText += response.data.businesses[i].transactions
             }
            }
             // Case where Visa API has results and we are adding to them
           //  else { //TODO: Add variables
             else { //TODO: Add variables to responsetext
              responseText +=  "You can call them at " + response.data.businesses[0].display_phone + ". They are currently using "
              for(var i = 0; i < response.data.businesses[0].transactions.length; i++){
                responseText += response.data.businesses[i].transactions
              }
            }
             //responseText += restObj.businesses[0].display_address;
             //let responseText = req.body.queryResult.outputContexts.length;
             response = responseText
             return response;
         })

         .catch(function (error) {
             console.log(error);
         });

   }

   String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  };



  const PORT = process.env.PORT || 3000

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
