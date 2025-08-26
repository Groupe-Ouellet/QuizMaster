# Docker Setup for QuizMaster

This document explains how to run the QuizMaster application using Docker.

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and run the application:**
   ```bash
   docker-compose up --build
   ```

2. **Run in background:**
   ```bash
   docker-compose up -d --build
   ```

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### Using Docker directly

1. **Build the image:**
   ```bash
   docker build -t quizmaster .
   ```

2. **Run the container:**
   ```bash
   docker run -p 7236:7236 -v $(pwd)/server/quiz_master.db:/app/server/quiz_master.db quizmaster
   ```

3. **Run in background:**
   ```bash
   docker run -d -p 7236:7236 -v $(pwd)/server/quiz_master.db:/app/server/quiz_master.db --name quizmaster-app quizmaster
   ```

### Production Optimized Build

For production deployment, use the multi-stage Dockerfile:

```bash
docker build -f Dockerfile.prod -t quizmaster:prod .
docker run -p 7236:7236 -v $(pwd)/server/quiz_master.db:/app/server/quiz_master.db quizmaster:prod
```

## Access the Application

Once running, access the application at:
- **Web Interface:** http://localhost:7236
- **Health Check:** http://localhost:7236/health
- **API Endpoints:** http://localhost:7236/api/*

## Environment Variables

You can customize the application behavior using environment variables:

- `PORT`: Server port (default: 7236)
- `NODE_ENV`: Environment mode (development/production)

Example with custom port:
```bash
docker run -p 8080:8080 -e PORT=8080 -v $(pwd)/server/quiz_master.db:/app/server/quiz_master.db quizmaster
```

## Database Persistence

The SQLite database is mounted as a volume to ensure data persistence:
- Database file: `./server/quiz_master.db`
- Container path: `/app/server/quiz_master.db`

## Health Monitoring

The container includes a health check that monitors the `/health` endpoint every 30 seconds.

Check container health:
```bash
docker ps  # Look for health status
docker inspect quizmaster-app  # Detailed health info
```

## Troubleshooting

### Check logs:
```bash
docker logs quizmaster-app
# or with docker-compose
docker-compose logs
```

### Access container shell:
```bash
docker exec -it quizmaster-app sh
```

### Rebuild without cache:
```bash
docker build --no-cache -t quizmaster .
# or with docker-compose
docker-compose build --no-cache
```

## File Structure

The Docker setup includes:
- `Dockerfile`: Standard Docker build
- `Dockerfile.prod`: Multi-stage production-optimized build
- `docker-compose.yml`: Docker Compose configuration
- `.dockerignore`: Files excluded from Docker build context

## Build Process

The Docker build process:
1. Installs Node.js dependencies
2. Builds the React frontend with Vite (outputs to `dist/`)
3. Sets up the Express server to serve the built frontend
4. Exposes port 7236
5. Starts the server with `npm run server`

## Security

- Runs as non-root user (nextjs:nodejs)
- Only production dependencies in final image
- Health checks for monitoring
- Minimal Alpine Linux base image
