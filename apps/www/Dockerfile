# Use the official Bun image
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency resolution
COPY package.json bun.lock* ./
COPY apps/www/package.json ./apps/www/

# Install dependencies
RUN bun install

# Copy source code
COPY apps/www/src ./apps/www/src
COPY apps/www/tsconfig.json ./apps/www/
COPY apps/www/public ./apps/www/public
COPY apps/www/i18n ./apps/www/i18n
COPY apps/www/astro.config.mjs ./apps/www/astro.config.mjs

WORKDIR /app/apps/www
RUN bun run build

# Production stage
FROM node:slim AS production

WORKDIR /app

# Copy built application from base stage
COPY --from=base /app ./

RUN chown -R node /app
USER node

# Set environment variables
ENV NODE_ENV=production

EXPOSE 4321

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl --silent --fail http://localhost:4321 || exit 1

# Start the web server
WORKDIR /app/apps/www
CMD ["node",  "./dist/server/entry.mjs"]
