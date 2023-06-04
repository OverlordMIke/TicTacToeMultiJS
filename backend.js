const express = require('express')
const app = express()
const port = 3000
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

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

function updateclientboards() {
    io.emit('boardUpdate', board)
}

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`)
    updateclientboards()
    //io.emit('updatePlayers', multiplayers)
    // socket.emit() to send to just connecting player

    socket.on('disconnect', (reason) => {
        console.log(`User Disconnected: ${socket.id}, Reason: ${reason}`)
        //io.emit('updatePlayers', multiplayers)
    })
    
    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    })

    socket.on('playerMove', (slotnum) => {
        board.slot[slotnum-1] = "X"
        updateclientboards()
    })

    socket.on('clearBoard', () => {
        console.log("Board clear requested.")
        board.slot = [
            "","","",
            "","","",
            "","",""
        ]
        updateclientboards()
    })
  })

  server.listen(port, () => {
    console.log(`Listening on port ${port}`)
})