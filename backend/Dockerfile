# Multi-stage build for backend
# Stage 1: Base image with dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Development dependencies for testing
FROM base AS test
RUN npm ci
COPY . .
# Run tests
RUN npm test

# Stage 3: Production dependencies
FROM base AS production-deps
RUN npm ci --only=production

# Stage 4: Production image
FROM node:18-alpine AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies
COPY --from=production-deps /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
