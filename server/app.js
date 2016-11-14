const express = require('express')
const redis = require('redis')
const path = require('path')
const bodyparser = require('body-parser')
const formidable = require('formidable')
var client = redis.createClient({ port: 6379, host: '127.0.0.1', db: 1 })

const app = express()
app.use(express.static(path.resolve('.') + '/public'))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())

app.get('/', function(req, res) {
    res.sendFile(path.resolve('.') + '/public/index.html')
})
app.get('/create', function(req, res) {
    res.sendFile(path.resolve('.') + '/public/create.html')
})
app.get('/vote', function(req, res) {
    res.sendFile(path.resolve('.') + '/public/vote.html')
})

const pollController = require('./pollController')
pollController(app)
const voteController = require('./voteController')
voteController(app)

const port = 3000
app.listen(port, () => {
    console.log('Running on port ' + port)
})
