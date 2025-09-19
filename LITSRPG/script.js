let tutorial = [
	[1, 1, 6, 1, 1],
	[0, 0, 0, 0, 0],
	[0, 0, 1, 0, 0],
	[0, 0, 0, 1, 0],
	[0, 0, 0, 0, 1],
	[0, 1, 0, 0, 0],
	[1, 0, 0, 0, 0],
	[0, 0, 1, 0, 1],
	[0, 0, 0, 0, 0],
	[0, 1, 0, 1, 0],
	[0, 0, 0, 0, 0],
	[1, 1, 6, 1, 1]
];
let map = tutorial.slice();
let currCount = 0;
let currCoords = [null, null, null, null];
let adjacentTypes = [0, 0, 0, 0];
/**
 *  0 = EMPTY
 *  1 = TERRAIN
 *  2 = L
 *  3 = I
 *  4 = T
 *  5 = S
 *  6 = START
 *  7 = END
 *  8 = CURR
 */
window.onload = function() {
	//https://dev.to/kaelscion/dynamically-filling-in-a-css-grid-with-javascript-5geb
	createGrid();
	addListeners();
}

function createGrid(){
	let hmap = document.getElementById("hmap");

	//makes evenly sized cells
    hmap.style.gridTemplateColumns = `repeat(${map[0].length}, 1fr)`;
    hmap.style.gridTemplateRows = `repeat(${map.length}, 1fr)`;

	//scales div so that each cell is 60x60px
	hmap.style.width = map[0].length * 60 + "px";
	hmap.style.height = map.length * 60 + "px";

	for(let row in map){
		for(let col in map[row]){
			//create each cell with id "row[X]col[Y]" with a class of "cell" and "celltype[N]"
			let markup = `<button id="row${row}col${col}" class="cell celltype${map[row][col]}" 
							style="grid-column: ${Number(col) + 1}; 
							grid-row: ${Number(row) + 1};">
							</button>`;
			hmap.innerHTML += markup;
		}
	}
}

function addListeners(){
	//take all buttons with ids starting with "row", which will be all the buttons in the map
	var hcells = document.querySelectorAll('button[id^=row]')
	hcells.forEach(cell => {
		cell.addEventListener('click', event => {
			let cellValue = value(cell);

			//do stuff depending on what kind of cell was clicked
			switch(cellValue){
				case 0:
					let neighbors = getNeighbors(coords(cell));
					//first block of the tetromino
					if(currCount === 0 && neighbors[1] === 0 && neighbors[2] === 0 && neighbors[3] === 0 && neighbors[4] === 0 && neighbors[5] === 0 && neighbors[6] === 0) {
						sendError("You may only shade cells adjacent to another shaded cell");
						break;
					}
					//finishing the tetromino
					if(currCount > 0 && neighbors[0] === 0) {
						sendError("Tetrominos must be constructed continuously!");
						break;
					} 
					
					//at this point, cell placement is valid
					for(let i = 0; i < 4; i++) {
						adjacentTypes[i] = Math.max(adjacentTypes[i], neighbors[i + 1]);
					}
					setValue(cell, 8);
					currCoords[currCount] = coords(cell);
					currCount++;							
					if(currCount === 4) {
						let shape = checkShape(currCoords) + 2;
						console.log(currCoords);
						for(key in currCoords) {
							setValue(getCell(currCoords[key]), shape);
						}
						currCount = 0;
						adjacentTypes = [0, 0, 0, 0];
						console.log(shape);
					}
					break;
				default:
					sendError("You can't place a block there!");
					break;
			}
		});
	});
}

