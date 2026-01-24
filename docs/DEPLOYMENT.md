# Deployment Guide

## Overview

This guide covers deploying Love Map to a VPS (Virtual Private Server) with Docker.

---

## Prerequisites

### VPS Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2 GB |
| Storage | 20 GB | 50 GB |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Domain & SSL

- Domain name pointing to VPS IP
- SSL certificate (Let's Encrypt - free)

---

## VPS Initial Setup

### 1. Connect to VPS

```bash
ssh root@your-vps-ip
```

### 2. Create non-root user

```bash
# Create user
adduser lovemap

# Add to sudo group
usermod -aG sudo lovemap

# Switch to user
su - lovemap
```

### 3. Install Docker

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version

# Logout and login for group changes
exit
ssh lovemap@your-vps-ip
```

### 4. Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Application Deployment

### 1. Clone Repository

```bash
cd ~
git clone <your-repo-url> love_map
cd love_map
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit with your values
nano .env
```

**Production .env:**
```env
# App
NODE_ENV=production
APP_URL=https://yourdomain.com
API_URL=https://yourdomain.com/api

# Database
DATABASE_URL=postgres://lovemap:your_secure_password@postgres:5432/lovemap
POSTGRES_USER=lovemap
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=lovemap

# Redis
REDIS_URL=redis://redis:6379

# Auth
JWT_SECRET=your-very-long-random-secret-key-at-least-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=/app/uploads

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### 3. Create Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.3
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - lovemap_network

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data
    networks:
      - lovemap_network

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      - postgres
      - redis
    networks:
      - lovemap_network

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${API_URL}
    restart: always
    networks:
      - lovemap_network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/ssl:/etc/nginx/ssl:ro
      - uploads_data:/uploads:ro
    depends_on:
      - server
      - client
    networks:
      - lovemap_network

volumes:
  postgres_data:
  redis_data:
  uploads_data:

networks:
  lovemap_network:
    driver: bridge
```

### 4. Create Nginx Configuration

```nginx
# docker/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=1r/s;

    # Upstream servers
    upstream client {
        server client:80;
    }

    upstream api {
        server server:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Client max body size (for uploads)
        client_max_body_size 10M;

        # API routes
        location /api {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket
        location /socket.io {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Uploads (static files)
        location /uploads {
            alias /uploads;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # Frontend
        location / {
            proxy_pass http://client;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### 5. Create Dockerfiles

**Server Dockerfile:**
```dockerfile
# server/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

**Client Dockerfile:**
```dockerfile
# client/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## SSL Setup (Let's Encrypt)

### 1. Install Certbot

```bash
sudo apt install certbot -y
```

### 2. Get Certificate

```bash
# Stop nginx temporarily
docker compose -f docker-compose.prod.yml down

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo mkdir -p docker/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/ssl/
sudo chown -R $USER:$USER docker/ssl
```

### 3. Auto-renewal

```bash
# Create renewal script
cat > ~/renew-ssl.sh << 'EOF'
#!/bin/bash
cd ~/love_map
docker compose -f docker-compose.prod.yml stop nginx
certbot renew
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/ssl/
docker compose -f docker-compose.prod.yml start nginx
EOF

chmod +x ~/renew-ssl.sh

# Add cron job (runs monthly)
(crontab -l 2>/dev/null; echo "0 3 1 * * ~/renew-ssl.sh") | crontab -
```

---

## Deployment Commands

### Initial Deploy

```bash
cd ~/love_map

# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker compose -f docker-compose.prod.yml exec server npm run db:migrate

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

### Update Deployment

```bash
cd ~/love_map

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Run any new migrations
docker compose -f docker-compose.prod.yml exec server npm run db:migrate
```

### Rollback

```bash
# Revert to previous version
git checkout <previous-commit>
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Backup Strategy

### Database Backup Script

```bash
# ~/backup.sh
#!/bin/bash

BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
docker compose -f ~/love_map/docker-compose.prod.yml exec -T postgres \
  pg_dump -U lovemap lovemap | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Uploads backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz \
  -C ~/love_map /var/lib/docker/volumes/love_map_uploads_data

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Restore Database

```bash
# Decompress
gunzip backup.sql.gz

# Restore
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U lovemap lovemap < backup.sql
```

### Cron Job

```bash
# Daily backup at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * ~/backup.sh >> ~/backup.log 2>&1") | crontab -
```

---

## Monitoring

### Health Check Endpoint

Add to server:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Simple Monitoring Script

```bash
# ~/monitor.sh
#!/bin/bash

URL="https://yourdomain.com/health"
WEBHOOK="https://your-discord-webhook-url"  # Optional

if ! curl -sf $URL > /dev/null; then
  echo "$(date) - Site is DOWN!" >> ~/monitor.log

  # Optional: Send Discord notification
  # curl -H "Content-Type: application/json" \
  #   -d '{"content":"Love Map is DOWN!"}' \
  #   $WEBHOOK

  # Attempt restart
  cd ~/love_map
  docker compose -f docker-compose.prod.yml restart
fi
```

### Cron (every 5 minutes)

```bash
*/5 * * * * ~/monitor.sh
```

---

## Troubleshooting

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f server
docker compose -f docker-compose.prod.yml logs -f postgres

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 server
```

### Common Issues

**Database connection error:**
```bash
# Check postgres is running
docker compose -f docker-compose.prod.yml ps

# Check postgres logs
docker compose -f docker-compose.prod.yml logs postgres
```

**File permission issues:**
```bash
# Fix uploads permission
docker compose -f docker-compose.prod.yml exec server chown -R node:node /app/uploads
```

**Out of disk space:**
```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a
```

---

## Performance Tuning

### PostgreSQL

```sql
-- postgresql.conf adjustments for 2GB RAM
shared_buffers = 512MB
effective_cache_size = 1536MB
work_mem = 16MB
maintenance_work_mem = 128MB
```

### Nginx

```nginx
# Worker processes
worker_processes auto;

# Worker connections
events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}
```

### Node.js

```bash
# Increase memory if needed
NODE_OPTIONS="--max-old-space-size=1024"
```
