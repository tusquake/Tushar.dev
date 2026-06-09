# Portfolio + Learning Web Application

A modern, production-ready portfolio, task management, and learning platform built with React, Node.js/Express, MongoDB, and integrated with third-party OAuth and payment systems.

## Features

- **Portfolio Showcase** - Display projects, certificates, and skills.
- **Learning Tracker** - Personal learning roadmap with progress tracking.
- **Gamified Task List & Calendar** - Create daily tasks, track achievements, earn XP rewards, and view schedule on an interactive calendar.
- **OAuth 2.0 Integration** - Google and GitHub social logins via Passport.js alongside standard email/password login.
- **Razorpay Payment Gateway** - Production-ready checkout for daily, basic, and premium subscription passes with automatic local simulator fallback.
- **JWT Authentication** - Secure login/register with short-lived access tokens and refresh tokens stored in secure `httpOnly` cookies.
- **Contact System** - Send contact inquiries with automated email notifications via Nodemailer.
- **Rate Limiting & Security** - Protection against spam with Helmet headers, CORS filters, and route-specific rate limits.
- **Aesthetic Dark Theme** - Sleek, responsive layout utilizing glassmorphism and modern micro-animations.

---

## Tech Stack

### Frontend
- **React (Vite)**
- **React Router v7**
- **Context API** for global auth, notifications, and subscription state
- **Axios** with request/response interceptors (automatic token refresh)
- **Tailwind CSS** & modern custom styling variables

### Backend
- **Node.js + Express**
- **MongoDB + Mongoose**
- **Passport.js** (Google & GitHub OAuth 2.0 strategies)
- **Razorpay Node SDK** (signature verification, secure hashing)
- **JWT Authentication** (access tokens and refresh cookies)
- **Nodemailer** for email delivery
- **express-rate-limit** & **Helmet** for network security

---

## Project Structure

```
Portfolio/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components (Tasks, SubscriptionModal, etc.)
│   │   ├── pages/          # Page views (Dashboard, Login, Profile)
│   │   ├── context/        # Auth and theme context provider
│   │   ├── services/       # API services (paymentAPI, taskAPI)
│   │   └── routes/         # Protected and public routes
│   └── ...
│
├── server/                 # Node.js backend
│   ├── controllers/        # Route logic (payment, auth, task)
│   ├── models/             # Mongoose schemas (User, Task, Project)
│   ├── routes/             # Express routing mapping
│   ├── middlewares/        # Authentication checks and error handlers
│   ├── config/             # DB and passport strategy configurations
│   └── server.js           # Entry point
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables in a `.env` file (see [Environment Variables](#environment-variables)).
4. Start the server:
   ```bash
   npm run dev
   ```
   The API will run at `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:5173`

---

## API Endpoints

### Authentication & OAuth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/google` | Trigger Google OAuth flow |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/github` | Trigger GitHub OAuth flow |
| GET | `/api/auth/github/callback` | GitHub OAuth callback |

### Tasks & Gamification
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all user tasks |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update task status, description, or title |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/tasks/stats` | Retrieve user XP, level, and accomplishments |

### Payments & Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/order` | Create a new Razorpay order |
| POST | `/api/payment/verify` | Verify transaction signature and upgrade tier |

---

## Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
CLIENT_URL=http://localhost:5173

# JWT Secrets
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# OAuth Keys
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

---

Built by Tushar Seth
