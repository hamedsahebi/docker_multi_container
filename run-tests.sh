#!/bin/bash
set -e

echo "🧪 Running tests..."

sudo docker compose -f docker-compose.test.yml up \
  --build \
  --abort-on-container-exit \
  --exit-code-from backend-test

EXIT_CODE=$?

echo "🧹 Cleaning up containers..."
sudo docker compose -f docker-compose.test.yml down -v

exit $EXIT_CODE
