import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getConversationByUser, getMessage, sendMessage,getConversations } from "../controllers/message.controller.js";

const router = Router()

router.route("/get/:userToChatId").get(verifyJWT,getMessage)
router.route("/send/:receiverId").post(verifyJWT, sendMessage)
router.get(
  "/conversation/:userId",
  verifyJWT,
  getConversationByUser
);
router.get(
  "/conversations",
  verifyJWT,
  getConversations
);

export default router