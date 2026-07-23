import { api } from './api';

/**
 * Post API Service
 * 
 * Handles all post-related endpoints including:
 * - Post CRUD operations
 * - Like/Unlike functionality
 * - Comments
 * - Post feed with pagination
 * - Optimistic updates for better UX
 */

// ========== TYPES ==========

export interface PostUser {
  _id: string;
  username: string;
  fullName: string;
  avatar: string;
}

export interface Comment {
  _id?: string;
  userId: string;
  text: string;
  username: string;
  avatar: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  userId: PostUser | string;
  postImage: string[];
  description: string;
  likes: string[];
  comments: Comment[];
  likecount: string | number;
  commentcount: string | number;
  createdAt: string;
  updatedAt: string;
  // Client-side computed
  isLiked?: boolean;
}

export interface PostsResponse {
  success: boolean;
  posts: Post[];
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SinglePostResponse {
  success: boolean;
  post: Post;
}

export interface CreatePostRequest {
  description: string;
  postImage: File | File[];
}

export interface CommentRequest {
  text: string;
}

export interface UserPostsRequest {
  userId: string;
  page?: number;
  limit?: number;
}

// ========== API ENDPOINTS ==========

export const postApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    /**
     * Get all posts with pagination
     * Supports infinite scroll
     */
    getAllPosts: builder.query<PostsResponse, { page?: number }>({
      query: ({ page = 1 }) => `/post/getallpost?page=${page}`,
      providesTags: (result) =>
        result?.posts
          ? [
              ...result.posts.map(({ _id }) => ({ type: 'Post' as const, id: _id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
      // Merge pages for infinite scroll
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          posts: [...(currentCache?.posts || []), ...(newItems?.posts || [])],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),
    
    /**
     * Get posts by user ID
     */
    getUserPosts: builder.query<PostsResponse, UserPostsRequest>({
      query: ({ userId, page = 1, limit = 10 }) =>
        `/post/getuserpostbyId/${userId}?page=${page}&limit=${limit}`,
      providesTags: (result, _error, { userId }) =>
        result
          ? [
              ...result.posts.map(({ _id }) => ({ type: 'Post' as const, id: _id })),
              { type: 'Post', id: `USER-${userId}` },
            ]
          : [{ type: 'Post', id: `USER-${userId}` }],
    }),
    
    /**
     * Get single post by ID
     */
    getPostById: builder.query<SinglePostResponse, string>({
      query: (postId) => `/post/getpostbyId/${postId}`,
      providesTags: (_result, _error, postId) => [{ type: 'Post', id: postId }],
    }),
    
    /**
     * Create new post
     */
    createPost: builder.mutation<SinglePostResponse, FormData>({
      query: (formData) => ({
        url: '/post/create',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
    
    /**
     * Like/Unlike a post
     * Uses optimistic update for instant UI feedback
     */
    likePost: builder.mutation<{ success: boolean; isLiked: boolean }, string>({
      query: (postId) => ({
        url: `/post/like/${postId}`,
        method: 'PUT',
      }),
      // Optimistic update - update UI immediately
      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
        // Get current user ID from auth state
        const state: any = getState();
        const currentUserId = state.auth.user?._id;
        
        // Update all post list caches
        const patchResults = [
          dispatch(
            postApi.util.updateQueryData('getAllPosts', { page: 1 }, (draft) => {
              const post = draft.posts.find((p) => p._id === postId);
              if (post) {
                const isCurrentlyLiked = post.likes?.includes(currentUserId);
                if (isCurrentlyLiked) {
                  // Unlike
                  post.likes = post.likes.filter((id) => id !== currentUserId);
                  post.likecount = Math.max(0, Number(post.likecount) - 1);
                  post.isLiked = false;
                } else {
                  // Like
                  post.likes = [...(post.likes || []), currentUserId];
                  post.likecount = Number(post.likecount) + 1;
                  post.isLiked = true;
                }
              }
            })
          ),
        ];
        
        try {
          await queryFulfilled;
        } catch {
          // Rollback all optimistic updates on error
          patchResults.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (_result, _error, postId) => [{ type: 'Post', id: postId }],
    }),
    
    /**
     * Add comment to a post
     */
    addComment: builder.mutation<SinglePostResponse, { postId: string; text: string }>({
      query: ({ postId, text }) => ({
        url: `/post/comment/${postId}`,
        method: 'PUT',
        body: { text },
      }),
      // Optimistic update
      async onQueryStarted({ postId, text }, { dispatch, queryFulfilled, getState }) {
        const state: any = getState();
        const currentUser = state.auth.user;
        
        if (!currentUser) return;
        
        const optimisticComment: Comment = {
          _id: `temp-${Date.now()}`,
          userId: currentUser._id,
          text,
          username: currentUser.username,
          avatar: currentUser.avatar,
          createdAt: new Date().toISOString(),
        };
        
        // Update post list cache
        const patchResult = dispatch(
          postApi.util.updateQueryData('getAllPosts', { page: 1 }, (draft) => {
            const post = draft.posts.find((p) => p._id === postId);
            if (post) {
              post.comments = [...(post.comments || []), optimisticComment];
              post.commentcount = Number(post.commentcount) + 1;
            }
          })
        );
        
        // Update single post cache
        const patchSinglePost = dispatch(
          postApi.util.updateQueryData('getPostById', postId, (draft) => {
            draft.post.comments = [...(draft.post.comments || []), optimisticComment];
            draft.post.commentcount = Number(draft.post.commentcount) + 1;
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          patchSinglePost.undo();
        }
      },
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Comment' },
      ],
    }),
    
    /**
     * Delete a post
     */
    deletePost: builder.mutation<{ success: boolean }, string>({
      query: (postId) => ({
        url: `/post/${postId}`,
        method: 'DELETE',
      }),
      // Optimistic update - remove from UI immediately
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          postApi.util.updateQueryData('getAllPosts', { page: 1 }, (draft) => {
            draft.posts = draft.posts.filter((post) => post._id !== postId);
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
    
    /**
     * Update post description
     */
    updatePost: builder.mutation<SinglePostResponse, { postId: string; description: string }>({
      query: ({ postId, description }) => ({
        url: `/post/${postId}`,
        method: 'PUT',
        body: { description },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
      ],
    }),
    
    /**
     * Check if post is liked by current user
     */
    checkIfLiked: builder.query<{ success: boolean; liked: boolean }, string>({
      query: (postId) => `/post/checkifliked/${postId}`,
      providesTags: (_result, _error, postId) => [{ type: 'Post', id: `LIKE-${postId}` }],
    }),
  }),
});

// ========== EXPORT HOOKS ==========

/**
 * Auto-generated hooks for use in components
 * 
 * Usage:
 * const { data, isLoading } = useGetAllPostsQuery({ page: 1 });
 * const [likePost] = useLikePostMutation();
 */
export const {
  useGetAllPostsQuery,
  useGetUserPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useAddCommentMutation,
  useDeletePostMutation,
  useUpdatePostMutation,
  useCheckIfLikedQuery,
} = postApi;

export default postApi;
