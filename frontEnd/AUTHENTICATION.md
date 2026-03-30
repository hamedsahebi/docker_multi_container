# Frontend Authentication Documentation

## Overview

The frontend authentication system integrates with the backend Google OAuth 2.0 authentication. It provides a complete user authentication flow with protected routes, login/logout functionality, and session management.

## Architecture

### Components

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Global authentication state management
   - Provides user data, authentication status, and loading states
   - Handles login/logout operations
   - Automatically checks authentication on mount
   - Handles OAuth callback parameters

2. **AuthService** (`src/services/authService.ts`)
   - API communication layer for authentication endpoints
   - Handles `/auth/me`, `/auth/logout`, `/auth/status`, `/auth/refresh`
   - Automatically includes credentials (cookies) in all requests

3. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
   - Wrapper component for routes requiring authentication
   - Shows loading spinner during auth check
   - Redirects to landing page if not authenticated

4. **LoginPage** (`src/pages/LoginPage.tsx`)
   - Google OAuth login interface
   - Redirects authenticated users to dashboard
   - Shows loading state during authentication check

5. **Layout** (`src/components/Layout.tsx`)
   - Navigation bar with user profile dropdown
   - Logout functionality
   - User avatar/initial display

## Authentication Flow

### Login Flow

1. User clicks "Sign In" button on landing page or visits `/login`
2. User clicks "Sign in with Google" on login page
3. Frontend redirects to backend OAuth endpoint: `${API_URL}/auth/google`
4. Backend redirects to Google for authentication
5. User authenticates with Google
6. Google redirects back to backend callback: `/auth/google/callback`
7. Backend creates/updates user, generates JWT tokens, sets httpOnly cookies
8. Backend redirects to frontend: `http://localhost:3065/dashboard?auth=success`
9. Frontend AuthContext detects `?auth=success` parameter
10. Frontend fetches user data from `/auth/me` endpoint
11. Frontend sets authenticated state and redirects to `/realtime`

### Logout Flow

1. User clicks "Sign Out" from user menu
2. Frontend calls `authService.logout()`
3. Backend clears JWT cookies
4. Frontend clears user state
5. Frontend redirects to landing page

### Session Management

- JWT access tokens stored in httpOnly cookies (15 minute expiry)
- JWT refresh tokens stored in httpOnly cookies (7 day expiry)
- Automatic authentication check on app load
- Protected routes verify authentication before rendering
- API requests automatically include credentials for authentication

## Configuration

### Environment Variables

#### Development (`.env.development`)
```env
VITE_API_URL=http://localhost:3000
```

#### Production (`.env.production`)
```env
# Empty string uses relative URLs (nginx proxy)
VITE_API_URL=
```

### Route Configuration

```tsx
<AuthProvider>
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/realtime" /></ProtectedRoute>} />
        <Route path="/historical" element={<ProtectedRoute><HistoricalDashboard /></ProtectedRoute>} />
        <Route path="/realtime" element={<ProtectedRoute><RealTimeDashboard /></ProtectedRoute>} />
      </Route>
    </Routes>
  </BrowserRouter>
</AuthProvider>
```

## Usage

### Using the Auth Hook

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <button onClick={login}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Making Authenticated API Calls

All API calls should include `credentials: 'include'` to send authentication cookies:

```tsx
const response = await fetch(`${API_URL}/api/metrics/temperature`, {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Creating Protected Components

```tsx
import { ProtectedRoute } from '../components/ProtectedRoute';

<Route 
  path="/my-protected-page" 
  element={
    <ProtectedRoute>
      <MyProtectedComponent />
    </ProtectedRoute>
  } 
