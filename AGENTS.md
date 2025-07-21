# AGENTS.md - Development Guidelines

## Build/Lint/Test Commands

- **Lint**: `bun check` (runs Biome check --write on all files)
- **Build**: `turbo build` (builds all workspace apps)
- **Type check**: `turbo check-types` (runs TypeScript type checking)
- **Test**: `bun test` for SMTP (uses Bun test runner), `vitest run` for dashboard
- **Dev**: `turbo dev` (starts all dev servers) or `turbo -F [app] dev` for specific app

## Code Style Guidelines

- **Formatter**: Biome with tab indentation, double quotes for JavaScript/TypeScript
- **Imports**: Auto-organize imports enabled, use @/ path aliases where configured
- **Types**: Strict TypeScript with `noUnusedLocals`, `noUnusedParameters` enabled
- **Naming**: Use camelCase for variables/functions, PascalCase for components/types
- **Error handling**: Use Zod for validation, proper error types with throw/catch patterns

## Project Structure

- Turborepo monorepo with apps/ (api, dashboard, server, smtp) and packages/ (database)
- Use existing utilities (cn, clsx, cva) for styling in React components
- Follow existing authentication patterns with Unkey and tRPC for API communication
- Database operations use Drizzle ORM with PostgreSQL
