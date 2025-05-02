import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";

const createPost = asyncHandler( async(req, res) => {
    const {description} = req.body

    const localPostImages = req.files?.postImage?.map(image => image.path)
    
    if(!localPostImages) {
       return res.status(404).json(new ApiResponse(404, {}, "Image is required"))
    }

    console.log(localPostImages)

    const cloudinaryImages = await uploadOnCloudinary(localPostImages)
    console.log(cloudinaryImages)
    if(!cloudinaryImages) {
        return res.status(501).json(new ApiResponse(501, {}, "Some problem occured while uploading"))
    }
    const imageUrls = cloudinaryImages.map(image => image.url);

    const post = await Post.create({
        userId: req.user._id,
        description,
        postImage: imageUrls,
    })

    if(!post){
        res.status(500).json(new ApiResponse(500,{},"some error occured while creating post"))
    }
    res.status(201).json(new ApiResponse(201, {post},"images uploaded successfully"))

})

const addLike = asyncHandler( async(req, res) =>{
    const {postId} = req.params
    const userId = req.user._id

    const post = await Post.findById(postId)
    
    if(!post) {
        res.status(500).json(new ApiResponse(500,{},"post not found"))
    }

    if(post.likes.includes(userId)){
        post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        post.likecount = post.likes.length;
        const updatedPost = await post.save();
        return res.status(200).json(new ApiResponse(200, { post: updatedPost }, "Like removed successfully"));
    } else{
        post.likes.push(userId);
        post.likecount = post.likes.length;
        const updatedPost = await post.save();
        return res.status(201).json(new ApiResponse(201, { post: updatedPost }, "Like added successfully"));
    }

    // // post.likecount = post.likes.length
    // // const updatedpost = await post.save()
    // res.status(201).json(new ApiResponse(201,{post: updatedpost},"somthing wen wrong"))
})

const addComment = asyncHandler( async(req, res) =>{
    const {postId} = req.params
    const {text} = req.body
    
    if(!text) {
        return res.status(404).json(new ApiResponse(404,{},"text is required"))
    }

    const post = await Post.findById(postId)

    if(!post) {
        return res.status(500).json(new ApiResponse(500,{},"post not found"))
    }

    const newComment = {
        userId: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar,
        text,
        createdAt: new Date()
    }

    post.comments.push(newComment)
    post.commentcount = post.comments.length
    const updatedpost = await post.save()

    return res.status(201).json(new ApiResponse(201, {updatedpost},"comment added successfully"))
})

const getPost = asyncHandler(async (req, res) => {
    // Extract page and limit from query params
    const page = parseInt(req.query.page) || 1;  // Default to page 1
    const limit = parseInt(req.query.limit) || 10;  // Default to 10 posts per page

    // Calculate the number of posts to skip based on the page and limit
    const skip = (page - 1) * limit;

    try {
        // Fetch posts with pagination and sorting by 'createdAt' descending
        const post = await Post.find()
            .sort({ createdAt: -1 })  // Ensure most recent posts are fetched first
            .skip(skip)               // Skip the appropriate number of posts
            .limit(limit);            // Limit the results to the requested number

        // If no posts are found
        if (!post.length) {
            return res.status(404).json(new ApiResponse(404, {}, "No posts available."));
        }

        // Send the paginated posts response
        res.status(200).json(new ApiResponse(200, { post }, "All posts fetched successfully"));
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
        return res.status(200).json(new ApiResponse(200, { liked: true }, "User has already liked this post"));
    } else {
        return res.status(200).json(new ApiResponse(200, { liked: false }, "User has not liked this post"));
    }
});

const getuserPostById = asyncHandler(async( req, res)=> {
    const {userId} = req.params

    const posts = await Post.find({ userId }).sort({ createdAt: -1 })

    if(posts.length ===0 ) {
        return res.status(404).json(new ApiResponse(404, {}, 'No post uploaded yet!'))
    }

    res.status(201).json(new ApiResponse(201, {posts}, 'posts fetched successfully'))
})

const getpostById = asyncHandler( async( req, res)=> {
    const {postId} = req.params
    
    if(!postId) {
        return res.status(404).json( new ApiResponse(404, {}, "Post Id is required"))
    }

    const post = await Post.findById(postId)

    if(!post) {
        return res.status(501).json( new ApiResponse(501, {}, "Post does not found"))
    }

    return res.status(201).json( new ApiResponse(201, {post}, "Post info fetched successfully!"))
})



export {createPost, addLike, addComment, getPost, checkIfLiked, getuserPostById, getpostById}