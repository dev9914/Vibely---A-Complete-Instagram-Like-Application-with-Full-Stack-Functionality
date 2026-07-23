# 🚀 RTK Query Architecture - Implementation Guide

## 📋 Overview

Vibely now uses **RTK Query** for all API interactions. This provides:

- ✅ **Automatic Caching** - No duplicate API calls
- ✅ **Optimistic Updates** - Instant UI feedback
- ✅ **Loading States** - Built-in `isLoading`, `isFetching`
- ✅ **Error Handling** - Consistent across the app
- ✅ **Auto Re-fetching** - On focus/reconnect
- ✅ **Type Safety** - Full TypeScript support

---

## 📁 Project Structure

```
frontend/src/
├── services/
│   ├── api.ts                   # Base RTK Query API
│   ├── notificationApi.ts       # Notification endpoints
│   ├── postApi.ts              # Post endpoints (with optimistic updates)
│   ├── userApi.ts              # User/auth endpoints
│   ├── aiApi.ts                # AI caption generation
│   ├── messageApi.ts           # Messaging endpoints
│   └── index.ts                # Central export file
├── store/
│   ├── store.ts                # Redux store with RTK Query
│   ├── authSlice.ts            # Auth state (keep for user data)
│   ├── uiSlice.ts              # UI state (modals, dropdowns)
│   ├── uploadpicSlice.ts       # (can be deprecated)
│   └── commentSlice.ts         # (can be deprecated)
```

---

## 🎯 Usage Examples

### **1. Fetching Data**

#### Before (Old Way - Direct Axios):
```typescript
// ❌ OLD - Don't do this anymore
const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/post/getallpost?page=1`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchPosts();
}, []);
```

#### After (New Way - RTK Query):
```typescript
// ✅ NEW - Use this approach
import { useGetAllPostsQuery } from '@/services';

const { data, isLoading, error, refetch } = useGetAllPostsQuery({ page: 1 });

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

return (
  <div>
    {data?.posts.map(post => (
      <PostCard key={post._id} post={post} />
    ))}
  </div>
);
```

**Benefits:**
- No manual state management
- Automatic caching (same query won't re-fetch)
- Auto re-fetch on window focus
- Cleaner, less code

---

### **2. Mutations (Create, Update, Delete)**

#### Like a Post with Optimistic Update:

```typescript
import { useLikePostMutation } from '@/services';

const [likePost, { isLoading }] = useLikePostMutation();

const handleLike = async (postId: string) => {
  try {
    await likePost(postId).unwrap();
    // UI updates INSTANTLY via optimistic update
    // No need to refetch or update state manually!
  } catch (error) {
    console.error('Failed to like post:', error);
    // Optimistic update is automatically rolled back
  }
};

return (
  <button onClick={() => handleLike(post._id)} disabled={isLoading}>
    {post.isLiked ? '❤️' : '🤍'} {post.likecount}
  </button>
);
```

**What Happens Behind the Scenes:**
1. ✅ UI updates immediately (optimistic update)
2. ✅ API call is made in background
3. ✅ If successful, optimistic update is confirmed
4. ✅ If failed, UI rolls back automatically

---

### **3. Create Post with AI Captions**

```typescript
import { 
  useCreatePostMutation, 
  useUploadAndGenerateCaptionsMutation 
} from '@/services';

const [uploadAndGenerate] = useUploadAndGenerateCaptionsMutation();
const [createPost] = useCreatePostMutation();

const [captions, setCaptions] = useState<string[]>([]);

// Step 1: Upload image & generate captions
const handleImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const result = await uploadAndGenerate(formData).unwrap();
    setCaptions(result.aiCaptions);
  } catch (error) {
    console.error('Failed to generate captions:', error);
  }
};

// Step 2: Create post with selected caption
const handleCreatePost = async (selectedCaption: string) => {
  const formData = new FormData();
  formData.append('description', selectedCaption);
  formData.append('postImage', imageFile);
  
  try {
    await createPost(formData).unwrap();
    // Post list automatically updates!
  } catch (error) {
    console.error('Failed to create post:', error);
  }
};
```

---

### **4. Follow/Unfollow User**

```typescript
import { useFollowUserMutation, useUnfollowUserMutation } from '@/services';

const [followUser] = useFollowUserMutation();
const [unfollowUser] = useUnfollowUserMutation();

const handleFollowToggle = async (userId: string, isFollowing: boolean) => {
  try {
    if (isFollowing) {
      await unfollowUser(userId).unwrap();
    } else {
      await followUser(userId).unwrap();
    }
    // UI updates instantly via optimistic update!
  } catch (error) {
    console.error('Failed to toggle follow:', error);
  }
};

return (
  <button onClick={() => handleFollowToggle(user._id, user.isFollowing)}>
    {user.isFollowing ? 'Unfollow' : 'Follow'}
  </button>
);
```

---

### **5. Notifications with RTK Query**

```typescript
import { 
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation 
} from '@/services';

const { data, isLoading } = useGetNotificationsQuery();
const [markAsRead] = useMarkNotificationAsReadMutation();

const handleNotificationClick = async (notificationId: string) => {
  try {
    await markAsRead(notificationId).unwrap();
    // Notification marked as read instantly!
    // Unread count updates automatically!
  } catch (error) {
    console.error('Failed to mark as read:', error);
  }
};

