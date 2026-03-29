# Auth

## Implemented

- Email registration with hashed `EmailVerification.token` storage
- Magic-link sign in with hashed token storage and browser-bound temp session cookies
- Hashed `Session.sessionToken` storage
- Google OAuth start and callback routes
- Fail-closed auth rate limiting when Redis checks fail
- Origin checks for state-changing requests in `src/server.ts`
- Logout server action via `logoutFn`
- No `console.log` calls in auth server modules

## Tests

Run the auth test suite with Bun:

```bash
bun run test
```

The current automated coverage verifies:

- origin protection for state-changing requests
- session creation and lookup using hashed database tokens
- register flow storing hashed verification/browser tokens
- login flow storing hashed magic-link/browser tokens
- fail-closed behavior for register and login rate limiting

## Still Missing

| # | Item | Severity |
|---|------|----------|
| 1 | Wire up actual email delivery for verification and magic-link emails | Critical |
| 2 | Implement passkey sign-in instead of showing an inactive button on `/login` | High |
| 3 | Implement real OTP and backup-code verification; the current OTP handlers are stubs and the pages are UI-only | High |
| 4 | Replace the enterprise auth dialog placeholder with a real enterprise SSO flow or remove it | Medium |
| 5 | Add `/terms` and `/privacy` routes inside the auth app or update the register page links to point at the existing external pages | Medium |

## Notes

- `Footer` already links to the hosted legal pages on `selfmail.app`, but the register page currently links to local `/terms` and `/privacy` routes that do not exist in this app.
- CSRF-style protection is currently origin-based rather than token-based.
