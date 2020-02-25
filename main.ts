interface Player {
		name: string;
		initiativeModifier: number;
		initiative: number;
		maxHealth: number;
		currentHealth: number;
		healthChanges: number[];
		statusEffects: string[];
		isMonster: boolean;
		isDead: boolean;
		deathRolls: number;
		lifeRolls: number;
}

interface State {
		players: Player[];
		turn: number;
}

function calculateTotalHealthChange(player: Player): number {
		return player.healthChanges.reduce((acc, change) => acc + change, player.maxHealth);
}

function damagePlayer(player: Player, damage: number): Player {
		console.log("called damage [" + damage + "] for player: " + player.name);
		console.log("health before: " + player.currentHealth);
		if (player.isMonster) {
				player.healthChanges.push(-damage);
				player.currentHealth = calculateTotalHealthChange(player);
				if (player.currentHealth <= 0) {
						player.isDead = true;
				}
		} else {
				let healthBeforeHit = calculateTotalHealthChange(player);
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

		return player
}

let newPlayerRowID = "new-player-row";

let testPlayers: Player[] = [
		createPlayer("odette", 3, 47, false),
		createPlayer("maris", 2, 45, false),
		createPlayer("monster dead", 0, 0, true),
		createPlayer("monster alive", 0, 10, true),
]

let testState: State = { players: testPlayers, turn: 0 }

var currentState: State = { players: [], turn: 0 }

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function rollD(sides: number): number {
		return getRandomInt(1, sides + 1);
}

function createPlayer(name: string, initiativeModifier: number, maxHealth: number, isMonster: boolean): Player {
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
				lifeRolls: 0,
		}
}

function playerRowIDFromName(name: string): string {
		return "player-row_" + name
}

function playerNameFromRowID(id: string): string {
		return id.slice(10);
}

