# Multi-stage Dockerfile: Builds React frontend and serves with Flask backend

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python backend environment
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies (libgomp1 is needed for FAISS)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (using PyTorch CPU wheels to keep image lightweight)
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r ./backend/requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend assets into the location expected by backend/app.py
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend

# Initialize SQLite database with seed data
RUN python database.py

# Expose default port (7860 for Hugging Face Spaces / 5000 for standard)
ENV PORT=7860
EXPOSE 7860

# Start Flask with Gunicorn
CMD ["sh", "-c", "gunicorn app:app --bind 0.0.0.0:${PORT:-7860} --workers 1 --threads 4 --timeout 120"]
