class Reversi {

    constructor(dims) {
        this.board = new Board(dims)
        this.display = new Display(dims)
        this.gameRunning = true
        this.blackTurn = true
        this.missedTurns = 0
        this.humanPlayers = []

        switch (document.getElementById("blackplayerselect").value) {
            case "Human":
                this.blackPlayer = "human"
                break;
            case "Alphabeta":
                this.blackPlayer = alphabeta
        }

        switch (document.getElementById("redplayerselect").value) {
            case "Human":
                this.blackPlayer
        }
        this.blackPlayer = document.getElementById("blackplayerselect").value
        this.blackPlayer = alphabeta
        this.redPlayer = alphabeta
        this.aiDelay = 0 //miliseconds
        this.freeTiles = dims ** 2 - 4
        this.gameHistory = ""
        this.inBook = true
        this.useBook = true
            // this.blackDepth = document.getElementById("depthSelect1").value
            // this.redDepth = document.getElementById("depthSelect2").value
        this.blackDepth = Number(document.getElementById("blackdepth").value[0])
        console.log("black depth: ", this.blackDepth)
        this.redDepth = Number(document.getElementById("reddepth").value[0])
        console.log("red depth: ", this.redDepth)
            // this.blackDepth = 2
            // this.redDepth = 4
        this.thinking = false
        Object.defineProperty(this, 'openings', {
            configurable: true,
            writable: true,
            value: []
        })
        this.initGameTable()
    }

    updateGameTable() {
        console.log("yeah boii")
        let table = document.getElementById("moveHistory")
        if (this.gameHistory.length % 4 === 0) {
            console.log(table.rows[0])
            let row = table.rows[table.rows.length - 1]
            let cell = row.cells[1]
            console.log(row)
            cell.innerHTML = this.gameHistory.slice(-2)
        } else {
            let row = table.insertRow(-1)
            let cell1 = row.insertCell(0)
            cell1.innerHTML = this.gameHistory.slice(-2)
            row.insertCell(1)
        }
    }

    initGameTable() {
        let table = document.getElementById("moveHistory")
        console.log("table", table)
        for (let i = 0; i < table.rows.length; i++) {
            table.deleteRow(i)
        }
    }

