# FreelanceFlow Backend
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ .

# Copy start script
COPY backend/start.sh .
RUN chmod +x start.sh

# Expose application ports
EXPOSE 5000

# Start the application
CMD ["bash", "start.sh"]
