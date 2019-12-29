class ValuedMove {

    constructor(value, move) {
        this.value = value;
        this.move = move;
    }
}

function endcheck(field) {
    let blackLegals = findLegalMoves(field, 1);
    let redLegals = findLegalMoves(field, 2);
    if (blackLegals == false && redLegals == false) {
        return true;
    } else {
        return false;
    }
}

function evaluateByWeight(field, maxToken) {
    let weightings = []
    let n = 8 - 1
    for (let i = 0; i < n+1; i++) {
        let row = []
        for (let j = 0; j < n+1; j++) {
            let score
            //test for corner square
            if ((i-n/2)**2+(j-n/2)**2==n**2/2) {
                score = 100
            //test for next-to corner square
            } else if ((i-n/2)**2+(j-n/2)**2==((n-1)**2+1)/2) {
                score = -5
            } else if ([i,j].map(function (x) {
                [0,n].includes(x)
            }).reduce(function(x, y) {x || y})) {
                score = 5
            } else {
                score = 0
            }
            row.push(score)
        }
        weightings.push(row)
    }

    let result = 0;
    for (let i = 0; i < weightings.length; i++) {
        for (let j = 0; j < weightings[i].length; j++) {
            let mult
            if (field[i][j] == maxToken) {
                mult = 1
            } else if (field[i][j] == 3 - maxToken) {
                mult = -1
            } else {
                mult = 0
            }
            result += mult * weightings[i][j]
        }
    }
    return result
}

function countFrontiers(field) {
    let black = 0, red = 0
    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[i].length; j++) {
            if (field[i][j] != 0) {
                const surrounds = [[0,1], [0,-1], [-1,0], [1,0]]
                let frontier = false
                for (let s of surrounds) {
                    let cell = [i+s[0], j+s[1]]
                    if (onBoard(cell) && field[cell[0]][cell[1]] == 0) {
                        frontier = true 
                    }
                }
                if (frontier) {
                    if (field[i][j] == 1) {
                        black ++
                    } else {
                        red ++
                    }
                }
            }
        }   
    }
    return [black, red]
}

function evaluateByTerritory(field, maxToken) {
    let black = 0, red = 0
    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[i].length; j++) {
            if (field[i][j] == 1) black ++
            else if (field[i][j] == 2) red ++
        }
    }
    return (maxToken == 1 ? black-red : red-black)
}

function evauateByMobility(field, maxToken) {
    const blackMoves = findLegalMoves(field, 1).length
    const redMoves = findLegalMoves(field, 2).length
    const team = (maxToken == 1 ? 1 : -1)
    const mobility = blackMoves - redMoves
    return mobility * team
}

function evaluateByFrontiers(field, maxToken) {
    const frontiers = countFrontiers(field)
    const [black, red] = frontiers
    return (maxToken == 1 ? red-black : black-red)
}

function mockPlay(field, move, token) {
    if (move == null) return field
    let newfield = JSON.parse(JSON.stringify(field))
    newfield[move[0]][move[1]] = token
    flipTokens(newfield, [move[1],move[0]], token)
    return newfield
}

function evaluate(field, maxToken, tilesLeft) {
    console.log("tiles left", tilesLeft)
    if (endcheck(field)) {
        console.log("yh ended")
        score = evaluateByTerritory(field, maxToken)
        if (score > 0) {
            return 1000 + score
        } else if (score < 0) {
            return -1000 + score
        } else {
            return 0
        }
    }
    if (tilesLeft > 5) {
        const mc = 1, fc = 1, ec = 1
        const mobility = evauateByMobility(field, maxToken)
        const frontiers = evaluateByFrontiers(field, maxToken)
        const edges = evaluateByWeight(field, maxToken)
        return mc*mobility + fc*frontiers + ec*edges
    } else return evaluateByTerritory(field, maxToken)
}

function inv(move) {
    if (move == null) {
        return move
    } else {
        return [move[1], move[0]]
    }
}

function maxMove(a, b) {
    let vals = []
    console.log(a, b)
    for (let m of [a,b]) {
        while (m instanceof ValuedMove) {
            m = m.value
        }
        vals.push(m)
    }
    console.log("max move", vals)
    return (vals[0] >= vals[1] ? a : b)
}

function minMove(a, b) {
    let vals = []
    console.log(a, b)
    for (let m of [a,b]) {
        while (m instanceof ValuedMove) {
            m = m.value
        }
        vals.push(m)
    }
    console.log("min move", vals)
    return (vals[0] <= vals[1] ? a : b)
}

