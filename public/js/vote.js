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
      .then(options => getData(options))

    var textVote = document.createTextNode(' Vote')
    trigger.appendChild(textVote)
    qusElm.appendChild(trigger)
    $('.modal-trigger').leanModal()
}


function getData(data) {
    //console.log(data)
    var list = []
    for (let key in data) {
        if (key !== 'pollId' && key !== 'pollCount') {
            list.push(key)
        }
    }
    var count = 1
    var pollId = data.pollId
    var html = ''
    html += '<div>'
    // html += '<div class="flow-text">' + question + '</div>'
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
    // xhr.send()
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
    // console.log(option)
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
    xhr.open('GET', `/api/polloptions/${id}`, true)
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText)
            var options = response.options
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

            // console.log(list)
            var graph_content = document.getElementById('graph-content')
            graph_content.innerHTML = '<p class = "flow-text">' + response.question + '</p>'
            var width = 500
            var height = 400
            var canvas_width = 600
                // using d3 to create graph
            var widthScale = d3.scaleLinear()
                .domain([0, 100])
                .range([10, width - 10])
            var graph = d3.select('#graph-content').append('svg')
                .attr('width', canvas_width)
                .attr('height', height)
                .attr('margin', '0 auto')
                .append('g')
                // .attr('transform', 'translate(150,0)')

            // var axis = d3.axisBottom(widthScale)
            var elements = graph.selectAll('g')
                .data(list)
                .enter()
                .append('g')

            // append bars to the canvas
            elements.append('rect')
                .attr('width', 0)
                .attr('height', 30)
                .attr('y', function(d, i) {
                    return i * 70
                })
                .attr('fill', '#33691e')

            // append percentage to the bars
            elements.append('text')
                .attr('id', 'percent')
                .attr('x', -30)
                .attr('y', function(d, i) {
                    return i * 70 + 15
                })
                .attr('dy', '.35em')
                .attr('fill', 'white')
                .text(function(d) {
                    return d.value + '%'
                })

            // append the legend to the bars
            elements.append('text')
                .attr('id', 'element_name')
                .attr('x', 0)
                .attr('y', function(d, i) {
                    return i * 70 + 15
                })
                .attr('dy', '.35em')
                .text(function(d) {
                    return d.name
                })

            // transition for the percentage text
            var percent = d3.selectAll('#percent')
                .transition()
                .duration(1500)
                .attr('x', function(d) {
                    return widthScale(d.value) - 40
                })

            // transition for the name of the element
            var element_name = d3.selectAll('#element_name')
                .transition()
                .duration(1500)
                .attr('x', function(d) {
                    return widthScale(d.value) + 3
                })

            // transition for the bars
            var bars = graph.selectAll('rect')
            bars.transition()
                .duration(1500)
                .attr('width', function(d) {
                    return widthScale(d.value)
                })
                // Append an axis at the bottom of the graph
            graph.append('g')
                .attr('transform', 'translate(0,350)')
                .call(d3.axisBottom(widthScale))
        }
    }
    xhr.send()
}
