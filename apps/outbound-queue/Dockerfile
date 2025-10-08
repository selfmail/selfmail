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
COPY keys ./keys
COPY packages/database/prisma ./packages/database/prisma
COPY packages/database/tsconfig.json ./packages/database/

# Install OpenSSL for certificate generation, in order to run Prisma generate
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app/packages/database
RUN bun run generate

# Build the application
WORKDIR /app/apps/queue
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS production

# Install OpenSSL and curl in production stage for Prisma runtime and health checks
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app


# Copy built application from base stage
COPY --from=base /app ./

# Change ownership of the app directory
RUN chown -R bun:bun /app
USER bun

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version || exit 1

# Start the application
WORKDIR /app/apps/queue
CMD ["./app"]
