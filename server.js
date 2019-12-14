var express = require('express')
var cors = require('cors')
var path = require('path')
var job = require('./clean-streams-folder-job')

var app = express()

// Enabling CORS
app.use(cors())
// Enabling built-in express json parser
app.use(express.json())

// Registering route for Post Stream
var streamConverter = require('./stream-converter/stream-converter')
app.use('/streams', streamConverter)

// Serving streams folder to Get HLS streams
app.use('/streams', express.static(__dirname + '/streams'))
app.use(express.static(path.join(__dirname,'/streams')))

app.listen(8000, function() {
  console.log('Express running on port 8000')
})
