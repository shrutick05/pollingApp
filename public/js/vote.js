IO.getJSON('/api/getpollData')
  .then(data => {
    for(qid in data) {
      createCard(JSON.parse(data[qid]),qid)
    }
  })

function createCard(data, qid) {
    var question = data.question
    var container = document.getElementById('votecards')
    var qusElm = document.createElement('p')
    qusElm.setAttribute('id',qid)
    var textNode = document.createTextNode(question)
    qusElm.appendChild(textNode)
    container.appendChild(qusElm)

    var trigger = document.createElement('a')
    trigger.setAttribute('class', 'modal-trigger')
    trigger.setAttribute('id','modal-trigger-box')
    trigger.setAttribute('href', '#modal')

    IO.click(trigger)
      .map(e => {
          e.preventDefault
          e.stopPropagation
          return e.path[1]['id']
        })
      .bind(id => IO.getJSON('/api/polloptions/' + id))
      .map((e, options) => options)
      .then(options => getData(options, question))

    var textVote = document.createTextNode(' Vote')
    trigger.appendChild(textVote)
    qusElm.appendChild(trigger)
    $('.modal-trigger').leanModal()
}

function fetchOptions(data) {
  var list = []
  for (let key in data) {
      if (key !== 'pollId' && key !== 'pollCount') {
          list.push(key)
      }
  }
  return list
}

function getData(data, question) {
    var list = fetchOptions(data)
    var count = 1
    var pollId = data.pollId
    var html = ''
    html += '<div>'
    html += '<div class="flow-text">' + question + '</div>'
    html += '<form id="modal-form" action="/api/vote/' + pollId + '" enctype="multipart/form-data" method="post">'
    list.forEach(element => {
        if (count === 1) {
            html += '<div class="flow-text"><input class="with-gap" name="option" type="radio" id="option' + count + '" value="' + element + '" checked/><label for="option' + count + '">' + element + '</label></div>'
        } else {
            html += '<div class="flow-text"><input class="with-gap" name="option" type="radio" id="option' + count + '" value="' + element + '"  /><label for="option' + count + '">' + element + '</label></div>'
        }
        count++
    })
    html += '</form>'
    html += '<br/><div id="modal-submit"><a class="btn waves-light teal-darken">Submit</a></div>'
    html += '</div>'
    document.getElementById('modal-content').innerHTML = html
    makeButtonsClickable(pollId)
}

function makeButtonsClickable(pollId) {
    var button = document.getElementById('modal-submit')
    button.addEventListener('click', function() {
        var obj = {}
        var options = document.getElementById('modal-form').childNodes
        for (var i = 0; i < options.length; i++) {
            if (options[i].firstChild.checked) {
                obj['option'] = options[i].firstChild.value
            }
        }
        if (obj.hasOwnProperty('option')) {
            $('#modal').closeModal()
            vote(obj, pollId)
        }
    })
}

function vote(option, pollId) {
    console.log(option)
    var xhr = new XMLHttpRequest()
    xhr.open('POST', `/api/vote/${pollId}`, true)
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            response = JSON.parse(xhr.responseText)
            if (response[0] == 1) {
                constructGraph(response[1])
                $('#graph-modal').openModal()
            } else {
                constructGraph(response[1])
                $('#graph-modal').openModal()
                Materialize.toast('You have already voted on this poll', 5000, 'rounded')
            }
        }
    }
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(option))
}

function constructGraph(id) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', `/api/polloptionsdata/${id}`, true)
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var data = JSON.parse(xhr.responseText)
            console.log(data)
            var options = data.options
            var pollId = options['pollId']
            delete options['pollId']
            var pollCount = options['pollCount']
            delete options['pollCount']
            var list = []
            var percent = []
            for (key in options) {
                var obj = {}
                obj['name'] = key
                obj['value'] = Math.round((100 * options[key]) / pollCount)
                obj['votes'] = options[key]
                list.push(obj)
            }
            console.log(list)
            var html =''
            html += '<p class = "flow-text">' + data.question + '</p>'
            html += '<form id="modal-form" action="/api/vote/' + pollId + '" enctype="multipart/form-data" method="post">'
            list.forEach(elm => {
              html += '<div class="progress">'
              html += '<div class="determinate" style="width:'+ elm.value +'%;height= 50%;"><label style="text-align: center;">' + elm.name + '  ' + elm.value + '%</label></div>'
              html += '</div>'
            })
            html += '</form>'
            html += '</div>'
            document.getElementById('graph-content').innerHTML = html
        }
    }
    xhr.send()
}
