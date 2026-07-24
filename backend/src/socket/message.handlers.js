import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import {
  addUserSocket,
  removeUserSocket,
  getOnlineUserIds,
  emitToUser,
  setTyping,
  clearTyping,
} from "./presence.registry.js";
import { markConversationAsRead } from "../services/message.service.js";

export const authenticateSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("_id username");

    if (!user) {
      return next(new Error("Invalid user"));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
};

export const registerMessageHandlers = (io, socket) => {
  const userId = socket.userId;

  socket.on("typing:start", ({ conversationId, receiverId }) => {
    if (!conversationId || !receiverId) return;

    setTyping(conversationId, userId, (isTyping) => {
      if (!isTyping) {
        emitToUser(io, receiverId, "typing:stop", { conversationId, userId });
      }
    });

    emitToUser(io, receiverId, "typing:start", { conversationId, userId });
  });

  socket.on("typing:stop", ({ conversationId, receiverId }) => {
    if (!conversationId || !receiverId) return;
    clearTyping(conversationId, userId);
    emitToUser(io, receiverId, "typing:stop", { conversationId, userId });
  });

  socket.on("message:seen", async ({ conversationId }) => {
    if (!conversationId) return;
    try {
      await markConversationAsRead({ conversationId, userId, io });
    } catch (error) {
      console.error("message:seen error:", error.message);
    }
  });

  socket.join(`user:${userId}`);
};

export const handleUserConnect = async (io, socket) => {
  const userId = socket.userId;
  addUserSocket(userId, socket.id);

  await User.findByIdAndUpdate(userId, {
    lastSeen: new Date(),
  });

  const onlineUsers = getOnlineUserIds();
  io.emit("presence:update", { userId, status: "online", lastSeen: new Date() });
  io.emit("getOnlineUsers", onlineUsers); // backward compat
};

export const handleUserDisconnect = async (io, socket) => {
  const userId = removeUserSocket(socket.id);
  if (!userId) return;

  const lastSeen = new Date();
  await User.findByIdAndUpdate(userId, { lastSeen });

  if (!getOnlineUserIds().includes(userId)) {
    io.emit("presence:update", { userId, status: "offline", lastSeen });
    io.emit("getOnlineUsers", getOnlineUserIds());
  }
};
