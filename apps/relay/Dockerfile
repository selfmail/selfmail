# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency resolution
COPY package.json bun.lock* ./
COPY apps/relay/package.json ./apps/relay/
COPY packages/services/package.json ./packages/services/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY apps/relay/src ./apps/relay/src
COPY apps/relay/tsconfig.json ./apps/relay/
COPY packages/services/src ./packages/services/src
COPY packages/services/tsconfig.json ./packages/services/

# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app

# Copy built application from base stage
COPY --from=base /app ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bun

# Change ownership of the app directory
RUN chown -R bun:nodejs /app
USER bun

# Expose the relay API port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the relay service
CMD ["bun", "run", "apps/relay/src/main.ts"]
