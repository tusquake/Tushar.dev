# CodeForge: Architecture Blueprint and Technical Interview Guide

This guide provides an end-to-end breakdown of CodeForge's system architecture, technical design decisions, trade-offs (why specific implementations were chosen over alternatives), and a set of key technical interview questions.

---

## 1. End-to-End Application Flows

### Authentication and Session Flow
1. **Initiation**: The user logs in via credentials (email/password) or selects a third-party provider (Google or GitHub).
2. **Passport.js Handshake (Social)**: For Google/GitHub, Passport.js authenticates the user profile with the external provider. If the user does not exist, a new account is automatically provisioned.
3. **Token Generation**: On successful authentication, the server generates:
   - An **Access Token** (JWT containing user ID, short-lived, e.g., 15 minutes).
   - A **Refresh Token** (JWT containing a unique session ID, long-lived, e.g., 7 days).
4. **Token Storage**:
   - The Access Token is returned in the JSON response body and stored in-memory by the React client.
   - The Refresh Token is set as an `httpOnly`, `Secure`, `SameSite=Strict` cookie on the user's browser.
5. **Session Verification (Axios Interceptors)**:
   - Every API request from the client appends the Access Token to the HTTP `Authorization` header (`Bearer <token>`).
   - If the Access Token expires, the backend returns a `401 Token Expired` response.
   - The client's Axios response interceptor intercepts the 401 error, makes a silent POST request to `/api/auth/refresh` (sending the HTTP-only cookie automatically), receives a new Access Token, and retries the original request.
6. **Concurrent Login Enforcement**:
   - The user schema maintains a `currentSessionId`.
   - When generating the refresh token, a new UUID `sessionId` is embedded.
   - If a user logs in from a new device, `currentSessionId` updates.
   - Any active session on the old device will be rejected with a `SESSION_EXPIRED` code during token refresh since the token's `sessionId` no longer matches the database's `currentSessionId`.

### Razorpay Payment and Subscription Flow
1. **Order Creation**: 
   - When a user chooses a plan (e.g., Daily Pass), the client sends a POST request to `/api/payment/order` with the selected plan.
   - The backend validates the plan price, instantiates the Razorpay Node SDK, and registers a transaction with a unique receipt reference under 40 characters.
   - Razorpay returns a signed `order_id`.
2. **Checkout Launch**:
   - The client loads the Razorpay checkout script and opens the Checkout UI prefilled with the `order_id`, amount, and the user's email.
3. **Verification**:
   - On completion, Razorpay returns `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature`.
   - The client posts these keys to `/api/payment/verify`.
   - The server computes a SHA-256 HMAC hash of `order_id|payment_id` using the local `RAZORPAY_KEY_SECRET` and compares it to the incoming `razorpay_signature`.
   - If verified, the server upgrades the user's database document to the purchased tier and calculates the expiration timestamp.
4. **Simulator Fallback**:
   - If the backend detects that Razorpay environment variables are missing, it returns a simulated order object.
   - The frontend intercepts this state and opens an interactive payment simulator popup allowing developers to mock successful card, UPI, and Netbanking checkouts.

### Gamified Task Tracking and XP Flow
1. **Task Action**: The user completes a task.
2. **XP Increment**: The client sends a PUT request to `/api/tasks/:id` with `{ completed: true }`.
3. **Database Hook**: The server validates the status, updates the task document, and calculates the user's new XP total (adding the task's reward XP, e.g., 10 XP).
4. **Level Calculation**:
   - Leveling uses a dynamic curve (e.g., `Level = floor(square_root(Total_XP / 100)) + 1`).
   - If the new XP crosses the next level threshold, the server increments the user's `level` field.
5. **Response**: The server sends the updated task, user XP, level status, and any achievement status back to the client.

---

## 2. Architecture Decisions and Trade-offs

