const socket = io()
let buttons = []
let tokeninfo
let turninfo

document.addEventListener('DOMContentLoaded', () => {
    buttons = document.getElementsByClassName('button')
    tokeninfo = document.getElementById('token')
    turninfo = document.getElementById('turninfo')
})

function playermove(slotnum) {
    socket.emit('playerMove', slotnum)
}

function clearboard() {
    socket.emit('clearBoard')
}

socket.on('boardUpdate', (board) => {
    const slots = board.slot
    slots.forEach((value, i) => {
        buttons[i].innerHTML = value
    })
})

socket.on('tokenInform', (token) => {
    tokeninfo.innerHTML = `You are ${token}`
})

socket.on('gamestateUpdate', (game) => {
    turninfo.innerHTML = `${game.activeplayer}'s turn.`
})