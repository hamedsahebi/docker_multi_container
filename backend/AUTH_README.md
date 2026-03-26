# Google OAuth Authentication Implementation

## 🎯 Overview

This backend now includes **Google OAuth 2.0 authentication** with JWT-based session management. All `/api/metrics` endpoints are protected and require authentication.

## 🏗️ Architecture

### Authentication Flow
```
User → Frontend → /auth/google → Google OAuth → /auth/google/callback → JWT Tokens → Protected APIs
```

### Tech Stack
- **Passport.js** with Google OAuth 2.0 Strategy
- **JWT** (JSON Web Tokens) for stateless authentication
- **httpOnly Cookies** for secure token storage
- **JSON File Storage** for user data (MVP - can be replaced with database)

### Token Strategy
- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access tokens
- Both stored in httpOnly cookies (secure, not accessible via JavaScript)

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── passport.ts          # Passport Google OAuth configuration
│   ├── middleware/
│   │   └── auth.ts               # Authentication middleware
│   ├── routes/
│   │   ├── auth.ts               # Authentication endpoints
│   │   └── metrics.ts            # Protected metrics APIs
│   ├── services/
│   │   └── userService.ts        # User CRUD operations
│   ├── utils/
│   │   └── jwt.ts                # JWT token utilities
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   └── app.ts                    # Express app with auth setup
├── data/
│   └── users.json                # User storage (auto-created)
├── __tests__/
│   └── auth.test.ts              # 25 comprehensive auth tests
└── .env.example                  # Environment variables template
```

## 🔐 Authentication Endpoints

### `GET /auth/google`
Initiates Google OAuth flow. Redirects user to Google login.

**Usage:**
```html
<a href="http://localhost:3000/auth/google">Login with Google</a>
```

### `GET /auth/google/callback`
Google OAuth callback endpoint. Sets JWT tokens as httpOnly cookies and redirects to frontend.

**Automatic redirects to:** `${FRONTEND_URL}/dashboard?auth=success`

### `POST /auth/logout`
Clears authentication cookies.

**Request:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  --cookie "accessToken=xxx; refreshToken=yyy"
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### `GET /auth/me`
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "user": {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://lh3.googleusercontent.com/...",
    "createdAt": "2026-03-26T10:30:00.000Z",
    "lastLogin": "2026-03-26T15:45:00.000Z"
  }
}
```

### `POST /auth/refresh`
Refresh expired access token using refresh token.

**Request:**
```bash
curl -X POST http://localhost:3000/auth/refresh \
  --cookie "refreshToken=xxx"
```

**Response:**
```json
{
  "message": "Token refreshed successfully"
}
```
*New tokens set as httpOnly cookies*

