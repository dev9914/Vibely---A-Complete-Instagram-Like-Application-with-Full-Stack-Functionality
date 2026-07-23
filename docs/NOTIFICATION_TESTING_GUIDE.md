# Notification System Testing Guide

## Overview
This guide provides step-by-step testing procedures for the complete notification system in Vibely.

---

## Pre-Testing Checklist

### Backend
- [ ] Backend running on `http://localhost:5000`
- [ ] MongoDB connected successfully
- [ ] Firebase Admin SDK initialized (no warnings about missing service account)
- [ ] Test endpoint: `curl http://localhost:5000/api/v1/notifications/my-notifications` (should require auth)

### Frontend
- [ ] Frontend running on `http://localhost:5173` (or your dev port)
- [ ] Firebase credentials configured in `firebase.ts` and `firebase-messaging-sw.js`
- [ ] Service worker registered (check browser dev tools → Application → Service Workers)
- [ ] No console errors on page load

---

## Test Suite 1: FCM Token Management

### Test 1.1: Request Notification Permission
**Steps:**
1. Open Vibely in a new browser/incognito window
2. Login with a test account
3. Browser should show notification permission prompt after 2 seconds

**Expected Results:**
- ✅ Permission prompt appears
- ✅ Console log: `Notification permission requested`

**Pass/Fail:** ______

---

### Test 1.2: Register FCM Token
**Steps:**
1. Click **"Allow"** on permission prompt
2. Wait 2-3 seconds
3. Check browser console

**Expected Results:**
- ✅ Console log: `FCM Token: BM4f...` (base64 string)
- ✅ Console log: `FCM token registered with backend`
- ✅ Toast: `Push notifications activated!`

**Pass/Fail:** ______

---

### Test 1.3: Verify Token in Database
**Steps:**
1. Open MongoDB Compass or Mongo shell
2. Query users collection:
   ```javascript
   db.users.findOne({ username: "testuser" })
   ```
3. Check `fcmTokens` array

**Expected Results:**
- ✅ `fcmTokens` array has 1 entry
- ✅ Token has fields: `token`, `platform: 'web'`, `deviceId`, `userAgent`, `isActive: true`, `lastUsed`

**Pass/Fail:** ______

---

### Test 1.4: Multi-Device Token Registration
**Steps:**
1. Login on Device 1 (Chrome)
2. Login on Device 2 (Firefox) with same account
3. Check database

**Expected Results:**
- ✅ `fcmTokens` array has 2 entries
- ✅ Different `deviceId` for each device
- ✅ Different `userAgent` strings

**Pass/Fail:** ______

---

### Test 1.5: Token Deactivation on Logout
**Steps:**
1. Login and register token
2. Logout
3. Check database

**Expected Results:**
- ✅ `fcmTokens` entry has `isActive: false`
- ✅ Console log: `FCM token deactivated`

**Pass/Fail:** ______

---

## Test Suite 2: In-App Notifications

### Test 2.1: Notification on Like
**Setup:**
- User A: Posts a photo
- User B: Likes the photo

**Steps:**
1. Login as User A
2. Create a post
3. Login as User B (different browser/incognito)
4. Like User A's post
5. Check User A's notification bell

**Expected Results:**
- ✅ User A sees red badge with count `1`
- ✅ Clicking bell shows notification: `@userB liked your post`
- ✅ Notification has heart icon (red)
- ✅ Database has notification with `type: 'like'`

**Pass/Fail:** ______

---

### Test 2.2: Notification on Comment
**Setup:**
- User A: Posts a photo
- User B: Comments on the photo

**Steps:**
1. User B comments: "Great photo!"
2. Check User A's notification bell

**Expected Results:**
- ✅ User A sees badge count `2` (1 like + 1 comment)
- ✅ Notification: `@userB commented on your post: "Great photo!"`
- ✅ Notification has comment icon (blue)
- ✅ Database has notification with `type: 'comment'`

**Pass/Fail:** ______

---

### Test 2.3: Notification on Follow
**Setup:**
- User B: Follows User A

**Steps:**
1. User B clicks "Follow" on User A's profile
2. Check User A's notification bell

**Expected Results:**
- ✅ User A sees badge count `3`
- ✅ Notification: `@userB started following you`
- ✅ Notification has user-plus icon (green)
- ✅ Database has notification with `type: 'follow'`

**Pass/Fail:** ______

---

### Test 2.4: Mark Notification as Read
**Steps:**
1. User A has 3 unread notifications
2. Click notification bell
3. Click on the first notification

**Expected Results:**
- ✅ Notification turns gray (read state)
- ✅ Badge count decreases by 1: `3` → `2`
- ✅ Database: `isRead: true`, `readAt` timestamp set
- ✅ User navigates to `actionUrl` (e.g., `/post/123`)

**Pass/Fail:** ______

---

