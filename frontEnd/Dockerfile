# Multi-stage build for frontend
# Stage 1: Base image with dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Install all dependencies for testing
FROM base AS test
RUN npm ci --legacy-peer-deps
COPY . .
# Set command to run tests (will be overridden by docker-compose)
CMD ["npm", "run", "test:ci"]


# CMD ["nginx", "-g", "daemon off;"]
