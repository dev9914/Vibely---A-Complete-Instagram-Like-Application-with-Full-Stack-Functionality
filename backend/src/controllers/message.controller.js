import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Conversation from "../models/conversation.model.js";
import { getIo } from "../socket/io.ref.js";
import {
  sendMessageSchema,
  conversationSettingsSchema,
} from "../validators/message.validator.js";
import {
  sendMessage as sendMessageService,
  getMessages as getMessagesService,
  getConversations as getConversationsService,
  markConversationAsRead,
  getUnreadCount,
  deleteMessage as deleteMessageService,
  updateConversationSettings,
} from "../services/message.service.js";

const sendRateLimit = new Map();
const SEND_LIMIT = 30;
const SEND_WINDOW_MS = 60_000;

const checkSendRateLimit = (userId) => {
  const now = Date.now();
  const entry = sendRateLimit.get(userId) || { count: 0, resetAt: now + SEND_WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + SEND_WINDOW_MS;
  }

  entry.count += 1;
  sendRateLimit.set(userId, entry);

  if (entry.count > SEND_LIMIT) {
    throw new ApiError(429, "Too many messages. Please slow down.");
  }
};

export const sendMessageController = asyncHandler(async (req, res) => {
  checkSendRateLimit(req.user._id.toString());

  const { error, value } = sendMessageSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const payload = await sendMessageService({
    senderId: req.user._id,
    receiverId: req.params.receiverId,
    content: value.message,
    type: value.type,
    attachments: value.attachments,
    replyTo: value.replyTo,
    clientId: value.clientId,
    io: getIo(),
  });

  return res.status(201).json(
    new ApiResponse(201, {
      message: payload.message,
      conversationId: payload.conversationId,
    }, "Message sent"),
  );
});

export const getMessageController = asyncHandler(async (req, res) => {
  const { before, limit } = req.query;
  const result = await getMessagesService({
    currentUserId: req.user._id,
    otherUserId: req.params.userToChatId,
    limit: limit ? Math.min(Number(limit), 50) : 30,
    before,
  });

  return res.status(200).json(
    new ApiResponse(200, result, "Messages fetched"),
  );
});

export const getConversationsController = asyncHandler(async (req, res) => {
  const conversations = await getConversationsService(req.user._id);
  return res.status(200).json(
    new ApiResponse(200, { conversations }, "Conversations fetched"),
  );
});

export const getConversationByUserController = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, req.params.userId] },
  }).select("_id");

  return res.status(200).json(
    new ApiResponse(200, {
      exists: !!conversation,
      conversationId: conversation?._id || null,
    }, "Conversation status"),
  );
});

export const markMessagesAsReadController = asyncHandler(async (req, res) => {
  await markConversationAsRead({
    conversationId: req.params.conversationId,
    userId: req.user._id,
    io: getIo(),
  });

  return res.status(200).json(
    new ApiResponse(200, {}, "Messages marked as read"),
  );
});

export const getUnreadCountController = asyncHandler(async (req, res) => {
  const count = await getUnreadCount(req.user._id);
  return res.status(200).json(
    new ApiResponse(200, { count }, "Unread count fetched"),
  );
});

export const deleteMessageController = asyncHandler(async (req, res) => {
  const scope = req.query.scope === "everyone" ? "everyone" : "me";
  await deleteMessageService({
    messageId: req.params.messageId,
    userId: req.user._id,
    scope,
    io: getIo(),
  });

  return res.status(200).json(
    new ApiResponse(200, {}, "Message deleted"),
  );
});

export const updateConversationSettingsController = asyncHandler(async (req, res) => {
  const { error, value } = conversationSettingsSchema.validate(req.body);
  if (error) throw new ApiError(400, error.details[0].message);

  const result = await updateConversationSettings({
    conversationId: req.params.conversationId,
    userId: req.user._id,
    ...value,
  });

  return res.status(200).json(
    new ApiResponse(200, result, "Conversation settings updated"),
  );
});

// Backward-compatible named exports
export {
  sendMessageController as sendMessage,
  getMessageController as getMessage,
  getConversationsController as getConversations,
  getConversationByUserController as getConversationByUser,
};