### `GET /auth/status`
Lightweight authentication status check.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "authenticated": true,
  "userId": "user_1234567890_abc123",
  "email": "user@example.com"
}
```

## 🛡️ Protected Endpoints

All `/api/metrics/*` endpoints now require authentication:

### `GET /api/metrics`
**Headers:**
```
Authorization: Bearer <accessToken>
```

### `GET /api/metrics/:metricType`
**Headers:**
```
Authorization: Bearer <accessToken>
```

**Without auth:**
```json
{
  "error": "Authentication required. No token provided."
}
```

## 🚀 Setup Instructions

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - Application type: Web application
   - Authorized redirect URIs:
     - Development: `http://localhost:3000/auth/google/callback`
     - Production: `https://yourdomain.com/auth/google/callback`
6. Copy **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:5173

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your-actual-client-id-from-google
GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-google
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Session Secret
SESSION_SECRET=your-super-secret-session-key-min-32-chars
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Run the Backend

```bash
npm install
npm run dev
```

### 4. Test Authentication

```bash
# 1. Open browser and visit
http://localhost:3000/auth/google

# 2. Complete Google login

# 3. You'll be redirected with tokens set as cookies

# 4. Test protected endpoint
curl http://localhost:3000/api/metrics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🧪 Testing

Run all tests (includes 25 authentication tests):
```bash
npm test
```

Run only auth tests:
```bash
npm test -- --testPathPattern=auth.test.ts
```

**Test Coverage:**
- ✅ JWT token generation and verification
- ✅ User service CRUD operations
- ✅ Authentication route responses
- ✅ Protected endpoint access control
- ✅ Token refresh logic
- ✅ Logout functionality

## 🔒 Security Features

1. **httpOnly Cookies**: Tokens not accessible via JavaScript (XSS protection)
2. **Secure Flag**: Cookies only sent over HTTPS in production
3. **SameSite**: CSRF protection
4. **Short-lived Access Tokens**: 15-minute expiry reduces risk
5. **Refresh Token Rotation**: Can implement token rotation for enhanced security
6. **CORS Configuration**: Restricts API access to authorized origins
7. **Environment Secrets**: Sensitive data in environment variables

## 📊 User Data Storage

Users are stored in `backend/data/users.json`:
```json
[
  {
    "id": "user_1711447200000_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "googleId": "1234567890",
    "picture": "https://lh3.googleusercontent.com/...",
    "createdAt": "2026-03-26T10:00:00.000Z",
    "lastLogin": "2026-03-26T15:30:00.000Z"
  }
]
```

**Note:** For production, replace JSON file storage with a proper database (PostgreSQL, MongoDB, etc.).

## 🐳 Docker Configuration

Environment variables are passed through docker-compose:
```yaml
backend:
  environment:
    - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
    - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
    - JWT_SECRET=${JWT_SECRET}
    - FRONTEND_URL=http://localhost:80
```

## 🔄 Frontend Integration

### 1. Login Button
```typescript
const handleLogin = () => {
  window.location.href = 'http://localhost:3000/auth/google';
};
```

### 2. Check Auth Status
```typescript
const checkAuth = async () => {
  const response = await fetch('http://localhost:3000/auth/status', {
    credentials: 'include' // Important: includes cookies
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('User authenticated:', data);
  }
};
```

### 3. Make Authenticated Requests
```typescript
const fetchMetrics = async () => {
  const response = await fetch('http://localhost:3000/api/metrics', {
    credentials: 'include', // Sends httpOnly cookies
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 401) {
    // Redirect to login
    window.location.href = 'http://localhost:3000/auth/google';
  }
  
  return response.json();
};
```

### 4. Logout
```typescript
const handleLogout = async () => {
  await fetch('http://localhost:3000/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  
  // Redirect to landing page
  window.location.href = '/';
};
```

## 🚧 Migration Path

To upgrade from JSON to Database:

1. **Choose Database**: PostgreSQL, MongoDB, MySQL, etc.
2. **Update User Service**: Replace `fs` operations with database queries
3. **Add Connection**: Install database driver and configure connection
4. **Migrate Data**: Transfer existing users from JSON to database
5. **Update Tests**: Mock database instead of file system

Example with PostgreSQL:
```typescript
// services/userService.ts
import { pool } from '../db';

export async function findUserByEmail(email: string) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}
```

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `3000` | Server port |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Frontend URL for CORS |
| `GOOGLE_CLIENT_ID` | Yes | - | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | - | Google OAuth Client Secret |
| `GOOGLE_CALLBACK_URL` | Yes | `http://localhost:3000/auth/google/callback` | OAuth callback URL |
| `JWT_SECRET` | Yes | - | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | - | Refresh token secret (min 32 chars) |
| `SESSION_SECRET` | Yes | - | Express session secret (min 32 chars) |

## 🐛 Troubleshooting

### "OAuth2Strategy requires a clientID option"
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- Check `.env` file is in the backend root directory
- Restart the server after changing `.env`

### "Authentication required" on protected routes
- Check if token is being sent (check Network tab in DevTools)
- Ensure `credentials: 'include'` is set in fetch requests
- Verify token hasn't expired (15 min for access token)
- Try refreshing token with `/auth/refresh`

### "Invalid or expired token"
- Access token may have expired
- Call `/auth/refresh` to get new access token
- If refresh token also expired, user needs to login again

### CORS errors
- Verify `FRONTEND_URL` matches your frontend origin
- Ensure frontend sends requests with `credentials: 'include'`
- Check browser console for specific CORS error

## 📚 Additional Resources

- [Passport.js Documentation](http://www.passportjs.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## 🎉 Summary

✅ Google OAuth 2.0 authentication implemented  
✅ JWT-based session management with refresh tokens  
✅ All metrics endpoints protected  
✅ 25 comprehensive tests (all passing)  
✅ httpOnly cookies for security  
✅ User data persistence  
✅ Production-ready configuration  

**Next Steps:** Implement frontend authentication UI and state management!