/>
```

## User Interface

### Landing Page
- "Sign In" button in top-right corner (if not authenticated)
- "Go to Dashboard" button in top-right corner (if authenticated)
- Access to historical and real-time dashboards links

### Login Page
- Google OAuth button with Google logo
- Features showcase (4 sensors, 24/7 monitoring, real-time analytics)
- Automatic redirect to dashboard if already authenticated

### Navigation Bar (Layout)
- Logo and app title
- Navigation tabs (Historical, Real-Time)
- User profile dropdown with:
  - User avatar/initials
  - User name and email
  - Sign Out button

## Testing

### Running Tests

```bash
npm test
```

### Test Coverage

- **AuthContext tests**: Authentication state management, loading states, error handling
- **AuthService tests**: API calls, error handling, credential inclusion
- **Component tests**: Login page, protected routes, user menu

### Test Files

- `src/contexts/__tests__/AuthContext.test.tsx`
- `src/services/__tests__/authService.test.ts`

## Security Features

1. **HttpOnly Cookies**: Tokens stored in httpOnly cookies prevent XSS attacks
2. **SameSite Protection**: Cookies use SameSite attribute to prevent CSRF
3. **Secure Flag**: Cookies marked as secure in production (HTTPS only)
4. **CORS with Credentials**: Backend validates origin for credential requests
5. **Token Expiry**: Short-lived access tokens (15 min), longer refresh tokens (7 days)
6. **Protected Routes**: Client-side route protection prevents unauthorized access
7. **API Authentication**: All API requests verified on backend with JWT

## Troubleshooting

### Authentication Not Working

1. Check browser console for errors
2. Verify `VITE_API_URL` is set correctly in environment files
3. Check that cookies are being set (Browser DevTools → Application → Cookies)
4. Verify backend is running and accessible
5. Check Google OAuth credentials in backend `.env` file

### Infinite Redirect Loop

- Clear browser cookies and cache
- Check that OAuth callback URL matches backend configuration
- Verify `FRONTEND_URL` in backend `.env` matches actual frontend URL

### "Not Authenticated" Errors

1. Check that `credentials: 'include'` is set in all API calls
2. Verify JWT tokens exist in cookies
3. Check token expiry (access tokens expire after 15 minutes)
4. Try refreshing the page to trigger token refresh
5. Log out and log back in to get fresh tokens

### User Data Not Loading

1. Verify `/auth/me` endpoint is accessible
2. Check browser network tab for failed requests
3. Verify backend is returning correct user data format
4. Check for CORS errors in console

## Development Workflow

### Adding New Protected Routes

1. Create your component
2. Import `ProtectedRoute` in `App.tsx`
3. Wrap route element with `<ProtectedRoute>`
4. Test authentication protection

Example:
```tsx
<Route 
  path="/new-page" 
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  } 
/>
```

### Accessing User Data in Components

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  
  return <div>{user?.name}</div>;
}
```

## API Endpoints

All authentication endpoints are proxied through nginx in production:

- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - OAuth callback handler
- `POST /auth/logout` - Logout and clear cookies
- `GET /auth/me` - Get current user data
- `POST /auth/refresh` - Refresh access token
- `GET /auth/status` - Check authentication status

## Docker Configuration

### Development
```bash
# Frontend runs on port 5173
npm run dev
```

### Production
```bash
# Build with authentication support
docker-compose up --build

# Frontend served by nginx on port 3065
# API requests proxied to backend through nginx
```

### Nginx Proxy Configuration

The production nginx configuration automatically proxies authentication requests:

```nginx
location /auth {
    proxy_pass http://backend:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
}
```

## Future Enhancements

1. **Remember Me**: Add option for longer session duration
2. **Profile Page**: Allow users to view/edit their profile
3. **Role-Based Access**: Add user roles and permissions
4. **Session Timeout Warning**: Warn users before token expiry
5. **Multi-Factor Authentication**: Add 2FA support
6. **Social Login Options**: Add more OAuth providers
7. **Password Recovery**: Add email-based account recovery
8. **User Preferences**: Store user settings in database

## References

- [Backend Authentication Documentation](../backend/AUTH_README.md)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
