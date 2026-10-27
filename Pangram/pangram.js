window.onload = function() {
	//https://dev.to/kaelscion/dynamically-filling-in-a-css-grid-with-javascript-5geb
	
	//makes evenly sized cells
	let kb = document.getElementById("keyboard");
    kb.style.gridTemplateColumns = `repeat(13, 1fr)`;
    kb.style.gridTemplateRows = `repeat(2, 1fr)`;

	//scales div so that each cell is 60x60px
	kb.style.width = 13 * 30 + "px";
	kb.style.height = 2 * 30 + "px";
	
	for(const curr of Array(26).keys()) {
		let markup = `<div id="key${curr + 1}" class="letter">${String.fromCharCode(64 + 1 + curr)}</div>`;
		kb.innerHTML += markup;
	}
	
	for(let i = 1; i < 6; i++) {
		document.getElementById("card" + i).addEventListener('change', update);
	}
}

function update () {
	let totalString = "";
	for(let i = 1; i < 6; i++) {
		totalString += document.getElementById("card" + i).value.toUpperCase	();
	}
	console.log(totalString);
	for(let i = 1; i < 27; i++) {
		if(totalString.indexOf(String.fromCharCode(64 + i)) > -1) {
			document.getElementById("key" + i).style.background = "MediumSeaGreen";
		} else {
			document.getElementById("key" + i).style.background = "White";
		}
	}
}
