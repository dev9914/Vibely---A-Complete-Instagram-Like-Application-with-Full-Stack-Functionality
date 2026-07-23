import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface User {
  _id: string
  username: string
  avatar: string
}

interface StoriesBarProps {
  users: User[]
  currentUser?: User
  isLoading?: boolean
}

/**
 * StoriesBar Component
 * 
 * Horizontal scrollable stories/avatars section at top of feed
 */
const StoriesBar = ({ users, currentUser, isLoading }: StoriesBarProps) => {
  if (isLoading) {
    return <StoriesBarSkeleton />
  }

  return (
    <div className="w-full bg-card/50 rounded-lg border border-border/50 py-4 mb-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-4 px-4">
          {/* Current user - Add story */}
          {currentUser && (
            <StoryAvatar
              user={currentUser}
              isCurrentUser
              hasStory={false}
            />
          )}

          {/* Other users */}
          {users.map((user) => (
            <StoryAvatar
              key={user._id}
              user={user}
              hasStory={true}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  )
}

interface StoryAvatarProps {
  user: User
  isCurrentUser?: boolean
  hasStory?: boolean
  hasUnseenStory?: boolean
}

const StoryAvatar = ({
  user,
  isCurrentUser,
  hasStory,
  hasUnseenStory = true,
}: StoryAvatarProps) => {
  return (
    <Link
      to={isCurrentUser ? '/create-story' : `/user/${user._id}`}
      className="flex flex-col items-center gap-1 group"
    >
      <div className="relative">
        {/* Gradient ring for unseen stories */}
        <div
          className={cn(
            'rounded-full p-[2px]',
            hasStory && hasUnseenStory
              ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
              : 'bg-transparent'
          )}
        >
          <div className="rounded-full bg-background p-[2px]">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="bg-muted text-lg">
                {user.username?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Add story button for current user */}
        {isCurrentUser && (
          <div className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary">
            <Plus className="h-3 w-3 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Username */}
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors max-w-[64px] truncate">
        {isCurrentUser ? 'Your story' : user.username}
      </span>
    </Link>
  )
}

const StoriesBarSkeleton = () => {
  return (
    <div className="w-full bg-card/50 rounded-lg border border-border/50 py-4 mb-4">
      <div className="flex gap-4 px-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton className="h-[60px] w-[60px] rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default StoriesBar
