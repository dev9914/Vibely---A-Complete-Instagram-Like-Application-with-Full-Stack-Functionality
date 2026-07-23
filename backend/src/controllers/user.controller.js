import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { deleteCache, getCache, setCache } from "../utils/cache.js";
import { enqueueNotificationJob } from "../../queues/notification.queue.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Avatar is now optional - use default if not provided
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  let avatarUrl =
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(fullName) +
    "&background=1a1a1a&color=ffffff&size=300";

  if (avatarLocalPath) {
    const croppedAvatarPath = path.join(
      process.cwd(),
      "uploads",
      `cropped_${Date.now()}.jpg`,
    );

    await sharp(avatarLocalPath).resize(300, 300).toFile(croppedAvatarPath);

    const avatarImagecloud = await uploadOnCloudinary([croppedAvatarPath]);

    if (avatarImagecloud?.[0]?.secure_url) {
    avatarUrl = avatarImagecloud[0].secure_url;
}
  }

  const user = await User.create({
    fullName,
    avatar: avatarUrl,
    coverImage: "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser, accessToken, refreshToken },
        "User registered Successfully",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({
    $or: [
      { username: username?.toLowerCase() },
      { email: email?.toLowerCase() },
    ],
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
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
    },
  );

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out Successfully"));
});

