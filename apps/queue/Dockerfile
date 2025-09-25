# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package.json bun.lock* ./
COPY apps/queue/package.json ./apps/queue/
COPY packages/services/package.json ./packages/services/
COPY packages/database/package.json ./packages/database/

# Install dependencies
RUN bun install

# Copy source code
COPY apps/queue/src ./apps/queue/src
COPY apps/queue/tsconfig.json ./apps/queue/
COPY packages/services/src ./packages/services/src
COPY packages/services/tsconfig.json ./packages/services/
COPY packages/database/src ./packages/database/src
COPY packages/database/tsconfig.json ./packages/database/

# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app


# Copy built application from base stage
COPY --from=base /app ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs

# Change ownership of the app directory
RUN chown -R bun:nodejs /app
USER bun


# Set environment variables
ENV NODE_ENV=production
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

RUN bun build apps/queue/src/index.ts --outfile=app --target=bun --compile

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version || exit 1

# Start the application
CMD ["./app"]
