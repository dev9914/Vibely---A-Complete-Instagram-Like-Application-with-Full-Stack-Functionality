# Firebase Setup Guide for Push Notifications

## Overview
This guide walks you through setting up Firebase Cloud Messaging (FCM) for push notifications in Vibely.

## Prerequisites
- Google account
- Firebase project (free tier is sufficient)

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `Vibely` (or any name you prefer)
4. Enable/disable Google Analytics (optional)
5. Click **"Create project"**
6. Wait for project to be created
7. Click **"Continue"** when ready

---

## Step 2: Enable Cloud Messaging

1. In Firebase Console, go to **Project Settings** (⚙️ gear icon)
2. Select **"Cloud Messaging"** tab
3. You'll see **"Cloud Messaging API (Legacy)"** - this is what we need

---

## Step 3: Get Web App Credentials

### 3.1 Register Web App

1. In Firebase Console, click **"Project Overview"**
2. Click the **Web icon** (`</>`) to add a web app
3. Register app:
   - **App nickname**: `Vibely Web`
   - **Firebase Hosting**: Leave unchecked (optional)
   - Click **"Register app"**

### 3.2 Copy Firebase Config

You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "vibely-xxxxx.firebaseapp.com",
  projectId: "vibely-xxxxx",
  storageBucket: "vibely-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Save this config - you'll need it in Step 5!**

---

## Step 4: Get VAPID Key (Web Push Certificate)

1. In Firebase Console, go to **Project Settings** → **Cloud Messaging** tab
2. Scroll down to **"Web Push certificates"**
3. Click **"Generate key pair"**
4. Copy the **VAPID key** (starts with `B...`)
   - Example: `BNdX...xyz123` (68 characters)

**Save this VAPID key - you'll need it in Step 5!**

---

## Step 5: Update Frontend Configuration

### 5.1 Update `frontend/src/config/firebase.ts`

Replace the placeholder config with your real Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",              // From Step 3.2
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const VAPID_KEY = "YOUR_ACTUAL_VAPID_KEY";    // From Step 4
```

### 5.2 Update `frontend/public/firebase-messaging-sw.js`

Replace the placeholder config with the same Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## Step 6: Get Firebase Admin SDK Service Account (Backend)

### 6.1 Generate Service Account Key

1. In Firebase Console, go to **Project Settings** → **"Service accounts"** tab
2. Click **"Generate new private key"**
3. Click **"Generate key"** in the confirmation dialog
4. A JSON file will be downloaded (e.g., `vibely-firebase-adminsdk-xxxxx.json`)

### 6.2 Configure Backend

1. **Rename the downloaded file** to `vibely-firebase-adminsdk.json`

2. **Move it to**: `backend/config/vibely-firebase-adminsdk.json`

3. **Add to `.gitignore`** (IMPORTANT - never commit this file!):
   ```
   # Firebase Admin SDK
   config/vibely-firebase-adminsdk.json
   ```

4. The backend is already configured to load this file at:
   ```javascript
   // backend/src/utils/firebaseAdmin.js
   const serviceAccount = require('../../config/vibely-firebase-adminsdk.json');
   ```

---

## Step 7: Verify Setup

### 7.1 Start Backend
```bash
cd backend
npm run dev
```

**Expected output:**
- ✅ `Firebase Admin SDK initialized successfully`
- ✅ `listening at port 5000`

**If you see warning:**
- ⚠️ `Firebase service account file not found` → Check Step 6.2

### 7.2 Start Frontend
```bash
cd frontend
npm run dev
```

### 7.3 Test Notifications

1. **Login** to Vibely
2. Browser will ask: **"Allow notifications?"** → Click **Allow**
3. Check browser console:
   - ✅ `FCM token registered with backend`
   - ✅ `Push notifications activated!`

4. **Test push notification:**
   - Open another browser/incognito tab
   - Login with a different account
   - Like a post from the first user
   - First user should receive a notification!

---

## Step 8: Test Notification Flow

### 8.1 Foreground Notification (tab open)
1. Keep Vibely tab open
2. Another user likes your post
3. You'll see a **toast notification** at the top-right

### 8.2 Background Notification (tab closed)
1. Close Vibely tab
2. Another user likes your post
3. You'll see a **system notification** (Windows/Mac/Linux notification)
4. Click the notification → Opens Vibely to the post

### 8.3 Multi-Device Support
1. Login on multiple devices (laptop + phone)
2. Notifications will be sent to **all devices**
3. Clicking notification on any device marks it as read

---

## Troubleshooting

### Issue 1: "Firebase service account file not found"
**Solution:**
- Check file exists: `backend/config/vibely-firebase-adminsdk.json`
- Check file name is exact match
- Restart backend server

### Issue 2: "Failed to register FCM token"
**Solution:**
- Check Firebase config in `firebase.ts` is correct
- Check VAPID key is correct
- Check browser supports notifications (Chrome, Firefox, Edge)
- Check service worker registered: `chrome://serviceworker-internals/`

### Issue 3: "Permission denied" for notifications
**Solution:**
- Click lock icon in browser address bar
- Reset notification permission
- Refresh page and allow notifications

### Issue 4: Notifications not showing
**Solution:**
- Check notification permission is granted
- Check FCM token is registered (check console logs)
- Check backend Firebase Admin SDK initialized
- Check notification triggers in backend (like, comment, follow)

### Issue 5: "Messaging: This browser doesn't support the API's required..."
**Solution:**
- Use a supported browser: Chrome, Firefox, Edge (not Safari on iOS)
- Enable notifications in browser settings
- Check if running on HTTPS (localhost is OK for development)

---

## Security Best Practices

### ✅ DO:
- Keep `vibely-firebase-adminsdk.json` in `.gitignore`
- Never commit Firebase credentials to Git
- Use environment variables for production
- Regenerate keys if accidentally exposed

### ❌ DON'T:
- Don't share Firebase service account JSON
- Don't commit credentials to public repos
- Don't use the same Firebase project for dev and production

---

## Production Deployment

### Environment Variables (Recommended)

**Frontend** (`.env`):
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

**Backend** (`.env`):
```bash
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
```

---

## Support

For issues or questions:
1. Check Firebase Console → Cloud Messaging logs
2. Check browser console for errors
3. Check backend logs for Firebase errors
4. Refer to [Firebase Documentation](https://firebase.google.com/docs/cloud-messaging)

---

## Summary Checklist

- [ ] Create Firebase project
- [ ] Enable Cloud Messaging
- [ ] Register web app and get config
- [ ] Generate VAPID key
- [ ] Update `frontend/src/config/firebase.ts`
- [ ] Update `frontend/public/firebase-messaging-sw.js`
- [ ] Download Firebase Admin SDK service account JSON
- [ ] Move JSON to `backend/config/vibely-firebase-adminsdk.json`
- [ ] Add to `.gitignore`
- [ ] Test backend starts without errors
- [ ] Test frontend requests notification permission
- [ ] Test notification flow (like, comment, follow)
- [ ] Test foreground and background notifications
- [ ] Test multi-device support

---

**Congratulations! 🎉**

Your push notification system is now fully configured and ready for production use!