// returns 0, 1, 2, 3 for L, I, T, S
function checkShape(input){
	let coords = [];
	for(key in input){
		coords[key] = input[key].slice();
	}
	let lowestX = 999;
	let lowestY = 999;
	for(key in coords){
		if(coords[key][0] < lowestX) lowestX = coords[key][0];
		if(coords[key][1] < lowestY) lowestY = coords[key][1];
	}
	for(key in coords){
		coords[key][0] -= lowestX;
		coords[key][1] -= lowestY;
	}
	if(includes(coords, [0, 3]) || includes(coords, [3, 0])) return 1;
	if(includes(coords, [0, 0])){
		if(includes(coords, [1, 1])){
			if(includes(coords, [1, 2]) || includes(coords, [2, 1])) {
				if(includes(coords, [0, 1]) && includes(coords, [2, 1]) || includes(coords, [1, 0]) && includes(coords, [1, 2])) return 0;
				return 3;
			}				
			return 2;
		}
		return 0;
	}
	if(includes(coords, [0, 1])){
		if(includes(coords, [0, 2])) return 3;
		if(includes(coords, [1, 0])){
			if(includes(coords, [2, 0])) return 3;
			return 2;
		}
		return 0;
	}
	return 0;
}

function includes(array, coord){
	for(key in array){
		let match = true;
		for(axis in coord){
			if(array[key][axis] != coord[axis]) match = false;
		}
		if(match) return true;
	}
	return false;
}

// returns 0 or 1 for [curr, L, I, T, S, start, end]
function getNeighbors(startCoords){
	let neighbors = [0, 0, 0, 0, 0, 0, 0];
	try{
		let checking = map[startCoords[0] + 1][startCoords[1]];
		switch(checking){
			case 8:
				neighbors[0] = 1;
				break;
			case 2:
			case 3:
			case 4:
			case 5:
				neighbors[checking - 1] = 1;
				break;
			case 6:
				neighbors[5] = 1;
				break
			case 7:
				neighbors[6] = 1;
				break;
		}
	} catch(e){};
	try{
		let checking = map[startCoords[0] - 1][startCoords[1]];
		switch(checking){
			case 8:
				neighbors[0] = 1;
				break;
			case 2:
			case 3:
			case 4:
			case 5:
				neighbors[checking - 1] = 1;
				break;
			case 6:
				neighbors[5] = 1;
				break
			case 7:
				neighbors[6] = 1;
				break;
		}
	} catch(e){};
	try{
		let checking = map[startCoords[0]][startCoords[1] + 1];
		switch(checking){
			case 8:
				neighbors[0] = 1;
				break;
			case 2:
			case 3:
			case 4:
			case 5:
				neighbors[checking - 1] = 1;
				break;
			case 6:
				neighbors[5] = 1;
				break
			case 7:
				neighbors[6] = 1;
				break;
		}
	} catch(e){};
	try{
		let checking = map[startCoords[0]][startCoords[1] - 1];
		switch(checking){
			case 8:
				neighbors[0] = 1;
				break;
			case 2:
			case 3:
			case 4:
			case 5:
				neighbors[checking - 1] = 1;
				break;
			case 6:
				neighbors[5] = 1;
				break
			case 7:
				neighbors[6] = 1;
				break;
		}
	} catch(e){};
	return neighbors;
}

//cell from coords
function getCell(coords){
	return document.getElementById(`row${coords[0]}col${coords[1]}`);
}

//find coords of a html element in the grid
function coords(cell){
	const row = parseInt(cell.id.substring(3, 5));
	const col = parseInt(cell.id.substring(6 + String(row).length));
	return [row, col]; 
}

//getter
function value(cell){
	const coordpair = coords(cell);
	return map[coordpair[0]][coordpair[1]];
}
//setter
function setValue(cell, newVal){
	const coordpair = coords(cell);
	cell.className = "cell celltype" + newVal;
	map[coordpair[0]][coordpair[1]] = newVal;
}

//send message to player
function sendError(errorMessage){
	let errors = document.getElementById("errors")
	errors.innerHTML = errorMessage;
	errors.style.opacity = 1.5;
	var timer = setInterval(function () {
        if (errors.style.opacity <= 0){
            clearInterval(timer);
        }
        errors.style.opacity -= 0.01;
    });
}