window.onload = () => {
    makeDivsClickable()
}

function addOption() {
    let options = document.getElementById('options')
    let id = options.children.length + 1
    let html = ""
    html += "<div id=\"" + id + "\" class=\"input-field col s6\">"
    html += "<input id=\"option" + id + "\" class=\"validate\" type=\"text\" maxlength=\"150\" name=\"" + id + "\">"
    html += "<label for=\"option\">Option " + id + "</label>"
    html += "</div>"
    options.insertAdjacentHTML('beforeend', html);
}

function removeOption() {
    let list = document.getElementById('options')
    let item = list.lastElementChild
    list.removeChild(item)
}

function makeDivsClickable() {
    let button = document.getElementById('form-button')
    IO.click(button)
      .then(() => {
        if (checkSimilar()) {
            if (checkFilled()) {
                document.getElementById('form-input').submit()
            } else {
                Materialize.toast("Don't leave any field empty", 2000)
            }
        } else {
            Materialize.toast("Two options can't be same", 3000)

        }
      })

    let addOpt = document.getElementById('add-option')
    IO.click(addOpt)
      .then(() => {
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

    let removeOpt = document.getElementById('remove-option')
    IO.click(removeOpt)
      .then(() => {
        let options = document.getElementById('options').children.length
            if (options > 2) {
                removeOption()
            }
      })

    function checkFilled() {
        let options = document.getElementById('options').children.length
        let flag = true
        if (document.getElementById('question').value.length > 0) {
            for (let i = 1; i <= options; i++) {
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
    let options = document.getElementById('options').children
    let count = options.length
    let flag = true
    let current = document.getElementById('option' + count).value.trim().toLowerCase()
    while (count > 0) {
        current = document.getElementById('option' + count).value.trim().toLowerCase()
        for (let i = 1; i <= options.length; i++)
            if (i !== count) {
                let input = document.getElementById('option' + i).value.trim().toLowerCase()
                if (input === current) {
                    flag = false
                }
            }
        count--
    }
    return flag
}
