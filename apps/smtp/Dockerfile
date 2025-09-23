# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency resolution
COPY package.json bun.lock* ./
COPY apps/smtp/package.json ./apps/smtp/
COPY packages/services/package.json ./packages/services/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY apps/smtp/src ./apps/smtp/src
COPY apps/smtp/tsconfig.json ./apps/smtp/
COPY apps/smtp/global.d.ts ./apps/smtp/
COPY packages/services/src ./packages/services/src
COPY packages/services/tsconfig.json ./packages/services/

# Build the application
RUN cd apps/smtp && bun run build

# Production stage
FROM node:21-slim AS production

WORKDIR /app

# Install necessary system packages for SMTP operations
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy built application from base stage
COPY --from=base /app/apps/smtp/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages

# Create non-root user but keep sudo capabilities for port binding
RUN addgroup --system --gid 1001 smtp
RUN adduser --system --uid 1001 --gid 1001 smtp

# Change ownership of the app directory
RUN chown -R smtp:smtp /app

# Switch to smtp user
USER smtp

# Expose SMTP ports
EXPOSE 25 587

# Set environment variables
ENV NODE_ENV=production
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:25 --max-time 5 || exit 1

# Start the SMTP server
CMD ["node", "dist/index.js"]
