# Multi-stage production Dockerfile for Backend
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY ../shared /shared
RUN npm ci --only=production

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Security: Non-root user
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["node", "src/server.js"]
