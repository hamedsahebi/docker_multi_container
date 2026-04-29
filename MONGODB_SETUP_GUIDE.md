# MongoDB Database Setup

## 🎯 Quick Start

The application now uses **MongoDB** for storing user authentication data instead of JSON files.

### Development Setup

1. **Create environment file:**
   ```bash
   cp .env.development.example .env.development
   ```

2. **Configure Google OAuth (required for authentication):**
   
   Edit `.env.development` and update:
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   ```

3. **Start all services (MongoDB + Backend + Frontend):**
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - MongoDB: localhost:27017 (for tools like MongoDB Compass)

### What's Included

✅ **MongoDB 7.0** running in Docker container  
✅ **Mongoose ODM** for schema validation and type safety  
✅ **User authentication** with Google OAuth  
✅ **Persistent data storage** in Docker volumes  
✅ **Test database** with MongoDB Memory Server  
✅ **Health checks** to ensure database readiness  
✅ **Automatic backups** possible with volume snapshots  

## 📊 Database Structure

```
sensor_monitoring_dev (Database)
└── users (Collection)
    ├── email (String, unique, indexed)
    ├── name (String)
    ├── googleId (String, unique, indexed)
    ├── picture (String, optional)
    ├── lastLogin (Date)
    ├── createdAt (Date, auto-generated)
    └── updatedAt (Date, auto-generated)
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.env.development.example` | Template for development environment variables |
| `.env.production.example` | Template for production environment variables |
| `.env.test.example` | Template for test environment variables |
| `docker-compose.dev.yml` | Development setup with MongoDB |
| `docker-compose.yml` | Production setup with MongoDB |
| `docker-compose.test.yml` | Test setup with MongoDB |

## 🗄️ MongoDB Services

### Development Environment

```yaml
mongodb:
  image: mongo:7.0
  ports: ["27017:27017"]  # Exposed for MongoDB Compass/CLI tools
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: devpassword123
  volumes:
    - mongodb_data:/data/db  # Persistent storage
```

**Connection String:**
```
mongodb://admin:devpassword123@localhost:27017/sensor_monitoring_dev?authSource=admin
```

### Production Environment

```yaml
mongodb:
  image: mongo:7.0
  # Not exposed to host (internal Docker network only)
  environment:
    MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
    MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
  volumes:
    - mongodb_data:/data/db  # Persistent storage
```

⚠️ **Important:** Set strong passwords in `.env.production`

### Test Environment

Uses **MongoDB Memory Server** (in-memory database) for fast, isolated testing.  
No manual configuration needed.

## 🛠️ Common Tasks

### View Database with MongoDB Compass

1. Download: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://admin:devpassword123@localhost:27017/?authSource=admin`
3. Browse collections and run queries

### View Database with CLI

```bash
# Connect to MongoDB container
docker exec -it mongodb-dev mongosh -u admin -p devpassword123 --authenticationDatabase admin

# Switch to app database
use sensor_monitoring_dev

# View all users
db.users.find().pretty()

# Count users
db.users.countDocuments()

# Find specific user
db.users.findOne({ email: "test@example.com" })

# Exit
exit
```

### Backup Database

```bash
# Create backup
docker exec mongodb-dev mongodump --out=/tmp/backup --authenticationDatabase=admin -u admin -p devpassword123

# Copy backup to host
docker cp mongodb-dev:/tmp/backup ./mongodb-backup-$(date +%Y%m%d)

# Create volume backup
docker run --rm \
  -v docker_multi_container_mongodb_data:/data \
  -v $(pwd):/backup \
  mongo:7.0 \
  tar czf /backup/mongodb-backup-$(date +%Y%m%d).tar.gz /data
```

### Restore Database

```bash
# Restore from mongodump
docker cp ./mongodb-backup mongodb-dev:/tmp/backup
docker exec mongodb-dev mongorestore /tmp/backup --authenticationDatabase=admin -u admin -p devpassword123

# Restore from volume backup
docker run --rm \
  -v docker_multi_container_mongodb_data:/data \
  -v $(pwd):/backup \
  mongo:7.0 \
  tar xzf /backup/mongodb-backup-20260429.tar.gz -C /
```

### Clear All Data (Development)

```bash
# Stop containers
docker-compose -f docker-compose.dev.yml down

# Remove MongoDB volume (destroys all data!)
docker volume rm docker_multi_container_mongodb_data

# Restart
docker-compose -f docker-compose.dev.yml up
```

### Migrate Existing JSON Users

If you have existing user data in `backend/data/users.json`:

```bash
cd backend

# Build the project
npm run build

# Run migration script
node scripts/migrate-users-to-mongodb.js
```

## 🔍 Troubleshooting

### Backend Can't Connect to MongoDB

**Symptoms:** Backend logs show "MongoDB connection failed"

**Solutions:**
1. Check MongoDB is running:
   ```bash
   docker ps | grep mongodb
   ```

2. Check MongoDB health:
   ```bash
   docker logs mongodb-dev
   ```

3. Verify connection string in `.env.development`

