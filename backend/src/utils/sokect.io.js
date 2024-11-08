// import { Server } from "socket.io";
// import { createServer } from 'http';
// import { app } from "../app.js";

// const server = createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: ["http://localhost:4000"],
//         methods: ["GET", "POST"]
//     }
// });


// io.on('connection', (socket) => {
//     console.log('connected', socket.id)
//     // socket.emit('welcome',`welcome to the server ${socket.id}`) // to only you
//     // io.emit('user-connected',`welcome to the server ${socket.id}`) // to all
//     // socket.broadcast.emit('joined',`has joined the server ${socket.id}`) // not you
    
//     socket.on('message', ({message, roomId}) => {
//         console.log(message,roomId)
//         io.to(roomId).emit('received-message', message)
//     })

//     socket.on('Ram', (room) => {
//         console.log(room)
//         socket.join(room)
//     })

//     socket.on('disconnect', () => {
//         console.log('User Disconnected', socket.id)
//     })
// })

// export {server}