### Why JWT with In-Memory Access Token + HTTP-only Refresh Cookie?
- **Alternative**: Storing both tokens in `localStorage`.
- **Trade-off Decision**: Storing access tokens in `localStorage` makes them highly vulnerable to Cross-Site Scripting (XSS) attacks. If an attacker injects a malicious script, they can read `localStorage` and steal the token.
- **Implementation Choice**: By placing the long-lived refresh token in an `httpOnly` cookie, Javascript scripts cannot access it (protecting against XSS). The short-lived access token is kept in React's memory, ensuring that even if an XSS attack occurs, the compromised credentials expire within minutes.

### Why Mongoose / MongoDB instead of PostgreSQL?
- **Alternative**: Using a relational database (SQL).
- **Trade-off Decision**: A SQL database requires rigid schema definitions and migrations whenever project fields or learning paths are modified.
- **Implementation Choice**: MongoDB's document model provides schema flexibility, which is highly beneficial for developer portfolios where projects, certificates, and learning objects contain highly nested, varying metadata. It allows rapid product iteration without database locking or complex migration workflows.

### Why Dual-Mode Checkout (Razorpay + Local Simulator)?
- **Alternative**: Standard checkout integration which fails outright if API keys are missing.
- **Trade-off Decision**: Real payment checkouts require active Merchant KYC approval and key configuration, preventing immediate testing by recruiters, prospective buyers, or new developers during local setup.
- **Implementation Choice**: We built a dual-mode integration. If the keys are configured, it runs live Razorpay checkouts. If keys are absent, it renders a custom, interactive simulation layer. This ensures the UX remains testable under all deployment conditions.

### Why Single-Session Enforcement?
- **Alternative**: Multi-session logins.
- **Trade-off Decision**: Allowing infinite concurrent sessions makes it easy for users to share paid accounts (e.g., Daily or Premium passes) with multiple people.
- **Implementation Choice**: We enforce a single active session ID in the database. When a new login occurs, the previous device's refresh token becomes invalid on the next API poll, automatically logging them out and preventing account sharing abuse.

---

## 3. Core Technical Interview Questions

### Question 1: How does your application prevent CSRF (Cross-Site Request Forgery) attacks since you store the refresh token in a cookie?
- **Answer**: We use the `SameSite=Strict` (or `SameSite=Lax`) cookie flag. This instructs the browser to never send the cookie along with cross-site requests (e.g., if a user clicks a malicious link on an external site targeting our API). Additionally, because operations require a valid JWT Access Token passed in the `Authorization` header (which cannot be read from cross-site scripts), standard CSRF attacks fail because the attacker cannot supply the access token.

### Question 2: Razorpay returns signatures on the frontend. Why can't we trust the frontend and upgrade the user's subscription immediately in the client?
- **Answer**: The frontend can be easily manipulated. A user could open the browser console and mock the success callback of the Razorpay SDK to send a fake success token to the application. To prevent this, the server must cryptographically verify the signature by generating an HMAC-SHA256 hash using the secret key (which is stored securely on the server and never exposed to the client) and checking if it matches the signature returned by Razorpay.

### Question 3: How does your application handle database connection pool management under high traffic?
- **Answer**: We use Mongoose's default connection pooling. When `mongoose.connect()` is called, it initializes a pool of reusable connections (defaulting to 10). When a request is received, Mongoose rents a connection from the pool and returns it when the operation completes. This prevents the server from incurring the network overhead of opening and closing database connections for every single HTTP request.

### Question 4: What is the benefit of using an Axios Interceptor for token refreshes instead of manually checking expiration dates before every API call?
- **Answer**: Manually checking token expiration adds boilerplate to every service file. Using an Axios interceptor centralizes this logic in a single location (`api.js`). It registers a global listener that automatically detects `401 Unauthorized` responses, halts subsequent requests, silently refreshes the token, and transparently retries the failed requests. The rest of the application remains completely unaware of the token renewal process.

### Question 5: Why does the Razorpay order generation limit the receipt identifier length, and how did you resolve it?
- **Answer**: Razorpay enforces a strict validation rule capping the `receipt` string length at 40 characters. Our initial implementation combined static text, the user's 24-character hex MongoDB ID, and a timestamp, exceeding the limit. We resolved this by extracting only the last 8 characters of the user's ID and the last 10 digits of the current timestamp, formatting a unique reference of 24 characters.
