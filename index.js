const express = require('express')
const http = require('http')
const path = require('path')
const hoganMiddleware = require('hogan-middleware') // Mustache templating engine

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'mustache')
app.engine('mustache', hoganMiddleware.__express)
app.use(express.static(path.join(__dirname, 'public'))) // Find all static assets in public directory

app.get('/', (req, res) => {
  res.send('TESTING 123')
})

app.post('/getdata', (req, res) => {
  // Check that data exists, set variable dataFound to the data if it does
  const dataFound = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.data
  ? req.body.result.parameters.restaurant : ' '
  res.json({
    fulfillmentText: dataFound,
    source: 'getdata'
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
