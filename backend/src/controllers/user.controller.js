import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { uploadOnCloudinary2 } from "../utils/cloudinary2.js";
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    res.status(400).json(new ApiError(400, {},"Somthing went wrong while generating refresh and access token"))
  }
};


const registerUser = asyncHandler( async (req, res) => {

  const {fullName, email, username, password } = req.body

  if (
      [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
      throw new ApiError(400, "All fields are required")
  }

  const existedUser = await User.findOne({
      $or: [{ username }, { email }]
  })

  if (existedUser) {
      throw new ApiError(409, "User with email or username already exists")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Product Image file is required")
   }

   const croppedAvatarPath = path.join(process.cwd(), 'uploads', `cropped_${Date.now()}.jpg`); // Create a path for the cropped image

    await sharp(avatarLocalPath)
        .resize(300, 300) // Adjust the size as needed (width, height)
        .toFile(croppedAvatarPath);

    // Upload the cropped image to Cloudinary

  const avatarImagecloud = await uploadOnCloudinary2(croppedAvatarPath)

   if (!avatarImagecloud) {
    throw new ApiError(400, "Some error occured while uploading the product image")
   }



  const user = await User.create({
      fullName,
      avatar: avatarImagecloud?.url,
      coverImage: "",
      email, 
      password,
      username: username.toLowerCase()
  })

  const { accessToken} = await generateAccessAndRefreshTokens(
    user._id
  );

  const createdUser = await User.findById(user._id).select(
      "-password -refreshTokn"
  )

  if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
      new ApiResponse(200, {createdUser, accessToken}, "User registered Successfully")
  )

} )

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    res.status(400).json(new ApiError(400, {},"username or email is required"))
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    res.status(400).json(new ApiError(400, {},"User does not exist"))
  }

  if(user.role == 'seller') {
    res.status(400).json(new ApiError(400, {},"Only buyer can login from this page"))
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    res.status(400).json(new ApiError(400, {},"Password is not Correct"))
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
        200, 
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
    )
)


});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
   httpOnly: true,
   secure: true,
 };

 return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User logged Out Successfully"))



});

const getUserDetails = asyncHandler(async (req, res) => {
  return res
  .status(200)
  .json(new ApiResponse(
      200,
      req.user,
      "User fetched successfully"
  ))
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
  const {oldPassword, newPassword} = req.body

  

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
  const {fullName, email} = req.body

  if (!fullName || !email) {
      throw new ApiError(400, "All fields are required")
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set: {
              fullName,
              email: email
          }
      },
      {new: true}
      
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const getuserbyId = asyncHandler(async(req, res) => {
    const userId = req.params.userId

    const user = await User.findById(userId)
    
    if(!user) {
        res.status(404).json(new ApiResponse(404, {}, "user does not found"))
    }

    return res.status(201).json(new ApiResponse(201, {user}, "user found successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing")
  }

  //TODO: delete old image - assignment

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
      throw new ApiError(400, "Error while uploading on avatar")
      
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              avatar: avatar.url
          }
      },
      {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
      new ApiResponse(200, user, "Avatar image updated successfully")
  )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover image file is missing")
  }

  //TODO: delete old image - assignment


  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
      throw new ApiError(400, "Error while uploading on avatar")
      
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              coverImage: coverImage.url
          }
      },
      {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
      new ApiResponse(200, user, "Cover image updated successfully")
  )
})


const getUserChannelProfile = asyncHandler(async(req, res) => {
  const {username} = req.params

  if (!username?.trim()) {
      throw new ApiError(400, "username is missing")
  }

  const channel = await User.aggregate([
      {
          $match: {
              username: username?.toLowerCase()
          }
      },
      {
          $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers"
          }
      },
      {
          $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "subscriber",
              as: "subscribedTo"
          }
      },
      {
          $addFields: {
              subscribersCount: {
                  $size: "$subscribers"
              },
              channelsSubscribedToCount: {
                  $size: "$subscribedTo"
              },
              isSubscribed: {
                  $cond: {
                      if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                      then: true,
                      else: false
                  }
              }
          }
      },
      {
          $project: {
              fullName: 1,
              username: 1,
              subscribersCount: 1,
              channelsSubscribedToCount: 1,
              isSubscribed: 1,
              avatar: 1,
              coverImage: 1,
              email: 1

          }
      }
  ])

  if (!channel?.length) {
      throw new ApiError(404, "channel does not exists")
  }

  return res
  .status(200)
  .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
  )
})

