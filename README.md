# Vibely

A modern, full-stack social media platform inspired by Instagram, built with the MERN stack. Vibely combines real-time communication, background job processing, push notifications, cloud media storage, and cloud-native deployment into a production-ready application.

---

## Overview

Vibely is designed to demonstrate the architecture and engineering practices used in modern web applications. It includes secure authentication, social interactions, real-time messaging, notification delivery, scalable background processing, and multiple deployment strategies.

The project is actively maintained and serves as both a learning project and a portfolio application showcasing full-stack development and cloud deployment.

---

## Live Demo

**Frontend**

https://vibely-social-media-app-frontend.onrender.com/

> The backend is hosted separately on Render and powers authentication, APIs, messaging, notifications, and media management.

---

## Features

### Authentication

- User registration
- Secure login
- JWT authentication
- Refresh token authentication
- Protected routes
- Persistent sessions
- Password hashing using Bcrypt

---

### User Profiles

- Create profile
- Edit profile
- Upload profile picture
- Update bio
- Follow users
- Unfollow users
- Followers & following
- Suggested users

---

### Posts

- Upload images
- Create posts
- Edit posts
- Delete posts
- Like posts
- Unlike posts
- Save posts
- Personalized feed

---

### Comments

- Add comments
- Delete comments
- Real-time comment updates

---

### Messaging

- One-to-one conversations
- Real-time messaging
- Socket.IO integration
- Instant message delivery

---

### Notification System

#### In-App Notifications

- Like notifications
- Comment notifications
- Follow notifications
- Read / unread status
- Notification badge

#### Push Notifications

- Firebase Cloud Messaging (FCM)
- Foreground notifications
- Background notifications
- Multi-device support
- Automatic device registration

#### Background Processing

- BullMQ job queue
- Upstash Redis
- Retry mechanism
- Worker-based notification processing

---

### Media Management

- Cloudinary integration
- Secure image uploads
- Optimized cloud storage

---

## Tech Stack

### Frontend

- React
- TypeScript
- Redux Toolkit
- React Router
- Tailwind CSS
- Shadcn UI
- Axios
- Socket.IO Client

### Backend

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

### Infrastructure

- MongoDB Atlas
- Upstash Redis
- Render
- Docker
- Docker Compose
- Kubernetes
- AWS Elastic Kubernetes Service (EKS)
- Nginx
- GitHub Actions

---

## System Architecture

```
                          React + TypeScript
                                  │
                                  │
                                  ▼
                          Express.js REST API
                                  │
          ┌──────────────┬────────┴───────────┬──────────────┐
          │              │                    │              │
          ▼              ▼                    ▼              ▼
    MongoDB Atlas   Cloudinary          Socket.IO      Authentication
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

## Project Structure

```
Vibely
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   └── bootstrap
│   │
│   ├── config
│   ├── queues
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

## Local Development

### Clone the repository

```bash
git clone https://github.com/dev9914/Vibely.git

cd Vibely
```

---

### Install dependencies

Backend

```bash
cd backend
npm install
```

Frontend

```bash
cd frontend
npm install
```

---

### Backend Environment Variables

Create a `.env` file inside the `backend` directory.

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

---

### Frontend Environment Variables

Create a `.env` file inside the `frontend` directory.

```env
VITE_API_URL=
VITE_SOCKET_URL=
```

---

### Start the backend

```bash
cd backend

npm run dev
```

---

### Start the frontend

```bash
cd frontend

npm run dev
```

---

## Docker

The repository includes Docker configuration for local containerized development.

Build and start the application:

```bash
docker-compose up --build
```

---

## Kubernetes Deployment

The project also includes Kubernetes manifests for deployment on AWS Elastic Kubernetes Service (EKS).

Deploy the application using:

```bash
kubectl apply -f k8s/
```

---

## Continuous Integration

GitHub Actions workflows are included for automated build and deployment.

The CI/CD pipeline supports:

- Dependency installation
- Project build
- Docker image creation
- Container registry publishing
- Kubernetes deployment

---

## Screenshots

The following screenshots can be added here:

- Authentication
- Home Feed
- User Profile
- Post Creation
- Messaging
- Notifications
- Mobile View

---

## Future Improvements

- Stories
- Reels
- Video uploads
- AI-powered captions
- User blocking
- Advanced search
- Email notifications
- Performance improvements

---

## What This Project Demonstrates

- Full-stack application development
- RESTful API design
- Authentication & authorization
- Real-time communication
- Background job processing
- Push notification architecture
- Cloud media management
- Containerization
- Kubernetes deployment
- CI/CD workflows
- Cloud infrastructure
- Scalable backend architecture

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new branch.

```bash
git checkout -b feature/my-feature
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push your branch.

```bash
git push origin feature/my-feature
```

5. Open a Pull Request.

---

## License

This project is licensed under the MIT License.

---

## Author

**Devanand**

GitHub: https://github.com/dev9914
