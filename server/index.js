import express from "express"
import { createServer } from 'node:http';
import { Server } from "socket.io";

const app = express()
const PORT = 4000;
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    console.log('Client connected with socket id', socket.id,)

    socket.on("send-message", ({ room, message }) => {
        console.log('Sent message', message,)
        let skt = socket
        skt = room ? skt.to(room) : skt
        skt.emit("send-message-from-server", message)
    })

    socket.on("typing", ({ room, isTyping }) => {
        console.log('room', room)
        console.log('isTyping', isTyping)
        let skt = socket.broadcast
        skt = room ? skt.to(room) : skt
        skt.emit("isTyping", { room, isTyping })
    })

    socket.on("joinRoom", (room) => {
        console.log('Room is ', room,)
        socket.join(room);
    })

    socket.on('disconnect', () => {
        console.log("User left")
    })
})

app.get("/", (req, res) => {
    res.json({ data: "Hi there" })
})

httpServer.listen(PORT, () => {
    console.log('Server on')
})
