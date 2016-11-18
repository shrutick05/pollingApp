IO.getJSON('/api/getpollData')
  .then(data => {
    for(qid in data) {
      displayQsn(JSON.parse(data[qid]), qid)
    }
  })

function displayQsn(data, qid) {
  let question = data.question
  let container = document.getElementById('votecards')
  let qusElm = document.createElement('p')
  qusElm.setAttribute('id', qid)
  let textNode = document.createTextNode(question)
  qusElm.appendChild(textNode)
  container.appendChild(qusElm)

  let trigger = document.createElement('a')
  trigger.setAttribute('class', 'modal-trigger')
  trigger.setAttribute('id', 'modal-trigger-box')
  trigger.setAttribute('href', '#modal')

  IO.click(trigger)
    .map(e => e.path[1]['id'])
    .bind(id => IO.getJSON('/api/polloptions/' + id))
    .map((e, options) => options)
    .then(options => getData(options, question))

  let textVote = document.createTextNode(' Vote')
  trigger.appendChild(textVote)
  qusElm.appendChild(trigger)
  $('.modal-trigger').leanModal()
}

function fetchOptions (data) {
  let list = []
  for (let key in data) {
    if (key !== 'pollId' && key !== 'pollCount') {
      list.push(key)
    }
  }
  return list
}

function getData (data, question) {
  let list = fetchOptions(data)
  let count = 1 , pollId = data.pollId
  let html = ''
  html += '<div>'
  html += '<div class="flow-text">' + question + '</div>'
  html += '<form id="modal-form" action="/api/vote/' + pollId + '" enctype="multipart/form-data" method="post">'
  list.forEach(elm => {
    if (count === 1) {
      html += '<div class="flow-text"><input class="with-gap" name="option" type="radio" id="option' + count + '" value="' + elm + '" checked/><label for="option' + count + '">' + elm + '</label></div>'
    } else {
      html += '<div class="flow-text"><input class="with-gap" name="option" type="radio" id="option' + count + '" value="' + elm + '"  /><label for="option' + count + '">' + elm + '</label></div>'
    }
    count++
  })
  html += '</form>'
  html += '<br/><div id="modal-submit"><a class="btn waves-light teal-darken">Submit</a></div>'
  html += '</div>'
  document.getElementById('modal-content').innerHTML = html

  let button = document.getElementById('modal-submit')
  IO.click(button)
    .map((e, res) => {
      let obj = {}
      let options = document.getElementById('modal-form').childNodes
      for (let i = 0; i < options.length; i++) {
        if (options[i].firstChild.checked) {
          obj['option'] = options[i].firstChild.value
        }
      }
      if (obj.hasOwnProperty('option')) {
        $('#modal').closeModal()
      }
      return [obj, pollId]
    })
    .bind((obj, pollId) => {
      return new IO.postJSON('/api/vote/'+pollId, obj)
    })
    .map((e, res) => res)
    .bind((res) => {
      let id = res
      return new IO.getJSON('/api/polloptionsdata/'+id)
    })
    .then((id, res) => {
      // console.log(id,res)
      let options = res.options
      let pollId = options.pollId
      let pollCount = options.pollCount
      //console.log(options)
      delete options.pollId
      delete options.pollCount
      let list = []
      for (let key in options) {
        let obj = {}
        obj.name = key
        obj.value = Math.round((100 * options[key]) / pollCount)
        obj.votes = options.key
        list.push(obj)
      }
      // console.log(list)
      let html = ''
      html += '<p class = "flow-text">' + res.question + '</p>'
      html += '<form id="modal-form" action="/api/vote/' + pollId + '" enctype="multipart/form-data" method="post">'
      list.forEach(elm => {
        html += '<div class="progress">'
        html += '<div class="determinate" style="width:' + elm.value + '%;height= 50%;"><label style="text-align: center;">' + elm.name + '  ' + elm.value + '%</label></div>'
        html += '</div>'
      })
      html += '</form>'
      html += '</div>'
      document.getElementById('graph-content').innerHTML = html
      $('#graph-modal').openModal()
    })
}
