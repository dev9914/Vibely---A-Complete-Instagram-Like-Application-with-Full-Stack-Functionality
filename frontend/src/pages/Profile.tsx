import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  Settings, 
  Grid3X3, 
  Bookmark, 
  UserSquare2, 
  Plus, 
  Heart,
  MessageCircle,
  Film,
  Loader2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

import { CardWithForm } from '@/components/Card'
import { EditProfileDialog } from '@/components/profile/EditProfileDialog'
import { RootState } from '@/store/store'
import { useGetUserByIdQuery, useGetFollowersListMutation, useGetFollowingListMutation, type User } from '@/services/userApi'
import { useGetUserPostsQuery } from '@/services/postApi'
import { cn } from '@/lib/utils'

interface ProfileProps {
  user: {
    _id: string
    username: string
    avatar: string
    noOfFollower: number
    noOfFollowing: number
    fullName: string
    bio?: string
    followers: string[]
    following: string[]
  }
}

interface FollowerUser {
  _id: string
  username: string
  fullName: string
  avatar: string
}

interface PostItem {
  _id: string
  postImage: string[]
  likes: string[]
  comments: string[]
}

// Profile Stats Component
const ProfileStat = ({ 
  value, 
  label, 
  onClick 
}: { 
  value: number
  label: string
  onClick?: () => void 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-0.5 transition-opacity",
      onClick && "hover:opacity-70 cursor-pointer"
    )}
  >
    <span className="text-lg font-semibold">{value.toLocaleString()}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </button>
)

// Story Highlight Component
const StoryHighlight = ({ label, isAdd = false }: { label: string; isAdd?: boolean }) => (
  <div className="flex flex-col items-center gap-2">
    <div className={cn(
      "w-20 h-20 rounded-full border-2 flex items-center justify-center transition-colors",
      isAdd 
        ? "border-muted-foreground/30 hover:border-muted-foreground/50 cursor-pointer" 
        : "border-muted"
    )}>
      {isAdd ? (
        <Plus className="w-8 h-8 text-muted-foreground" />
      ) : (
        <div className="w-[72px] h-[72px] rounded-full bg-muted" />
      )}
    </div>
    <span className="text-xs font-medium">{label}</span>
  </div>
)

// Post Grid Item Component
const PostGridItem = ({ post }: { post: PostItem }) => (
  <Link 
    to={`/post/${post._id}`}
    className="group relative aspect-square overflow-hidden bg-muted"
  >
    <img 
      src={post.postImage[0]} 
      alt="Post" 
      className="w-full h-full object-cover transition-transform group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
      <div className="flex items-center gap-2 text-white font-semibold">
        <Heart className="w-5 h-5 fill-white" />
        <span>{post.likes?.length || 0}</span>
      </div>
      <div className="flex items-center gap-2 text-white font-semibold">
        <MessageCircle className="w-5 h-5 fill-white" />
        <span>{post.comments?.length || 0}</span>
      </div>
    </div>
  </Link>
)

// Follower List Item Component
const FollowerListItem = ({ user }: { user: FollowerUser }) => (
  <div className="flex items-center justify-between py-3 px-4 hover:bg-muted/50 transition-colors">
    <Link to={`/${user.username}`} className="flex items-center gap-3">
      <Avatar className="w-11 h-11">
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold text-sm">{user.username}</p>
        <p className="text-sm text-muted-foreground">{user.fullName}</p>
      </div>
    </Link>
    <Button variant="secondary" size="sm">
      Remove
    </Button>
  </div>
)

