# Authentication System

This authentication system uses Bun's built-in password hashing and provides a complete authentication solution for your tRPC server.

## Features

- **User Registration**: Create new user accounts with email and password
- **User Login**: Authenticate users with email and password
- **Session Management**: Secure session handling with HTTP-only cookies
- **Password Hashing**: Uses Bun's built-in bcrypt implementation
- **Protected Routes**: Middleware for protecting tRPC procedures
- **Type Safety**: Full TypeScript support

## Architecture

### Files Overview

- `src/lib/auth.ts` - Core authentication utilities and validation schemas
- `src/lib/auth-service.ts` - Authentication service functions (register, login, etc.)
- `src/lib/auth-middleware.ts` - HTTP middleware helpers for cookies
- `src/lib/context.ts` - tRPC context with authentication
- `src/lib/trpc.ts` - tRPC setup with protected procedures
- `src/routers/auth.ts` - Authentication tRPC router
- `src/db/schema.ts` - Database schema for users and sessions
- `migrations/001_create_auth_tables.sql` - Database migration

### Database Schema

#### Users Table
- `id` (UUID, Primary Key)
- `email` (Text, Unique)
- `name` (Text)
- `password_hash` (Text)
- `email_verified` (Boolean)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### Sessions Table
- `id` (Text, Primary Key) - Session token
- `user_id` (UUID, Foreign Key)
- `expires_at` (Timestamp)
- `created_at` (Timestamp)

## Usage

### Setting up the Database

1. Run the migration to create the required tables:
```sql
-- Run the migration in migrations/001_create_auth_tables.sql
```

2. Or use Drizzle to generate and push the schema:
```bash
bun run db:generate
bun run db:push
```

### Using the Authentication Router

The authentication router provides the following endpoints:

#### Register
```typescript
trpc.auth.register.mutate({
  email: "user@example.com",
  password: "securepassword123",
  name: "John Doe"
})
```

#### Login
```typescript
const result = await trpc.auth.login.mutate({
  email: "user@example.com",
  password: "securepassword123"
})
// Returns: { success: true, user: PublicUser, sessionToken: string }
```

#### Get Current User
```typescript
const user = await trpc.auth.me.query()
// Only works if user is authenticated
```

#### Check Authentication Status
```typescript
const status = await trpc.auth.isAuthenticated.query()
// Returns: { isAuthenticated: boolean, user: PublicUser | null }
```

#### Logout
```typescript
await trpc.auth.logout.mutate()
// Only works if user is authenticated
```

### Using Protected Procedures

```typescript
import { protectedProcedure } from "../lib/trpc";

export const someRouter = router({
  protectedEndpoint: protectedProcedure
    .query(({ ctx }) => {
      // ctx.user is guaranteed to exist and be typed as PublicUser
      return {
        message: `Hello ${ctx.user.name}!`,
        userId: ctx.user.id
      };
    }),
});
```

### Setting Session Cookies

To properly handle session cookies, you'll need to integrate with your Hono server. Here's an example:

```typescript
// In your server setup
import { setSessionCookie, clearSessionCookie } from "./lib/auth-middleware";

// After successful login
app.post('/api/login', async (c) => {
  // ... login logic ...
  const { sessionToken } = await loginUser(loginData);
  
  setSessionCookie(c, sessionToken);
  
  return c.json({ success: true });
});

// After logout
app.post('/api/logout', async (c) => {
  // ... logout logic ...
  clearSessionCookie(c);
  
  return c.json({ success: true });
});
```

## Security Features

### Password Hashing
- Uses Bun's built-in bcrypt implementation
- Cost factor of 12 for strong security
- Automatic salt generation

### Session Management
- HTTP-only cookies (cannot be accessed via JavaScript)
- Secure flag in production
- SameSite protection
- 7-day expiration (configurable)
- Automatic cleanup of expired sessions

### Input Validation
- Zod schemas for all inputs
- Email validation
- Password minimum length requirements
- Proper error handling

## Configuration

You can modify the session configuration in `src/lib/auth.ts`:

```typescript
export const SESSION_CONFIG = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    cookieName: "session-token",
    cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: "/",
    },
};
```

## Error Handling

The system includes proper error handling with custom error types:

- `AuthError` - Custom authentication errors
- Proper tRPC error codes (UNAUTHORIZED, CONFLICT, etc.)
- User-friendly error messages

## Type Safety

All functions are fully typed with TypeScript:

- `PublicUser` - User without password hash
- `RegisterInput` / `LoginInput` - Validated input types
- `Session` - Session data type
- `Context` - tRPC context with user information

## Next Steps

1. Set up your database and run the migration
2. Configure your environment variables (DATABASE_URL)
3. Integrate session cookie handling in your Hono server
4. Add email verification if needed
5. Implement password reset functionality
6. Add rate limiting for auth endpoints
