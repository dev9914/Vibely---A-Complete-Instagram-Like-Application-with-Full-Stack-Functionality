import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  BookmarkCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { openCommentDialog } from '@/store/commentSlice'
import { RootState } from '@/store/store'
import { useGetUserByIdQuery } from '@/services/userApi'
import { useLikePostMutation, useCheckIfLikedQuery, useAddCommentMutation } from '@/services/postApi'
import { formatPostTime } from '@/lib/date'

interface PostProps {
  postId: string
  userId: string
  postImage: string | string[]
  description: string
  likecount: string | number
  commentcount: string | number
  created: string
  onCommentClick: () => void
}

/**
 * Post Component
 * 
 * Instagram-style post with:
 * - Sleek header with avatar and username
 * - High-quality image display
 * - Animated like, comment, share actions
 * - Interactive comment input
 */
const Post = ({
  postId,
  userId,
  postImage,
  description,
  likecount,
  commentcount,
  created,
  onCommentClick,
}: PostProps) => {
  const dispatch = useDispatch()
  const [commentText, setCommentText] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showFullCaption, setShowFullCaption] = useState(false)
  
  // Local state for optimistic updates
  const [localLiked, setLocalLiked] = useState<boolean | null>(null)
  const [localLikeCount, setLocalLikeCount] = useState(Number(likecount) || 0)

  // Get current user for like animation
  const currentUser = useSelector((state: RootState) => state.auth.user)

  // RTK Query hooks
  const { data: userData } = useGetUserByIdQuery(userId)
  const { data: likeData, isLoading: likeCheckLoading } = useCheckIfLikedQuery(postId)
  const [likePost, { isLoading: isLiking }] = useLikePostMutation()
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation()

  // Sync local state with server state
  useEffect(() => {
    if (likeData?.liked !== undefined && localLiked === null) {
      setLocalLiked(likeData.liked)
    }
  }, [likeData?.liked, localLiked])

  // Update like count when props change
  useEffect(() => {
    setLocalLikeCount(Number(likecount) || 0)
  }, [likecount])

  const user = userData?.user || { username: '', avatar: '', _id: userId }
  const isLiked = localLiked ?? likeData?.liked ?? false
  const timeAgo = formatPostTime(created)
  const imageUrl = Array.isArray(postImage) ? postImage[0] : postImage
  
  // Truncate long captions
  const shouldTruncate = description && description.length > 100
  const displayCaption = shouldTruncate && !showFullCaption 
    ? `${description.slice(0, 100)}...` 
    : description

  const handleLike = async () => {
    if (isLiking) return
    
    // Optimistic update
    const wasLiked = isLiked
    setLocalLiked(!wasLiked)
    setLocalLikeCount(prev => wasLiked ? prev - 1 : prev + 1)
    
    try {
      await likePost(postId).unwrap()
    } catch (error) {
      // Revert on error
      setLocalLiked(wasLiked)
      setLocalLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
      console.error('Failed to like post:', error)
    }
  }

  const handleDoubleClickLike = async () => {
    if (!isLiked) {
      await handleLike()
    }
  }

  const handleComment = async () => {
    if (!commentText.trim() || isCommenting) return
    try {
      await addComment({ postId, text: commentText }).unwrap()
      setCommentText('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleCommentClick = () => {
    dispatch(openCommentDialog())
    onCommentClick()
  }

  return (
    <article className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to={`/user/${user._id}`} className="relative">
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
              <Avatar className="h-9 w-9 ring-2 ring-background">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback className="bg-muted text-sm">
                  {user.username?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </Link>
          <div className="flex flex-col">
            <Link 
              to={`/user/${user._id}`}
              className="text-sm font-semibold text-foreground hover:opacity-70 transition-opacity"
            >
              {user.username}
            </Link>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-card border-border">
            <DropdownMenuItem className="cursor-pointer py-3">
              Report
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-3">
              <Link to={`/post/${postId}`} className="w-full">Go to post</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-3">
              Share to...
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-3">
              Copy link
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="cursor-pointer py-3 text-destructive focus:text-destructive">
              Unfollow
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Image - Double click to like */}
      <div 
        className="relative w-full bg-black cursor-pointer select-none"
        onDoubleClick={handleDoubleClickLike}
      >
        <img
          src={imageUrl}
          alt="Post"
          className="w-full object-contain max-h-[70vh]"
          loading="lazy"
        />
      </div>

      {/* Actions */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-transparent hover:opacity-60 transition-all"
              onClick={handleLike}
              disabled={isLiking || likeCheckLoading}
            >
              <Heart
                className={cn(
                  'h-[26px] w-[26px] transition-all duration-200',
                  isLiked 
                    ? 'fill-red-500 text-red-500 scale-110' 
                    : 'text-foreground hover:text-muted-foreground'
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-transparent hover:opacity-60 transition-opacity"
              onClick={handleCommentClick}
            >
              <MessageCircle className="h-[26px] w-[26px]" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 hover:bg-transparent hover:opacity-60 transition-opacity"
            >
              <Send className="h-[24px] w-[24px]" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 hover:bg-transparent hover:opacity-60 transition-all"
            onClick={handleBookmark}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-[26px] w-[26px] fill-foreground" />
            ) : (
              <Bookmark className="h-[26px] w-[26px]" />
            )}
          </Button>
        </div>

        {/* Likes */}
        <p className="text-sm font-semibold text-foreground mb-2">
          {localLikeCount.toLocaleString()} {localLikeCount === 1 ? 'like' : 'likes'}
        </p>

        {/* Caption */}
        {description && (
          <div className="text-sm text-foreground mb-1">
            <Link
              to={`/user/${user._id}`}
              className="font-semibold hover:opacity-70 transition-opacity mr-2"
            >
              {user.username}
            </Link>
            <span className="text-foreground/90">{displayCaption}</span>
            {shouldTruncate && !showFullCaption && (
              <button 
                onClick={() => setShowFullCaption(true)}
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                more
              </button>
            )}
          </div>
        )}

        {/* View Comments */}
        {Number(commentcount) > 0 && (
          <button
            onClick={handleCommentClick}
            className="text-sm text-muted-foreground hover:text-muted-foreground/70 transition-opacity block mb-1"
          >
            View all {commentcount} comments
          </button>
        )}

        {/* Timestamp for mobile */}
        <time className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {timeAgo}
        </time>
      </div>

      {/* Add Comment */}
      <div   className="
        sticky
        bottom-0
        z-10
        flex
        items-center
        gap-3
        px-4
        py-3
        border-t
        border-border
        bg-card
    ">
        <Avatar className="h-7 w-7">
          <AvatarImage src={currentUser?.avatar} alt="You" />
          <AvatarFallback className="text-xs">
            {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <Input
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleComment()}
          className="
          pl-1
flex-1
border-0
bg-transparent
shadow-none
outline-none
ring-0
focus-visible:ring-0
focus-visible:ring-offset-0
focus:border-0
focus:outline-none
h-auto
text-sm
placeholder:text-muted-foreground
"
        />
        {commentText.trim() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            disabled={isCommenting}
            className="text-primary font-semibold h-auto p-0 hover:bg-transparent hover:text-primary/70"
          >
            Post
          </Button>
        )}
      </div>
    </article>
  )
}

/**
 * PostSkeleton Component
 * Loading placeholder for Post
 */
export const PostSkeleton = () => {
  return (
    <article className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>

      {/* Image Skeleton */}
      <Skeleton className="aspect-square w-full" />

      {/* Actions Skeleton */}
      <div className="px-4 py-3 space-y-3">
        <div className="flex gap-3">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-24" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
    </article>
  )
}

export default Post
