import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Grid3X3, 
  UserSquare2, 
  MoreHorizontal,
  Heart,
  MessageCircle,
  Film,
  UserPlus,
  UserChecka,
  UserCheck,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

import { cn } from '@/lib/utils'
import { 
  useGetUserByIdQuery, 
  useFollowUserMutation, 
  useUnfollowUserMutation, 
  useCheckIfFollowedQuery, 
  useGetFollowersListMutation, 
  useGetFollowingListMutation 
} from '@/services/userApi'
import { useGetUserPostsQuery } from '@/services/postApi'

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
    <span className="text-lg font-semibold">{(value || 0).toLocaleString()}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </button>
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
      Follow
    </Button>
  </div>
)

const ForeignProfile = () => {
  const { userId } = useParams<{ userId: string }>()
  
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false)
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false)
  const [followersList, setFollowersList] = useState<FollowerUser[]>([])
  const [followingList, setFollowingList] = useState<FollowerUser[]>([])
  const [page, setPage] = useState(1)
  const [profilePosts, setProfilePosts] = useState<PostItem[]>([])
  const [hasMorePosts, setHasMorePosts] = useState(true)
  
  // RTK Query hooks - skip queries if no userId
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(userId!, { skip: !userId })
  const { data: postsData, isLoading: postsLoading, isFetching: postsFetching } = useGetUserPostsQuery(
    {
      userId: userId!,
      page,
      limit: 10,
    },
    { skip: !userId }
  )
  const { data: followData, isLoading: followStatusLoading } = useCheckIfFollowedQuery(userId!, { skip: !userId })
  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation()
  const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation()
  const [getFollowList, { isLoading: followersLoading }] = useGetFollowersListMutation()
  const [getFollowingList, { isLoading: followingLoading }] = useGetFollowingListMutation()
  
  const user = userData?.user || {}
  const postLength = profilePosts.length
  const isFollowed = followData?.isFollowing || false
  const isLoadingMorePosts = postsFetching && page > 1

  useEffect(() => {
    setPage(1)
    setProfilePosts([])
    setHasMorePosts(true)
  }, [userId])

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
  
  const handleFollow = async () => {
    if (!userId) return
    try {
      await followUser(userId).unwrap()
    } catch (error) {
      console.error('Failed to follow user:', error)
    }
  }
  
  const handleUnfollow = async () => {
    if (!userId) return
    try {
      await unfollowUser(userId).unwrap()
    } catch (error) {
      console.error('Failed to unfollow user:', error)
    }
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

  if (userLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-12">
          <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full" />
          <div className="flex-1 space-y-5">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-10">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-12">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 ring-2 ring-border">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-4xl">
                {user.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 space-y-5">
            {/* Username Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <h1 className="text-xl font-normal">{user.username}</h1>
              <div className="flex items-center gap-2">
                {isFollowed ? (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleUnfollow}
                    disabled={isUnfollowing}
                    className="gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    Following
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={handleFollow}
                    disabled={isFollowing}
                    className="gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </Button>
                )}
                <Link
    to={`/chat/${userId}`}
    state={{
        user,
    }}
>
                  <Button variant="secondary" size="sm">
                    Message
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>Block</DropdownMenuItem>
                    <DropdownMenuItem>Restrict</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Report</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Copy profile URL</DropdownMenuItem>
                    <DropdownMenuItem>Share this profile</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>About this account</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="flex justify-center sm:justify-start gap-10">
              <ProfileStat value={postLength} label="posts" />
              <ProfileStat 
                value={user.noOfFollower} 
                label="followers" 
                onClick={handleGetFollowList}
              />
              <ProfileStat 
                value={user.noOfFollowing} 
                label="following" 
                onClick={handleGetFollowingList}
              />
            </div>
            
            {/* Bio */}
            <div className="text-center sm:text-left">
              <p className="font-semibold">{user.fullName}</p>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Story Highlights */}
        <div className="flex gap-6 pb-8 border-b border-border overflow-x-auto scrollbar-hide">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full border-2 border-muted flex items-center justify-center">
              <div className="w-[72px] h-[72px] rounded-full bg-muted" />
            </div>
            <span className="text-xs font-medium">Highlights</span>
          </div>
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
                  <h3 className="text-2xl font-light">No Posts Yet</h3>
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
          
          <TabsContent value="tagged" className="mt-4">
            <div className="py-16 text-center">
              <UserSquare2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-light">No Tagged Posts</h3>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
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

export default ForeignProfile
