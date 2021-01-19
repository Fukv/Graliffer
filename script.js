var gridOffset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-+", // toutes les adresses dispo
	kays = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567893.*/", // toutes les touches dispo a l'ecriture
	gridData = [],
	gridH = 25,
	gridW = 50,
	opcodes = [
		["gup", "dwn", "lft", "rit", "hlt", "gud"], 						// [0] zero arguments
		["guZ", "dnZ", "ltZ", "rtZ", "jmp"], 								// [1] un argument 
		["prt", "prK", "mov", "lod"],										// ...
		["add", "sus", "mlt", "div", "sup", "inf", "dif", "sam"],
	],
	ptr = {
		"x": 0,
		"y": 0,
		"elem": "",
		"dir": ""
	},
	isEditing = true,
	isInit = false,
	execLoop = undefined,
	execSpeed = 300

function error(error) {
	console.error("Erreur Graliffer : " + error);
}

// grid handling

function getCase(x, y) { // get l'element du tableau selon des coordonnées
	try {
		return document.getElementById("gridTable").rows[y].cells[x];
	} catch (error) {
		return false;
	}
}

function editCaseContent(x, y, str, isErase) {
	var elem = getCase(x, y)
	if (elem) {
		if (isErase) {
			str = str.slice(0, 3);
		} else {
			str = (elem.innerHTML + str).slice(0, 3)
		}

		elem.innerHTML = str
		gridData[x][y] = str

	}
}

function changePos(x, y) {

	var elem = getCase(x, y);

	if (elem) {
		var allActive = document.getElementsByClassName("active");
		for(var i = 0; i < allActive.length; i++) {
			allActive[i].classList.remove("active");
		}

		var allCursor = document.getElementsByClassName("cursor");
		for(var i = 0; i < allCursor.length; i++) {
			allCursor[i].classList.remove("cursor");
		}

		elem.classList.add("active");

		ptr.elem = elem;
		ptr.x = x;
		ptr.y = y;	
	}
}

function getCaseAbeNum(x, y, getCoor) {
	var x = gridOffset.indexOf(x)
	var y = gridOffset.indexOf(y)
	var cellContent = getCase(x, y)

	if (cellContent) {
		if (getCoor) {
			y = Number(y)
			x = Number(x)
			return [x, y]
		} else {
			return cellContent;
		}
	} else {
		return false;
	}
}

function accessCase(x, y, elem) { // show what case is accessed (by a black background)
	if (!elem) {
		elem = getCase(x, y);
	}
	
	if (elem) {
		elem.classList.add("access")
		setTimeout(function () {elem.classList.remove("access")}, execSpeed)
	}
}

function getRandom(min, max) {
	return Math.floor(Math.random() * ((max + 1) - min) + min)
}

function tradArg(arg) {
	let val
	if (arg[0] == ".") { // go adresse
		let elem = getCaseAbeNum(arg[1], arg[2]); // .XX
		if (elem) {
			accessCase(0, 0, elem)

			val = elem.innerHTML;
			if (isNaN(val)) {
				return val
			} else {
				return Number(val);
			}
		} else {
			return false;
		}
	} else if (arg[0] == "*") { // go pointer
		let elem = getCaseAbeNum(arg[1], arg[2]); // *XX

		if (elem) {
			accessCase(0, 0, elem)

			val = elem.innerHTML;

			return tradArg(val)

		}
	} else if (arg[0] == "/") { // go adresse pointer 
		let coor = getCaseAbeNum(arg[1], arg[2], true) // get coordonates

		accessCase(coor[0], coor[1])

		if (coor) {
			return coor
		} else {
			return [getRandom(0, gridW), getRandom(0, gridH)]
		}
	} else if (!isNaN(arg)) { // go direct
		return Number(arg); 
	} else { // go random
		return arg
	}
}