4. Ensure backend waits for MongoDB health check (configured in docker-compose)

### MongoDB Container Won't Start

**Symptoms:** Container exits immediately or restarts repeatedly

**Solutions:**
1. Check logs:
   ```bash
   docker logs mongodb-dev
   ```

2. Verify port 27017 isn't already in use:
   ```bash
   netstat -an | grep 27017
   ```

3. Check volume permissions:
   ```bash
   docker volume inspect docker_multi_container_mongodb_data
   ```

### Authentication Failed

**Symptoms:** "Authentication failed" errors

**Solutions:**
1. Verify credentials match in:
   - `docker-compose.dev.yml` (MONGO_INITDB_ROOT_USERNAME/PASSWORD)
   - `.env.development` (MONGODB_URI connection string)

2. Ensure `authSource=admin` is in connection string

3. Try connecting with mongosh to verify credentials

### Data Disappeared After Restart

**Symptoms:** Users are gone after container restart

**Solutions:**
1. Check if you used `docker-compose down -v` (this removes volumes!)
   - Use `docker-compose down` instead (keeps volumes)

2. Verify named volumes are defined:
   ```bash
   docker volume ls | grep mongodb
   ```

3. Check volume mount in container:
   ```bash
   docker inspect mongodb-dev | grep -A 5 Mounts
   ```

### Tests Failing

**Symptoms:** Tests timeout or can't connect to database

**Solutions:**
1. Ensure `mongodb-memory-server` is installed:
   ```bash
   cd backend
   npm list mongodb-memory-server
   ```

2. Clear Jest cache:
   ```bash
   npx jest --clearCache
   ```

3. Increase test timeout in jest.config.js:
   ```javascript
   testTimeout: 30000
   ```

## 📚 Additional Documentation

For detailed information, see:
- [Backend MongoDB Setup Guide](./backend/MONGODB_SETUP.md) - Comprehensive documentation
- [Backend Authentication README](./backend/AUTH_README.md) - OAuth setup guide
- [Development Guide](./DEVELOPMENT.md) - General development info

## 🚀 Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Set strong `MONGO_ROOT_PASSWORD` (min 20 chars, random)
- [ ] Set strong `SESSION_SECRET` (min 32 chars, random)
- [ ] Set strong `JWT_SECRET` (min 32 chars, random)
- [ ] Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for production
- [ ] Update `GOOGLE_CALLBACK_URL` to production domain
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Ensure MongoDB is NOT exposed to internet (no ports in docker-compose.yml)
- [ ] Enable MongoDB authentication (already configured)
- [ ] Set up automated backups
- [ ] Configure log rotation
- [ ] Enable firewall rules
- [ ] Set up monitoring/alerts

### Generate Secure Secrets

```bash
# Generate secure random strings for secrets
openssl rand -base64 32

# Generate multiple secrets
for i in {1..3}; do echo "Secret $i: $(openssl rand -base64 32)"; done
```

### Example Production Configuration

```env
# .env.production

# Strong passwords (CHANGE THESE!)
MONGO_ROOT_PASSWORD=X7k9mP2nQ8fR5vL3tJ6wS1dH4gY0bN9cZ
SESSION_SECRET=aB3dE6fG9hJ2kL5mN8pQ1rS4tU7vW0xY3zA6bC9dE2fG5hJ8kL1mN
JWT_SECRET=pQ9rS2tU5vW8xY1zA4bC7dE0fG3hJ6kL9mN2oP5qR8sT1uV4wX7yZ

# Production OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-1234567890abcdefghij
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

# Production domain
FRONTEND_URL=https://yourdomain.com
```

## 💡 Key Features

### Why MongoDB?

| Feature | JSON Files | MongoDB |
|---------|-----------|---------|
| **Concurrency** | ❌ Race conditions | ✅ ACID transactions |
| **Performance** | ❌ Slow with many users | ✅ Optimized indexes |
| **Querying** | ❌ Load entire file | ✅ Efficient queries |
| **Scalability** | ❌ Limited | ✅ Horizontal scaling |
| **Data Integrity** | ❌ Manual validation | ✅ Schema validation |
| **Relationships** | ❌ Manual management | ✅ Built-in support |
| **Backups** | ❌ Copy files manually | ✅ Built-in tools |
| **Production Ready** | ❌ Not recommended | ✅ Battle-tested |

### Mongoose ODM Benefits

- **Type Safety:** Full TypeScript support
- **Validation:** Automatic schema validation
- **Middleware:** Pre/post hooks for business logic
- **Virtuals:** Computed properties
- **Population:** Automatic relationship handling
- **Indexes:** Optimized query performance

## 🔗 Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Docker MongoDB Image](https://hub.docker.com/_/mongo)

## ❓ Need Help?

1. Check the [troubleshooting section](#-troubleshooting)
2. Review [backend/MONGODB_SETUP.md](./backend/MONGODB_SETUP.md) for details
3. Check Docker container logs: `docker logs mongodb-dev`
4. Verify environment configuration
5. Test MongoDB connection with mongosh or Compass
