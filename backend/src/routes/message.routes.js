import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  sendMessage,
  getMessage,
  getConversations,
  getConversationByUser,
  markMessagesAsReadController,
  getUnreadCountController,
  deleteMessageController,
  updateConversationSettingsController,
} from "../controllers/message.controller.js";

const router = Router();

router.get("/conversations", verifyJWT, getConversations);
router.get("/unread-count", verifyJWT, getUnreadCountController);
router.get("/get/:userToChatId", verifyJWT, getMessage);
router.get("/conversation/:userId", verifyJWT, getConversationByUser);
router.post("/send/:receiverId", verifyJWT, sendMessage);
router.patch("/:conversationId/read", verifyJWT, markMessagesAsReadController);
router.patch("/:conversationId/settings", verifyJWT, updateConversationSettingsController);
router.delete("/:messageId", verifyJWT, deleteMessageController);

export default router;
