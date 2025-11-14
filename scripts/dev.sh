#!/bin/bash

# Development startup script for Acquisition App with Neon Local
# This script starts the application in development mode with Neon Local

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    echo "   Please copy .env.development from the template and update with your Neon credentials."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

# Create .neon_local directory if it doesn't exist
mkdir -p .neon_local

# Add .neon_local to .gitignore if not already present
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "✅ Added .neon_local/ to .gitignore"
fi

echo "📦 Building and starting development containers..."
echo "   - Neon Local proxy will create an ephemeral database branch"
echo "   - Application will run with hot reload enabled"
echo ""

# Start development environment
docker compose -f docker-compose.dev.yml up --build -d

# Wait for Neon Local to be ready by checking logs
echo "⏳ Waiting for Neon Local to be ready..."
MAX_RETRIES=60
RETRY_COUNT=0
until docker compose -f docker-compose.dev.yml logs neon-local 2>&1 | grep -q "All services are healthy and ready for traffic"; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Neon Local failed to start after $MAX_RETRIES attempts"
        docker compose -f docker-compose.dev.yml logs neon-local
        exit 1
    fi
    echo "   Attempt $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

echo "✅ Neon Local is ready!"

# Run migrations with Drizzle
echo "📜 Applying latest schema with Drizzle..."
# Load DATABASE_URL from .env.development
export $(grep -v '^#' .env.development | xargs)
npm run db:migrate

# Show status
echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:3000"
echo "   Database: postgres://neon:npg@localhost:5432/neondb"
echo ""
echo "📋 Showing logs (Ctrl+C to exit)..."
docker compose -f docker-compose.dev.yml logs -f