function buildPlayerRow(player: Player, isTurn: boolean): HTMLTableRowElement {
		let row = document.createElement("tr");
		row.id = playerRowIDFromName(player.name);
		let cellName = document.createElement("td");
		let cellInitiative = document.createElement("td");
		let cellMaxHealth = document.createElement("td");
		let cellCurrentHealth = document.createElement("td");
		let cellStatusEffects = document.createElement("td");
		let cellDamage = document.createElement("td");
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

		let damageInput = document.createElement("input");
		// let damageButton = document.createElement("button");
		cellDamage.appendChild(damageInput);
		// cellDamage.appendChild(damageButton);

		let damageThisPlayer = event => {
				if (event.keyCode != 13) { return; }
				event.preventDefault();

				// let damageInput = event.currentTarget;

				let damageAmount = parseInt(damageInput.value);
				for (var i = 0; i <= currentState.players.length; i++) {
						if (currentState.players[i] == player) {
								currentState.players[i] = damagePlayer(currentState.players[i], damageAmount);
						}
				}
				damageInput.value = ""
				update(currentState);
		}

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

function getNewPlayers(): Player[] {
		// let row: HTMLTableRowElement = event.closest("row");
		let nameInput = document.getElementById(newPlayerRowID + "_name") as HTMLInputElement;
		let initiativeInput = document.getElementById(newPlayerRowID + "_initiative") as HTMLInputElement;
		let maxHealthInput = document.getElementById(newPlayerRowID + "_maxhealth") as HTMLInputElement;
		let IDsInput = document.getElementById(newPlayerRowID + "_ids") as HTMLInputElement;
		let isMonsterInput = document.getElementById(newPlayerRowID + "_ismonster") as HTMLInputElement;
		let ids = IDsInput.value.split(",").map(id => id.trim());

		if (ids.length <= 1) {
				return [createPlayer(
						 nameInput.value,
						 parseInt(initiativeInput.value),
						 parseInt(maxHealthInput.value),
						 isMonsterInput.checked)];
		} else {
				return ids.map(id => createPlayer(
								      nameInput.value + ": " + id,
							   	      parseInt(initiativeInput.value),
							   	      parseInt(maxHealthInput.value),
								      isMonsterInput.checked));
		}
}

function resetNewPlayer() {
		let nameInput = document.getElementById(newPlayerRowID + "_name") as HTMLInputElement;
		let initiativeInput = document.getElementById(newPlayerRowID + "_initiative") as HTMLInputElement;
		let maxHealthInput = document.getElementById(newPlayerRowID + "_maxhealth") as HTMLInputElement;
		let IDsInput = document.getElementById(newPlayerRowID + "_ids") as HTMLInputElement;
		let isMonsterInput = document.getElementById(newPlayerRowID + "_ismonster") as HTMLInputElement;
		isMonsterInput.checked = true;

		let inputs = [nameInput, initiativeInput, maxHealthInput, IDsInput];
		inputs.map(input => input.value = "")
}

function buildNewPlayerRow(): HTMLTableRowElement {
		let row = document.createElement("tr");
		row.id = newPlayerRowID;

		let cellName = document.createElement("td");
		let cellInitiative = document.createElement("td");
		let cellMaxHealth = document.createElement("td");
		let cellCurrentHealth = document.createElement("td");
		let cellStatusEffects = document.createElement("td");
		let cellButton = document.createElement("td");
		let cellIDs = document.createElement("td");
		let cellIsMonster = document.createElement("td");
		row.appendChild(cellName);
		row.appendChild(cellInitiative);
		row.appendChild(cellMaxHealth);
		row.appendChild(cellCurrentHealth);
		row.appendChild(cellStatusEffects);
		row.appendChild(cellButton);
		row.appendChild(cellIDs);
		row.appendChild(cellIsMonster);
		
		let nameInput = document.createElement("input");
		let initiativeInput = document.createElement("input");
		let maxHealthInput = document.createElement("input");
		let button = document.createElement("input");
		let IDsInput = document.createElement("input")
		let isMonsterInput = document.createElement("input")
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

function buildPlayerTable(players: Player[], turn: number): HTMLFormElement {
		let columns: string[] = ["Name", "Initiative", "Max Health", "Current Health", "Status Effects"];
		let form = document.createElement("form");
		form.id = newPlayerRowID + "_form";
		form.addEventListener("submit", function(event) {
				event.preventDefault();
				let players = getNewPlayers();
				resetNewPlayer();
				players.map(player => currentState.players.push(player));
				update(currentState);
		})

		let table = document.createElement("table");
		form.appendChild(table);

		let headerRow = document.createElement("tr");
		table.appendChild(headerRow)

		let columnHeaders = columns.map(function(columnName: string) {
				let header = document.createElement("th");
				header.innerText = columnName
				return header
		});
		columnHeaders.map(header => headerRow.appendChild(header));

		players.map((player, index) => table.appendChild(buildPlayerRow(player, index==turn)));

		let newPlayerRow = buildNewPlayerRow();
		table.appendChild(newPlayerRow);

		return form;
}

function buildAdvanceTurnButton(): HTMLFormElement {
		let form = document.createElement("form");
		form.id = "advance-turn-form";

		let button = document.createElement("input");
		form.appendChild(button);

		button.type = "submit";
		button.value = "next turn";
		form.addEventListener("submit", function(event) {
				event.preventDefault();
				currentState = advanceTurn(currentState);
				update(currentState);
		});

		return form
}

function reRenderPlayers(players: Player[], turn: number) {
		let tableDiv = document.getElementById("main-status-table") as HTMLDivElement;
		tableDiv.innerHTML = "";
		tableDiv.appendChild(buildPlayerTable(players, turn));
		tableDiv.appendChild(buildAdvanceTurnButton());
}

function advanceTurn(state: State) {
		console.log("advancing");
		let allPlayersAreDead = state.players.reduce((allAreDead, player) => allAreDead && player.isDead, true);
		if (allPlayersAreDead) {
				console.log("all are dead");
				return state;
		}

		state.turn = (state.turn + 1) % state.players.length;
		let nextPlayer = state.players[state.turn];
		if (nextPlayer.isDead) {
				return advanceTurn(state);
		}

		return state
}

function update(state: State) {
		reRenderPlayers(state.players, state.turn);
}

currentState = testState;
update(currentState);
