#!/usr/bin/env bash
# Start PostgreSQL for Antigravity Signal (Docker preferred).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Antigravity Signal — database startup"

if command -v docker &>/dev/null; then
  if docker info &>/dev/null 2>&1; then
    echo "Starting PostgreSQL container (docker compose)..."
    docker compose up -d
    echo "Waiting for PostgreSQL to accept connections..."
    for i in $(seq 1 40); do
      if docker compose exec -T postgres pg_isready -U asp -d antigravity_signal &>/dev/null; then
        echo "PostgreSQL is ready on localhost:5432"
        exit 0
      fi
      sleep 1
    done
    echo "Container started but health check timed out. Run: docker compose logs postgres"
    exit 1
  fi

  echo ""
  echo "Docker is installed but your user cannot access the daemon."
  echo "Run ONE of the following, then re-run this script:"
  echo ""
  echo "  Option A (one-time, recommended):"
  echo "    sudo usermod -aG docker \"\$USER\" && newgrp docker"
  echo ""
  echo "  Option B (start DB now with sudo):"
  echo "    cd \"$ROOT\" && sudo docker compose up -d"
  echo ""
  exit 1
fi

echo "Docker not found. Install Docker or use SQLite fallback:"
echo "  cd server && npm run db:migrate:sqlite"
exit 1
