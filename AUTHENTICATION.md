# Authentication System with Unkey Rate Limiting

This document describes the comprehensive authentication system implemented across the selfmail application with Unkey rate limiting integration.

## Overview

The authentication system provides:
- **Session-based authentication** with HTTP-only cookies
- **Unkey rate limiting** for API protection
- **Route protection** in the dashboard
- **Automatic redirects** for unauthenticated users
- **Secure password hashing** with Bun's built-in argon2id

## Architecture

### API Layer (`apps/api/`)

#### Authentication Middleware (`src/lib/auth-middleware.ts`)
- **Session Authentication**: Validates session tokens from cookies
- **Rate Limiting**: Multiple rate limit configurations for different endpoints
- **User Context**: Extracts user information from database

```typescript
// Session-based auth
const authUser = await sessionAuthMiddleware(headers);

// Rate limiting
const rateLimit = await rateLimitMiddleware(clientIp, "auth");
```

#### Authentication Service (`src/web/authentication/`)
- **Login/Register**: Handles user authentication with rate limiting
- **Session Management**: Creates and manages session tokens
- **Logout**: Clears sessions and cookies

Key endpoints:
- `POST /v1/web/authentication/login`
- `POST /v1/web/authentication/register` 
- `POST /v1/web/authentication/logout`
- `GET /v1/web/authentication/me`

#### Dashboard Endpoints (`src/web/dashboard/`)
- **Protected Routes**: All dashboard endpoints require authentication
- **Rate Limited**: Dashboard API calls are rate limited
- **User-scoped Data**: Only returns data accessible to the authenticated user

### Dashboard Layer (`apps/dashboard/`)

#### Authentication Provider (`src/lib/auth.tsx`)
- **React Context**: Manages authentication state across the app
- **Auto-login Check**: Validates existing sessions on app load
- **API Integration**: Connects to backend authentication endpoints

```tsx
const { user, isAuthenticated, login, logout } = useAuth();
```

#### Route Protection
All protected routes automatically redirect unauthenticated users:

```tsx
// Routes with auth protection:
// - /second-inbox
// - /third-inbox  
// - /mail/$mailId

if (!isAuthenticated) {
    window.location.href = "/auth/login";
    return null;
}
```

#### Client Configuration (`src/lib/client.ts`)
- **Cookie-based Auth**: Automatically includes session cookies
- **Same-origin Requests**: Leverages browser cookie handling

```typescript
const client = treaty<App>("http://localhost:3000", {
    fetch: {
        credentials: 'include', // Include cookies in requests
    },
});
```

## Rate Limiting Configuration

### Unkey Integration
Different rate limits for different operations:

- **Authentication**: 10 requests per minute per IP
- **Dashboard API**: 100 requests per minute per IP  
- **General API**: 50 requests per minute per IP (configurable)

### Rate Limit Types
```typescript
// In auth-middleware.ts
const authRateLimit = new Ratelimit({
    rootKey: process.env.UNKEY_ROOT_KEY,
    namespace: "auth-requests", 
    limit: 10,
    duration: "1m",
});

const dashboardRateLimit = new Ratelimit({
    rootKey: process.env.UNKEY_ROOT_KEY,
    namespace: "dashboard-api",
    limit: 100, 
    duration: "1m",
});
```

## Security Features

### Password Security
- **Argon2id Hashing**: Using Bun's built-in password hashing
- **Minimum Length**: 8 character requirement
- **Secure Comparison**: Constant-time password verification

### Session Security
- **HTTP-Only Cookies**: Cannot be accessed via JavaScript
- **Secure Flag**: HTTPS-only in production
- **SameSite Protection**: CSRF protection
- **Session Cleanup**: Automatic cleanup on logout

### Rate Limiting
- **IP-based Limiting**: Prevents brute force attacks
- **Graceful Degradation**: Fallback if Unkey service is down
- **Different Limits**: Appropriate limits for different endpoints

## Environment Variables

Required environment variables:

```bash
# Unkey Configuration
UNKEY_ROOT_KEY=your_unkey_root_key
UNKEY_API_ID=your_unkey_api_id

# Database
DATABASE_URL=your_database_url

# Optional
NODE_ENV=development|production
```

## Usage Examples

### Frontend Authentication

```tsx
// Login
const { login } = useAuth();
await login(email, password);

// Register  
const { register } = useAuth();
await register(email, password, name);

// Logout
const { logout } = useAuth();
await logout();

// Check authentication status
const { isAuthenticated, user, isLoading } = useAuth();
```

### Protected Route Example

```tsx
function ProtectedComponent() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <LoadingSpinner />;
    if (!isAuthenticated) {
        window.location.href = "/auth/login";
        return null;
    }

    return <DashboardContent />;
}
```

### API Integration

```typescript
// Client automatically includes session cookies
const emails = await client.v1.web.dashboard.emails.get({
    query: { limit: 20, page: 1 }
});
```

## Database Schema

The authentication system uses these database tables:

```sql
-- Users table
CREATE TABLE User (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL
);

-- Sessions table  
CREATE TABLE Session (
    token TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id)
);
```

## Error Handling

### Rate Limiting Errors
- **429 Too Many Requests**: When rate limit is exceeded
- **Graceful Fallback**: Service continues if Unkey is unavailable

### Authentication Errors
- **401 Unauthorized**: Invalid credentials or expired session
- **403 Forbidden**: Missing authentication
- **409 Conflict**: User already exists during registration

### Frontend Error Handling
```tsx
try {
    await login(email, password);
} catch (error) {
    // Handle specific error types
    setError(error.message);
}
```

## Development vs Production

### Development
- **Relaxed CORS**: Allows localhost origins
- **Debug Logging**: Detailed authentication logs
- **Non-secure Cookies**: Works over HTTP

### Production  
- **Strict CORS**: Only allows configured origins
- **Secure Cookies**: HTTPS-only with secure flags
- **Rate Limiting**: Full Unkey protection enabled

## Troubleshooting

### Common Issues

1. **"Authentication required" errors**
   - Check if session cookie is being sent
   - Verify API endpoints are accessible
   - Check network tab for CORS issues

2. **Rate limiting issues**
   - Verify UNKEY_ROOT_KEY is set correctly
   - Check Unkey dashboard for API quotas
   - Monitor rate limit headers in responses

3. **Login redirects not working**
   - Ensure useAuth hook is used within AuthProvider
   - Check that routes are properly wrapped
   - Verify client credentials configuration

### Debug Tools

```typescript
// Check auth status
console.log(await client.v1.web.authentication.me.get());

// Check rate limit status
// (Rate limit info included in response headers)
```

## Future Enhancements

Planned improvements:
- **Email verification** for new accounts
- **Password reset** functionality  
- **Multi-factor authentication** support
- **Session management** dashboard
- **Advanced rate limiting** with user-based limits
- **OAuth integration** (Google, GitHub, etc.)

## Security Considerations

- **Regular Security Audits**: Review authentication flows
- **Rate Limit Monitoring**: Monitor for abuse patterns
- **Session Cleanup**: Implement session expiration
- **HTTPS Enforcement**: Always use HTTPS in production
- **Environment Security**: Secure environment variable storage
