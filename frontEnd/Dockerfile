# Multi-stage build for frontend
# Stage 1: Base image with dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Stage 2: Install all dependencies for testing
FROM base AS test
COPY . .
# Set command to run tests (will be overridden by docker-compose)
CMD ["npm", "run", "test:ci"]

# Stage 3: Development with hot-reloading (source code mounted as volume)
FROM base AS development
# Source code will be mounted as volumes
# Vite dev server runs on port 5173 by default
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
