#!/bin/sh
set -e

echo "=== TrackGuard Backend Starting ==="
echo "Working directory: $(pwd)"
echo "Contents of /app/app/:"
ls -la /app/app/ || echo "ERROR: /app/app/ not found!"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'no')"
echo ""

# Test import before anything else
echo "Testing app.main import..."
python -c "import app.main; print('OK: app.main imported successfully')" || {
    echo "FATAL: import app.main failed"
    exit 1
}
echo ""

# Run migrations (non-fatal — DB may not be ready on first start)
echo "Running alembic migrations..."
alembic upgrade head || echo "WARNING: migrations failed (will retry on next restart)"
echo ""

echo "Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
