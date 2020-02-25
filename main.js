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
var newPlayerRowID = "new-player-row";
var testPlayers = [
    createPlayer("odette", 3, 47, false),
    createPlayer("maris", 2, 45, false),
    createPlayer("monster dead", 0, 0, true),
    createPlayer("monster alive", 0, 10, true),
];
var testState = { players: testPlayers, turn: 0 };
var currentState = { players: [], turn: 0 };
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
    var cellName = document.createElement("td");
    var cellInitiative = document.createElement("td");
    var cellMaxHealth = document.createElement("td");
    var cellCurrentHealth = document.createElement("td");
    var cellStatusEffects = document.createElement("td");
    var cellDamage = document.createElement("td");
    row.appendChild(cellName);
    row.appendChild(cellInitiative);
    row.appendChild(cellMaxHealth);
    row.appendChild(cellCurrentHealth);
    row.appendChild(cellStatusEffects);
    row.appendChild(cellDamage);
    cellName.innerText = player.name;
    cellInitiative.innerText = String(player.initiative);
    cellMaxHealth.innerText = String(player.maxHealth);
    cellCurrentHealth.innerText = String(player.currentHealth);
    cellStatusEffects.innerText = String(player.statusEffects);
    var damageInput = document.createElement("input");
    // let damageButton = document.createElement("button");
    cellDamage.appendChild(damageInput);
    // cellDamage.appendChild(damageButton);
    var damageThisPlayer = function (event) {
        if (event.keyCode != 13) {
            return;
        }
        event.preventDefault();
        // let damageInput = event.currentTarget;
        var damageAmount = parseInt(damageInput.value);
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
    // damageButton.addEventListener("click", damageThisPlayer)
    if (isTurn) {
        row.style.color = "red";
    }
    if (player.isDead) {
        row.style.background = "grey";
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
function buildNewPlayerRow() {
    var row = document.createElement("tr");
    row.id = newPlayerRowID;
    var cellName = document.createElement("td");
    var cellInitiative = document.createElement("td");
    var cellMaxHealth = document.createElement("td");
    var cellCurrentHealth = document.createElement("td");
    var cellStatusEffects = document.createElement("td");
    var cellButton = document.createElement("td");
    var cellIDs = document.createElement("td");
    var cellIsMonster = document.createElement("td");
    row.appendChild(cellName);
    row.appendChild(cellInitiative);
    row.appendChild(cellMaxHealth);
    row.appendChild(cellCurrentHealth);
    row.appendChild(cellStatusEffects);
    row.appendChild(cellButton);
    row.appendChild(cellIDs);
    row.appendChild(cellIsMonster);
    var nameInput = document.createElement("input");
    var initiativeInput = document.createElement("input");
    var maxHealthInput = document.createElement("input");
    var button = document.createElement("input");
    var IDsInput = document.createElement("input");
    var isMonsterInput = document.createElement("input");
    cellName.appendChild(nameInput);
    cellInitiative.appendChild(initiativeInput);
    cellMaxHealth.appendChild(maxHealthInput);
    cellButton.appendChild(button);
    cellIDs.appendChild(IDsInput);
    cellIsMonster.appendChild(isMonsterInput);
    nameInput.type = "text";
    nameInput.id = newPlayerRowID + "_name";
    initiativeInput.type = "text";
    initiativeInput.id = newPlayerRowID + "_initiative";
    maxHealthInput.type = "text";
    maxHealthInput.id = newPlayerRowID + "_maxhealth";
    button.type = "submit";
    button.id = newPlayerRowID + "_button";
    button.value = "add";
    IDsInput.type = "text";
    IDsInput.id = newPlayerRowID + "_ids";
    isMonsterInput.type = "checkbox";
    isMonsterInput.id = newPlayerRowID + "_ismonster";
    isMonsterInput.checked = true;
    return row;
}
function buildPlayerTable(players, turn) {
    var columns = ["Name", "Initiative", "Max Health", "Current Health", "Status Effects"];
    var form = document.createElement("form");
    form.id = newPlayerRowID + "_form";
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var players = getNewPlayers();
        resetNewPlayer();
        players.map(function (player) { return currentState.players.push(player); });
        update(currentState);
    });
    var table = document.createElement("table");
    form.appendChild(table);
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
    return form;
}
function buildAdvanceTurnButton() {
    var form = document.createElement("form");
    form.id = "advance-turn-form";
    var button = document.createElement("input");
    form.appendChild(button);
    button.type = "submit";
    button.value = "next turn";
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        currentState = advanceTurn(currentState);
        update(currentState);
    });
    return form;
}
function reRenderPlayers(players, turn) {
    var tableDiv = document.getElementById("main-status-table");
    tableDiv.innerHTML = "";
    tableDiv.appendChild(buildPlayerTable(players, turn));
    tableDiv.appendChild(buildAdvanceTurnButton());
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
    reRenderPlayers(state.players, state.turn);
}
currentState = testState;
update(currentState);
