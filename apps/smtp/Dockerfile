# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency resolution
COPY package.json bun.lock* ./
COPY apps/smtp/package.json ./apps/smtp/
COPY packages/services/package.json ./packages/services/
COPY packages/database/package.json ./packages/database/

# Install dependencies
RUN bun install

# Copy source code
COPY apps/smtp/src ./apps/smtp/src
COPY apps/smtp/tsconfig.json ./apps/smtp/
COPY apps/smtp/global.d.ts ./apps/smtp/
COPY packages/services/src ./packages/services/src
COPY packages/services/tsconfig.json ./packages/services/
COPY packages/database/src ./packages/database/src
COPY packages/database/tsconfig.json ./packages/database/
COPY packages/database/prisma ./packages/database/prisma

# Install OpenSSL for certificate generation, in order to run Prisma generate
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app/packages/database
RUN bun run generate

# Build the application
WORKDIR /app/apps/smtp
RUN bun run build:docker

# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app

# Copy built application from base stage
COPY --from=base /app ./

RUN chown -R bun:bun /app
USER bun

# Expose SMTP ports
EXPOSE 25 587

# Set environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:25 --max-time 5 || exit 1

# Start the SMTP server
WORKDIR /app/apps/smtp
CMD ["./app"]
