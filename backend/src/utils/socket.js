import { Server } from "socket.io";
import { createServer } from "http";
import { app } from "../app.js";
import {
  authenticateSocket,
  registerMessageHandlers,
  handleUserConnect,
  handleUserDisconnect,
} from "../socket/message.handlers.js";
import { getUserSocketIds } from "../socket/presence.registry.js";
import { setIo } from "../socket/io.ref.js";

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:4000",
      "https://vibely-social-media-app-frontend.onrender.com",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setIo(io);

io.use(authenticateSocket);

io.on("connection", (socket) => {
  registerMessageHandlers(io, socket);
  handleUserConnect(io, socket);

  socket.on("disconnect", () => {
    handleUserDisconnect(io, socket);
  });
});

// Backward-compatible helper used by legacy imports
export const getReceiverSocketId = (receiverId) => {
  const ids = getUserSocketIds(receiverId);
  return ids.size > 0 ? [...ids][0] : null;
};

export { io, server };
