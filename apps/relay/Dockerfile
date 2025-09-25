# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency resolution
COPY package.json bun.lock* ./
COPY apps/relay/package.json ./apps/relay/
COPY packages/services/package.json ./packages/services/

# Install dependencies
RUN bun install

# Copy source code
COPY apps/relay/src ./apps/relay/src
COPY apps/relay/tsconfig.json ./apps/relay/
COPY packages/services/src ./packages/services/src
COPY packages/services/tsconfig.json ./packages/services/

WORKDIR /app/apps/relay
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS production

WORKDIR /app

COPY --from=base /app ./

RUN chown -R bun:bun /app
USER bun

# Expose the relay API port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the relay service
CMD ["bun", "run", "apps/relay/src/main.ts"]
