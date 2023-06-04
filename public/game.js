const socket = io()
let buttons = []

document.addEventListener('DOMContentLoaded', () => {
    buttons = document.getElementsByClassName('button')
    console.log(buttons)
})

function playermove(slotnum) {
    socket.emit('playerMove', slotnum)
}

function clearboard() {
    socket.emit('clearBoard')
}

socket.on('boardUpdate', (board) => {
    const slots = board.slot
    console.log(typeof slots)
    slots.forEach((value, i) => {
        buttons[i].innerHTML = value
    })
})