# 🚀 RTK Query Quick Reference Guide

## 📖 How to Use RTK Query in Vibely

### Basic Query (GET requests)

```typescript
import { useGetAllPostsQuery } from '../services/postApi'

function MyComponent() {
  const { data, isLoading, error } = useGetAllPostsQuery({ page: 1 })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error occurred</div>
  
  return <PostList posts={data.posts} />
}
```

### Basic Mutation (POST/PUT/DELETE requests)

```typescript
import { useCreatePostMutation } from '../services/postApi'

function MyComponent() {
  const [createPost, { isLoading }] = useCreatePostMutation()
  
  const handleSubmit = async () => {
    try {
      await createPost(formData).unwrap()
      toast.success('Post created!')
    } catch (error) {
      toast.error('Failed to create post')
    }
  }
  
  return (
    <button onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create Post'}
    </button>
  )
}
```

---

## 📚 Available API Hooks

### User API (`../services/userApi`)

#### Queries (GET)
- `useGetAllUsersQuery()` - Get all users
- `useGetUserByIdQuery(userId)` - Get user details
- `useCheckIfFollowedQuery(userId)` - Check if you follow a user

#### Mutations (POST/PUT/DELETE)
- `useLoginMutation()` - Login user
- `useRegisterMutation()` - Register new user
- `useFollowUserMutation()` - Follow a user
- `useUnfollowUserMutation()` - Unfollow a user
- `useGetFollowersListMutation()` - Get followers list
- `useGetFollowingListMutation()` - Get following list
- `useUpdateProfileMutation()` - Update profile
- `useChangePasswordMutation()` - Change password
- `useLogoutMutation()` - Logout

### Post API (`../services/postApi`)

#### Queries (GET)
- `useGetAllPostsQuery({ page })` - Get posts with pagination
- `useGetUserPostsQuery(userId)` - Get user's posts
- `useGetPostByIdQuery(postId)` - Get single post
- `useCheckIfLikedQuery(postId)` - Check if post is liked

#### Mutations (POST/PUT/DELETE)
- `useCreatePostMutation()` - Create new post
- `useLikePostMutation()` - Like/unlike post
- `useAddCommentMutation()` - Add comment to post
- `useDeletePostMutation()` - Delete post
- `useUpdatePostMutation()` - Update post description

### AI API (`../services/aiApi`)

#### Mutations
- `useUploadImageForAIMutation()` - Upload image
- `useGenerateCaptionsMutation()` - Generate AI captions
- `useUploadAndGenerateCaptionsMutation()` - Combined operation

### Message API (`../services/messageApi`)

#### Queries
- `useGetMessagesQuery(receiverId)` - Get chat messages

#### Mutations
- `useSendMessageMutation()` - Send message

### Notification API (`../services/notificationApi`)

#### Queries
- `useGetNotificationsQuery()` - Get notifications

#### Mutations
- `useRegisterFCMTokenMutation()` - Register FCM token
- `useMarkNotificationAsReadMutation()` - Mark notification as read
- `useDeleteNotificationMutation()` - Delete notification

---

## 💡 Common Patterns

### Pattern 1: Fetch and Display Data

```typescript
const { data, isLoading, error } = useGetUserByIdQuery(userId)

if (isLoading) return <Spinner />
if (error) return <ErrorMessage />

const user = data?.user
return <UserProfile user={user} />
```

### Pattern 2: Mutation with Loading State

```typescript
const [followUser, { isLoading }] = useFollowUserMutation()

const handleFollow = async () => {
  try {
    await followUser(userId).unwrap()
    toast.success('Followed!')
  } catch (error) {
    toast.error('Failed to follow')
  }
}

return (
  <Button onClick={handleFollow} disabled={isLoading}>
    {isLoading ? 'Following...' : 'Follow'}
  </Button>
)
```

### Pattern 3: Refetching Data

```typescript
const { data, refetch } = useGetPostByIdQuery(postId)

const handleRefresh = () => {
  refetch() // Manually refetch data
}
```

### Pattern 4: Conditional Query

```typescript
// Skip query if userId is not available
const { data } = useGetUserByIdQuery(userId, {
  skip: !userId
})
```

### Pattern 5: Pagination

```typescript
const [page, setPage] = useState(1)
const { data, isFetching } = useGetAllPostsQuery({ page })

const handleLoadMore = () => {
  setPage(prev => prev + 1)
}
```

---

## 🎯 Best Practices

### ✅ DO

```typescript
// ✅ Use .unwrap() for error handling
try {
  const result = await createPost(data).unwrap()
  console.log(result)
} catch (error) {
  console.error(error)
}

// ✅ Use loading states for UX
<button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>

// ✅ Check data existence
const user = userData?.user || {}
```

### ❌ DON'T

```typescript
// ❌ Don't use axios directly
import axios from 'axios'
const response = await axios.get('/api/posts')

// ❌ Don't manage loading state manually
const [isLoading, setIsLoading] = useState(false)

// ❌ Don't forget error handling
await createPost(data) // Missing try-catch
```

---

## 🔍 Debugging Tips

### View Redux DevTools
```bash
# Install Redux DevTools extension in Chrome/Firefox
# Then open DevTools > Redux tab
# You'll see:
# - All API requests
# - Cache state
# - Query status
# - Mutations history
```

### Check Cache State
```typescript
// In Redux DevTools, look at:
// State > api > queries
// State > api > mutations
```

### Force Refetch
```typescript
const { refetch } = useGetAllPostsQuery({ page: 1 })

// Manually trigger refetch
refetch()

// Or with options
refetch({ force: true })
```

---

## 🚨 Common Issues & Solutions

### Issue: Data not updating after mutation
**Solution:** Check that tags are properly configured in API service

### Issue: Multiple requests for same data
**Solution:** RTK Query automatically deduplicates, but check if you're using different query parameters

### Issue: Cache not invalidating
**Solution:** Ensure mutation has correct `invalidatesTags`

### Issue: TypeScript errors
**Solution:** Check that types are imported from API services

---

## 📊 Performance Tips

1. **Use `skip` option** for conditional queries
2. **Implement pagination** instead of loading all data
3. **Use optimistic updates** for instant UI feedback
4. **Set `pollingInterval`** only when needed
5. **Configure `keepUnusedDataFor`** based on your needs

---

## 🎓 Next Steps

1. ✅ All components migrated - DONE
2. 🔜 Add Firebase Cloud Messaging for push notifications
3. 🔜 Implement notification polling with RTK Query
4. 🔜 Add real-time updates with WebSocket integration
5. 🔜 Implement offline support with cache persistence

---

## 📞 Need Help?

- Check [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- Review [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)
- See [RTK_QUERY_GUIDE.md](./RTK_QUERY_GUIDE.md)
- Look at existing migrated components for examples

---

**Happy Coding! 🚀**
