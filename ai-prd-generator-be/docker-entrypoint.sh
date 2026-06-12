#!/bin/sh
set -e

echo "========================================="
echo "Parsing database connection details..."
echo "========================================="

if [ -n "$DATABASE_URL" ]; then
  DB_HOST=$(node -e "const { URL } = require('url'); try { const u = new URL(process.env.DATABASE_URL); console.log(u.hostname); } catch(e) { console.log('db'); }")
  DB_PORT=$(node -e "const { URL } = require('url'); try { const u = new URL(process.env.DATABASE_URL); console.log(u.port || '5432'); } catch(e) { console.log('5432'); }")
else
  DB_HOST="db"
  DB_PORT="5432"
fi

echo "Waiting for database to be ready at $DB_HOST:$DB_PORT..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  echo "Database is unavailable - sleeping 2 seconds..."
  sleep 2
done
echo "Database is ready!"

echo "========================================="
echo "Applying database migrations..."
echo "========================================="

# Run all pending migrations
npx prisma migrate deploy

# Start Prisma Studio in the background
echo "========================================="
echo "Starting Prisma Studio on port 5555..."
echo "========================================="
npx prisma studio --port 5555 --browser none &

# Start the Node.js application server
echo "========================================="
echo "Starting backend server..."
echo "========================================="
exec node dist/index.js
