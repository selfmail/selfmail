# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency resolution
COPY package.json bun.lock* ./
COPY apps/transactional-queue/package.json ./apps/transactional-queue/
COPY packages/services/package.json ./packages/services/
COPY packages/database/package.json ./packages/database/

# Install dependencies
RUN bun install

# Copy source code
COPY apps/transactional-queue/src ./apps/transactional-queue/src
COPY apps/transactional-queue/tsconfig.json ./apps/transactional-queue/
COPY packages/services/src ./packages/services/src
COPY packages/services/tsconfig.json ./packages/services/
COPY packages/database/src ./packages/database/src
COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/tsconfig.json ./packages/database/

# Install OpenSSL for certificate generation, in order to run Prisma generate
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app/packages/database
RUN bun run generate

WORKDIR /app/apps/transactional-queue

RUN bun run build

# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app

# Copy built application from base stage
COPY --from=base /app ./

RUN chown -R bun:bun /app
USER bun

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version || exit 1

# Start the transactional queue worker
WORKDIR /app/apps/transactional-queue
CMD ["./app"]
