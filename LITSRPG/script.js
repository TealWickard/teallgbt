let tutorial = [
	[1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
	[1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
	[7, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 8],
	[1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1]
];
let map = [];
let currCount = 0;
let currCells = [null, null, null, null];
let adjacentTypes = [0, 0, 0, 0];
/**
 *  0 = EMPTY
 *  1 = TERRAIN
 *  2 = L
 *  3 = I
 *  4 = T
 *  5 = S
 *  6 = CURR
 *  7 = START
 *  8 = END
 */
window.onload = function() {
	//https://dev.to/kaelscion/dynamically-filling-in-a-css-grid-with-javascript-5geb
	createGrid(tutorial);
	addListeners();
}

function createGrid(grid) {
	//makes evenly sized cells
	let hmap = document.getElementById("hmap");
    hmap.style.gridTemplateColumns = `repeat(${grid[0].length}, 1fr)`;
    hmap.style.gridTemplateRows = `repeat(${grid.length}, 1fr)`;

	//scales div so that each cell is 60x60px
	hmap.style.width = grid[0].length * 60 + "px";
	hmap.style.height = grid.length * 60 + "px";

	for(row in grid) {
		map[row] = [];
		for(col in grid[row]) {
			//create each cell with id "row[X]col[Y]" with a class of "cell" and "celltype[N]"
			let markup = `<button id="row${row}col${col}" class="cell celltype${grid[row][col]}" 
							style="grid-column: ${Number(col) + 1}; 
							grid-row: ${Number(row) + 1};">
							</button>`;
			hmap.innerHTML += markup;
			map[row][col] = new Cell(row, col, grid[row][col]);
		}
	}
}

function addListeners() {
	for(row in map) {
		for(col in map[row]) {
			let cell = map[row][col];
			cell.button.addEventListener('click', event => {
				switch(cell.value) {
					case 0:
						// clicked empty block
						let neighbors = cell.neighbors;
						if(currCount === 0 && neighbors[2] === 0 && neighbors[3] === 0 && neighbors[4] === 0 && neighbors[5] === 0 && neighbors[7] === 0) {
							sendError("You may only shade cells adjacent to another shaded cell");
							break;
						}
						if(currCount > 0 && neighbors[6] === 0) {
							sendError("Tetrominos must be constructed continuously!");
							break;
						}
						if(checkForQuad(cell)) {
							sendError("This placement creates a shaded 2x2");
							break;
						}
						//cell placement is confirmed to be valid
						for(let i = 0; i < 4; i++) {
							adjacentTypes[i] = Math.max(adjacentTypes[i], neighbors[i + 2]);
						}

						//shade cell and update the curr
						cell.setValue(6);
						currCells[currCount] = cell;
						currCount++;

						//handle complete tetromino
						if(currCount === 4) {
							let shape = checkShape(currCells);
							if(adjacentTypes[shape - 2]) {
								sendError("Adjacent tetrominos cannot be the same shape");
								for(key in currCells) {
									currCells[key].setValue(0);
								}
							}
							else {
								for(key in currCells) {
									currCells[key].setValue(shape);
								}
							}
							currCount = 0;
							adjacentTypes = [0, 0, 0, 0];
						}
						break;
					default:
						sendError("You can't place a block there!");
						break;
				}
			})
		}
	}
}

// returns 2, 3, 4, 5 for L, I, T, S
function checkShape(input) {
	let kinks = 2;
	for(key in input) {
		let links = 0;
		if(input.includes(input[key].neighbor(-1, 0))) {
			if(input.includes(input[key].neighbor(1, 0))) kinks--;
			links++;
		} 
		if(input.includes(input[key].neighbor(1, 0))) links++;
		if(input.includes(input[key].neighbor(0, -1))) {
			if(input.includes(input[key].neighbor(0, 1))) kinks--;
			links++;
		}
		if(input.includes(input[key].neighbor(0, 1))) links++;
		if(links === 3) return 4;
	}
	switch(kinks) {
		case 0:
			return 3;
		case 1:
			return 2;
		case 2:
			return 5;
	}
}

//send message to player
function sendError(errorMessage) {
	let errors = document.getElementById("errors")
	errors.innerHTML = errorMessage;
	errors.style.opacity = 1.5;
	var timer = setInterval(function () {
        if (errors.style.opacity <= 0){
            clearInterval(timer);
        }
        errors.style.opacity -= 0.005;
    });
}

function checkForQuad(cell) {
	if(cell.neighbor(-1, 0) && cell.neighbor(0, -1) && cell.neighbor(-1, 0).isShaded() && cell.neighbor(0, -1).isShaded() && cell.neighbor(-1, -1).isShaded()) return true;
	if(cell.neighbor(1, 0) && cell.neighbor(0, -1) && cell.neighbor(1, 0).isShaded() && cell.neighbor(0, -1).isShaded() && cell.neighbor(1, -1).isShaded()) return true;
	if(cell.neighbor(-1, 0) && cell.neighbor(0, 1) && cell.neighbor(-1, 0).isShaded() && cell.neighbor(0, 1).isShaded() && cell.neighbor(-1, 1).isShaded()) return true;
	if(cell.neighbor(1, 0) && cell.neighbor(0, 1) && cell.neighbor(1, 0).isShaded() && cell.neighbor(0, 1).isShaded() && cell.neighbor(1, 1).isShaded()) return true;
	return false;
}

class Cell {
	constructor(row, col, value) {
		this.row = Number(row);
		this.col = Number(col);
		this.value = value;
	}

	get button() {
		return document.getElementById(`row${this.row}col${this.col}`);
	}

	setValue(newVal) {
		this.value = newVal;
		this.button.className = "cell celltype" + newVal;
	}

	// returns 0 or 1 for [empty, terrain, L, I, T, S, curr, start, end]
	get neighbors() {
		let neighbors = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		if(this.neighbor(-1, 0)) neighbors[this.neighbor(-1, 0).value] = 1;
		if(this.neighbor(1, 0)) neighbors[this.neighbor(1, 0).value] = 1;
		if(this.neighbor(0, -1)) neighbors[this.neighbor(0, -1).value] = 1;
		if(this.neighbor(0, 1)) neighbors[this.neighbor(0, 1).value] = 1;
		return neighbors;
	}
	neighbor(offRow, offCol) {
		if(map[this.row + offRow] && map[this.row + offRow][this.col + offCol]) return map[this.row + offRow][this.col + offCol];
		return null;
	}
	isShaded() {
		return this.value > 1 && this.value < 7;
	}
}