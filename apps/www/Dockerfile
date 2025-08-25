FROM oven/bun:latest

WORKDIR /app

# Copy package files first for better caching
COPY package.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 1234
# Start the server with the serve script
CMD ["bun", "run", "start"]