    loadOpenings(callback) {
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                callback(this)
            }
        }
        xhttp.open("GET", "books/openings.txt", true)
        xhttp.send()
    }

    callback(xhttp) {
        let openings = xhttp.responseText.split("\n")
        for (let i = 0; i < openings.length; i++) {
            openings[i] = openings[i].toLowerCase().split(", ")
                // console.log(openings[i])
        }
        reversi.openings = openings
    }

    draw() {
        this.display.drawBoard(this.board)
    }

    turnToken() {
        if (this.blackTurn) return 1
        else return 2
    }

    gameEnded() {
        if (this.findLegalMoves(this.board, 1) == false && this.findLegalMoves(this.board, 2) == false) {
            console.log("ended")
            return true
        } else {
            console.log("not ended")
            return false
        }
        // console.log("missed", this.missedTurns)
    }

    insertToken(cell, field) {
        console.log("cell", cell)
            // console.log(JSON.parse(JSON.stringify(field)))
        var [col, row] = cell
        // console.log(col, row)
        // console.log("field", field)
        console.log("legals", this.findLegalMoves(this.board))
        if (JSON.stringify(this.findLegalMoves(this.board)).includes(cell.reverse())) {
            var success = true
            field[row][col] = this.turnToken()
                // console.log(JSON.parse(JSON.stringify(field)))
        } else {
            success = false
            console.log("illegal")
        }
        // console.log("success", success)
        return success
    }

    findLegalMoves(board, player = null) {
        if (player == null) player = this.turnToken()
        let legals = []
        let friendlyCells = []
            // console.log(friendlyCells)
        let enemyCells = []
            // console.log("enemy: ", enemyCells)
        for (i = 0; i < board.rows; i++) {
            for (j = 0; j < board.cols; j++) {
                // console.log([i,j])
                if (board.field[i][j] == player) {
                    friendlyCells.push([i, j])
                        // console.log(friendlyCells)
                        // friendlyCells.map(console.log)
                } else if (board.field[i][j] == 3 - player) {
                    enemyCells.push([i, j])
                        // console.log("enemy: ", enemyCells)
                }
            }
        }
        var surrounds = []
        for (i = -1; i < 2; i++) {
            for (j = -1; j < 2; j++) {
                if (i != 0 || j != 0) {
                    surrounds.push([i, j])
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
        var trueLegals = [],
            directions = []
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
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
                    var testedCell = testedCell.map(function(a, b) { return a + d[b] })
                        // console.log("next tested cell", testedCell)
                    if (this.onBoard(testedCell)) {
                        if (board.field[testedCell[1]][testedCell[0]] == 3 - player) {
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

    onBoard(cell) {
        var valid = true
        for (var coord of cell) {
            valid = valid && 0 <= coord && coord < this.board.cols
        }
        return valid
    }

    flipTokens(field, cell) {
        console.log(field)
            // console.log("from flip", cell, JSON.parse(JSON.stringify(field)))
        var directions = []
        for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
                directions.push([i, j])
            }
        }
        directions.splice(4, 1) //removes [0, 0]
            // console.log("directions", directions)
        var runs = []
        for (var d of directions) {
            var run = [],
                testedCell = cell,
                ended = false,
                valid = true
            while (!ended) {
                run.push(testedCell)
                testedCell = testedCell.map(function(a, b) { return a + d[b] })
                if (!this.onBoard(testedCell)) {
                    valid = false
                    break
                }
                if (field[testedCell[1]][testedCell[0]] != 3 - this.turnToken()) {
                    ended = true
                        // console.log("ended", this.constructor.humanForm(testedCell))
                }
            }
            // console.log("run", run)
            // console.log(field[testedCell[1]][testedCell[0]])
            if (valid && field[testedCell[1]][testedCell[0]] == this.turnToken()) {
                runs.push(run)
                    // console.log("ya")
            }
        }
        // console.log("runs", runs)
        for (var r of runs) {
            for (var tile of r) {
                // console.log("cell", tile)
                field[tile[1]][tile[0]] = this.turnToken()
            }
        }
    }

    countTokens(board) {
        var black = 0,
            red = 0
        for (var i = 0; i < board.rows; i++) {
            for (var j = 0; j < board.cols; j++) {
                if (board.field[i][j] == 1) black++
                    else if (board.field[i][j] == 2) red++
            }
        }
        return [black, red]
    }

    addListeners() {
        document.getElementById("myCanvas").addEventListener("mousedown", this.processMove)
    }

    mainLoop() {
        this.addListeners()
        let i = 0
        this.thinking = false
            // while (this.gameRunning) {
        while (i < 50) {
            if (this.gameEnded()) {
                this.gameRunning = false
                this.handlegameEnd()
            } else {
                console.log("a")
                if (this.findLegalMoves(this.board) == false) {
                    this.missedTurns++
                        this.blackTurn = !(this.blackTurn)
                        // this.handleTurn()
                } else {
                    console.log("b")
                    var activePlayer = (this.blackTurn ? this.blackPlayer : this.redPlayer)
                    if (activePlayer != "human" && !this.thinking) {
                        console.log("c")
                            // setTimeout(function() {this.processCompMove(activePlayer)}, this.aiDelay)
                        this.thinking = true
                        this.processCompMove(activePlayer)
                    }
                }
            }
            i++
        }
    }

    handleTurn() {
        if (this.gameEnded()) {
            this.gameRunning = false
            this.handlegameEnd()
        } else {
            console.log("galactic brain")
            if (this.findLegalMoves(this.board) == false) {
                this.missedTurns++
                    this.blackTurn = !(this.blackTurn)
                this.handleTurn()
            } else {
                var activePlayer = (this.blackTurn ? this.blackPlayer : this.redPlayer)
                console.log("activeplayer: ", activePlayer)
                if (activePlayer === "human") {
                    document.getElementById("myCanvas").addEventListener("mousedown", this.processMove)
                    console.log("listening for input")
                } else if (!this.thinking) { //if computer player
                    this.thinking = true
                    console.log("processing CompMove")
                    setTimeout(function() { reversi.processCompMove(activePlayer) }, this.aiDelay)
                }
            }
        }

    }

    processCompMove(player) {
        var executed = false
        var activePlayer = (this.blackTurn ? this.blackPlayer : this.redPlayer)
        if (activePlayer !== "human") {
            console.log("d")
            if (this.gameHistory == "") {
                let legals = this.findLegalMoves(this.board)
                var move = legals[Math.floor(Math.random() * legals.length)].reverse()
                executed = true
                console.log("executed = true (immediate)")
                this.executeMove(move)
                    // var move = [2, 3]
            } else if (this.inBook && this.useBook) {
                console.log("yh")
                this.inBook = false
                let possibleOpenings = []
                for (let rot = 0; rot < 4; rot++) {
                    var rotatedHistory = ""
                    for (let i = 0; i < this.gameHistory.length / 2; i++) {
                        let cell = this.machineForm(this.gameHistory.slice(i * 2, i * 2 + 2).split(""))
                        let rotatedCell = Reversi.humanForm(this.board.rotateCell(cell, rot)).join("")
                        rotatedHistory += rotatedCell
                    }
                    for (let opening of this.openings) {
                        // console.log(opening[0], rotatedHistory)
                        if (opening[0].startsWith(rotatedHistory)) {
                            if (opening[0].length > rotatedHistory.length) {
                                // console.log([opening[0], rot])
                                // var move = opening[0].slice(progress, progress + 2)
                                possibleOpenings.push([opening, rot])
                                    // move = this.machineForm([move[0], move[1]])
                                this.inBook = true
                            }
                        }
                    }
                }
                if (this.inBook) {
                    let progress = this.gameHistory.length
                    let opening = possibleOpenings[Math.floor(Math.random() * possibleOpenings.length)]
                    console.log(opening[0][1])
                    let rotMove = this.machineForm(opening[0][0].slice(progress, progress + 2).split(""))
                    var move = this.board.rotateCell(rotMove, 4 - opening[1])
                        // console.log(move)   
                    move = [move[0], move[1]]
                    executed = true
                    console.log("executed = true")
                    this.executeMove(move)
                }
            }
            console.log("executed", executed)
            if (((this.inBook && this.useBook) == false) && (executed == false)) {
                console.log("minimaxing")
                let depth = (this.blackTurn ? this.blackDepth : this.redDepth)
                if (this.freeTiles < 10) {
                    depth = 10
                }
                let fieldCopy = JSON.parse(JSON.stringify(this.board.field))
                var w
                if (typeof(Worker) !== "undefined") {
                    if (typeof(w) == "undefined") {
                        console.log("creating minimax worker")
                        w = new Worker("js/minimaxWorker.js")
                    }
                    // w.postMessage(reversi)
                    w.postMessage([depth, fieldCopy, this.turnToken(), this.freeTiles])
                    w.onmessage = function(event) {
                        console.log("recieving")
                        var result = event.data
                        w.terminate()
                        w = undefined
                        console.log(result)
                        console.log(player, "result", this.result)
                        var value = result.value,
                            move = result.move
                        reversi.executeMove(move)
                    }
                }

                // let result = player(fieldCopy, 14, this.turnToken(), -Infinity, Infinity, 1, this.freeTiles)
            }
            // console.log(move)
            // if (this.insertToken(move, this.board.field)) {
            //     this.flipTokens(this.board.field, move.reverse())
            //     this.display.ctx.clearRect(0, 0, reversi.display.canvas.width, reversi.display.canvas.height)
            //     this.draw()
            //     this.blackTurn = !(this.blackTurn)
            //     this.display.showLegals(this)
            //     this.gameHistory += Reversi.humanForm(move).join("")
            //     console.log(this.gameHistory)
            //     this.updateGameTable()
        }
        // this.handleTurn()
    }


    executeMove(move) {
        console.log("executing", move)
        if (this.insertToken(move, this.board.field)) {
            this.flipTokens(this.board.field, move.reverse())
            this.display.ctx.clearRect(0, 0, reversi.display.canvas.width, reversi.display.canvas.height)
            this.draw()
            this.blackTurn = !(this.blackTurn)
            this.display.showLegals(this)
            this.gameHistory += Reversi.humanForm(move).join("")
            console.log(this.gameHistory)
            this.updateGameTable()
            this.freeTiles -= 1
            this.thinking = false
            this.handleTurn()
        }
    }

    processMove() {

        const bound = reversi.display.canvas.getBoundingClientRect()
        var x = event.clientX - bound.left
        var y = event.clientY - bound.top
        var cellX = Math.floor(x / reversi.display.colWidth),
            cellY = Math.floor(y / reversi.display.rowHeight)
        let move = [cellX, cellY]
        console.log(Reversi.humanForm(move))
        if (reversi.insertToken(move, reversi.board.field)) {
            reversi.flipTokens(reversi.board.field, move.reverse())
                // console.log(reversi.board.field)
            reversi.display.ctx.clearRect(0, 0, reversi.display.canvas.width, reversi.display.canvas.height)
            reversi.draw()
            reversi.blackTurn = !(reversi.blackTurn)
            reversi.display.showLegals(reversi)
            reversi.gameHistory += Reversi.humanForm(move).join("")
            console.log(reversi.gameHistory)
            reversi.updateGameTable()
            reversi.freeTiles -= 1
        }
        reversi.handleTurn()
    }

    // getMove() {
    //     if (this.gameEnded()) {
    //         this.gameRunning = false
    //         this.handlegameEnd()
    //     } else {
    //         if (!this.findLegalMoves(this.board)) {
    //             this.missedTurns++
    //             console.log("missed")
    //             this.blackTurn = !this.blackTurn
    //             getMove()
    //         } else {
    //             document.getElementById("myCanvas").addEventListener("mousedown", this.processMove)

    //         }
    //     }
    // }

    handlegameEnd() {
        var [black, red] = this.countTokens(this.board)
        console.log("black", black)
        console.log("red", red)
    }

    machineForm(cell) {
        // console.log(cell)
        let col = cell[0].charCodeAt(0) - 97
        let row = cell[1] - 1
        return [col, row]
    }

    static humanForm(cell) {
        var col = String.fromCharCode(cell[0] + 97)
        var row = cell[1] + 1
        return [col, row]
    }
}

reversi = new Reversi(8)
reversi.draw()

document.getElementById("configButton").addEventListener("click", function() {
    console.log("swticheroo")
    document.getElementById("configButton").style.display = "none"
        // document.getElementById("myCanvas").style.display = "none"
        // document.getElementById("configPanel").style.display = "none"
    document.getElementById("setupPopup").style.display = "block"
    document.getElementById("cancelButton").addEventListener("click", function() {
        document.getElementById("configButton").style.display = "block"
            // document.getElementById("myCanvas").style.display = "none"
            // document.getElementById("configPanel").style.display = "none"
        document.getElementById("setupPopup").style.display = "none"
    })

})
document.getElementById("startButton").addEventListener("click", function() {
    // reversi = new Reversi(8)
    // reversi.draw()
    reversi.display.showLegals(reversi)
    console.log("dig bick energy　初めまして")
    console.log("shown legals")
    reversi.handleTurn()
        // reversi.mainLoop()
    reversi.loadOpenings(reversi.callback)
})

// reversi = new Reversi(8)
// reversi.draw()
// reversi.display.showLegals(reversi)
// reversi.handleTurn()
// // reversi.mainLoop()
// reversi.loadOpenings(reversi.callback)