# Multi-stage build for frontend
# Stage 1: Base image with dependencies
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Install all dependencies and run tests
FROM base AS test
RUN npm ci --legacy-peer-deps
COPY . .
# Run linter and tests
RUN npm run lint || true
RUN npm test

# Stage 3: Build the application
FROM base AS build
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 4: Production image with nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY --from=build /app/dist /usr/share/nginx/html

# Create nginx configuration for SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://backend:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