function build() {
	
	console.log("Executing..")

	if (typeof execLoop != undefined) { // security
		clearInterval(execLoop) 
	}

	opeArray = [];
	opeExpect = 1; // how much ope are expect
	finishPrec = true

	function exec(ope) {

		if (!finishPrec) {
			return 0
		}

		finishPrec = false
		doMove = true;

		if (ope) {

			let ignore = false

			if (opeArray.length == 0) { // if we expect an opcode

				if (opcodes[0].indexOf(ope) != -1) { 	// put 'opeExpect' at a certain amount
					opeExpect = 0;						// opeExpect isthe amount of ope we expect before executing the opcode with arguments
				} else if (opcodes[1].indexOf(ope) != -1) {
					opeExpect = 1;
				} else if (opcodes[2].indexOf(ope) != -1) {
					opeExpect = 2;
				} else if (opcodes[3].indexOf(ope) != -1) {
					opeExpect = 3;
				} else {
					ignore = true
				}
			} else { // if it's a argument
				ope = tradArg(ope); // translate the ope to use it, ex : /ab is tranlate as 135, if 135 was in the cell ab

				if (ope === false) { // if the arg is incorrect we put random (it's my way to handle errors)
					opeArray = getRandom(0, 999)
				}
			}

			if(!ignore) {

				opeArray.push(ope);
			}

			// -- execute -- //
			// when all expected ope are register
			if (opeExpect == 0 && !ignore) { 
				
				console.log("Launch :", opeArray);

				if (opeArray[0] == "rit") {
					ptr.dir = "r";
				} else if (opeArray[0] == "lft") {
					ptr.dir = "l";
				} else if (opeArray[0] == "dwn") {
					ptr.dir = "d";
				} else if (opeArray[0] == "gup") {
					ptr.dir = "u";

				} else if (["guZ", "dnZ", "ltZ", "rtZ"].indexOf(opeArray[0]) != -1) {
					if (opeArray[1]) {
						
						if (opeArray[0] == "guZ") {
							ptr.dir = "u";
						} else if (opeArray[0] == "dnZ") {
							ptr.dir = "d";
						} else if (opeArray[0] == "ltZ") {
							ptr.dir = "l";
						} else if (opeArray[0] == "rtZ") {
							ptr.dir = "r";
						}
					}

				} else if (opeArray[0] == "jmp") { // Jmp process

					if (typeof opeArray[1] != "object") {opeArray[1] = tradArg("/")} // get random coord

					changePos(opeArray[1][0], opeArray[1][1])
					doMove = false;

				} else if (opeArray[0] == "hlt") { // Halt process
					stopExec()
					isEditing = true;
				} else if (["prt", "prK"].indexOf(opeArray[0]) != -1) { // print
					
					if (typeof opeArray[2] != "object") {opeArray[1] = tradArg("/")}
					
					if (opeArray[0] == "prt") {
						var doErase = false;
					} else {
						var doErase = true;
					}

					editCaseContent(opeArray[2][0], opeArray[2][1], String.fromCharCode(opeArray[1].toString()), doErase)

				} else if (opeArray[0] == "lod") { // load (copy)
					if (typeof opeArray[2] != "object") {opeArray[2] = tradArg("/")}
					editCaseContent(opeArray[2][0], opeArray[2][1], opeArray[1].toString(), true)

				} else if (opeArray[0] == "mov") { // move

					if (typeof opeArray[1] != "object") {opeArray[1] = tradArg("/")}
					if (typeof opeArray[2] != "object") {opeArray[2] = tradArg("/")}

					let val = getCase(opeArray[1][0], opeArray[1][1]).innerHTML;

					editCaseContent(opeArray[2][0], opeArray[2][1], val.toString(), true)
					editCaseContent(opeArray[1][0], opeArray[1][1], "", true)

				} else if (["add", "sus", "mlt", "div", "sup", "inf", "dif", "sam"].indexOf(opeArray[0]) != -1) {

					if (typeof opeArray[1] != "number") {opeArray[1] = getRandom(0, 999)}
					if (typeof opeArray[2] != "number") {opeArray[2] = getRandom(0, 999)}
					if (typeof opeArray[3] != "object") {opeArray[3] = tradArg("/")}


					if (opeArray[0] == "add") {
						result = opeArray[1] + opeArray[2]
					} else if (opeArray[0] == "sus") {
						result = opeArray[1] - opeArray[2]
					} else if (opeArray[0] == "mlt") {
						result = opeArray[1] * opeArray[2]
					} else if (opeArray[0] == "div") {
						if (opeArray[2] == 0) {
							result = "nop";
							document.getElementById("divby0").style.display = ""
							setTimeout(function () {document.getElementById("divby0").style.display = "none"}, 2000)
						} else {
							result = opeArray[1] / opeArray[2]
						}
					} else if (opeArray[0] == "sup") {
						result = Number(opeArray[1] > opeArray[2])
					} else if (opeArray[0] == "inf") {
						result = Number(opeArray[1] < opeArray[2])
					} else if (opeArray[0] == "dif") {
						result = Number(opeArray[1] != opeArray[2])
					} else if (opeArray[0] == "sam") {
						result = Number(opeArray[1] == opeArray[2])
					}
					editCaseContent(opeArray[3][0], opeArray[3][1], result.toString(), true)
				}


				delete opeArray;
				opeArray = [];
				opeExpect = 1;
			} else {
				if (!ignore) {
					opeExpect--;
				}
			}
		}

		if (doMove) {
			// Déplace
			if (ptr.dir == "r") {
				changePos(ptr.x + 1, ptr.y)
			} else if (ptr.dir == "l") {
				changePos(ptr.x - 1, ptr.y)
			} else if (ptr.dir == "d") {
				changePos(ptr.x, ptr.y + 1)
			} else if (ptr.dir == "u") {
				changePos(ptr.x, ptr.y - 1)
			}
		}

		finishPrec = true

	}

	execLoop = setInterval(function () {
		exec(ptr.elem.innerHTML.slice(0, 3)) // loop exec
	}, execSpeed);

}