function negascout(field, depth, token, tilesLeft, alpha=-100000, beta=100000, colour=1) {
    // console.log("depth", depth, "endcheck", endcheck(field))
    if(depth <= 0 || endcheck(field)) {
        // console.log("returning")
        return new ValuedMove(colour * evaluate(field, token, tilesLeft), null)
    }
    const simToken = (colour == 1 ? token : 3 - token)
    let legals = findLegalMoves(field, simToken)
    let orderedValLegals = []
    orderMoves(field, depth-1, colour, token, tilesLeft, legals, orderedValLegals)
    let orderedLegals = deval(orderedValLegals)
    // console.log(orderedLegals)
    if (orderedLegals.length == 0) orderedLegals = legals
    // console.log(legals)
    if (orderedLegals == []) orderedLegals.push(null)
    for (let move of orderedLegals) {
        const newfield = mockPlay(field, move, simToken)
        if (orderedLegals.indexOf(move) == 0) {
            var score = new ValuedMove(-negascout(newfield, depth-1, token, tilesLeft, -beta, -alpha, -colour).value, inv(move))
        } else {
            var score = new ValuedMove(-negascout(newfield, depth-1, token, tilesLeft, -alpha-1, -alpha, -colour).value, inv(move))
            if (alpha < score && score < beta) {
                score = new ValuedMove(-negascout(newfield, depth-1, token, tilesLeft, -beta, -score, -colour).value, inv(move))
            }
        }
        alpha = maxMove(alpha, score.value)
        if (alpha >= beta) break
    }
    return alpha
}

function orderMoves(field, depth, colour, token, tilesLeft, legals, orderedLegals) {
    let cont = true
    if (depth <=0 || endcheck(field)) {
        return new ValuedMove(colour * evaluate(field, token, tilesLeft), null)
    }
    const simToken = (colour == 1 ? token : 3 - token)
    for (let move of legals) {
        const newfield = mockPlay(field, move, simToken)
        if (orderedLegals.length < legals.length) {
            var value = new ValuedMove(-orderMoves(newfield, depth-1, -colour, token, tilesLeft, legals, orderedLegals).value, move)
        } else {
            cont = false
            var value = new ValuedMove(0, null)
        }
        if (depth == 1 && cont) {
            insertInOrder(value, orderedLegals)
        }
        if (!cont) break
    }
    return new ValuedMove(0, null)
}

function deval(valmoves) {
    // console.log(valmoves)
    let result = []
    for (let valmove of valmoves) {
        result.push(valmove.move)
    }
    return result
}

function insertInOrder(value, orderedLegals) {
    orderedLegals.push(value)
    orderedLegals.sort(function(a, b) {return b-a})
    return orderedLegals
}

function flipTokens(field, cell, player) {
    var directions = []
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            directions.push([i,j])
        }
    }
    directions.splice(4, 1) //removes [0, 0]
    var runs = []
    for (var d of directions) {
        var run = [],
            testedCell = cell,
            ended = false, valid = true
        while (!ended) {
            run.push(testedCell)
            testedCell = testedCell.map(function(a, b) {return a+d[b]})
            if (!onBoard(testedCell)) {
                valid = false
                break
            }
            if (field[testedCell[1]][testedCell[0]] != 3-player) {
                ended = true
            }
        }
        if (valid && field[testedCell[1]][testedCell[0]] == player) {
            runs.push(run)
        }
    }
    for (var r of runs) {
        for (var tile of r) {
            field[tile[1]][tile[0]] = player
        }
    }
}   

function findNeighbours(field, player) {
    let neighbours = []
    let occupiedCells = []
    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[i].length; j++) {
            if(field[i][j] != 0) {
                occupiedCells.push([i,j])
            }
        }
    }
    var surrounds = []
    for (i = -1; i < 2; i++) {
        for (j = -1; j < 2; j++) {
            if (i != 0 || j != 0) {
                surrounds.push([i,j])
            }
        }
    }    
    for (let cell of occupiedCells) {
        for (let s of surrounds) {
            let neighbour = cell.map(function(a, b) {return a+s[b]})
            if (onBoard(neighbour) && field[neighbour[0]][neighbour[1]] == 0) {
                neighbours.push(neighbour)
            }
        }
    }
    return neighbours
}

function validateNeighbours(neighbours, field, player) {
    let legals = [], directions = []
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            directions.push([i,j])
        }
    }
    directions.splice(4, 1) //removes [0, 0]
    for (let move of neighbours) {
        let valid = false
        for (let d of directions) {
            let testedCell = [move[1], move[0]]
            let runLength = 0
            while (true) {
                testedCell = testedCell.map(function(a, b) {return a+d[b]})
                if (onBoard(testedCell)) {
                    if (field[testedCell[1]][testedCell[0]] == 3-player) {
                        runLength++
                    } else if (field[testedCell[1]][testedCell[0]] == player) {
                        if (runLength > 0) {
                            valid = true
                        }
                        break
                    } else break
                } else break
        
            }
        }
        if (valid) legals.push(move)
    }
    // console.log(trueLegals)
    return legals
}

