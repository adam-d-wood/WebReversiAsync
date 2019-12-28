class Board {

    constructor(dims) {
        this.rows = this.cols = dims
        this.field = []
        for (var i = 0; i < this.rows; i++) {
            this.field.push([])
            for (var j=0; j<this.cols; j++) {
                this.field[i].push(0)
            }
        }
        let half = this.rows/2
        this.field[half-1][half-1] = this.field[half][half] = 2
        this.field[half][half-1] = this.field[half-1][half] = 1
    }

    rotateBoard(turn) {
        //turn is the number of 1/4 turns
        for (i = 0; i < turn; i++) {
            let newfield = []
            for (let i = 0; i < this.rows; i++) {
                newfield.push([])
            }
            for (let i = 0; i < this.cols; i++) {
                for (let j = 0; i < this.row; j++) {
                    newfield[this.rows - 1 - j][i] = this.field[i][j]
                }
            }
        }
        return newfield
    }

    // rotateCell(cell, theta) {
    //     let cellVector = [
    //         [cell[0]-this.rows/2],
    //         [cell[1]-this.cols/2]
    //     ]
    //     console.log(cellVector)
    //     const rotationMatrix = [
    //         [Math.cos(theta), -Math.sin(theta)],
    //         [Math.sin(theta), -Math.cos(theta)]
    //     ]
    //     console.log(rotationMatrix)
    //     let rotatedCell = matrixMult(rotationMatrix, cellVector)
    //     return rotatedCell
    // }

    rotateCell(cell, turns) {
        for (let i = 0; i < turns; i++) {
            let col = this.rows - 1 - cell[1]
            let row = cell[0]
            var cell = [col, row]
        }
        return cell
    }
}



// board = new Board(8)
// console.log(board.field)

function matrixMult(a, b) {
    if (a[0].length === b.length) {
        let result = []
        for (let i = 0; i < a.length; i++) {
            result.push([])
            for (let j = 0; j < b[0].length; j++) {
                console.log("yh")
                var vectorA = a[i]
                console.log(vectorA)
                var vectorB = []
                for (let row of b) {
                    vectorB.push(row[j])
                }
            }
            console.log(vectorA, vectorB)
            result[i].push(dotProduct(vectorA, vectorB))
        }
        return result
    } else {
        throw "matrix multiplication is undefined for " + a + " and " + b
    }
}

function dotProduct(a, b) {
    console.log(a, b)
    let result = 0
    let vectorLength = a.length
    for (let i = 0; i < vectorLength; i++) {
        result += a[i] * b[i]
    }
    return result
}
