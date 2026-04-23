# Development Environment Setup

This guide explains how to set up and use the development environment with hot-reloading.

## Quick Start

```bash
# Start the development environment
docker compose -f docker-compose.dev.yml up --build

# Or in detached mode
docker compose -f docker-compose.dev.yml up -d --build
```

## Features

### Hot-Reloading
Both frontend and backend support hot-reloading. Changes to your source code will automatically trigger rebuilds:

- **Backend**: Uses `ts-node-dev` to watch TypeScript files and restart the server on changes
- **Frontend**: Uses Vite's dev server with HMR (Hot Module Replacement) for instant updates

### Volume Mounts
The following directories are mounted from your host to the containers:

**Backend:**
- `./backend/src` → `/app/src` (source code)
- `./backend/data` → `/app/data` (data files)
- Configuration files (tsconfig.json, package.json)

**Frontend:**
- `./frontEnd/src` → `/app/src` (source code)
- `./frontEnd/public` → `/app/public` (static assets)
- Configuration files (vite.config.ts, tailwind.config.cjs, etc.)

### Named Volumes
`node_modules` directories are preserved in named volumes to prevent conflicts with host:
- `backend_node_modules`
- `frontend_node_modules`

## Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Backend Health Check**: http://localhost:3000/health

## Commands

### Start Development Environment
```bash
docker compose -f docker-compose.dev.yml up
```

### Stop Development Environment
```bash
docker compose -f docker-compose.dev.yml down
```

### View Logs
```bash
# All services
docker compose -f docker-compose.dev.yml logs -f

# Specific service
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend
```

### Rebuild Containers
```bash
# Rebuild and start
docker compose -f docker-compose.dev.yml up --build

# Force rebuild without cache
docker compose -f docker-compose.dev.yml build --no-cache
```

### Install New Dependencies

If you add new npm packages, you need to rebuild the containers:

```bash
# Add package to package.json first, then:
docker compose -f docker-compose.dev.yml build backend
docker compose -f docker-compose.dev.yml up backend

# Or for frontend
docker compose -f docker-compose.dev.yml build frontend
docker compose -f docker-compose.dev.yml up frontend
```

### Execute Commands Inside Containers
```bash
# Backend
docker compose -f docker-compose.dev.yml exec backend sh
docker compose -f docker-compose.dev.yml exec backend npm run test

# Frontend
docker compose -f docker-compose.dev.yml exec frontend sh
docker compose -f docker-compose.dev.yml exec frontend npm run test
```

## Environment Variables

Development environment uses default values for secrets (see docker-compose.dev.yml).
For production values, create a `.env` file in the root directory:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5173/auth/google/callback
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
SESSION_SECRET=your_session_secret
```

## Troubleshooting

### Port Already in Use
If you see "port already in use" errors:
```bash
# Stop all running containers
docker compose -f docker-compose.dev.yml down

# Check for processes using the ports
lsof -i :3000
lsof -i :5173
```

### Hot-Reload Not Working
1. Ensure files are being saved on the host
2. Check volume mounts: `docker compose -f docker-compose.dev.yml config`
3. Check container logs for errors
4. Try rebuilding: `docker compose -f docker-compose.dev.yml up --build`

### node_modules Issues
If you encounter dependency issues:
```bash
# Remove named volumes and rebuild
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build
```

### Container Crashes
```bash
# View logs
docker compose -f docker-compose.dev.yml logs backend
docker compose -f docker-compose.dev.yml logs frontend

# Restart specific service
docker compose -f docker-compose.dev.yml restart backend
```

## Development Workflow

1. **Start the environment**: `docker compose -f docker-compose.dev.yml up`
2. **Edit code**: Make changes to files in `./backend/src` or `./frontEnd/src`
3. **See changes**: Changes are automatically detected and applied
4. **Test changes**: Frontend at http://localhost:5173, API at http://localhost:3000
5. **Stop environment**: `Ctrl+C` or `docker compose -f docker-compose.dev.yml down`

## Comparison with Other Environments

| Feature | Development | Test | Production |
|---------|------------|------|------------|
| File | docker-compose.dev.yml | docker-compose.test.yml | docker-compose.yml |
| Hot-reload | ✅ Yes | ❌ No | ❌ No |
| Volume mounts | ✅ Yes | ❌ No | ❌ No |
| Build optimization | ❌ No | ❌ No | ✅ Yes |
| Port exposure | Both exposed | Internal only | Frontend only |
| Default secrets | ✅ Yes | N/A | ❌ No |

## Tips

- Keep the terminal open to see live logs
- Use `docker compose -f docker-compose.dev.yml logs -f` to follow logs in a separate terminal
- Changes to `package.json` require a rebuild
- Changes to Dockerfiles require a rebuild
- Changes to `.ts`, `.tsx`, `.css` files trigger hot-reload automatically
