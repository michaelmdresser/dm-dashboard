var newPlayerRowID = "new-player-row";
var testPlayers = [
    createPlayer("Odette", 3, 47, false),
    createPlayer("Maris", 2, 45, false),
    createPlayer("monster dead", 0, 0, true),
    createPlayer("monster alive", 0, 10, true),
];
var testState = { players: testPlayers, turn: 0 };
var currentState = { players: [], turn: 0 };
function calculateTotalHealthChange(player) {
    return player.healthChanges.reduce(function (acc, change) { return acc + change; }, player.maxHealth);
}
function damagePlayer(player, damage) {
    console.log("called damage [" + damage + "] for player: " + player.name);
    console.log("health before: " + player.currentHealth);
    if (player.isMonster) {
        player.healthChanges.push(-damage);
        player.currentHealth = calculateTotalHealthChange(player);
        if (player.currentHealth <= 0) {
            player.isDead = true;
        }
    }
    else {
        var healthBeforeHit = calculateTotalHealthChange(player);
        if (healthBeforeHit - damage <= -player.maxHealth) {
            player.isDead = true;
        }
        player.healthChanges.push(-damage);
        player.currentHealth = calculateTotalHealthChange(player);
        if (player.currentHealth < 0) {
            player.healthChanges.push(-player.currentHealth); // bring up to 0
            player.currentHealth = calculateTotalHealthChange(player);
        }
        if (healthBeforeHit <= 0 && player.currentHealth <= 0 && damage > 0) {
            player.deathRolls += 2;
        }
        if (player.deathRolls >= 3) {
            player.isDead = true;
        }
    }
    console.log("health after: " + player.currentHealth);
    return player;
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
function rollD(sides) {
    return getRandomInt(1, sides + 1);
}
function createPlayer(name, initiativeModifier, maxHealth, isMonster) {
    return {
        name: name,
        initiativeModifier: initiativeModifier,
        initiative: rollD(20) + initiativeModifier,
        maxHealth: maxHealth,
        currentHealth: maxHealth,
        healthChanges: [],
        statusEffects: [],
        isMonster: isMonster,
        isDead: isMonster && (maxHealth == 0),
        deathRolls: 0,
        lifeRolls: 0
    };
}
function playerRowIDFromName(name) {
    return "player-row_" + name;
}
function playerNameFromRowID(id) {
    return id.slice(10);
}
function buildPlayerRow(player, isTurn) {
    var row = document.createElement("tr");
    row.id = playerRowIDFromName(player.name);
    if (!player.isMonster) {
        row.className += "player-row ";
    }
    var cellName = document.createElement("td");
    var cellInitiative = document.createElement("td");
    var cellMaxHealth = document.createElement("td");
    var cellCurrentHealth = document.createElement("td");
    var cellStatusEffects = document.createElement("td");
    var cellDamage = document.createElement("td");
    var cellDelete = document.createElement("td");
    row.appendChild(cellName);
    row.appendChild(cellInitiative);
    row.appendChild(cellMaxHealth);
    row.appendChild(cellCurrentHealth);
    row.appendChild(cellStatusEffects);
    row.appendChild(cellDamage);
    row.appendChild(cellDelete);
    var initiativeText = document.createElement("div");
    initiativeText.innerText = String(player.initiative);
    cellName.innerText = player.name;
    cellInitiative.appendChild(initiativeText);
    cellMaxHealth.innerText = String(player.maxHealth);
    cellCurrentHealth.innerText = String(player.currentHealth);
    cellStatusEffects.innerText = String(player.statusEffects);
    var initiativeInput = document.createElement("input");
    initiativeInput.type = "text";
    initiativeInput.placeholder = "new initiative";
    initiativeInput.addEventListener("keydown", function (event) {
        if (event.keyCode != 13) {
            return;
        }
        event.preventDefault();
        var newInitiative = parseInt(initiativeInput.value);
        if (isNaN(newInitiative)) {
            newInitiative = player.initiative;
        }
        for (var i = 0; i <= currentState.players.length; i++) {
            if (currentState.players[i] == player) {
                currentState.players[i].initiative = newInitiative;
            }
        }
        initiativeInput.value = "";
        cellInitiative.innerHTML = "";
        cellInitiative.appendChild(initiativeText);
        update(currentState);
    });
    initiativeText.onclick = function (event) {
        cellInitiative.innerHTML = "";
        cellInitiative.appendChild(initiativeInput);
        initiativeInput.focus();
    };
    initiativeInput.addEventListener("focusout", function (event) {
        cellInitiative.innerHTML = "";
        cellInitiative.appendChild(initiativeText);
    });
    var damageInput = document.createElement("input");
    cellDamage.appendChild(damageInput);
    var damageThisPlayer = function (event) {
        if (event.keyCode != 13) {
            return;
        }
        event.preventDefault();
        var damageAmount = parseInt(damageInput.value);
        if (isNaN(damageAmount)) {
            return;
        }
        for (var i = 0; i <= currentState.players.length; i++) {
            if (currentState.players[i] == player) {
                currentState.players[i] = damagePlayer(currentState.players[i], damageAmount);
            }
        }
        damageInput.value = "";
        update(currentState);
    };
    damageInput.type = "text";
    damageInput.addEventListener("keydown", damageThisPlayer);
    damageInput.placeholder = "Damage - Enter to apply";
    var deleteInput = document.createElement("input");
    cellDelete.appendChild(deleteInput);
    deleteInput.type = "submit";
    deleteInput.value = "delete";
    deleteInput.onclick = function (event) {
        event.preventDefault();
        for (var i = 0; i <= currentState.players.length; i++) {
            if (currentState.players[i] === player) {
                currentState.players.splice(i, 1);
                if (currentState.turn > i) {
                    currentState.turn -= 2;
                    currentState = advanceTurn(currentState);
                }
                break;
            }
        }
        update(currentState);
    };
    if (isTurn) {
        // row.style.color = "red";
        row.className += "isTurn ";
    }
    if (player.isDead) {
        // row.style.background = "grey";
        row.className += "isDead ";
    }
    return row;
}
function getNewPlayers() {
    // let row: HTMLTableRowElement = event.closest("row");
    var nameInput = document.getElementById(newPlayerRowID + "_name");
    var initiativeInput = document.getElementById(newPlayerRowID + "_initiative");
    var maxHealthInput = document.getElementById(newPlayerRowID + "_maxhealth");
    var IDsInput = document.getElementById(newPlayerRowID + "_ids");
    var isMonsterInput = document.getElementById(newPlayerRowID + "_ismonster");
    var ids = IDsInput.value.split(",").map(function (id) { return id.trim(); });
    if (nameInput.value.length == 0 || isNaN(parseInt(initiativeInput.value)) || isNaN(parseInt(maxHealthInput.value))) {
        return [];
    }
    if (ids.length <= 1) {
        return [createPlayer(nameInput.value, parseInt(initiativeInput.value), parseInt(maxHealthInput.value), isMonsterInput.checked)];
    }
    else {
        return ids.map(function (id) { return createPlayer(nameInput.value + ": " + id, parseInt(initiativeInput.value), parseInt(maxHealthInput.value), isMonsterInput.checked); });
    }
}
function resetNewPlayer() {
    var nameInput = document.getElementById(newPlayerRowID + "_name");
    var initiativeInput = document.getElementById(newPlayerRowID + "_initiative");
    var maxHealthInput = document.getElementById(newPlayerRowID + "_maxhealth");
    var IDsInput = document.getElementById(newPlayerRowID + "_ids");
    var isMonsterInput = document.getElementById(newPlayerRowID + "_ismonster");
    isMonsterInput.checked = true;
    var inputs = [nameInput, initiativeInput, maxHealthInput, IDsInput];
    inputs.map(function (input) { return input.value = ""; });
}
function addNewPlayer(event) {
    if (event.keyCode != 13) {
        return;
    }
    event.preventDefault();
    var newPlayers = getNewPlayers();
    newPlayers.map(function (player) { return currentState.players.push(player); });
    resetNewPlayer();
    update(currentState);
}
function buildNewPlayerRow() {
    var row = document.createElement("tr");
    row.id = newPlayerRowID;
    var cellName = document.createElement("td");
    var cellInitiative = document.createElement("td");
    var cellMaxHealth = document.createElement("td");
    var cellCurrentHealth = document.createElement("td");
    var cellStatusEffects = document.createElement("td");
    //let cellButton = document.createElement("td");
    var cellIDs = document.createElement("td");
    var cellIsMonster = document.createElement("td");
    row.appendChild(cellName);
    row.appendChild(cellInitiative);
    row.appendChild(cellMaxHealth);
    row.appendChild(cellCurrentHealth);
    row.appendChild(cellStatusEffects);
    //row.appendChild(cellButton);
    row.appendChild(cellIDs);
    row.appendChild(cellIsMonster);
    var nameInput = document.createElement("input");
    var initiativeInput = document.createElement("input");
    var maxHealthInput = document.createElement("input");
    //let button = document.createElement("input");
    var IDsInput = document.createElement("input");
    var isMonsterInput = document.createElement("input");
    cellName.appendChild(nameInput);
    cellInitiative.appendChild(initiativeInput);
    cellMaxHealth.appendChild(maxHealthInput);
    //cellButton.appendChild(button);
    cellIDs.appendChild(IDsInput);
    cellIsMonster.appendChild(isMonsterInput);
    nameInput.type = "text";
    nameInput.id = newPlayerRowID + "_name";
    nameInput.placeholder = "Name";
    nameInput.addEventListener("keydown", addNewPlayer);
    initiativeInput.type = "text";
    initiativeInput.id = newPlayerRowID + "_initiative";
    initiativeInput.placeholder = "initiative mod";
    initiativeInput.addEventListener("keydown", addNewPlayer);
    maxHealthInput.type = "text";
    maxHealthInput.id = newPlayerRowID + "_maxhealth";
    maxHealthInput.placeholder = "max health";
    maxHealthInput.addEventListener("keydown", addNewPlayer);
    //button.type = "submit";
    //button.id = newPlayerRowID + "_button";
    //button.value = "add";
    //button.onclick = addNewPlayer;
    IDsInput.type = "text";
    IDsInput.id = newPlayerRowID + "_ids";
    IDsInput.placeholder = "ids for multi-add";
    IDsInput.addEventListener("keydown", addNewPlayer);
    isMonsterInput.type = "checkbox";
    isMonsterInput.id = newPlayerRowID + "_ismonster";
    isMonsterInput.checked = true;
    isMonsterInput.addEventListener("keydown", addNewPlayer);
    return row;
}
function buildPlayerTable(players, turn) {
    var columns = ["Name", "Initiative", "Max Health", "Current Health", "Status Effects"];
    // let form = document.createElement("form");
    // form.id = newPlayerRowID + "_form";
    // form.addEventListener("submit", function(event) {
    // 		event.preventDefault();
    // 		let players = getNewPlayers();
    // 		resetNewPlayer();
    // 		players.map(player => currentState.players.push(player));
    // 		update(currentState);
    // })
    var table = document.createElement("table");
    table.className += "fl-table";
    // form.appendChild(table);
    var headerRow = document.createElement("tr");
    table.appendChild(headerRow);
    var columnHeaders = columns.map(function (columnName) {
        var header = document.createElement("th");
        header.innerText = columnName;
        return header;
    });
    columnHeaders.map(function (header) { return headerRow.appendChild(header); });
    players.map(function (player, index) { return table.appendChild(buildPlayerRow(player, index == turn)); });
    var newPlayerRow = buildNewPlayerRow();
    table.appendChild(newPlayerRow);
    return table;
}
function buildAdvanceTurnButton() {
    var button = document.createElement("input");
    button.type = "submit";
    button.value = "next turn";
    button.onclick = function (event) {
        event.preventDefault();
        currentState = advanceTurn(currentState);
        update(currentState);
    };
    return button;
}
function removeMonsters(players) {
    return players.filter(function (player) { return !player.isMonster; });
}
function buildNewRoundButton() {
    var button = document.createElement("input");
    button.type = "submit";
    button.value = "new round - remove monsters";
    button.onclick = function (event) {
        event.preventDefault();
        currentState.players = removeMonsters(currentState.players);
        update(currentState);
    };
    return button;
}
function reRenderPlayers(players, turn) {
    var tableDiv = document.getElementById("main-status-table");
    tableDiv.innerHTML = "";
    tableDiv.appendChild(buildPlayerTable(players, turn));
    tableDiv.appendChild(buildAdvanceTurnButton());
    tableDiv.appendChild(buildNewRoundButton());
}
function advanceTurn(state) {
    console.log("advancing");
    var allPlayersAreDead = state.players.reduce(function (allAreDead, player) { return allAreDead && player.isDead; }, true);
    if (allPlayersAreDead) {
        console.log("all are dead");
        return state;
    }
    state.turn = (state.turn + 1) % state.players.length;
    var nextPlayer = state.players[state.turn];
    if (nextPlayer.isDead) {
        return advanceTurn(state);
    }
    return state;
}
function update(state) {
    var currentTurnPlayer = state.players[state.turn];
    state.players.sort(function (b, a) {
        if (a.initiative < b.initiative) {
            return -1;
        }
        else if (a.initiative > b.initiative) {
            return 1;
        }
        else {
            return a.initiativeModifier - b.initiativeModifier;
        }
    });
    for (var i = 0; i < state.players.length; i++) {
        if (state.players[i] === currentTurnPlayer) {
            state.turn = i;
            break;
        }
    }
    reRenderPlayers(state.players, state.turn);
}
// currentState = testState;
update(currentState);
currentState.turn = 0;
update(currentState);
