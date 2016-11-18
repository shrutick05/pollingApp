const redis = require('redis')
const bodyparser = require('body-parser')
const formidable = require('formidable')
const client = redis.createClient()

module.exports = function(app) {
    app.post('/api/vote/:id', (req, res) => {
        //console.log(req, res)
        let ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress
        let id = req.params.id
        let option = req.body.option
        //console.log(option)
        let arr = []
        client.hset('ip', ip + ':' + id, 1, (err, reply) => {
            arr.push(reply)
            arr.push(id)
            //console.log(reply)
            if (reply != 0) {
                client.hget('pollOptions:' + id, option, (err, reply) => {
                    let votes = parseInt(reply) + 1
                    client.hset('pollOptions:' + id, option, votes, (err, reply) => console.log(reply))
                    client.hget('pollOptions:' + id, 'pollCount', function(err, reply) {
                        let count = parseInt(reply) + 1
                        client.hset('pollOptions:' + id, 'pollCount', count, (err, reply) => console.log(reply))
                    })
                })
            }
            res.send(JSON.stringify(arr))
        })
    })
}
