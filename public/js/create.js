window.onload = function() {
    makeDivsClickable()
}

function addOption() {
    var options = document.getElementById('options')
    var id = options.children.length + 1
    var html = ""
    html += "<div id=\"" + id + "\" class=\"input-field col s6\">"
    html += "<input id=\"option" + id + "\" class=\"validate\" type=\"text\" maxlength=\"150\" name=\"" + id + "\">"
    html += "<label for=\"option\">Option " + id + "</label>"
    html += "</div>"
    options.insertAdjacentHTML('beforeend', html);
}

function removeOption() {
    var list = document.getElementById('options')
    var item = list.lastElementChild
    list.removeChild(item)
}

function makeDivsClickable() {
    var button = document.getElementById('form-button')
    button.addEventListener('click', function() {
        if (checkSimilar()) {
            if (checkFilled()) {
                document.getElementById('form-input').submit()
            } else {
                Materialize.toast("Don't leave any field empty", 2000, 'rounded')
            }
        } else {
            Materialize.toast("Two options can't be same", 3000, 'rounded')

        }
    })
    document.getElementById('add-option').addEventListener('click', function() {
        if (checkSimilar()) {
            if (checkFilled()) {
                addOption()
            } else {
                Materialize.toast("Don't leave any field empty", 2000, 'rounded')
            }
        } else {
            Materialize.toast("Two options can't be same", 3000, 'rounded')
        }
    })
    document.getElementById('remove-option').addEventListener('click', function() {
        var options = document.getElementById('options').children.length
        if (options > 2) {
            removeOption()
        }
    })
    function checkFilled() {
        var options = document.getElementById('options').children.length
        var flag = true
        if (document.getElementById('question').value.length > 0) {
            for (var i = 1; i <= options; i++) {
                if (document.getElementById("option" + i).value.length <= 0) {
                    flag = false
                }
            }
        } else {
            flag = false
        }
        return flag
    }
}
function checkSimilar() {
    var options = document.getElementById('options').children
    var count = options.length
    var flag = true
    var current = document.getElementById('option' + count).value.trim().toLowerCase()
    while (count > 0) {
        current = document.getElementById('option' + count).value.trim().toLowerCase()
        for (var i = 1; i <= options.length; i++)
            if (i !== count) {
                var input = document.getElementById('option' + i).value.trim().toLowerCase()
                if (input === current) {
                    flag = false
                }
            }
        count--

    }
    return flag
}
