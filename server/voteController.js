const redis = require('redis')
const bodyparser = require('body-parser')
const formidable = require('formidable')
var client = redis.createClient({ port: 6379, host: '127.0.0.1', db: 1 })

module.exports = function(app) {
    app.post('/api/vote/:id', function(req, res) {
        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress
        var id = req.params.id
        var option = req.body.option
        console.log(option)
        var arr = []
        client.hset('ip', ip + ':' + id, 1, function(err, reply) {
            arr.push(reply)
            arr.push(id)
            console.log(reply)
            if (reply != 0) {
                client.hget('pollOptions:' + id, option, function(err, reply) {
                    var votes = parseInt(reply) + 1
                    client.hset('pollOptions:' + id, option, votes, function(err, reply) {
                        console.log(reply)
                    })
                    client.hget('pollOptions:' + id, 'pollCount', function(err, reply) {
                        var count = parseInt(reply) + 1
                        client.hset('pollOptions:' + id, 'pollCount', count, function(err, reply) {
                            console.log(reply)
                        })
                    })
                })
            }
            res.send(JSON.stringify(arr))
        })
    })
}
