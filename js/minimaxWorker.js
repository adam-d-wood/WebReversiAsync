importScripts("minimax.js")
importScripts("negascout.js")

self.onmessage = function (msg) {
    console.log("initiating minimax")
    let [depth, fieldCopy, turnToken, freeTiles] = msg.data
    result = alphabeta(fieldCopy, depth, turnToken, freeTiles)
    console.log(result)
    self.postMessage(result)
}

