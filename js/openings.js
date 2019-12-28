function loadOpenings() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let openings = this.responseText.split("\n")
            for (let i = 0; i < openings.length; i++) {
                // console.log(openings[i])
                openings[i] = openings[i].split(", ")
            }
            // document.getElementById("ops").innerHTML = "this.asdasdasdad";
            // console.log(openings)
        }
    }
    xhttp.open("GET", "books/openings.txt", true)
    xhttp.send()
}

console.log("big brain time")  
loadOpenings()

function findLegalMoves2(board, player=null) {

    /* 
    Find all empty cells which are adjacent to enemy cells
    (as only these cells have the potential to be legal moves)
     */

    if (player == null) player == this.turnToken()
    let candidates = []
    let enemyCells = []
    for (let i=0; i < board.rows; i++) {
        for (let j=0; j < board.cols; j++) {
            if (board.field[i][j] == 3 - player) {
                enemyCells.push([i,j])
            }
        }
    }

    //generate array of possible directions to test

    let surrounds = []
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (i != 0 || j != 0) {
                surrounds.push([i, j])
            }
        }
    }

    //check in each direction of the enemy cells for empty cells

    for (let cell of enemyCells)  {
        for (let s of surrounds) {
            var testedCell = cell.map(function(a, b) {return a+s[b]})
            console.log(cell, s, testedCell)
            if (this.onBoard(testedCell) &&
                board.field[testedCell[0]][testedCell[1]] == 0) {
                    candidates.push(testedCell)
                }
        }
    }
    console.log(candidates)

    //check that each candidate for a legal move results in flipped tiles

    let valid = false
}
