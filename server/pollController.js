const redis = require('redis')
const bodyparser = require('body-parser')
const formidable = require('formidable')
var client = redis.createClient()

module.exports = function(app) {

    app.post('/api/poll', function(req, res) {
        var form = new formidable.IncomingForm()
        form.parse(req, function(err, fields) {
            var question = fields['question']
            delete fields['question']
            var pollOptions = fields
            client.incr('pollId')
            client.get('pollId', function(err, reply) {
                var pollId = parseInt(reply)
                set(pollId, question, pollOptions)
                    // console.log(fields, question)
            })
            res.redirect('/')
        })
    })

    function set(pollId, question, pollOptions) {

        client.hset('poll:' + pollId, 'question', question, function(err, reply) {
            console.log('set ' + reply)
        })
        client.hset('poll:' + pollId, 'pollId', pollId, function(err, reply) {
            console.log('set ' + reply)
        })
        for (var element in pollOptions) {
            client.hset('pollOptions:' + pollId, pollOptions[element], 0, function(err, reply) {
                console.log('set ' + reply)
            })
        }
        client.hset('pollOptions:' + pollId, 'pollId', pollId, function(err, reply) {
            console.log('set ' + reply)
        })
        client.hset('pollOptions:' + pollId, 'pollCount', 0, function(err, reply) {
            console.log('set ' + reply)
        })

        client.hmset('pollData', pollId, JSON.stringify({"question": question, "pollOptions": pollOptions}))
    }

    app.get('/api/polloptions/:id', (req, res) => {
        client.hgetall('pollOptions:' + req.params.id, function(err, reply) {
            res.send(reply)
        })
    })
    
    app.get('/api/polloptionsdata/:id', function(req, res) {
        var pollId = req.params.id
        var obj = {}
        client.hgetall('poll:' + pollId, function(err, reply) {
            if (reply) {
                obj['question'] = reply['question']
                    // console.log(reply)
                client.hgetall('pollOptions:' + pollId, function(err, reply) {
                    obj['options'] = reply
                    res.send(obj)
                })
            } else {
                res.sendStatus(404)
            }
        })
    })

    app.get('/api/getpoll/', (req, res) => {
        client.keys('poll:*', (err, reply) => {
            res.send(reply)
        })
    })

    app.get('/api/getpollData', (req, res) => {
        client.hgetall('pollData', (err, reply) => {
            res.send(JSON.parse(JSON.stringify(reply)))
        })
    })

    app.get('/api/getquestion/:id', (req, res) => {
        client.hgetall('poll'+ req.params.id, (err, reply) => {
            res.send(JSON.parse(reply))
        })
    })
}
