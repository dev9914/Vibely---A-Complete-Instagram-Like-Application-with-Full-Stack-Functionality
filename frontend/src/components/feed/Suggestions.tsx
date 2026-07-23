import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFollowUserMutation, useUnfollowUserMutation } from '@/services/userApi'
import { Loader2 } from 'lucide-react'

interface User {
  _id: string
  username: string
  fullName?: string
  avatar: string
}

interface SuggestionsProps {
  currentUser?: User
  suggestions: User[]
  isLoading?: boolean
}

/**
 * Suggestions Component
 * 
 * Right sidebar showing:
 * - Current user info with switch option
 * - Suggested users to follow
 * - Footer links
 */
const Suggestions = ({ currentUser, suggestions, isLoading }: SuggestionsProps) => {
  if (isLoading) {
    return <SuggestionsSkeleton />
  }

  return (
    <div className="w-full pt-4 pb-8 pl-1">
      {/* Current User */}
      {currentUser && (
        <div className="flex items-center justify-between mb-5">
          <Link to="/profile" className="flex items-center gap-3 group">
            <Avatar className="h-11 w-11 ring-2 ring-offset-2 ring-offset-background ring-primary/10 group-hover:ring-primary/30 transition-all">
              <AvatarImage src={currentUser.avatar} alt={currentUser.username} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                {currentUser.username?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {currentUser.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {currentUser.fullName || currentUser.username}
              </span>
            </div>
          </Link>
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs font-semibold text-primary hover:text-primary/80 h-auto p-0"
          >
            Switch
          </Button>
        </div>
      )}

      {/* Suggestions Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-muted-foreground">
          Suggested for you
        </span>
        <Button 
          variant="link" 
          size="sm" 
          className="text-xs font-semibold text-foreground hover:text-foreground/70 h-auto p-0"
        >
          See All
        </Button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {suggestions.slice(0, 5).map((user) => (
          <SuggestionItem key={user._id} user={user} />
        ))}
      </div>

      {/* Footer Links */}
      <footer className="mt-8">
        <nav className="flex flex-wrap gap-x-1 text-[11px] text-muted-foreground/40 leading-4">
          {['About', 'Help', 'Press', 'API', 'Jobs', 'Privacy', 'Terms', 'Locations', 'Language', 'Meta Verified'].map((link, i) => (
            <span key={link}>
              <span className="hover:underline cursor-pointer">{link}</span>
              {i < 9 && <span className="mx-0.5">·</span>}
            </span>
          ))}
        </nav>
        <p className="text-[11px] text-muted-foreground/40 mt-4 uppercase tracking-wide">
          © 2026 Vibely from Dev
        </p>
      </footer>
    </div>
  )
}

interface SuggestionItemProps {
  user: User
}

const SuggestionItem = ({ user }: SuggestionItemProps) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation()
  const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation()
  
  const isLoading = isFollowLoading || isUnfollowLoading

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (isFollowing) {
        await unfollowUser(user._id).unwrap()
        setIsFollowing(false)
      } else {
        await followUser(user._id).unwrap()
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error)
    }
  }

  return (
    <div className="flex items-center justify-between py-1">
      <Link to={`/user/${user._id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-pink-400 text-white">
            {user.username?.charAt(0)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {user.username}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            Followed by user1 + 2 more
          </span>
        </div>
      </Link>
      <Button 
        variant="link"
        size="sm"
        className={`text-xs font-semibold h-auto p-0 ml-2 ${
          isFollowing 
            ? 'text-muted-foreground hover:text-foreground' 
            : 'text-primary hover:text-primary/80'
        }`}
        onClick={handleFollowToggle}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isFollowing ? (
          'Following'
        ) : (
          'Follow'
        )}
      </Button>
    </div>
  )
}

const SuggestionsSkeleton = () => {
  return (
    <div className="w-full pt-4 pb-6">
      {/* Current User Skeleton */}
      <div className="flex items-center gap-3 mb-5">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-12" />
      </div>

      {/* Suggestions Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-3.5 w-full max-w-[100px]" />
              <Skeleton className="h-2.5 w-full max-w-[140px]" />
            </div>
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Suggestions