const Profile = ({ user }: ProfileProps) => {
  const createpost = useSelector(
  (state: RootState) => state.ui.isCreatePostModalOpen
)

  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false)
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false)
  const [followersList, setFollowersList] = useState<FollowerUser[]>([])
  const [followingList, setFollowingList] = useState<FollowerUser[]>([])
  const [page, setPage] = useState(1)
  const [profilePosts, setProfilePosts] = useState<PostItem[]>([])
  const [hasMorePosts, setHasMorePosts] = useState(true)
  
  // RTK Query hooks
  const { data: userData } = useGetUserByIdQuery(user._id)
  const { data: postsData, isLoading: postsLoading, isFetching: postsFetching } = useGetUserPostsQuery({
    userId: user._id,
    page,
    limit: 10,
  })
  const [getFollowList, { isLoading: followersLoading }] = useGetFollowersListMutation()
  const [getFollowingList, { isLoading: followingLoading }] = useGetFollowingListMutation()
  
  const userInfo = userData?.user || user
  const profileUser = userInfo as User
  const postLength = profilePosts.length
  const isLoadingMorePosts = postsFetching && page > 1

  useEffect(() => {
    if (!postsData) {
      return
    }

    const incomingPosts = (postsData.posts || []) as PostItem[]

    setProfilePosts((prev) => {
      if (page === 1) {
        return incomingPosts
      }

      const seen = new Set(prev.map((post) => post._id))
      const uniqueIncoming = incomingPosts.filter((post) => !seen.has(post._id))

      return [...prev, ...uniqueIncoming]
    })

    setHasMorePosts(Boolean(postsData.hasMore))
  }, [postsData, page])

  const handleLoadMorePosts = () => {
    if (postsFetching || !hasMorePosts) {
      return
    }

    setPage((prev) => prev + 1)
  }

  const handleGetFollowList = async () => {
    setFollowersDialogOpen(true)
    try {
      const result = await getFollowList({ following: user.followers }).unwrap()
      setFollowersList(result.users)
    } catch (error) {
      console.error('Failed to get followers:', error)
    }
  }
  
  const handleGetFollowingList = async () => {
    setFollowingDialogOpen(true)
    try {
      const result = await getFollowingList({ following: user.following }).unwrap()
      setFollowingList(result.users)
    } catch (error) {
      console.error('Failed to get following:', error)
    }
  }

  return (
    <div className="min-h-screen">
      {createpost && <CardWithForm />}
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-12">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 ring-2 ring-border">
  <AvatarImage
    src={profileUser.avatar}
    className="object-cover"
  />
  <AvatarFallback className="text-4xl">
    {profileUser.username?.[0]?.toUpperCase()}
  </AvatarFallback>
</Avatar>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 space-y-5">
            {/* Username Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <h1 className="text-xl font-normal">{profileUser.username}</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditProfileOpen(true)}
                >
                  Edit profile
                </Button>
                <Button variant="secondary" size="sm">
                  View archive
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="flex justify-center sm:justify-start gap-10">
              <ProfileStat value={postLength} label="posts" />
              <ProfileStat 
                value={userInfo.noOfFollower || 0} 
                label="followers" 
                onClick={handleGetFollowList}
              />
              <ProfileStat 
                value={userInfo.noOfFollowing || 0} 
                label="following" 
                onClick={handleGetFollowingList}
              />
            </div>
            
            {/* Bio */}
            <div className="text-center sm:text-left">
              <p className="font-semibold">{profileUser.fullName}</p>
              {profileUser.bio && (
                <p className="text-sm text-muted-foreground mt-1">{profileUser.bio}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Story Highlights */}
        <div className="flex gap-6 pb-8 border-b border-border overflow-x-auto scrollbar-hide">
          <StoryHighlight label="New" isAdd />
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="posts" className="mt-4">
          <TabsList className="w-full bg-transparent border-b border-border rounded-none h-auto p-0 justify-center gap-12">
            <TabsTrigger 
              value="posts"
              className="rounded-none border-t-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-4 px-0 gap-2"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wider uppercase">Posts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reels"
              className="rounded-none border-t-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-4 px-0 gap-2"
            >
              <Film className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wider uppercase">Reels</span>
            </TabsTrigger>
            <TabsTrigger 
              value="saved"
              className="rounded-none border-t-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-4 px-0 gap-2"
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wider uppercase">Saved</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tagged"
              className="rounded-none border-t-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-4 px-0 gap-2"
            >
              <UserSquare2 className="w-4 h-4" />
              <span className="text-xs font-semibold tracking-wider uppercase">Tagged</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-4">
            <div className="grid grid-cols-3 gap-1">
              {postsLoading && page === 1 ? (
                Array.from({ length: 9 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-square" />
                ))
              ) : profilePosts.length > 0 ? (
                profilePosts.map((post) => (
                  <PostGridItem key={post._id} post={post} />
                ))
              ) : (
                <div className="col-span-3 py-16 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-2 border-foreground rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-light">Share Photos</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    When you share photos, they will appear on your profile.
                  </p>
                </div>
              )}
            </div>

            {profilePosts.length > 0 && (
              <div className="flex justify-center pt-6">
                {isLoadingMorePosts ? (
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more posts...
                  </div>
                ) : hasMorePosts ? (
                  <Button variant="secondary" onClick={handleLoadMorePosts}>
                    Load more
                  </Button>
                ) : null}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="reels" className="mt-4">
            <div className="py-16 text-center">
              <Film className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-light">No Reels Yet</h3>
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-4">
            <div className="py-16 text-center">
              <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-light">No Saved Posts</h3>
            </div>
          </TabsContent>
          
          <TabsContent value="tagged" className="mt-4">
            <div className="py-16 text-center">
              <UserSquare2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-light">No Tagged Posts</h3>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        user={profileUser}
      />

      {/* Followers Dialog */}
      <Dialog open={followersDialogOpen} onOpenChange={setFollowersDialogOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4 border-b border-border">
            <DialogTitle className="text-center font-semibold">Followers</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {followersLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-11 h-11 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : followersList.length > 0 ? (
              followersList.map((follower) => (
                <FollowerListItem key={follower._id} user={follower} />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No followers yet
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      {/* Following Dialog */}
      <Dialog open={followingDialogOpen} onOpenChange={setFollowingDialogOpen}>
        <DialogContent className="sm:max-w-md p-0">
          <DialogHeader className="p-4 border-b border-border">
            <DialogTitle className="text-center font-semibold">Following</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {followingLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-11 h-11 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : followingList.length > 0 ? (
              followingList.map((following) => (
                <FollowerListItem key={following._id} user={following} />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Not following anyone
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Profile
