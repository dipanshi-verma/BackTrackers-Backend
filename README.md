# 🔍 BackTrackers — Backend

> REST API powering the BackTrackers lost-and-found platform.  
> **Live Frontend:** [https://backtrackers.netlify.app](https://backtrackers.netlify.app)

---

## 📌 Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [License](#license)

---

## About

BackTrackers is a lost-and-found web application that helps users report lost items and claim found ones. This repository contains the **Node.js/Express backend** that handles authentication, item management, real-time chat, and user administration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (via Mongoose) |
| Cloud Storage | Cloudinary |
| Auth | JWT + Auth Middleware |
| File Uploads | Multer (`upload.js`) |
| Environment | dotenv |

---

## Project Structure

```
BackTrackers-Backend/
│
├── config/
│   ├── cloudinary.js         # Cloudinary setup
│   ├── db.js                 # MongoDB connection
│   └── upload.js             # Multer upload config
│
├── controllers/
│   ├── authController.js     # Register, login, admin login
│   ├── chatController.js     # Chat message handling
│   ├── foundController.js    # Found items logic
│   ├── itemController.js     # Shared item utilities
│   ├── lostController.js     # Lost items logic
│   └── userController.js     # User management (admin)
│
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   ├── errorHandler.js       # Global error handler
│   └── upload.js             # Upload middleware
│
├── models/
│   ├── ChatMessage.js        # Chat message schema
│   ├── FoundItem.js          # Found item schema
│   ├── LostItem.js           # Lost item schema
│   ├── User.js               # User schema
│   └── Verification.js       # Verification schema
│
├── routes/
│   ├── authRoutes.js         # Auth routes
│   ├── foundRoutes.js        # Found item routes
│   ├── lostRoutes.js         # Lost item routes
│   └── userRoutes.js         # User/admin routes
│
├── uploads/                  # Local upload storage
│
├── utils/
│   └── cleanupUpload.js      # Upload cleanup utility
│
├── .env                      # Environment variables (not committed)
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js                 # App entry point
```

---

## API Endpoints

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/admin-login` | Admin login | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### 📦 Lost Items — `/api/lost-items`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/lost-items` | Get all lost items | ❌ |
| POST | `/api/lost-items` | Report a lost item | ✅ |
| GET | `/api/lost-items/:id` | Get a specific lost item | ❌ |
| PUT | `/api/lost-items/:id` | Update a lost item | ✅ |
| DELETE | `/api/lost-items/:id` | Delete a lost item | ✅ |
| PUT | `/api/lost-items/:id/mark-returned` | Mark item as returned | ✅ |

### 🟢 Found Items — `/api/found-items`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/found-items` | Get all found items | ❌ |
| POST | `/api/found-items` | Report a found item | ✅ |
| GET | `/api/found-items/:id` | Get a specific found item | ❌ |
| PUT | `/api/found-items/:id` | Update a found item | ✅ |
| DELETE | `/api/found-items/:id` | Delete a found item | ✅ |

### 💬 Chat — `/api/chat`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/chat/:itemId` | Get messages for an item | ✅ |
| POST | `/api/chat/:itemId` | Send a message | ✅ |

### 👤 Users (Admin) — `/api/users`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users` | Get all users | ✅ Admin |
| DELETE | `/api/users/:id` | Delete a user | ✅ Admin |

> ✅ = Requires JWT token in `Authorization: Bearer <token>` header

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `MONGO_URI` | MongoDB connection URI |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

---

## Getting Started

### Prerequisites

- Node.js v16+
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/BackTrackers-Backend.git
cd BackTrackers-Backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Start the development server
npm run dev
```

The server will start at `http://localhost:5000`.

You should see:
```
🚀 Server running on port 5000
```

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (hot reload) |

---

## Deployment

This backend can be deployed to any Node.js-compatible platform:

- [Render](https://render.com)
- [Railway](https://railway.app)
- [Heroku](https://heroku.com)
- [Cyclic](https://cyclic.sh)

Make sure to configure all environment variables on your hosting platform before deploying.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

> Built with ❤️ by the BackTrackers team
