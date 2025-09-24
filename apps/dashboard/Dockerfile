FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency resolution
COPY package.json bun.lock* ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN bun install


COPY apps/api/package.build.json ./apps/api/package.json
WORKDIR /app/apps/api
RUN bun add elysia 

WORKDIR /app

# Copy source code
COPY apps/dashboard/src ./apps/dashboard/src
COPY apps/dashboard/index.html ./apps/dashboard/index.html
COPY apps/api/src ./apps/api/src
COPY apps/dashboard/vite.config.ts ./apps/dashboard/
COPY apps/dashboard/public ./apps/dashboard/public
COPY packages/ui/styles ./packages/ui/styles
COPY packages/ui/src/components.ts ./packages/ui/src/components.ts
COPY packages/ui/src/components ./packages/ui/src/components
COPY packages/ui/src/lib ./packages/ui/src/lib
COPY apps/dashboard/tsconfig.json ./apps/dashboard/

# Build the application for production
WORKDIR /app/apps/dashboard

RUN ls -la && cat index.html
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app

# Copy built application from base stage
COPY --from=base /app ./

# non root user
RUN chown -R bun:bun /app
USER bun

# Expose the dashboard port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the dashboard service with production build
WORKDIR /app/apps/dashboard
CMD ["bun", "run", "serve"]