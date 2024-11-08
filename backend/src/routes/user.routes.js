import { Router } from "express";
import { loginUser, registerUser, logoutUser, getUserDetails, changeCurrentPassword,  
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory, 
    updateAccountDetails,
    addFollow,
    unFollow,
    getuserbyId,
    getAllUser,
    checkifFollwed,
    getFollowers} from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {upload} from '../middleware/multer.middleware.js'

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
router.route("/login").post(loginUser)
router.route("/getuserbyId/:userId").get(getuserbyId)
router.route('/getalluser').get(getAllUser)



//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route('/getuserdetails').get(verifyJWT, getUserDetails)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/follow/:followedId").post(verifyJWT,addFollow)
router.route("/unfollow/:unfollowedId").post(verifyJWT,unFollow)
router.route("/checkifFollwed/:foreignId").get(verifyJWT,checkifFollwed)
router.route("/followedlist").post(getFollowers)

// unused routes
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router