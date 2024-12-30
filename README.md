# Selfmail

Selfmail is a self-hosted email service. This is the offical repository for the project. It's including the backend, frontend, auth and more. You can find the developer documentation [here](https://selfmail.dev/).

## Environment Variables

- `DATABASE_URL` - The URL of the database. Needed in the `packages/database` package.
- `BETTER_AUTH_SECRET` - The secret for the auth server. Needed in the `packages/auth` package.
- `BETTER_AUTH_URL` - The base URL of the auth server. Needed in the `packages/auth` package.

## Packages

- `database` - The database package. It's using Prisma as an ORM.
- `auth` - The auth package. It's using BetterAuth as an auth server.
- `tailwind` - The tailwind package. It's using TailwindCSS as a CSS framework.

## Apps

- `www` - The frontend package. It's using Next.js as a framework.
- `docs` - The documentation package. It's using fumadocs.

