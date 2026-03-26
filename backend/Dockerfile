# Multi-stage build for TypeScript backend
# Stage 1: Base image with dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./

# Stage 2: Development dependencies for testing
FROM base AS test
RUN npm ci
COPY . .
# Run tests (TypeScript compilation happens via ts-jest)
CMD ["npm", "test"]

