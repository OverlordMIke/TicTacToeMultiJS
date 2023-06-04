const express = require('express')
const app = express()
const port = 3000
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`)
    //io.emit('updatePlayers', multiplayers)
    // socket.emit() to send to just connecting player

    socket.on('disconnect', (reason) => {
        console.log(`User Disconnected: ${socket.id}, Reason: ${reason}`)
        //io.emit('updatePlayers', multiplayers)
    })
  })

  server.listen(port, () => {
    console.log(`Listening on port ${port}`)
})