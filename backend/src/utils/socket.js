import { Server } from "socket.io";
import { createServer } from "http";
import { app } from "../app.js";  // Ensure this is the correct path and that `app` is exported correctly

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:4000","https://vibely-social-media-app-frontend.onrender.com"],  // Adjust for production
        methods: ["GET", "POST"]
    }
});

const userSocketMap = {};

// Function to get the receiver's socket ID
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const userId = socket.handshake.query.userId;

    // console.log(userId)

    
    if (userId) {
        const hello = userSocketMap[userId] = socket.id;
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        // console.log(hello)
    } else {
        console.error("Invalid or missing userId:", userId);
    }
    // console.log("User Socket Map:", userSocketMap);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // socket.on("sendMessage", (data) => {
    //     const { receiverId } = data;
    //     const receiverSocketId = getReceiverSocketId(receiverId);
    //     if (receiverSocketId) {
    //         io.to(receiverSocketId).emit("receiveMessage", data);
    //         console.log('sent')
    //     } else {
    //         console.error("Receiver not connected:", receiverId);
    //     }
    // });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// Export the server and io for use in other parts of the application
export { io, server };