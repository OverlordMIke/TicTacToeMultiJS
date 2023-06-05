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
}

const board = new GameBoard()
const players = {}
let availabletokens = ["X", "O"]

// Send updated board state to all players.
function updateclientboards() {
    io.emit('boardUpdate', board)
}

function changeturns() {
    Object.keys(players).forEach((key) => {
        if (players[key].token != "not playing") {
            players[key].canplay = !players[key].canplay
        }
    })
}

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

// When a player connects
io.on('connection', (socket) => {
    // Assign O if first player on server, otherwise set based on existing player.
    if (availabletokens.length == 0) {
        players[socket.id] = {
            token: "not playing",
            canplay: false
        }
    } else {
        let t = availabletokens.splice(-1)
        let b
        if (t == "O") { // this is bad : it sets Os canplay as true if they refresh during Xs turn : don't set canplay as true at connection : make a gamestart function that handles it
            b = true
        } else {
            b = false
        }
        players[socket.id] = {
            token: t,
            canplay: b
        }
    }

    socket.emit('tokenInform', players[socket.id].token) // Tell the player what they are.
    updateclientboards()
    console.log(`\n${socket.id}: Connected`)
    console.log('Connected Players:')
    console.log(Object.keys(players))

    // When player disconnects
    socket.on('disconnect', (reason) => {
        if (players[socket.id].token !== "not playing") {
            availabletokens.push(players[socket.id].token)
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
        if (board.slot[slotnum-1] === "" && players[socket.id].canplay) {
            board.slot[slotnum-1] = players[socket.id].token
            updateclientboards()
            changeturns()
        }
    })

    // When a player clears the board
    socket.on('clearBoard', () => {
        board.slot = [
            "","","",
            "","","",
            "","",""
        ]
        updateclientboards()
        console.log(`\n${socket.id}: Cleared board`)
    })
  })

  // Port on 3000
  server.listen(port, () => {
    console.log(`Listening on port ${port}`)
})