return (
  <div>
    <span className="badge">{data?.unreadCount}</span>
    {data?.notifications.map(notification => (
      <NotificationItem 
        key={notification._id}
        notification={notification}
        onClick={() => handleNotificationClick(notification._id)}
      />
    ))}
  </div>
);
```

---

### **6. Manual Cache Updates (Advanced)**

Sometimes you need to update cache manually (e.g., after Socket.IO event):

```typescript
import { useDispatch } from 'react-redux';
import { postApi } from '@/services';

const dispatch = useDispatch();

// Listen for Socket.IO new post event
socket.on('new-post', (newPost) => {
  // Manually add new post to cache
  dispatch(
    postApi.util.updateQueryData('getAllPosts', { page: 1 }, (draft) => {
      draft.posts.unshift(newPost);
    })
  );
});

// Listen for new notification
socket.on('notification', (notification) => {
  dispatch(
    notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
      draft.notifications.unshift(notification);
      draft.unreadCount += 1;
    })
  );
});
```

---

### **7. Conditional Queries (Skip)**

```typescript
// Only fetch user data if userId is available
const { data: user } = useGetUserByIdQuery(userId, {
  skip: !userId, // Don't fetch if userId is null/undefined
});

// Fetch with polling (auto-refresh every 30s)
const { data: notifications } = useGetNotificationsQuery(undefined, {
  pollingInterval: 30000, // 30 seconds
});

// Refetch on mount and focus
const { data: posts } = useGetAllPostsQuery({ page: 1 }, {
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,
});
```

---

## 🎨 UI State Management (Non-Server State)

Use the `uiSlice` for UI-only state:

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { 
  openCreatePostModal, 
  closeCreatePostModal,
  toggleNotificationDropdown 
} from '@/store/uiSlice';

const dispatch = useDispatch();
const isModalOpen = useSelector((state) => state.ui.isCreatePostModalOpen);

// Open modal
dispatch(openCreatePostModal());

// Close modal
dispatch(closeCreatePostModal());

// Toggle notification dropdown
dispatch(toggleNotificationDropdown());
```

---

## 🔄 Migration Checklist

### **Components to Migrate:**

#### ✅ **Home.tsx**
- Replace axios posts fetch with `useGetAllPostsQuery`
- Replace axios users fetch with `useGetAllUsersQuery`
- Replace axios comment with `useAddCommentMutation`

#### ✅ **Profile.tsx**
- Replace axios user fetch with `useGetUserByIdQuery`
- Replace axios posts fetch with `useGetUserPostsQuery`

#### ✅ **Card.tsx (Create Post)**
- Replace axios image upload with `useUploadImageForAIMutation`
- Replace axios caption generation with `useGenerateCaptionsMutation`
- Replace axios create post with `useCreatePostMutation`

#### ✅ **Post.tsx / Card Component**
- Replace axios like with `useLikePostMutation`
- Replace axios comment with `useAddCommentMutation`

#### ✅ **ForeignProfile.tsx**
- Replace axios follow/unfollow with `useFollowUserMutation` / `useUnfollowUserMutation`

#### ✅ **Messages.tsx**
- Replace axios with `useGetMessagesQuery`
- Replace axios send with `useSendMessageMutation`

#### ✅ **SignIn.tsx**
- Replace axios login with `useLoginMutation`

#### ✅ **SignUp.tsx**
- Replace axios register with `useRegisterMutation`

---

## 📦 Deprecate Old Slices

These can be removed after migration:

- ❌ `uploadpicSlice.ts` - Replaced by UI state + RTK Query
- ❌ `commentSlice.ts` - Handled by RTK Query optimistic updates

Keep:
- ✅ `authSlice.ts` - For auth state (user data, token)
- ✅ `uiSlice.ts` - For UI-only state

---

## 🚀 Next Steps

1. **Start migrating one component at a time** (recommend starting with Home.tsx)
2. **Test each migration thoroughly**
3. **Remove old axios calls** after migration
4. **Update tests** to work with RTK Query

---

## 💡 Pro Tips

1. **Always use `.unwrap()`** with mutations to catch errors:
   ```typescript
   await createPost(data).unwrap(); // ✅ Good
   await createPost(data); // ❌ Error handling is harder
   ```

2. **Use optimistic updates** for better UX (already configured in postApi, userApi)

3. **Combine with Socket.IO** for real-time updates:
   - Socket.IO for instant updates
   - RTK Query for HTTP-based operations

4. **Use `skip` option** to conditionally fetch data

5. **Prefetch data** for better UX:
   ```typescript
   dispatch(postApi.util.prefetch('getUserPosts', userId, { force: true }));
   ```

---

## 🎯 Benefits Summary

| Feature | Before (Axios) | After (RTK Query) |
|---------|---------------|-------------------|
| Code Lines | ~50 lines | ~5 lines |
| Loading State | Manual | Automatic |
| Error Handling | Manual | Automatic |
| Caching | None | Automatic |
| Optimistic Updates | Manual | Automatic |
| Type Safety | Partial | Full |
| Re-fetching | Manual | Automatic |

---

**Ready to build notifications? The RTK Query foundation is complete! 🎉**
