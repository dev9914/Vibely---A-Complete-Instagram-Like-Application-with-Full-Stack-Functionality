import { Router } from "express";
import { generateCaptionsFromImage, getImageUrl } from "../controllers/aiFeature.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()

router.post("/auto-captions",verifyJWT, generateCaptionsFromImage)
router.post("/getUrl", verifyJWT,upload.fields([
    {
        name: "image",
        maxCount: 5
    }
]),getImageUrl )

export default router