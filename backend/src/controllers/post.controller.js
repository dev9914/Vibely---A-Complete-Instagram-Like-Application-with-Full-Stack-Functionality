import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { deleteCache, getCache, setCache } from "../utils/cache.js";
import { enqueueNotificationJob } from "../../queues/notification.queue.js";

const createPost = asyncHandler(async (req, res) => {
  const { description } = req.body;

  const localPostImages = req.files?.postImage?.map((image) => image.path);

  if (!localPostImages?.length) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "At least one image is required"));
  }

  console.log(localPostImages);

  const cloudinaryImages = await uploadOnCloudinary(localPostImages);
  console.log(cloudinaryImages);
  if (!cloudinaryImages) {
    return res
      .status(501)
      .json(new ApiResponse(501, {}, "Some problem occured while uploading"));
  }
  const imageUrls = cloudinaryImages.map((image) => image.url);

  const post = await Post.create({
    userId: req.user._id,
    description,
    postImage: imageUrls,
  });

  if (!post) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Error creating post"));
  }

  await deleteCache("feed:1:10");

  res
    .status(201)
    .json(new ApiResponse(201, { post }, "images uploaded successfully"));
});

const addLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json(new ApiResponse(404, {}, "Post not found"));
  }

  if (post.likes.includes(userId)) {
    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    post.likecount = post.likes.length;
    const updatedPost = await post.save();
    await deleteCache(`post:${postId}`);
    await deleteCache("feed:1:10");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { post: updatedPost },
          "Like removed successfully",
        ),
      );
  } else {
    post.likes.push(userId);
    post.likecount = post.likes.length;
    const updatedPost = await post.save();
    await deleteCache(`post:${postId}`);
    await deleteCache("feed:1:10");

    // Send notification to post owner (if not self-like)
    if (post.userId.toString() !== userId.toString()) {
      try {
        await enqueueNotificationJob(post.userId, {
          sender: userId,
          type: "like",
          title: `${req.user.username} liked your post`,
          message: post.description?.substring(0, 50) || "Your post",
          actionUrl: `/post/${postId}`,
          relatedResource: {
            resourceType: "post",
            resourceId: postId,
          },
        });
      } catch (error) {
        console.error("Error sending like notification:", error);
      }
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, { post: updatedPost }, "Like added successfully"),
      );
  }

  // // post.likecount = post.likes.length
  // // const updatedpost = await post.save()
  // res.status(201).json(new ApiResponse(201,{post: updatedpost},"somthing wen wrong"))
});

const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  if (!text?.trim()) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Comment text is required"));
  }

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json(new ApiResponse(404, {}, "Post not found"));
  }

  const newComment = {
    userId: req.user._id,
    username: req.user.username,
    avatar: req.user.avatar,
    text,
    createdAt: new Date(),
  };

  post.comments.push(newComment);
  post.commentcount = post.comments.length;
  const updatedpost = await post.save();
  await deleteCache(`post:${postId}`);
  await deleteCache("feed:1:10");

  // Send notification to post owner (if not self-comment)
  if (post.userId.toString() !== req.user._id.toString()) {
    try {
      await enqueueNotificationJob(post.userId, {
        sender: req.user._id,
        type: "comment",
        title: `${req.user.username} commented on your post`,
        message: text.substring(0, 50),
        actionUrl: `/post/${postId}`,
        relatedResource: {
          resourceType: "post",
          resourceId: postId,
        },
      });
    } catch (error) {
      console.error("Error sending comment notification:", error);
    }
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { updatedpost }, "comment added successfully"));
});

const getPost = asyncHandler(async (req, res) => {
  // Extract page and limit from query params
  const parsedPage = Number.parseInt(req.query.page, 10);
  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, 20)
    : 10;

  // Calculate the number of posts to skip based on the page and limit
  const skip = (page - 1) * limit;
  const cacheKey = `feed:${page}:${limit}`;

  // 1. Check cache first
  const cachedFeed = await getCache(cacheKey);
  if (cachedFeed) {
    return res
      .status(200)
      .json(new ApiResponse(200, cachedFeed, "All posts fetched successfully"));
  }

  try {
    // Get total count of posts
    const totalPosts = await Post.countDocuments();

    // Fetch posts with pagination and sorting by 'createdAt' descending
    const posts = await Post.find()
      .sort({ createdAt: -1, _id: -1 }) // Stable sort prevents duplicate/missing posts across pages
      .skip(skip) // Skip the appropriate number of posts
      .limit(limit); // Limit the results to the requested number

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalPosts / limit);
    const hasMore = page < totalPages;

    // If no posts are found
    if (!posts.length) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            posts: [],
            currentPage: page,
            totalPages: 0,
            hasMore: false,
          },
          "No posts available.",
        ),
      );
    }

    // Send the paginated posts response with metadata
    const payload = {
      posts,
      currentPage: page,
      totalPages,
      hasMore,
    };

    // 2. Store in cache for 10 minutes
    await setCache(cacheKey, payload, 600);

    res
      .status(200)
      .json(new ApiResponse(200, payload, "All posts fetched successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, {}, "Error fetching posts"));
  }
});

const checkIfLiked = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json(new ApiResponse(404, {}, "Post not found"));
  }

  // Check if the user has already liked the post
  const userHasLiked = post.likes.includes(userId);

  if (userHasLiked) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: true },
          "User has already liked this post",
        ),
      );
  } else {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "User has not liked this post"),
      );
  }
});

const getuserPostById = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "User id is required"));
  }

  const parsedPage = Number.parseInt(req.query.page, 10);
  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0
    ? parsedLimit
    : 10;
  const skip = (page - 1) * limit;
  const cacheKey = `userPosts:${userId}:${page}:${limit}`;

  // 1. Check cache first
  const cachedUserPosts = await getCache(cacheKey);
  if (cachedUserPosts) {
    return res
      .status(200)
      .json(new ApiResponse(200, cachedUserPosts, "Posts fetched successfully"));
  }

  const totalPosts = await Post.countDocuments({ userId });
  const posts = await Post.find({ userId })
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(totalPosts / limit);
  const hasMore = page < totalPages;

  if (!posts.length) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            posts: [],
            currentPage: page,
            totalPages: 0,
            hasMore: false,
          },
          "No posts yet",
        ),
      );
  }

  const payload = {
    posts,
    currentPage: page,
    totalPages,
    hasMore,
  };

  // 2. Store in cache for 10 minutes
  await setCache(cacheKey, payload, 600);

  return res
    .status(200)
    .json(new ApiResponse(200, payload, "Posts fetched successfully"));
});

const getpostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Post Id is required"));
  }

  const cacheKey = `post:${postId}`;

  // 1. Check cache first
  const cachedPost = await getCache(cacheKey);
  if (cachedPost) {
    return res
      .status(200)
      .json(new ApiResponse(200, { post: cachedPost }, "Post info fetched successfully!"));
  }

  const post = await Post.findById(postId);

  if (!post) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Post not found"));
  }

  // 2. Store in cache for 10 minutes
  await setCache(cacheKey, post, 600);

  return res
    .status(200)
    .json(new ApiResponse(200, { post }, "Post info fetched successfully!"));
});

export {
  createPost,
  addLike,
  addComment,
  getPost,
  checkIfLiked,
  getuserPostById,
  getpostById,
};