const getWatchHistory = asyncHandler(async(req, res) => {
  const user = await User.aggregate([
      {
          $match: {
              _id: new mongoose.Types.ObjectId(req.user._id)
          }
      },
      {
          $lookup: {
              from: "videos",
              localField: "watchHistory",
              foreignField: "_id",
              as: "watchHistory",
              pipeline: [
                  {
                      $lookup: {
                          from: "users",
                          localField: "owner",
                          foreignField: "_id",
                          as: "owner",
                          pipeline: [
                              {
                                  $project: {
                                      fullName: 1,
                                      username: 1,
                                      avatar: 1
                                  }
                              }
                          ]
                      }
                  },
                  {
                      $addFields:{
                          owner:{
                              $first: "$owner"
                          }
                      }
                  }
              ]
          }
      }
  ])

  return res
  .status(200)
  .json(
      new ApiResponse(
          200,
          user[0].watchHistory,
          "Watch history fetched successfully"
      )
  )
})

const addFollow = asyncHandler(async(req, res)=>{
    const {followedId} = req.params
    const userId = req.user._id

    await User.findByIdAndUpdate(userId, { $addToSet: { following: followedId } });
    await User.findByIdAndUpdate(followedId, { $addToSet: { followers: userId } });

    
    const updatedfollower = await User.findById(followedId)
    const upadtedcurrentuser = await User.findById(userId)
    
    updatedfollower.noOfFollower = updatedfollower.followers.length
    updatedfollower.noOfFollowing = updatedfollower.following.length

    upadtedcurrentuser.noOfFollower = upadtedcurrentuser.followers.length
    upadtedcurrentuser.noOfFollowing = upadtedcurrentuser.following.length

    const follwedId = await updatedfollower.save()
    const currentUser = await upadtedcurrentuser.save()

    res.status(200).json(new ApiResponse(200,{updatedfollower},"follow added successfully"))
})


const unFollow = asyncHandler(async(req, res)=>{
    const {unfollowedId} = req.params
    const userId = req.user._id

    await User.findByIdAndUpdate(userId, { $pull: { following: unfollowedId } });
    await User.findByIdAndUpdate(unfollowedId, { $pull: { followers: userId } });
    const updatedfollower = await User.findById(unfollowedId)
    const upadtedcurrentuser = await User.findById(userId)

    updatedfollower.noOfFollower = updatedfollower.followers.length
    updatedfollower.noOfFollowing = updatedfollower.following.length

    upadtedcurrentuser.noOfFollower = upadtedcurrentuser.followers.length
    upadtedcurrentuser.noOfFollowing = upadtedcurrentuser.following.length

    const follwedId = await updatedfollower.save()
    const currentUser = await upadtedcurrentuser.save()

    res.status(200).json(new ApiResponse(200,{updatedfollower},"unfollowed successfully"))
})

const checkifFollwed = asyncHandler(async(req, res)=>{
    const { foreignId } = req.params;
    const userId = req.user._id;

    const foreign = await User.findById(foreignId);

    // return res.status(200).json(new ApiResponse(200, {foreign}, "User Details"));

    if (!foreign) {
        return res.status(404).json(new ApiResponse(404, {}, "User not found"));
    }

    const userHasFollowed = foreign.followers.includes(userId);

    if (userHasFollowed) {
        return res.status(200).json(new ApiResponse(200, { followed: true }, "User has already follwed this account"));
    } else {
        return res.status(200).json(new ApiResponse(200, { followed: false }, "User has not follwed this account"));
    }
})

const getAllUser = asyncHandler(async(req, res) => {

    const alluser = await User.find()

    if(!alluser) {
        return res.status(500).json(new ApiResponse(500, {}, "No users yet!"))
    }

    return res.status(201).json(new ApiResponse(201, {alluser},"all user fetched Successfully"))
})

const getFollowers = asyncHandler( async(req, res) => {
    const userIds = req.body.following;

    // Query the database for users whose IDs are in the userIds array
    const users = await User.find(
        { _id: { $in: userIds } }, // MongoDB query to match IDs in array
        'username fullName' // Select only the 'username' and 'name' fields
    );

    // Format the response to match requested output
    const formattedUsers = users.map(user => ({
        id: user._id,
        fullname: user.fullName,
        username: user.username
    }));

    res.status(201).json(new ApiResponse(201, {users: formattedUsers}, "fetched successfully"))
})

export { registerUser, loginUser, logoutUser , getUserDetails,changeCurrentPassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory, addFollow, unFollow, getuserbyId,getAllUser, checkifFollwed, getFollowers};
