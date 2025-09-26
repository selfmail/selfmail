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

WORKDIR /app

# Install ClamAV dependencies for virus scanning
RUN apt-get update && apt-get install -y \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Copy built application from base stage
COPY --from=base /app ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bun

# Change ownership of the app directory
RUN chown -R bun:nodejs /app
USER bun

# Expose the SMTP API port
EXPOSE 4001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4001
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4001/health || exit 1

# Start the SMTP API service
CMD ["bun", "run", "apps/smtp-api/src/index.ts"]
