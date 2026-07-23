import { io, Socket } from "socket.io-client";

// Create a singleton instance of the socket to ensure only one connection
let socket: Socket | null = null;

const initializeSocket = (userId: string): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      reconnection: false,
      query: { userId }  // Pass the userId as a query parameter
    });
    console.log("Socket initialized with userId:", userId);
  }
  return socket;
};

const getSocket = (userId: string) => {
  if (!socket) {
    initializeSocket(userId);
  }
  return socket;
};

export { initializeSocket, getSocket };