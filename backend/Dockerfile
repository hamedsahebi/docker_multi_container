# Multi-stage build for TypeScript backend
# Stage 1: Base image with dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Stage 2: Development dependencies for testing
FROM base AS test
COPY . .
# Run tests (TypeScript compilation happens via ts-jest)
CMD ["npm", "test"]

# Stage 3: Development with hot-reloading (source code mounted as volume)
FROM base AS development
# Source code will be mounted as volumes
CMD ["npm", "run", "dev"]

