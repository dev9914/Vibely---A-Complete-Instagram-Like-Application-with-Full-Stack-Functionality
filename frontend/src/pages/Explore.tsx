import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Heart, MessageCircle, Play, Grid3X3, Film, X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useGetAllPostsQuery } from '@/services/postApi'
import { useGetAllUsersQuery } from '@/services/userApi'

interface PostItem {
  _id: string
  postImage: string[]
  likes: string[]
  comments: string[]
  isReel?: boolean
}

interface UserItem {
  _id: string
  username: string
  fullName: string
  avatar: string
}

// Explore Grid Item
const ExploreGridItem = ({ 
  post, 
  size = 'normal' 
}: { 
  post: PostItem
  size?: 'normal' | 'large' 
}) => (
  <Link 
    to={`/post/${post._id}`}
    className={cn(
      "group relative overflow-hidden bg-muted",
      size === 'large' ? "row-span-2 col-span-2" : ""
    )}
  >
    <img 
      src={post.postImage[0]} 
      alt="Post" 
      className="w-full h-full object-cover aspect-square transition-transform group-hover:scale-105"
    />
    {/* Hover Overlay */}
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
      <div className="flex items-center gap-2 text-white font-semibold">
        <Heart className="w-6 h-6 fill-white" />
        <span>{post.likes?.length || 0}</span>
      </div>
      <div className="flex items-center gap-2 text-white font-semibold">
        <MessageCircle className="w-6 h-6 fill-white" />
        <span>{post.comments?.length || 0}</span>
      </div>
    </div>
    {/* Reel Indicator */}
    {post.isReel && (
      <div className="absolute top-3 right-3">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
    )}
  </Link>
)

// Search Result User Item
const SearchUserItem = ({ 
  user, 
  onSelect 
}: { 
  user: UserItem
  onSelect: () => void 
}) => (
  <Link 
    to={`/${user.username}`}
    onClick={onSelect}
    className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
  >
    <Avatar className="w-11 h-11">
      <AvatarImage src={user.avatar} />
      <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="font-semibold text-sm">{user.username}</p>
      <p className="text-sm text-muted-foreground">{user.fullName}</p>
    </div>
  </Link>
)

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  
  const { data: postsData, isLoading: postsLoading } = useGetAllPostsQuery({})
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery()
  
  const allPosts: PostItem[] = postsData?.posts || []
  const allUsers: UserItem[] = usersData?.users || []
  
  const filteredUsers = allUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Create a masonry-like pattern with larger items
  const getItemSize = (index: number): 'normal' | 'large' => {
    // Every 10th item and items at positions 2, 12, 22, etc. are large
    if (index % 10 === 2 || index % 10 === 7) return 'large'
    return 'normal'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSearch(e.target.value.length > 0)
            }}
            onFocus={() => searchQuery.length > 0 && setShowSearch(true)}
            className="pl-12 pr-10 h-12 bg-muted border-0 rounded-lg text-base"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => {
                setSearchQuery('')
                setShowSearch(false)
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Search Results Dropdown */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            <ScrollArea className="max-h-[400px]">
              {usersLoading ? (
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
              ) : filteredUsers.length > 0 ? (
                filteredUsers.slice(0, 10).map((user) => (
                  <SearchUserItem 
                    key={user._id} 
                    user={user} 
                    onSelect={() => setShowSearch(false)}
                  />
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No results found
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
      
      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 mb-6">
          <TabsTrigger 
            value="posts"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3 px-6 gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="font-semibold">Posts</span>
          </TabsTrigger>
          <TabsTrigger 
            value="reels"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent py-3 px-6 gap-2"
          >
            <Film className="w-4 h-4" />
            <span className="font-semibold">Reels</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-0">
          {/* Explore Grid */}
          <div className="grid grid-cols-3 gap-1">
            {postsLoading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <Skeleton 
                  key={index} 
                  className={cn(
                    "aspect-square",
                    getItemSize(index) === 'large' && "row-span-2 col-span-2"
                  )} 
                />
              ))
            ) : allPosts.length > 0 ? (
              allPosts.map((post, index) => (
                <ExploreGridItem 
                  key={post._id} 
                  post={post} 
                  size={getItemSize(index)}
                />
              ))
            ) : (
              <div className="col-span-3 py-20 text-center">
                <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-light">No posts yet</h3>
                <p className="text-muted-foreground mt-2">
                  Start exploring to find amazing content
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="reels" className="mt-0">
          <div className="py-20 text-center">
            <Film className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-light">No Reels Yet</h3>
            <p className="text-muted-foreground mt-2">
              Discover short videos from creators
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Click outside to close search */}
      {showSearch && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSearch(false)}
        />
      )}
    </div>
  )
}

export default Explore
