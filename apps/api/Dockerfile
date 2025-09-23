# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency resolution
COPY package.json bun.lock* ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/services/package.json ./packages/services/
COPY packages/transactional/package.json ./packages/transactional/
COPY apps/payments/package.json ./apps/payments/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/
COPY packages/database/src ./packages/database/src
COPY packages/database/tsconfig.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma
COPY packages/services/src ./packages/services/src
COPY packages/services/tsconfig.json ./packages/services/
COPY packages/transactional ./packages/transactional/
COPY apps/payments/src ./apps/payments/src
COPY apps/payments/tsconfig.json ./apps/payments/

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

# Expose the API port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/v1/health || exit 1

# Start the application
CMD ["bun", "run", "apps/api/src/index.ts"]
