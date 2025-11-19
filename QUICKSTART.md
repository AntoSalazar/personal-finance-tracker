# Quick Setup Guide

## 🚀 Getting Started

### 1. Start the Application

```bash
# Start all services (PostgreSQL + App)
docker compose up -d --build

# View logs
docker compose logs -f app
```

The app will be available at **http://localhost:3000**

### 2. Run Database Migrations (First Time Only)

```bash
# Apply migrations to create database tables
docker compose exec app npx prisma migrate deploy

# Or if running locally without Docker:
npm run db:migrate
```

### 3. Access the Application

1. Open http://localhost:3000
2. Click "Sign up" to create an account
3. Start managing your finances!

## 🔧 Common Commands

```bash
# View app logs
docker compose logs -f app

# View database logs
docker compose logs -f postgres

# Restart the app (after code changes)
docker compose restart app

# Stop everything
docker compose down

# Stop and remove all data
docker compose down -v
```

## 📊 Database Management

```bash
# Open Prisma Studio (database GUI)
docker compose exec app npx prisma studio
# Then visit http://localhost:5555

# Create a new migration
docker compose exec app npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
docker compose exec app npx prisma migrate reset
```

## 🐛 Troubleshooting

### "Table does not exist" errors
```bash
# Run migrations
docker compose exec app npx prisma migrate deploy
```

### Port already in use
```bash
# Stop all containers
docker compose down

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Hot reload not working
```bash
# Restart the app container
docker compose restart app
```

### Database connection issues
```bash
# Check if PostgreSQL is running
docker compose ps

# Restart PostgreSQL
docker compose restart postgres
```

## 📝 Environment Variables

Make sure your `.env` file has these variables:

```env
DATABASE_URL="postgresql://financeuser:financepass@localhost:5432/financedb"
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
COINMARKETCAP_API_KEY="your-api-key-here"
```

## ✅ Verify Everything Works

1. **App is running**: Visit http://localhost:3000
2. **Database is connected**: Try signing up for an account
3. **Hot reload works**: Edit a file in `src/` and see changes automatically

For more details, see [DEVELOPMENT.md](./DEVELOPMENT.md)
