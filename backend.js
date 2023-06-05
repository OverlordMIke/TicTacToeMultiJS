const express = require('express')
const app = express()
const port = 3000
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

// 3x3 Gameboard
class GameBoard {
    constructor() {
        this.slot = [
            "","","",
            "","","",
            "","",""
        ]
    }

    clear() {
        this.slot = [
            "","","",
            "","","",
            "","",""
        ]
    }
}

class GameState {
    constructor() {
        this.gamerunning = false
        this.activeplayer = Math.random < 0.5 ? "X" : "O"
        this.availabletokens = ["X", "O"]
    }
}

class Player {
    constructor(t) {
        this.token = t
    }
}

const game = new GameState()
const board = new GameBoard()
const players = {}

// Send updated board state to all players.
function updateclientboards() {
    io.emit('boardUpdate', board)
}

// Send updated game state to all players.
function updateclientstate() {
    io.emit('gamestateUpdate', game)
}

function changeturns() {
    switch (game.activeplayer) {
        case "X":
            game.activeplayer = "O"
            break
        case "O":
            game.activeplayer = "X"
    }
    updateclientstate()
}

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

// When a player connects
io.on('connection', (socket) => {
    if (game.availabletokens.length == 0) {
        players[socket.id] = new Player("not playing")
    } else {
        let t = game.availabletokens.splice(-1)[0]
        players[socket.id] = new Player(t)
    }

    socket.emit('tokenInform', players[socket.id].token) // Tell the player what they are.
    updateclientboards()
    updateclientstate()
    console.log(`\n${socket.id}: Connected`)
    console.log('Connected Players:')
    console.log(Object.keys(players))

    // When player disconnects
    socket.on('disconnect', (reason) => {
        if (players[socket.id].token !== "not playing") {
            game.availabletokens.push(players[socket.id].token)
        }
        delete players[socket.id]
        console.log(`\n${socket.id}: Disconnected: ${reason}`)
        console.log('Connected Players:')
        console.log(Object.keys(players))
    })
    
    // Connection Error
    socket.on("connect_error", (err) => {
        console.log(`${socket.id}: Connection Error: ${err}`);
    })

    // When a player plays a move
    socket.on('playerMove', (slotnum) => {
        if (board.slot[slotnum-1] === "" && players[socket.id].token === game.activeplayer) {
            board.slot[slotnum-1] = players[socket.id].token
            updateclientboards()
            changeturns()
        }
    })

    // When a player clears the board
    socket.on('clearBoard', () => {
        switch (players[socket.id].token) {
            case "X":
                game.activeplayer = "O"
                break
            case "O":
                game.activeplayer = "X"
        }
        board.clear()
        updateclientboards()
        updateclientstate()
        console.log(`\n${socket.id}: Cleared board`)
    })
  })

  // Port on 3000
  server.listen(port, () => {
    console.log(`Listening on port ${port}`)
})