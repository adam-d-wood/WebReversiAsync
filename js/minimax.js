function minimax(field, depth, maxToken, tilesLeft, maximisingPlayer=true) {
    if (depth === 0 || endcheck(field)) {
        return new ValuedMove(evaluate(field, maxToken, tilesLeft), null)
    }
    let simToken = (maximisingPlayer ? maxToken : 3-maxToken)
    let legals = findLegalMoves(field, simToken)
    if (legals == false) legals.push(null)
    if (maximisingPlayer) {
        var value = new ValuedMove(-10000, null)
        for (var move of legals) {
            var newfield = mockPlay(field, move, simToken)
            value = maxMove(value, new ValuedMove(minimax(newfield, depth-1, maxToken, tilesLeft, false).value, inv(move)))
        }
        return value
    } else {
        var value = new ValuedMove(10000, null)
        for (var move of legals) {
            var newfield = mockPlay(field, move, simToken)
            value = minMove(value, new ValuedMove(minimax(newfield, depth-1, maxToken, tilesLeft, true).value, inv(move)))
        }
        return value
    }
}

// function negascout(field, depth, token, tilesLeft, alpha=-10000, beta=10000, colour=1) {
//     if (depth === 0 || endcheck(field)) {
//         return new ValuedMove(colour * evaluate(field, token, tilesLeft), null)
//     }
//     let simToken = (colour == 1 ? token : 3 - token)
//     let legals == false
// }

function alphabeta(field, depth, maxToken, tilesLeft, alpha=-10000, beta=10000, maximisingPlayer=true) {
    if (depth === 0 || endcheck(field)) {
        return new ValuedMove(evaluate(field, maxToken, tilesLeft), null)
    }
    let simToken = (maximisingPlayer ? maxToken : 3-maxToken)
    let legals = findLegalMoves(field, simToken)
    if (legals == false) legals.push(null)
    console.log(legals)
    if (maximisingPlayer) {
        var value = new ValuedMove(-10000, null)
        for (var move of legals) {
            var newfield = mockPlay(field, move, simToken)
            value = maxMove(value, new ValuedMove(alphabeta(newfield, depth-1, maxToken, tilesLeft, alpha, beta, false).value, inv(move)))
            alpha = maxMove(alpha, value.value)
            if (alpha >= beta) {
                console.log("beta cut")
                console.log(alpha, beta)
                break
            }
        }
        return value
    } else {
        var value = new ValuedMove(10000, null)
        for (var move of legals) {
            var newfield = mockPlay(field, move, simToken)
            value = minMove(value, new ValuedMove(alphabeta(newfield, depth-1, maxToken, tilesLeft, alpha, beta, true).value, inv(move)))
            beta = minMove(beta, value.value)
            if (alpha >= beta) {
                console.log("alpha cut")
                console.log(alpha, beta)
                break
            }
        }
        return value
    } 
}