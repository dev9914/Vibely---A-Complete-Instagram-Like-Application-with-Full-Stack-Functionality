# 🚀 Quick Start Guide - Notification System

## Overview
Get the Vibely notification system up and running in 10 minutes!

---

## Step 1: Configure Firebase (5 minutes)

### 1.1 Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project" → Name it "Vibely" → Create
3. Wait for project creation

### 1.2 Get Web Credentials
1. Click the **Web icon** (`</>`) on project homepage
2. Register app as "Vibely Web"
3. Copy the `firebaseConfig` object

### 1.3 Get VAPID Key
1. Go to **Project Settings** → **Cloud Messaging**
2. Scroll to **"Web Push certificates"**
3. Click **"Generate key pair"**
4. Copy the VAPID key (starts with `B...`)

### 1.4 Download Admin SDK
1. Go to **Project Settings** → **Service accounts**
2. Click **"Generate new private key"**
3. Download JSON file
4. Rename to `vibely-firebase-adminsdk.json`
5. Move to `backend/config/`

---

## Step 2: Update Configuration (2 minutes)

### 2.1 Frontend Firebase Config
Edit `frontend/src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",                    // ← Paste from Step 1.2
  authDomain: "vibely-xxxxx.firebaseapp.com",
  projectId: "vibely-xxxxx",
  storageBucket: "vibely-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123"
};

const VAPID_KEY = "YOUR_VAPID_KEY";          // ← Paste from Step 1.3
```

### 2.2 Service Worker Config
Edit `frontend/public/firebase-messaging-sw.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",                    // ← Same as Step 2.1
  authDomain: "vibely-xxxxx.firebaseapp.com",
  projectId: "vibely-xxxxx",
  storageBucket: "vibely-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123"
};
```

### 2.3 Backend Config
✅ Already done! Just verify `vibely-firebase-adminsdk.json` is in `backend/config/`

---

## Step 3: Start Servers (1 minute)

### 3.1 Start Backend
```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Firebase Admin SDK initialized successfully
✅ MongoDb Connected
✅ listening at port 5000
```

### 3.2 Start Frontend
```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## Step 4: Test (2 minutes)

### 4.1 Enable Notifications
1. Open http://localhost:5173/
2. Login with a test account
3. Click **"Allow"** when browser asks for notification permission
4. You should see: ✅ **"Push notifications activated!"**

### 4.2 Verify Token Registered
Open browser console, you should see:
```
✅ FCM token registered with backend
```

### 4.3 Test Notification
1. Open a **second browser** (or incognito window)
2. Login with a **different account**
3. Like a post from the first user
4. First user should receive:
   - 🔔 Notification badge appears
   - 📬 Toast message (if tab is open)
   - 📱 System notification (if tab is closed)

---

## ✅ Success Checklist

- [ ] Firebase project created
- [ ] Firebase credentials configured in frontend
- [ ] Firebase Admin SDK JSON placed in backend
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Notification permission granted
- [ ] FCM token registered
- [ ] Test notification received

---

## 🐛 Troubleshooting

### Issue: "Firebase service account file not found"
```bash
# Check file exists
ls backend/config/vibely-firebase-adminsdk.json

# If not, download again from Firebase Console
```

### Issue: "Failed to register FCM token"
```bash
# Check firebase.ts config is correct
# Common mistake: Forgot to replace YOUR_API_KEY
```

### Issue: Notifications not showing
```bash
# 1. Check notification permission
console.log(Notification.permission)  # Should be "granted"

# 2. Check FCM token exists
localStorage.getItem('fcmToken')

# 3. Test backend endpoint
curl http://localhost:5000/api/v1/notifications/my-notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Next Steps

1. ✅ System working? → Go to [NOTIFICATION_TESTING_GUIDE.md](./NOTIFICATION_TESTING_GUIDE.md)
2. 🚀 Deploy to production? → Set up environment variables
3. 🎨 Customize UI? → Edit components in `frontend/src/components/notifications/`

---

## 🎉 You're Done!

Congratulations! Your notification system is now live.

**Try it out:**
- Like a post
- Comment on a post
- Follow a user
- Watch the notifications roll in! 🔔
