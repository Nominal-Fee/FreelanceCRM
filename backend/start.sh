#!/bin/bash
set -e

echo "============================================"
echo "  FreelanceFlow - Application Startup"
echo "============================================"

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while ! python -c "
import socket, sys
try:
    s = socket.create_connection(('db', 5432))
    s.close()
except Exception:
    sys.exit(1)
" 2>/dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "ERROR: PostgreSQL did not become ready in time."
        exit 1
    fi
    echo "  Attempt $RETRY_COUNT/$MAX_RETRIES - PostgreSQL not ready, retrying in 2s..."
    sleep 2
done

echo "PostgreSQL is ready!"

# Initialize the database tables
echo "Initializing database tables..."
python -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('  Database tables created successfully.')
"

# Start the Flask application
echo "Starting FreelanceFlow backend on port 5000..."
echo "============================================"
python app.py
