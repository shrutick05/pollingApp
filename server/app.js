const express = require('express')
const redis = require('redis')
const path = require('path')
const bodyparser = require('body-parser')
const pollController = require('./pollController')
const voteController = require('./voteController')

const app = express()
app.use(express.static(path.resolve('.') + '/public'))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded())

app.get('/', (req, res) => {
  res.sendFile(path.resolve('.') + '/public/index.html')
})
app.get('/create', (req, res) => {
  res.sendFile(path.resolve('.') + '/public/create.html')
})
app.get('/vote', (req, res) => {
  res.sendFile(path.resolve('.') + '/public/vote.html')
})

pollController(app)
voteController(app)

const port = 8000
app.listen(port, () => console.log('Running on port ' + port))
