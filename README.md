<div align="center">

# 📸 Vibely

### A Production-Ready Social Media Platform Built with the MERN Stack

<p>
A modern Instagram-inspired social media application featuring real-time messaging, push notifications,
background job processing, cloud-native deployment, and scalable architecture.
</p>

<p>

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-black?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-black?style=for-the-badge&logo=socketdotio)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis)
![BullMQ](https://img.shields.io/badge/BullMQ-red?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes)

</p>

</div>

---

# 🌟 Overview

**Vibely** is a full-stack social media platform inspired by Instagram, designed to demonstrate modern web application architecture and production-ready backend engineering.

The application goes beyond a traditional CRUD project by integrating real-time communication, background job processing, cloud media storage, push notifications, scalable deployment infrastructure, and secure authentication.

---

# 🚀 Live Demo

### 🌐 Frontend

**Coming Soon**

### ⚙️ Backend API

https://vibely-instagram-like-application-with.onrender.com

---

# ✨ Features

## 🔐 Authentication

- User Registration
- Secure Login
- JWT Authentication
- Refresh Token Authentication
- Persistent Sessions
- Protected Routes
- Password Encryption using Bcrypt

---

## 👤 User Profiles

- Create Profile
- Edit Profile
- Upload Profile Picture
- Update Bio
- Followers & Following
- Suggested Users

---

## 📸 Posts

- Create Posts
- Upload Images
- Edit Posts
- Delete Posts
- Feed System
- Saved Posts

---

## ❤️ Social Features

- Like Posts
- Unlike Posts
- Comment System
- Delete Comments
- Follow Users
- Unfollow Users
- Real-time Feed Updates

---

## 💬 Real-Time Messaging

- One-to-One Chat
- Real-Time Messaging
- Conversation List
- Online User Status
- Instant Delivery
- Socket.IO Integration

---

## 🔔 Notification System

### In-App Notifications

- Like Notifications
- Comment Notifications
- Follow Notifications
- Notification Badge
- Read / Unread Status

### Push Notifications

- Firebase Cloud Messaging (FCM)
- Background Notifications
- Foreground Notifications
- Multi-device Support
- Automatic Token Registration

### Background Queue Processing

- BullMQ
- Redis Queue
- Retry Mechanism
- Worker Processing
- Reliable Notification Delivery

---

## ☁️ Media Management

- Cloudinary Integration
- Image Optimization
- Cloud Storage
- Secure Upload Pipeline

---

# 🏗 Tech Stack

## Frontend

- React
- TypeScript
- Redux Toolkit
- React Router
- Tailwind CSS
- Shadcn UI
- Axios
- Socket.IO Client

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- Socket.IO
- BullMQ
- Firebase Admin SDK
- Cloudinary

---

## Infrastructure

- MongoDB Atlas
- Upstash Redis
- Firebase Cloud Messaging
- Render
- Docker
- Docker Compose
- Kubernetes
- AWS EKS
- Nginx
- GitHub Actions

---

# 🏛 Architecture

```
                    React + TypeScript
                            │
                            ▼
                      Express.js API
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
 MongoDB Atlas         Cloudinary         Socket.IO Server
        │
        ▼
 BullMQ Queue
        │
        ▼
 Upstash Redis
        │
        ▼
 Notification Worker
        │
        ▼
 Firebase Cloud Messaging
        │
        ▼
 User Devices
```

---

# 📁 Project Structure

```
Vibely
│
├── backend
│   ├── src
│   ├── queues
│   ├── config
│   ├── middleware
│   ├── routes
│   ├── controllers
│   ├── services
│   └── package.json
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── docker
├── k8s
├── .github
│
└── README.md
```

---

# 🚀 Local Setup

## Clone Repository

```bash
git clone https://github.com/dev9914/Vibely---A-Complete-Instagram-Like-Application-with-Full-Stack-Functionality.git

cd Vibely---A-Complete-Instagram-Like-Application-with-Full-Stack-Functionality
```

---

## Install Dependencies

### Backend

```bash
cd backend

npm install
```

### Frontend

```bash
cd frontend

npm install
```

---

# ⚙ Environment Variables

### Backend

```env
PORT=

MONGODB_URI=

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=

REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=

CLIENT_URL=

REDIS_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Frontend

```env
VITE_API_URL=
```

---

# ▶ Running Locally

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm run dev
```

---

# 🐳 Docker

Build and run the project using Docker.

```bash
docker-compose up --build
```

---

# ☸ Kubernetes Deployment

The repository includes Kubernetes manifests for deploying Vibely on **AWS Elastic Kubernetes Service (EKS)**.

Deploy using:

```bash
kubectl apply -f k8s/
```

---

# 🔄 CI/CD

The project includes GitHub Actions workflows for automated deployment.

Pipeline includes:

- Dependency Installation
- Build
- Docker Image Creation
- Container Registry Push
- Kubernetes Deployment

---

# 📱 Screenshots

> Add screenshots here

- Login
- Home Feed
- Profile
- Chat
- Notifications
- Mobile View

---

# 🚀 Future Improvements

- Stories
- Reels
- Video Uploads
- AI Caption Suggestions
- Search Improvements
- Dark Mode
- User Blocking
- Post Sharing
- Email Notifications

---

# 📚 What This Project Demonstrates

- Full-Stack MERN Development
- REST API Design
- Authentication & Authorization
- Real-Time Communication
- Background Job Processing
- Push Notification Architecture
- Cloud Media Storage
- Containerization
- Kubernetes Deployment
- CI/CD Pipelines
- Cloud Infrastructure
- Scalable Backend Design

---

# 🤝 Contributing

Contributions are always welcome.

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes

```bash
git commit -m "Add AmazingFeature"
```

4. Push the branch

```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request

---

# 📄 License

Licensed under the MIT License.

---

<div align="center">

### ⭐ If you found this project helpful, consider giving it a star!

Made with ❤️ by **Devanand**

</div>
