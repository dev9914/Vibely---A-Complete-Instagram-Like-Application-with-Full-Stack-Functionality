import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { formatPostTime } from '../lib/date'
import { useAddCommentMutation } from '../services'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { RootState } from '@/store/store'
import { Heart, Smile, Loader2 } from 'lucide-react'
import { closeCommentDialog } from '@/store/commentSlice'

interface Comment {
  userId: string
  username: string
  avatar: string
  text: string
  createdAt: string
}

interface CommentDialogProps {
  comments: Comment[]
  postId: string
}

export function CommentDialog({ comments, postId }: CommentDialogProps) {
  const dispatch = useDispatch()
  const [commentText, setCommentText] = useState('')
  const [addComment, { isLoading }] = useAddCommentMutation()
  const currentUser = useSelector((state: RootState) => state.auth.user)
  console.log('Current User:', currentUser);

  const handleAddComment = async () => {
    if (!commentText.trim()) return

    try {
      await addComment({ postId, text: commentText }).unwrap()
      setCommentText('')
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddComment()
    }
  }

  const handleClose = () => {
    dispatch(closeCommentDialog())
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && dispatch(closeCommentDialog())}>
      <DialogContent className="z-[9999] bg-card border-border max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="py-3 border-b border-border">
          <div className="flex">
            <div className="w-8" /> {/* Spacer for centering */}
            <DialogTitle className="text-base font-semibold">Comments</DialogTitle>
          </div>
        </DialogHeader>

        {/* Comments List */}
        <ScrollArea className="h-[400px]">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="mb-4 rounded-full bg-muted p-6">
                <svg
                  className="h-12 w-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                No comments yet
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Start the conversation.
              </p>
            </div>
          ) : (
            <div className="py-4 px-4 space-y-4">
              {comments.map((item, index) => (
                <div 
                  className="flex gap-3 group" 
                  key={`${item.userId}-${item.createdAt}-${index}`}
                >
                  <Link 
                    to={`/user/${item.userId}`} 
                    onClick={handleClose}
                    className="shrink-0"
                  >
                    <Avatar className="w-9 h-9 ring-1 ring-border">
                      <AvatarImage src={item?.avatar} />
                      <AvatarFallback className="bg-muted text-sm">
                        {item.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm">
                          <Link 
                            to={`/user/${item.userId}`} 
                            onClick={handleClose}
                            className="font-semibold hover:opacity-70 transition-opacity mr-2"
                          >
                            {item.username}
                          </Link>
                          <span className="text-foreground/90">{item.text}</span>
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatPostTime(item.createdAt)}
                          </span>
                          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
                            Reply
                          </button>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <Heart className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Add Comment Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-t border-border bg-background/50">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={currentUser?.avatar || undefined} alt="You" />
            <AvatarFallback className="text-xs bg-muted">
              {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center gap-2">
            <Input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a comment..."
              className="flex-1 pl-1.5
border-0
bg-transparent
shadow-none
outline-none
ring-0
h-auto
text-sm
placeholder:text-muted-foreground
focus:border-0
focus:outline-none
focus:ring-0
focus-visible:border-0
focus-visible:outline-none
focus-visible:ring-0
focus-visible:ring-offset-0"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 hover:bg-transparent"
            >
              <Smile className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </Button>
          </div>
          {commentText.trim() && (
            <Button
              onClick={handleAddComment}
              disabled={!commentText.trim() || isLoading}
              variant="ghost"
              size="sm"
              className="text-primary font-semibold hover:bg-transparent hover:text-primary/70 h-auto p-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Post'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
