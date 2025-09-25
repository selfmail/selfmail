# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency resolution
COPY package.json bun.lock* ./
COPY apps/payments/package.json ./apps/payments/
COPY packages/database/package.json ./packages/database/
COPY packages/services/package.json ./packages/services/
COPY packages/transactional/package.json ./packages/transactional/

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
COPY packages/transactional/emails ./packages/transactional/emails
COPY packages/transactional/tsconfig.json ./packages/transactional/
COPY packages/transactional/index.tsx ./packages/transactional/

# Install OpenSSL for certificate generation, in order to run Prisma generate
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app/packages/database
RUN bun run generate

WORKDIR /app/apps/payments
RUN bun run build


# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app


# Install ClamAV for virus scanning
RUN apt-get update && apt-get install -y \
  clamav \
  && rm -rf /var/lib/apt/lists/*

# Copy built application from base stage
COPY --from=base /app ./

# Create non-root user
RUN chown -R bun:bun /app
USER bun

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version || exit 1

WORKDIR /app/apps/payments

# Start the payment worker
CMD ["./app"]
