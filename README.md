# Portfolio + Learning Web Application

A modern, production-ready portfolio and learning platform built with React, Node.js/Express, and MongoDB.

## Features

- **Portfolio Showcase** - Display projects, certificates, and skills
- **Learning Tracker** - Personal learning roadmap with progress tracking
- **JWT Authentication** - Secure login/register with access & refresh tokens
- **Contact System** - Contact form with email notifications via Nodemailer
- **Rate Limiting** - Protection against spam and abuse
- **Dark Mode** - Full dark mode support
- **Responsive Design** - Mobile-first, works on all devices

## Tech Stack

### Frontend
- React (Vite)
- React Router v6
- Context API for state management
- Axios with interceptors
- Tailwind CSS
- Modern animations

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcrypt password hashing
- Nodemailer for emails
- express-rate-limit
- Helmet for security

## Project Structure

```
Portfolio/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Auth context
│   │   ├── services/       # API service
│   │   └── routes/         # Protected routes
│   └── ...
│
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── middlewares/        # Auth & rate limit
│   ├── utils/              # Helpers
│   └── server.js           # Entry point
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Edit .env file with your values
# MongoDB connection string
# JWT secrets
# SMTP credentials (optional)
```

4. Start the server:
```bash
npm run dev
```

The API will be running at `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
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

The app will be running at `http://localhost:5173`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/refresh` | Refresh access token |

### Public APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/certificates` | Get all certificates |
| POST | `/api/certificates` | Create certificate |
| POST | `/api/contact` | Submit contact form |

### Protected APIs (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/learning` | Get learning topics |
| POST | `/api/learning` | Create topic |
| PATCH | `/api/learning/:id/status` | Update status |

## Security Features

- JWT access tokens (15 min expiry)
- Refresh tokens in httpOnly cookies (7 days)
- bcrypt password hashing (12 rounds)
- Rate limiting on sensitive endpoints
- Helmet security headers
- CORS configuration

## Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_secret_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

---

Built by Tushar Seth
