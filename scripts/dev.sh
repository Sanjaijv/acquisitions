#!/bin/bash

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"
echo "📦 Building and starting development containers..."
echo "   - Neon Local proxy will create an ephemeral database branch"
echo "   - Application will run with hot reload enabled"
echo ""

# Start neon-local first
docker compose -f docker-compose.dev.yml up -d neon-local

# Wait for PostgreSQL to actually be ready
echo "⏳ Waiting for Neon Local to be ready..."
attempt=0
max_attempts=60

until docker compose -f docker-compose.dev.yml exec -T neon-local pg_isready -h localhost -p 5432 > /dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "❌ Timeout waiting for database to be ready"
    exit 1
  fi
  echo "   Attempt $attempt/$max_attempts..."
  sleep 2
done

echo "✅ Neon Local is ready!"

# Run migrations
echo "📜 Applying latest schema with Drizzle..."
docker compose -f docker-compose.dev.yml run --rm app npm run db:migrate

# Start the app
echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:3000"
echo "   Database: postgres://neon:npg@localhost:5432/neondb"
echo ""
echo "📋 Showing logs (Ctrl+C to exit)..."
docker compose -f docker-compose.dev.yml up app