### Test 2.5: Mark All as Read
**Steps:**
1. User A has 2 unread notifications
2. Click "Mark all as read" button

**Expected Results:**
- ✅ All notifications turn gray
- ✅ Badge disappears (count = 0)
- ✅ Database: All notifications have `isRead: true`

**Pass/Fail:** ______

---

### Test 2.6: Delete Notification
**Steps:**
1. User A has 3 notifications
2. Hover over a notification
3. Click the "X" (delete) button

**Expected Results:**
- ✅ Notification disappears immediately (optimistic update)
- ✅ Toast: `Notification deleted`
- ✅ Database: Notification document deleted
- ✅ Badge count updates if it was unread

**Pass/Fail:** ______

---

## Test Suite 3: Push Notifications (Foreground)

### Test 3.1: Foreground Push on Like
**Setup:**
- User A: Vibely tab is OPEN and focused
- User B: Likes User A's post

**Steps:**
1. User A keeps Vibely tab open
2. User B likes User A's post
3. Watch User A's screen

**Expected Results:**
- ✅ Toast notification appears at top-right
- ✅ Toast shows: Title = "New Like", Body = "@userB liked your post"
- ✅ Toast has "View" button
- ✅ Console log: `📬 Foreground notification received`
- ✅ Notification sound plays (if audio file exists)

**Pass/Fail:** ______

---

### Test 3.2: Click Foreground Notification
**Steps:**
1. Toast notification appears
2. Click "View" button

**Expected Results:**
- ✅ User navigates to `/post/123`
- ✅ Notification marked as read
- ✅ Toast disappears

**Pass/Fail:** ______

---

## Test Suite 4: Push Notifications (Background)

### Test 4.1: Background Push on Comment
**Setup:**
- User A: Vibely tab is CLOSED or minimized
- User B: Comments on User A's post

**Steps:**
1. User A closes Vibely tab completely
2. User B comments: "Amazing!"
3. Watch User A's system notifications (Windows/Mac tray)

**Expected Results:**
- ✅ System notification appears
- ✅ Notification shows: "@userB commented: Amazing!"
- ✅ Notification has Vibely icon/badge
- ✅ Console log (Service Worker): `🔔 Background message received`

**Pass/Fail:** ______

---

### Test 4.2: Click Background Notification
**Steps:**
1. System notification appears
2. Click on it

**Expected Results:**
- ✅ Browser opens new tab with Vibely
- ✅ User navigates to `/post/123`
- ✅ Notification marked as read in database

**Pass/Fail:** ______

---

### Test 4.3: Multiple Background Notifications
**Steps:**
1. User A closes Vibely
2. User B likes 3 posts
3. User C comments on 2 posts
4. Check User A's system notifications

**Expected Results:**
- ✅ 5 system notifications appear
- ✅ Each notification is separate
- ✅ Notifications are batched if OS supports it

**Pass/Fail:** ______

---

## Test Suite 5: Edge Cases

### Test 5.1: Self-Like (No Notification)
**Steps:**
1. User A likes their own post
2. Check notifications

**Expected Results:**
- ✅ NO notification created
- ✅ Badge count unchanged
- ✅ Database: No new notification document

**Pass/Fail:** ______

---

### Test 5.2: Self-Comment (No Notification)
**Steps:**
1. User A comments on their own post
2. Check notifications

**Expected Results:**
- ✅ NO notification created
- ✅ Badge count unchanged

**Pass/Fail:** ______

---

### Test 5.3: Unlike (Delete Notification?)
**Steps:**
1. User B likes User A's post → notification created
2. User B unlikes the post
3. Check User A's notifications

**Expected Results:**
- ✅ Notification remains (optional behavior)
- OR
- ✅ Notification is deleted (if implemented)

**Current Implementation:** Notification remains

**Pass/Fail:** ______

---

### Test 5.4: Duplicate Notification Prevention
**Steps:**
1. User B likes User A's post → notification created
2. User B unlikes and likes again
3. Check notifications

**Expected Results:**
- ✅ Only 1 like notification exists
- ✅ No duplicate notifications

**Pass/Fail:** ______

---

### Test 5.5: Invalid FCM Token Cleanup
**Steps:**
1. Manually corrupt FCM token in database
2. Trigger notification to user
3. Check backend logs

**Expected Results:**
- ✅ Backend attempts to send push
- ✅ FCM returns error (invalid token)
- ✅ Backend marks token as `isActive: false`
- ✅ Console log: `⚠️  Marking token as invalid`

**Pass/Fail:** ______

---

## Test Suite 6: Performance & Load Testing

### Test 6.1: Notification List Pagination
**Steps:**
1. Create 25+ notifications for User A
2. Open notification dropdown
3. Scroll to bottom

**Expected Results:**
- ✅ Dropdown scrolls smoothly
- ✅ All notifications visible
- ✅ No lag or freezing

