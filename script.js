passedInit = false;
isEditing = true;
execSpeed = 200;
finishPrev = true;
maxX = 9;
maxY = 9;

kays = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567893.*/"; // toutes les touches dispo a l'ecriture
opcodes = [
	["gup", "dwn", "lft", "rit", "hlt", "gud"], 				// [0] zero arguments
	["guZ", "dnZ", "ltZ", "rtZ"], 								// [1] un argument 
	["prt", "prK", "mov", "lod"],										// ...
	["add", "sus", "mlt", "div", "sup", "inf", "dif", "sam"],
]

caseStorage = "" // juste pour stocker et pouvoir retrouver le code

ptr = {
	"x": 0,
	"y": 0,
	"elem": "",
	"dir": ""
};

function getCase(x, y) {
	try {
		return document.getElementById("tear").children[y].children[x];
	} catch (error) {
		return false;
	}
}

function getCaseAbeNum(x, y, getCoor) {
	var x = kays.indexOf(x)
	var casePut = getCase(x, y)

	if (casePut) {
		if (getCoor) {
			y = Number(y)
			x = Number(x)
			return [x, y]
		} else {
			return casePut;
		}
	} else {
		return false;
	}
}

function error(error) {
	console.error("Erreur Graliffer : " + error);
}



function changePos(x, y) {

	var elem = getCase(x, y);

	if (elem) {
		allActive = document.getElementsByClassName("active");
		for(var i = 0; i < allActive.length; i++) {
			allActive[i].classList.remove("active");
		}

		elem.classList.add("active");

		ptr.elem = elem;
		ptr.x = x;
		ptr.y = y;	
	}
}

function editCaseContent(x, y, str, isErase) {

	elem = getCase(x, y)

	if (elem) {

		if (isErase) {
			elem.innerHTML = str.slice(0, 3);
		} else {
			elem.innerHTML = (elem.innerHTML + str).slice(0, 3)
		}

	}
}

function getRandom(min, max) {
	return Math.floor(Math.random() * ((max + 1) - min) + min)
}

function accessCase(x, y, elem) {
	if (!elem) {
		elem = getCase(x, y);
	}
	
	if (elem) {
		elem.classList.add("access")
		setTimeout(function () {elem.classList.remove("access")}, execSpeed)
	}
}

function tradArg(arg) {
	let val
	if (arg[0] == ".") { // go adresse
		let elem = getCaseAbeNum(arg[1], arg[2]);

		if (elem) {

			accessCase(0, 0, elem)

			val = elem.innerHTML;
			if (!isNaN(Number(val))) {
				return Number(elem.innerHTML);
			} else {
				return getRandom(0, 999)
			}
		} else {
			return false;
		}

	} else if (arg[0] == "*") { // go pointer
		let elem = getCaseAbeNum(arg[1], arg[2]);

		if (elem) {
			accessCase(0, 0, elem)

			val = elem.innerHTML;

			console.log(val);
			return tradArg(val)

		}
	} else if (arg[0] == "/") { // go adresse pointer
		let coor = getCaseAbeNum(arg[1], arg[2], true)

		accessCase(coor[0], coor[1])

		if (coor) {
			return coor
		} else {
			return [getRandom(0, 9), getRandom(0, 9)]
		}
	} else if (!isNaN(Number(arg))) { // go direct
		return Number(arg); 
	} else { // go random
		console.log("random");
		return getRandom(0, 999)
	}
}

