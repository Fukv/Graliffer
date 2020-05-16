input = [["sdf","sss","sd","","","","","","",""],["","","","","sd","q","","","",""],["q","sdf","","","","","f","qsd","",""],["","","q","sd","f","q","sdq","f","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""],["","","","","","","","","",""]]

for(var iY = 0; iY <= 9; iY++) {
	for(var iX = 0; iX <= 9; iX++) {
		editCaseContent(iX, iY, input[iY][iX])
	}
}



textOutput = []

for(var iY = 0; iY <= 9; iY++) {
    textOutput.push([])
    for(var iX = 0; iX <= 9; iX++) {
        let textTemp = getCase(iX, iY).innerHTML
        
		textOutput[iY].push(textTemp)
    }
    
}

console.log(JSON.stringify(textOutput))