function stopExec() {

	console.log("Stop Exec")

	if (typeof execLoop != undefined) {
		clearInterval(execLoop) 
	}

}


function keyPress(e) {
	if (isInit) {
		if (isEditing) {
			if (e.key == "ArrowRight" && !e.ctrlKey || e.key == " " ||  (e.key == "Tab" && !e.shiftKey)) { // go a droite
				e.preventDefault();
				changePos(ptr.x + 1, ptr.y);
			} else if (e.key == "ArrowRight" && e.ctrlKey) { // dash droite

				changePos(gridW - 1, ptr.y)
			} else if (e.key == "ArrowLeft" && !e.ctrlKey || (e.key == "Tab" && e.shiftKey)) { // go a gauche
				changePos(ptr.x - 1, ptr.y);
			} else if (e.key == "ArrowLeft" && e.ctrlKey) { // dash a droite
				changePos(0, ptr.y);

			} else if (e.key == "ArrowUp" && !e.ctrlKey) { // go en haut
				changePos(ptr.x, ptr.y - 1)
			} else if (e.key == "ArrowUp" && e.ctrlKey) { // dash en haut
				changePos(ptr.x, 0)


			} else if (e.key == "ArrowDown" && !e.ctrlKey|| e.key == "Enter") { // go en bas
				changePos(ptr.x, ptr.y + 1);
			} else if (e.key == "ArrowDown" && e.ctrlKey) { // dash en bas
				changePos(ptr.x, gridH - 1);
			

			} else if (e.key == "Backspace") { // erase un peu
				e.preventDefault();
				
				if (ptr.elem.innerHTML == "") {
					changePos(ptr.x - 1, ptr.y);
				} else {
					editCaseContent(ptr.x, ptr.y, ptr.elem.innerHTML.slice(0, ptr.elem.innerHTML.length - 1), true);
				}
				
			} else if (e.key == "Delete") { // erase tout
				editCaseContent(ptr.x, ptr.y, "", true);
			} else if (kays.indexOf(e.key) != -1) { // -- prompt -- //
				e.preventDefault();
				editCaseContent(ptr.x, ptr.y, e.key); 

			} else if (e.key == "F9") { // lance l'execution
				isEditing = false;
				document.body.classList.remove("editing")
				ptr.elem.classList.remove("cursor")
				build()
			} else if (e.key == "c" && e.ctrlKey) {
				console.log("ctrl+c")

				textOutput = []

				for(var iY = 0; iY <= 9; iY++) {
					textOutput.push([])
					for(var iX = 0; iX <= 9; iX++) {
						let textTemp = getCase(iX, iY).innerHTML
						textOutput[iY].push(textTemp)
					}
				}

				console.log(JSON.stringify(textOutput))

			}

		} else { // si n'est pas en edition
			if (e.key == "F9") { // stoppe l'execution
				isEditing = true;
				document.body.classList.add("editing")
				stopExec()
			}
		}
	}
	
}

// init

function init() {
	function composeGrid() {

		var elGridContainer = document.getElementById('gridContainer')

		var elGrid = document.createElement("table")
		elGrid.id = "gridTable"

		/* 
		** Les tables HTML sont orienté de façon a ce que 
		** Ce soit les ordonnées (y) qui contiennent les abcisses (x)
		** et non l'inverse, comme vont être stocké les données
		*/

		for(var iRow = 0, rowTot = gridH; iRow < rowTot; iRow++) {
			elGrid.insertRow()
			elGrid.rows[iRow].setAttribute("yoffset", gridOffset[iRow])
			for(var iCol = 0, colTot = gridW; iCol < colTot; iCol++) {
				elGrid.rows[iRow].insertCell()
				if (iRow == 0) {
					elGrid.rows[iRow].cells[iCol].setAttribute("xoffset", gridOffset[iCol])
				}
			}
		}

		for(var iCol = 0, colTot = gridW; iCol < colTot; iCol++) {
			gridData[iCol] = []
			for(var iRow = 0, rowTot = gridH; iRow < rowTot; iRow++) {
				gridData[iCol][iRow] = ""
			}
		}

		elGridContainer.append(elGrid);
	}

	composeGrid()

	changePos(0, 0)

	setInterval(function () {
		if (isEditing) {
			ptr.elem.classList.toggle("cursor")
		}
	}, 500)

	isInit = true

}