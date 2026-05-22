#!/usr/bin/env bash
# Install and configure local PostgreSQL (Ubuntu/Debian) when Docker is unavailable.
set -euo pipefail

echo "==> Installing PostgreSQL (requires sudo)..."

sudo apt-get update -qq
sudo apt-get install -y postgresql postgresql-contrib

sudo systemctl enable postgresql
sudo systemctl start postgresql

sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'asp') THEN
    CREATE ROLE asp LOGIN PASSWORD 'asp_dev_password' CREATEDB;
  END IF;
END
$$;

SELECT 'CREATE DATABASE antigravity_signal OWNER asp'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'antigravity_signal')\gexec

GRANT ALL PRIVILEGES ON DATABASE antigravity_signal TO asp;
SQL

echo "PostgreSQL is running on localhost:5432"
echo "Run migrations: cd server && npm run db:migrate"
