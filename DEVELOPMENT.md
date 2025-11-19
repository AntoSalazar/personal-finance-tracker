# Development Guide

## Quick Start

### Development with Docker (Recommended)

```bash
# Start all services (PostgreSQL + App with hot reload)
docker compose up -d --build

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

The app will be available at http://localhost:3000 with **hot reload enabled**. Any changes to your code will automatically restart the development server.

### Local Development (Without Docker)

```bash
# 1. Start PostgreSQL only
docker compose up postgres -d

# 2. Install dependencies
npm install

# 3. Generate Prisma Client
npm run db:generate

# 4. Run migrations
npm run db:migrate

# 5. Start dev server
npm run dev
```

## Docker Configuration

### Development vs Production

- **`Dockerfile.dev`** - Development with hot reload (`npm run dev`)
- **`Dockerfile`** - Production build (`npm run build`)

The `docker-compose.yml` uses `Dockerfile.dev` by default for development.

### Hot Reload

Source code is mounted as volumes in docker-compose:
- `./src` - App pages and API routes
- `./lib` - Domain, application, infrastructure, presentation layers
- `./prisma` - Database schema

Changes to these directories will trigger automatic reload.

### Database

PostgreSQL runs in a separate container:
- **Host**: localhost
- **Port**: 5432
- **Database**: financedb
- **User**: financeuser
- **Password**: financepass

## Environment Variables

Copy `.env.example` to `.env` and update:

```bash
DATABASE_URL="postgresql://financeuser:financepass@localhost:5432/financedb"
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
COINMARKETCAP_API_KEY="your-api-key"
```

## Useful Commands

```bash
# Database
npm run db:generate    # Generate Prisma Client
npm run db:migrate     # Create and apply migration
npm run db:studio      # Open Prisma Studio
npm run db:reset       # Reset database (WARNING: deletes all data)

# Docker
docker compose up -d --build    # Build and start
docker compose down             # Stop all services
docker compose logs -f app      # View app logs
docker compose logs -f postgres # View database logs
docker compose restart app      # Restart app only

# Development
npm run dev            # Start dev server (local)
npm run build          # Build for production
npm run lint           # Run ESLint
```

## Troubleshooting

### Port already in use
```bash
# Stop all containers
docker compose down

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection issues
```bash
# Check if PostgreSQL is running
docker compose ps

# Restart PostgreSQL
docker compose restart postgres

# View database logs
docker compose logs postgres
```

### Hot reload not working
```bash
# Rebuild the container
docker compose up -d --build

# Or restart the app
docker compose restart app
```

### Clear everything and start fresh
```bash
# Stop and remove containers, volumes
docker compose down -v

# Rebuild from scratch
docker compose up -d --build
```
