# CodeForge: The Ultimate Gamified Developer Portfolio & Learning SaaS Ecosystem

**Turn your professional showcase into a highly-engaging, monetizable product.** 

CodeForge is not just a developer portfolio—it is a premium, feature-rich SaaS (Software as a Service) platform designed to engage visitors, track learning paths, and monetize premium resources out of the box. With its stunning modern dark-mode aesthetic, gamified progress engine, and real-time payment checkouts, CodeForge is built to impress recruiters, clients, and prospective buyers from the first click.

---

## Why CodeForge Stands Out (SaaS-Ready Value)

### 💰 Monetize Your Content Instantly
Comes with a fully-integrated **Razorpay Production Payment Gateway**. Charge users for premium access using Daily, Monthly, or Premium Subscription tiers. Whether selling courses, coding sandboxes, or premium resume scanners, payments are secure and automated.

### 🎮 Gamified Productivity & Retention
Keep users returning daily with a built-in **Interactive Task Planner & Dynamic Calendar**. Users earn Experience Points (XP), level up, and unlock achievements as they complete daily coding goals. A perfect system for user engagement and retention.

### ⚡ Seamless, Frictionless Onboarding
Boost sign-up conversion rates with one-click **Google & GitHub Social Authentication**, alongside standard, highly-secure email registration. 

### 🚀 Visual Learning Roadmap
An interactive, milestone-based learning tracker allows users to map out their curriculum, mark progress, and visually showcase their technical growth in a sleek roadmap dashboard.

### 🛡️ Enterprise-Grade Security
Built with modern security best practices including secure HTTP-only cookies, protection against spam, rate limiting, and standard encryption, ensuring user data is always protected.

---

## Premium Core Modules

### 1. Interactive Gamified Dashboard
- **Daily Task Planner**: Add, complete, and track tasks with a simple interactive interface.
- **Dynamic Scheduler Calendar**: A beautiful calendar visualizer mapping out all goals, schedules, and deadlines.
- **XP Engine**: Real-time level progress bars and animated achievement notifications.

### 2. SaaS Billing Engine
- **Subscription Tier Cards**: Sleek UI highlighting Day Pass, Basic Pass, and Premium Pass options.
- **Razorpay Integration**: Supports Cards, UPI, Wallets, and Netbanking.
- **Smart Simulator Fallback**: Graceful local payment sandbox for easy testing and development without live credentials.

### 3. Professional Portfolio Showcase
- **Projects Carousel**: Highlight your best work with description tags, images, and live links.
- **Certificates Vault**: Display verified credentials and technical achievements.
- **Resume Builder & ATS Scanner**: Built-in resume compiler and ATS optimization scanner for career progression.

---

## Technology Stack

CodeForge is engineered using a robust, modern, and scalable stack:
- **Frontend**: React.js (Vite), Tailwind CSS, Context API for global state.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Integrations**: Passport.js (OAuth 2.0), Razorpay API, Nodemailer SMTP.

---

## Quick Setup & Deployment Guide

### Prerequisites
- Node.js 18+
- MongoDB database (Atlas or Local)

### 1. Backend Server Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file inside `/server`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   CLIENT_URL=http://localhost:5173
   
   # JWT Configuration
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   
   # Social Login
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   GITHUB_CLIENT_ID=your_github_id
   GITHUB_CLIENT_SECRET=your_github_secret
   
   # Payment Gateway Keys
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```
4. Launch backend:
   ```bash
   npm run dev
   ```

### 2. Frontend Client Setup
1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run local dev server:
   ```bash
   npm run dev
   ```
   *Visit `http://localhost:5173` to experience CodeForge locally!*

---

Built to impress. Engineered for scalability. Ready for monetization.

**Developed by Tushar Seth**
