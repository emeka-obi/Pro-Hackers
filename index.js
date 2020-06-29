const express = require('express')
const axios = require('axios');
const http = require('http')
const https = require('https')
const path = require('path')
const hoganMiddleware = require('hogan-middleware') // Mustache templating engine

//Not sure how much of this stuff is actually necessary
const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'mustache')
app.engine('mustache', hoganMiddleware.__express)
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.status(200).send('Server is working.')
})

app.listen(port, () => {
    console.log(`🌏 Server is running at http://localhost:${port}`)
})
app.post('/getdata', (req, res) => {
    var responseText = '';

    
    var restName, restLoc, keyWord;

    for (const context of req.body.queryResult.outputContexts) {
        if (context.name.includes("zip") && !context.name.includes("followup")) {

            //Parse out restaurant name and location
            let restName = context.parameters.restaurant;
            let restLoc = context.parameters.address;
            var zip = context.parameters.zip;
            if (!restLoc.includes(zip)) restLoc += " " + zip;

            //Remove whitespaces and commas - DOES NOT WORK YET
            let restName = restName.replace(/\s+/g, '-');
            responseText += restname + "/n";

            break;
        }
    }

    //Option 1: specific restaurant
    if (req.body.queryResult.intent.displayName.includes("list-options - 1 - checkapi")) {

    }
    //Option 2: multiple restaurants, sort by wait time
    else if (req.body.queryResult.intent.displayName.includes("list-options - 2 - checkapi")) {

    }

    //Search yelp
    var searchUrl = "https://api.yelp.com/v3/businesses/search?term=" + restName + "&location=" + restLoc;
    var config = {
        method: 'get',
        url: searchUrl,
        headers: {
            'Authorization': 'Bearer qxzauzGWC0i9v6BEJGzkV7kRCUBZE1FWJB16OGgn-XB-DdKIRuk-_4RFjNhJSbvD6VhttsdAMNU_broBe1ZpqgOLeqdyS7o9HXPz_bMZHyLOw6nxd4TmAQ37ZCD5XnYx'
        }
    };

    //Return results to dialogflow
    axios(config)
        .then(function (response) {
            var allRestaurants = JSON.stringify(response.data);
            var restObj = JSON.parse(allRestaurants);
            let responseText = restObj.businesses[0].name;
            responseText += restObj.businesses[0].display_address;
            //let responseText = req.body.queryResult.outputContexts.length;
            
            res.json({
                fulfillmentText: responseText,
                source: 'getdata'
            })
        })
        .catch(function (error) {
            console.log(error);
        });
})
