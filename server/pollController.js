const redis = require('redis')
const bodyparser = require('body-parser')
const formidable = require('formidable')
const client = redis.createClient()

function set(pollId, question, pollOptions) {
    client.hset('poll:' + pollId, 'question', question, (err, reply) => console.log('set ' + reply))
    client.hset('poll:' + pollId, 'pollId', pollId, (err, reply) => console.log('set ' + reply))
    for (let element in pollOptions) {
        client.hset('pollOptions:' + pollId, pollOptions[element], 0, (err, reply) => console.log('set ' + reply))
    }
    client.hset('pollOptions:' + pollId, 'pollId', pollId, (err, reply) => console.log('set ' + reply))
    client.hset('pollOptions:' + pollId, 'pollCount', 0, (err, reply) => console.log('set ' + reply))
    client.hmset('pollData', pollId, JSON.stringify({"question": question, "pollOptions": pollOptions}), (err, reply) => console.log('set ' + reply))
}

module.exports = function(app) {

    app.post('/api/poll', (req, res) => {
        let form = new formidable.IncomingForm()
        form.parse(req, (err, fields) => {
            let question = fields['question']
            delete fields['question']
            let pollOptions = fields
            client.incr('pollId')
            client.get('pollId', (err, reply) => {
                let pollId = parseInt(reply)
                set(pollId, question, pollOptions)
                // console.log(fields, question)
            })
            res.redirect('/')
        })
    })

    app.get('/api/polloptions/:id', (req, res) => {
        client.hgetall('pollOptions:' + req.params.id, (err, reply) => res.send(reply))
    })

    app.get('/api/polloptionsdata/:id', (req, res) => {
        let pollId = req.params.id
        //console.log(req.params.id)
        let obj = {}
        client.hgetall('poll:' + pollId, (err, reply) => {
            if (reply) {
                obj['question'] = reply['question']
                //console.log(reply)
                client.hgetall('pollOptions:' + pollId, (err, reply) => {
                    console.log(reply)
                    obj['options'] = reply
                    res.send(obj)
                })
            } else {
                res.sendStatus(404)
            }
        })
    })

    app.get('/api/getpoll/', (req, res) => {
        client.keys('poll:*', (err, reply) => res.send(reply))
    })

    app.get('/api/getpollData', (req, res) => {
        client.hgetall('pollData', (err, reply) => res.send(JSON.parse(JSON.stringify(reply))))
    })

    app.get('/api/getquestion/:id', (req, res) => {
        client.hgetall('poll'+ req.params.id, (err, reply) => res.send(JSON.parse(reply)))
    })
}
