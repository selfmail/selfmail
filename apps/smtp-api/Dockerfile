# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency resolution
COPY package.json bun.lock* ./
COPY apps/smtp-api/package.json ./apps/smtp-api/
COPY packages/database/package.json ./packages/database/
COPY packages/services/package.json ./packages/services/

# Install dependencies
RUN bun install

# Copy source code
COPY apps/smtp-api/src ./apps/smtp-api/src
COPY apps/smtp-api/tsconfig.json ./apps/smtp-api/
COPY packages/database/src ./packages/database/src
COPY packages/database/tsconfig.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma
COPY packages/services/src ./packages/services/src
COPY packages/services/tsconfig.json ./packages/services/

# Install OpenSSL for certificate generation, in order to run Prisma generate
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app/packages/database
RUN bun run generate

WORKDIR /app/apps/smtp-api

RUN bun run build

# Production stage
FROM oven/bun:1-slim AS production

# Install OpenSSL and curl in production stage for Prisma runtime and health checks
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built application from base stage
COPY --from=base /app ./

RUN chown -R bun:bun /app
USER bun

# Expose the SMTP API port
EXPOSE 4001

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4001/health || exit 1

WORKDIR /app/apps/smtp-api

# Start the SMTP API service
CMD ["./app"]
