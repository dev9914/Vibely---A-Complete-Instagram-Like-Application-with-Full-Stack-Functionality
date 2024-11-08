import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getMessage, sendMessage } from "../controllers/message.controller.js";

const router = Router()

router.route("/get/:userToChatId").get(verifyJWT,getMessage)
router.route("/send/:receiverId").post(verifyJWT, sendMessage)

export default router