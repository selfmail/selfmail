# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency resolution
COPY package.json bun.lock* ./
COPY apps/payments/package.json ./apps/payments/
COPY packages/database/package.json ./packages/database/
COPY packages/services/package.json ./packages/services/

# Install dependencies
RUN bun install

# Copy source code
COPY apps/payments/src ./apps/payments/src
COPY apps/payments/tsconfig.json ./apps/payments/
COPY packages/database/src ./packages/database/src
COPY packages/database/tsconfig.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma
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

# Set environment variables
ENV NODE_ENV=production
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version || exit 1

# Start the payment worker
CMD ["bun", "run", "apps/payments/src/queue/index.ts"]