function deleteDuplicates(legals) {
    let result = []
    for (let move of legals) {
        if (!JSON.stringify(result).includes(move)) {
            result.push(move)
        }
    }
    return result
}

function findLegalMoves(field, player) {
    var neighbours = findNeighbours(field, player)
    var legals = validateNeighbours(neighbours, field, player)
    return deleteDuplicates(legals)
}

function onBoard(cell) {
    let valid = true
    for (let coord of cell) {
        valid = valid && 0 <= coord && coord < 8
    }
    return valid
}

function minimax2(field, depth, maxToken, tilesLeft, maximisingPlayer=true) {
    if (depth == 0 || endcheck(field)) {
        return new ValuedMove(evaluate(field, maxToken, tilesLeft), null)
    }
    let simToken = (maximisingPlayer ? maxToken : 3-maxToken)
    console.log("sim token", simToken)
    let legals = findLegalMoves(field, simToken)
    if (legals == false) legals.push(null)
    console.log("legals", JSON.parse(JSON.stringify(legals)))
    if (maximisingPlayer) {
        var value = new ValuedMove(-10000, null) //arbitrarily large and -ve
        for (var move of legals) {
            var newfield = mockPlay(field, move, simToken)
            console.log("newfield", JSON.parse(JSON.stringify(newfield)))
            value = maxMove(value, new ValuedMove(minimax(newfield, depth-1, maxToken, tilesLeft, false).value, inv(move)))
            console.log("value", value)
        }
        console.log(value)
        return value
    } else {
        var value = new ValuedMove(10000, null) //arbitrarily large and +ve
        for (var move of legals) {
            var newfield = mockPlay(field, move, simToken)
            console.log("newfield", JSON.parse(JSON.stringify(newfield)))
            value = minMove(value, new ValuedMove(minimax(newfield, depth-1, maxToken, tilesLeft, true).value, inv(move)))
            console.log("value min", value)
        }
        console.log(value)
        return value
    }
}

function findLegalMoves2(board, player=null) {
    let legals = []
    let friendlyCells = []
    // console.log(friendlyCells)
    let enemyCells = []
    // console.log("enemy: ", enemyCells)
    for (i=0; i < board.rows; i++) {
        for (j=0; j < board.cols; j++) {
            // console.log([i,j])
            if (board.field[i][j] == player) {
                friendlyCells.push([i,j])
                // console.log(friendlyCells)
                // friendlyCells.map(console.log)
            } else if (board.field[i][j] ==  3-player) {
                enemyCells.push([i,j])
                // console.log("enemy: ", enemyCells)
            }
        }
    }
    var surrounds = []
    for (i = -1; i < 2; i++) {
        for (j = -1; j < 2; j++) {
            if (i != 0 || j != 0) {
                surrounds.push([i,j])
            }
        }
    }
    var totalOccupied = friendlyCells.concat(enemyCells)
    for (var cell of totalOccupied) {
        for (var s of surrounds) {
            var neighbour = []
            for (var i = 0; i <= 1; i++) {
                neighbour.push(cell[i] + s[i])
            }
            var legal = true
            if (JSON.stringify(totalOccupied).includes(neighbour)) legal = false
            for (var ordinate of neighbour) {
                if (!(0 <= ordinate && ordinate < board.cols)) legal = false
                }
            if (legal) legals.push(neighbour)
            }
        }
    // console.log("maybe legals", legals)
    var trueLegals = [], directions = []
    for (var i = -1; i < 2; i++) {
        for (var j=-1; j<2; j++) {
            directions.push([i, j])
        }
    }
    directions.splice(4, 1) //removes [0, 0]
    for (var move of legals) {
        // console.log(legals)
        // console.log("move", move)
        var valid = false
        for (var d of directions) {
            // console.log(d)
            var testedCell = [move[1], move[0]]
            // console.log("restart", testedCell)
            var runLength = 0
            while (true) {
                // console.log("tested cell", testedCell)
                var testedCell = testedCell.map(function(a, b) {return a+d[b]})
                // console.log("next tested cell", testedCell)
                if (this.onBoard(testedCell)) {
                    if (board.field[testedCell[1]][testedCell[0]] == 3-player) {
                        runLength++
                        // console.log("run", runLength)
                    } else if (board.field[testedCell[1]][testedCell[0]] == player) {
                        if (runLength > 0) {
                            valid = true
                            // console.log("gotem")
                        }
                        break
                    } else break
                } else break
        
            }
        }
        if (valid) trueLegals.push(move)
    }
    // console.log(trueLegals)
    return trueLegals
}