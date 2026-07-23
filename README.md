# 📸 Instagram Clone (MERN Stack + AWS + Kubernetes)

## � NEW: Real-Time Notifications & Push Notifications

Vibely now includes a **production-ready notification system** with:
- 🔔 **In-App Notifications** - Bell icon with unread count badge
- 📱 **Push Notifications** - FCM-powered push notifications (foreground & background)
- 🔄 **Real-Time Updates** - Auto-refresh notifications every 30 seconds
- 🌐 **Multi-Device Support** - Receive notifications on all your devices
- 🎯 **Smart Triggers** - Get notified on likes, comments, and follows

📖 **Quick Setup:** [QUICK_START_NOTIFICATIONS.md](./QUICK_START_NOTIFICATIONS.md)  
🧪 **Testing Guide:** [NOTIFICATION_TESTING_GUIDE.md](./NOTIFICATION_TESTING_GUIDE.md)  
📊 **Full Documentation:** [NOTIFICATION_IMPLEMENTATION_SUMMARY.md](./NOTIFICATION_IMPLEMENTATION_SUMMARY.md)

---

## �🌟 Overview
This is a **full-fledged Instagram Clone** built using the **MERN stack** with **AWS deployment** and **Kubernetes orchestration**. It includes all core Instagram features such as user authentication, posts, comments, likes, notifications, and friend requests.

## 🚀 Live Demo
🔗 **[Project Live Link](#)** (Replace with actual URL)

## 🎯 Features
✅ **User Authentication** (Sign Up, Login, JWT-based Auth)
✅ **Create, Edit & Delete Posts** (Images & Captions)
✅ **Like & Comment System** (Real-time updates)
✅ **Follow / Unfollow Users**
✅ **User Profiles & Feeds**
✅ **AWS Deployed with Kubernetes & Auto Scaling**
✅ **CI/CD Pipeline with GitHub Actions**

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, TailwindCSS
- **Backend:** Node.js, Express.js, MongoDB
- **State Management:** Redux Toolkit
- **Authentication:** JWT, Bcrypt
- **Deployment:** Docker, AWS EKS, Kubernetes, Nginx
- **CI/CD:** GitHub Actions

## 🎯 Architecture & Deployment
This project is **containerized** using Docker and deployed on **AWS EKS (Kubernetes)** with auto-scaling.

- **Frontend & Backend run in separate containers**
- **Nginx as a reverse proxy for handling requests**
- **MongoDB Atlas for database**
- **CI/CD pipeline automates build & deployment**

## 📂 Project Structure
```
insta-clone/
│── backend/      # Express.js Server
│── frontend/     # React + TypeScript Frontend
│── k8s/          # Kubernetes Configurations
│── .github/      # CI/CD Workflows
│── README.md     # Project Documentation
```

## 🖥️ Local Setup
### Prerequisites
Ensure you have **Node.js, Docker, and Kubernetes (kubectl, minikube, or AWS EKS)** installed.


### 2️⃣ Install Dependencies
```sh
cd backend && npm install
cd ../frontend && npm install
```

### 3️⃣ Start Development Server
- **Backend:**
  ```sh
  cd backend
  npm run dev
  ```
- **Frontend:**
  ```sh
  cd frontend
  npm start
  ```

### 4️⃣ Run with Docker
```sh
docker-compose up --build
```

### 5️⃣ Deploy to Kubernetes (AWS EKS)
```sh
kubectl apply -f k8s/
```

## 📌 Future Improvements
- Add **AI-powered features**
- Implement **Story Feature**
- Improve **SEO & Performance**

## 🤝 Contributing
Feel free to fork this repository and submit a pull request. Let's improve it together! 🚀

## 📜 License
This project is licensed under the **MIT License**.
