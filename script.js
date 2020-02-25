var statusTable = document.getElementById("status-table")

// https://stackoverflow.com/questions/14267781/sorting-html-table-with-javascript
const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

const comparer = (idx, asc) => (a, b) => ((v1, v2) => 
    v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
    )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));


function sortByInitiative() {
  // var newTable = document.createElement("table");
  var table = statusTable

  th = document.getElementById("initiative-header")

  let elements = Array.from(table.querySelectorAll('tr:nth-child(n+2)'));
  let th_index = Array.from(th.parentNode.children).indexOf(th);
  console.log("th_index: ", th_index)
  let sorted = elements.sort(comparer(th_index, false));
  sorted.forEach(tr => table.appendChild(tr));

  // document.getElementById("main-turn-order").appendChild(newTable);
}



function updateHealth(row) {
  console.log("updating row id: " + row.id)
  var maxHealth = row.getElementsByClassName("max-health")[0]
  var damageTaken = row.getElementsByClassName("damage-taken")[0]
  var currentHealth = row.getElementsByClassName("current-health")[0]
  //
  currentHealth.innerText = maxHealth.innerText - damageTaken.innerText
}

function rollInitiative(modifier) {
  let max = 20
  let min = 1
  let roll = getRandomInt(min, max)
  return roll + Math.floor(modifier)
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function damagePlayer(e) {
  // e.preventDefault()
  console.log("in listener")
  row = e.target.closest("tr")
  damageTaken = row.getElementsByClassName("damage-taken")[0]
  console.log("taken so far: ", damageTaken.innerText)
  newDamage = e.currentTarget.parentElement.children[0]
  damageTaken.innerText = parseInt(damageTaken.innerText) + parseInt(newDamage.value)
  newDamage.value = ""

  updateHealth(row)
}

function insertPlayerRow(table, name, initiativeModifier, maxHealth) {
  let rolledInitiative = rollInitiative(initiativeModifier)
  let newRow = table.insertRow(table.rows.length - 1)
  newRow.id = name
  
  // var newRow = document.getElementById(newName)
  var cellName = newRow.insertCell()
  var cellInitiative = newRow.insertCell()
  var cellMaxHealth = newRow.insertCell()
  var cellDamageTaken = newRow.insertCell()
  var cellDamage = newRow.insertCell()
  var cellCurrentHealth = newRow.insertCell()
  var cellStatusEffects = newRow.insertCell()
  
  cellName.innerText = name
  cellName.className = "name"

  cellInitiative.innerText = rolledInitiative
  cellInitiative.className = "initiative"

  cellMaxHealth.innerText = maxHealth
  cellMaxHealth.className = "max-health"

  cellDamageTaken.className = "damage-taken"
  cellDamageTaken.innerText = 0
  // damageTakenInput = document.createElement("input")
  // damageTakenInput.type = "text"
  // damageTakenInput.value = 0
  // damageTakenInput.addEventListener("input", update)
  // cellDamageTaken.appendChild(damageTakenInput)

  cellDamage.className = "damage"
  //damageForm = document.createElement("form")
  damageInput = document.createElement("input")
  damageButton = document.createElement("p")
  //cellDamage.appendChild(damageForm)
  //damageForm.appendChild(damageInput)
  //damageForm.appendChild(damageButton)
  cellDamage.appendChild(damageInput)
  cellDamage.appendChild(damageButton)

  //damageForm.className = "damage-form"
  damageInput.type = "text"
  // damageButton.type = "submit"
  damageButton.innerText = "DAMAGE"
  damageButton.onclick = damagePlayer

  cellCurrentHealth.className = "current-health"
  cellStatusEffects.className = "status-effects"
}

function newPlayer() {
  var newIDs = document.getElementById("new-count").value.split(",")
  var newName = document.getElementById("new-name").value
  var newInitiative = document.getElementById("new-initiative").value
  var newHealth = document.getElementById("new-max-health").value
  let statusTable = document.getElementById("status-table")
  
  if (newIDs.length == 1) {
    insertPlayerRow(statusTable, newName, newInitiative, newHealth)
  } else {
    newIDs.map(id => insertPlayerRow(statusTable, newName + ": " + id, newInitiative, newHealth))
  }
}

form_new = document.getElementById("new-player-form")
form_new.addEventListener("submit", function(event) {
  newPlayer()
  form_new.reset()
  sortByInitiative()
  update()
  event.preventDefault()
})

function update() {
  var statusTable = document.getElementById("status-table")
  for (var i = 0; i < statusTable.rows.length; i++) {
    row = statusTable.rows[i]
    if (row.id == "status-table-header" || row.id == "new-player-row") {
      continue
    }

    updateHealth(row)
  }
}
update()