/**
 * Refresh Access Token
 * Uses refresh token to generate new access token
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request - No refresh token provided");
  }

  try {
    // Verify the refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    // Find user by decoded token ID
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token - User not found");
    }

    // Check if refresh token matches the one stored in DB
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or has been used");
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const getUserDetails = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const {
    username,
    fullName,
    email,
    bio,
    website,
    location,
  } = req.body;

  const updateFields = {};

  // Check username uniqueness
  if (username !== undefined) {
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      throw new ApiError(400, "Username already exists");
    }

    updateFields.username = username.toLowerCase();
  }

  if (fullName !== undefined) {
    updateFields.fullName = fullName;
  }

  if (email !== undefined) {
    updateFields.email = email;
  }

  if (bio !== undefined) {
    updateFields.bio = bio;
  }

  if (website !== undefined) {
    updateFields.website = website;
  }

  if (location !== undefined) {
    updateFields.location = location;
  }

  // Nothing to update
  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "No fields provided for update");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: updateFields,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password -refreshToken");

  await deleteCache(`user:${req.user._id}`);

  return res.status(200).json(
    new ApiResponse(
      200,
      { user },
      "Profile updated successfully"
    )
  );
});

const getuserbyId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const cacheKey = `user:${userId}`;

  // 1. Check Redis
  const cachedUser = await getCache(cacheKey);

  if (cachedUser) {
    console.log("🔥 USER CACHE HIT");

    return res
      .status(200)
      .json(new ApiResponse(200, { user: cachedUser }, "User fetched from cache"));
  }

  console.log("🐢 USER CACHE MISS");

  // 2. Fetch from Mongo
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  // 3. Store in Redis
  await setCache(cacheKey, user, 600);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User found successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  //TODO: delete old image - assignment

  const avatar = await uploadOnCloudinary([avatarLocalPath]);


if (!avatar?.[0]?.url) {
  throw new ApiError(400, "Error while uploading on avatar");
}



const user = await User.findByIdAndUpdate(
  req.user?._id,
  {
    $set: {
      avatar: avatar[0].url,
    },
  },
  { new: true }
).select("-password");

  await deleteCache(`user:${req.user._id}`);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  //TODO: delete old image - assignment

  const coverImage = await uploadOnCloudinary([coverImageLocalPath]);

  if (!coverImage?.[0]?.url) {
    throw new ApiError(400, "Error while uploading on cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage[0].url,
      },
    },
    { new: true },
  ).select("-password");

  await deleteCache(`user:${req.user._id}`);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
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
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully"),
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
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
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully",
      ),
    );
});

const addFollow = asyncHandler(async (req, res) => {

  const { followedId } = req.params;
  const userId = req.user._id;

  if (followedId === userId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  await User.findByIdAndUpdate(userId, {
    $addToSet: { following: followedId },
  });
  await User.findByIdAndUpdate(followedId, {
    $addToSet: { followers: userId },
  });

  const updatedfollower = await User.findById(followedId);
  const upadtedcurrentuser = await User.findById(userId);

  updatedfollower.noOfFollower = updatedfollower.followers.length;
  updatedfollower.noOfFollowing = updatedfollower.following.length;

  upadtedcurrentuser.noOfFollower = upadtedcurrentuser.followers.length;
  upadtedcurrentuser.noOfFollowing = upadtedcurrentuser.following.length;

  const follwedId = await updatedfollower.save();
  const currentUser = await upadtedcurrentuser.save();

  await Promise.all([
    deleteCache(`user:${followedId}`),
    deleteCache(`user:${userId}`),
  ]);

  // Send notification to followed user
  try {
    await enqueueNotificationJob(followedId, {
      sender: userId,
      type: "follow",
      title: `${req.user.username} started following you`,
      message: `${req.user.fullName} is now following you`,
      actionUrl: "",
      relatedResource: {
        resourceType: "user",
        resourceId: userId.toString(),
      },
    });
  } catch (error) {
    console.error("Error sending follow notification:", error);
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, { updatedfollower }, "follow added successfully"),
    );
});

const unFollow = asyncHandler(async (req, res) => {
  const { unfollowedId } = req.params;
  const userId = req.user._id;

  await User.findByIdAndUpdate(userId, { $pull: { following: unfollowedId } });
  await User.findByIdAndUpdate(unfollowedId, { $pull: { followers: userId } });
  const updatedfollower = await User.findById(unfollowedId);
  const upadtedcurrentuser = await User.findById(userId);

  updatedfollower.noOfFollower = updatedfollower.followers.length;
  updatedfollower.noOfFollowing = updatedfollower.following.length;

  upadtedcurrentuser.noOfFollower = upadtedcurrentuser.followers.length;
  upadtedcurrentuser.noOfFollowing = upadtedcurrentuser.following.length;

  const follwedId = await updatedfollower.save();
  const currentUser = await upadtedcurrentuser.save();

  await Promise.all([
    deleteCache(`user:${unfollowedId}`),
    deleteCache(`user:${userId}`),
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, { updatedfollower }, "unfollowed successfully"));
});

const checkifFollwed = asyncHandler(async (req, res) => {
  const { foreignId } = req.params;
  const userId = req.user._id;

  const foreign = await User.findById(foreignId);

  // return res.status(200).json(new ApiResponse(200, {foreign}, "User Details"));

  if (!foreign) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  const userHasFollowed = foreign.followers.includes(userId);

  if (userHasFollowed) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { followed: true },
          "User has already follwed this account",
        ),
      );
  } else {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { followed: false },
          "User has not follwed this account",
        ),
      );
  }
});

const getAllUser = asyncHandler(async (req, res) => {
  const users = await User.find();

  if (!users || users.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, { users: [] }, "No users yet!"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { users }, "All users fetched successfully"));
});

const getFollowers = asyncHandler(async (req, res) => {
  const userIds = req.body.following;

  if (!userIds || userIds.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, { users: [] }, "No users to fetch"));
  }

  // Query the database for users whose IDs are in the userIds array
  const users = await User.find(
    { _id: { $in: userIds } },
    "_id username fullName avatar", // Include avatar field
  );

  // Format the response to match requested output
  const formattedUsers = users.map((user) => ({
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    avatar: user.avatar || "",
  }));

  res
    .status(200)
    .json(
      new ApiResponse(200, { users: formattedUsers }, "fetched successfully"),
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUserDetails,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  addFollow,
  unFollow,
  getuserbyId,
  getAllUser,
  checkifFollwed,
  getFollowers,
};