function build(stop) {
	if (!stop) {
		if (finishPrev) {
			finishPrev = false
			opeArray = [];
			opeExpect = 1;


			

			function exec(ope) {
				if (ope) {
					// console.log(ope)

					let ignore = false

					if (opeArray.length == 0) { // si on est a l'opcode et non au arg

						if (opcodes[0].indexOf(ope) != -1) {
							opeExpect = 0;
						} else if (opcodes[1].indexOf(ope) != -1) {
							opeExpect = 1;
						} else if (opcodes[2].indexOf(ope) != -1) {
							opeExpect = 2;
						} else if (opcodes[3].indexOf(ope) != -1) {
							opeExpect = 3;
						} else {
							ignore = true
						}
					} else {
						ope = tradArg(ope);

						if (ope === false) {
							opeArray = getRandom(0, 999)
						}
					}


					if(!ignore) {
						opeArray.push(ope);
					}
									
// -- execute -- //
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
							if (!opeArray[1]) {
								
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

						} else if (opeArray[0] == "hlt") { // Halt process
							build(true)
							isEditing = true;
						} else if (["prt", "prK"].indexOf(opeArray[0]) != -1) { // print
							
							if (typeof opeArray[1] != "object") {opeArray[1] = tradArg("/")}

							if (opeArray[0] == "prt") {
								editCaseContent(opeArray[1][0], opeArray[1][1], String.fromCharCode(opeArray[2].toString()), true)
							} else {
								editCaseContent(opeArray[1][0], opeArray[1][1], String.fromCharCode(opeArray[2].toString()))
							}

						} else if (["mov", "lod"].indexOf(opeArray[0]) != -1) { // move et load (copy)

							if (typeof opeArray[1] != "object") {opeArray[1] = tradArg("/")}
							if (typeof opeArray[2] != "object") {opeArray[2] = tradArg("/")}

							let val = getCase(opeArray[1][0], opeArray[1][1]).innerHTML;

							editCaseContent(opeArray[2][0], opeArray[2][1], val.toString(), true)

							if (opeArray[0] == "mov") {
								editCaseContent(opeArray[1][0], opeArray[1][1], "", true)
							}

						} else if (["add", "sus", "mlt", "div", "sup", "inf", "dif", "sam"].indexOf(opeArray[0]) != -1) {

							if (typeof opeArray[1] != "object") {opeArray[1] = tradArg("/")}
							if (typeof opeArray[2] != "number") {opeArray[2] = getRandom(0, 999)}
							if (typeof opeArray[3] != "number") {opeArray[3] = getRandom(0, 999)}

							if (opeArray[0] == "add") {
								result = opeArray[2] + opeArray[3]
							} else if (opeArray[0] == "sus") {
								result = opeArray[2] - opeArray[3]
							} else if (opeArray[0] == "mlt") {
								result = opeArray[2] * opeArray[3]
							} else if (opeArray[0] == "div") {
								if (opeArray[3] == 0) {
									result = "nop";
									document.getElementById("divby0").style.display = ""
									setTimeout(function () {document.getElementById("divby0").style.display = "none"}, 2000)
								} else {
									result = opeArray[2] / opeArray[3]
								}
							} else if (opeArray[0] == "sup") {
								result = Number(opeArray[2] > opeArray[3])
							} else if (opeArray[0] == "inf") {
								result = Number(opeArray[2] < opeArray[3])
							} else if (opeArray[0] == "dif") {
								result = Number(opeArray[2] != opeArray[3])
							} else if (opeArray[0] == "sam") {
								result = Number(opeArray[2] == opeArray[3])
							}
							editCaseContent(opeArray[1][0], opeArray[1][1], result.toString(), true)
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

				finishPrev = true;

			}

			chem = setInterval(function () {
				exec(ptr.elem.innerHTML.slice(0, 3)) // loop exec
			}, execSpeed);
		}
	} else {
		if (typeof chem != undefined) {
			clearInterval(chem) 
		}
	}
}



function keyPress(e) {
	if (passedInit) {
		if (isEditing) {
			if (e.key == "ArrowRight" && !e.ctrlKey || e.key == " " ||  (e.key == "Tab" && !e.shiftKey)) { // go a droite
				e.preventDefault();
				changePos(ptr.x + 1, ptr.y);
			} else if (e.key == "ArrowRight" && e.ctrlKey) { // dash droite
				changePos(maxX, ptr.y)

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
			} else if (e.key == "ArrowDown" && e.ctrlKey) { // dash en base
				changePos(ptr.x, maxY);
			

			} else if (e.key == "Backspace") { // erase un peu
				e.preventDefault();
				editCaseContent(ptr.x, ptr.y, ptr.elem.innerHTML.slice(0, ptr.elem.innerHTML.length - 1), true);
			} else if (e.key == "Delete") { // erase tout
				editCaseContent(ptr.x, ptr.y, "", true);
			} else if (kays.indexOf(e.key) != -1) { // -- prompt -- //
				e.preventDefault();
				editCaseContent(ptr.x, ptr.y, e.key); 

			} else if (e.key == "F9") { // lance l'execution
				isEditing = false;
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

		} else {
			if (e.key == "F9") { // stoppe l'execution
				isEditing = true;
				build(true)
			}
		}
	}
	
}

function init() {
	changePos(0, 0)
	setInterval(function () {
		if (isEditing) {
			ptr.elem.classList.toggle("cursor")
		}
	}, 500)

	passedInit = true
}