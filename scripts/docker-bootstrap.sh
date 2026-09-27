#!/bin/sh
set -eu

echo "Applying Prisma migrations..."
if ! npx prisma migrate deploy; then
  echo "Prisma migration failed; application startup is aborted." >&2
  exit 1
fi

seed_mode=${RUN_DB_SEED:-}
if [ -z "$seed_mode" ]; then
  if [ -n "${EXTERNAL_DATABASE_URL:-}" ]; then
    seed_mode=false
  else
    seed_mode=true
  fi
fi

if [ "$seed_mode" = "true" ]; then
  echo "Running idempotent Prisma seed..."
  if ! npx prisma db seed; then
    echo "Prisma seed failed; application startup is aborted." >&2
    exit 1
  fi
elif [ "$seed_mode" = "false" ]; then
  echo "Skipping demo seed."
else
  echo "RUN_DB_SEED must be true or false." >&2
  exit 1
fi

echo "Database bootstrap completed."