**Pass/Fail:** ______

---

### Test 6.2: Real-Time Updates
**Steps:**
1. Keep notification dropdown OPEN
2. User B likes a post
3. Watch dropdown

**Expected Results:**
- ✅ New notification appears at top of list immediately
- ✅ Badge count updates in real-time
- ✅ No page refresh needed

**Current Implementation:** Requires manual refresh or polling

**Pass/Fail:** ______

---

### Test 6.3: Offline Behavior
**Steps:**
1. Open Vibely
2. Disable internet connection
3. Try to load notifications

**Expected Results:**
- ✅ Error message: "Failed to load notifications"
- ✅ "Try again" button appears
- ✅ Clicking button retries when online

**Pass/Fail:** ______

---

## Test Suite 7: Cross-Browser Compatibility

### Test 7.1: Chrome Desktop
**Steps:**
1. Test all above features in Chrome
2. Check service worker registration

**Expected Results:**
- ✅ All features work
- ✅ Service worker active

**Pass/Fail:** ______

---

### Test 7.2: Firefox Desktop
**Steps:**
1. Test all features in Firefox
2. Check service worker registration

**Expected Results:**
- ✅ All features work
- ✅ Service worker active
- ✅ Notifications show correctly

**Pass/Fail:** ______

---

### Test 7.3: Edge Desktop
**Steps:**
1. Test all features in Microsoft Edge
2. Check service worker registration

**Expected Results:**
- ✅ All features work
- ✅ Service worker active

**Pass/Fail:** ______

---

### Test 7.4: Safari (Limited Support)
**Steps:**
1. Open Vibely in Safari
2. Try to enable notifications

**Expected Results:**
- ⚠️ Notification permission prompt may not appear
- ⚠️ Service worker may not register
- ✅ In-app notifications still work
- ✅ No console errors

**Note:** Safari has limited FCM support on iOS

**Pass/Fail:** ______

---

## Test Suite 8: Security & Privacy

### Test 8.1: Unauthorized Access
**Steps:**
1. Logout
2. Try to access: `GET /api/v1/notifications/my-notifications`

**Expected Results:**
- ✅ Status: `401 Unauthorized`
- ✅ Error: `Unauthorized request`

**Pass/Fail:** ______

---

### Test 8.2: Cross-User Notification Access
**Steps:**
1. User A has notification ID: `abc123`
2. Login as User B
3. Try to access: `GET /api/v1/notifications/abc123`

**Expected Results:**
- ✅ Status: `403 Forbidden` or `404 Not Found`
- ✅ Cannot access other user's notifications

**Pass/Fail:** ______

---

### Test 8.3: XSS Protection
**Steps:**
1. User B comments: `<script>alert('XSS')</script>`
2. Check User A's notification

**Expected Results:**
- ✅ Script is escaped/sanitized
- ✅ No alert popup
- ✅ Shows raw text: `<script>alert('XSS')</script>`

**Pass/Fail:** ______

---

## Test Suite 9: API Endpoints

### Test 9.1: GET /api/v1/notifications/my-notifications
```bash
curl -X GET http://localhost:5000/api/v1/notifications/my-notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "notifications": [...],
  "unreadCount": 5
}
```

**Pass/Fail:** ______

---

### Test 9.2: POST /api/v1/notifications/register-token
```bash
curl -X POST http://localhost:5000/api/v1/notifications/register-token \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "BM4f...",
    "platform": "web",
    "userAgent": "Mozilla/5.0..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "FCM token registered successfully",
  "deviceId": "abc123"
}
```

**Pass/Fail:** ______

---

### Test 9.3: PATCH /api/v1/notifications/:id/read
```bash
curl -X PATCH http://localhost:5000/api/v1/notifications/abc123/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

**Pass/Fail:** ______

---

### Test 9.4: DELETE /api/v1/notifications/:id
```bash
curl -X DELETE http://localhost:5000/api/v1/notifications/abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

**Pass/Fail:** ______

---

## Summary

### Test Results
- **Total Tests:** 40
- **Passed:** ______
- **Failed:** ______
- **Skipped:** ______

### Critical Issues Found
1. ______________________________
2. ______________________________
3. ______________________________

### Minor Issues Found
1. ______________________________
2. ______________________________
3. ______________________________

### Recommendations
1. ______________________________
2. ______________________________
3. ______________________________

---

## Sign-Off

**Tested By:** ______________________  
**Date:** ____ / ____ / ________  
**Status:** [ ] PASS [ ] FAIL [ ] NEEDS REVISION

---

## Next Steps After Testing

### If All Tests Pass:
1. Deploy to staging environment
2. Test with real users
3. Monitor Firebase Console for errors
4. Check server logs for performance

### If Tests Fail:
1. Document failures in detail
2. Create bug tickets
3. Fix critical issues first
4. Re-run failed tests
5. Full regression test before deployment
