# =====================
# Server Production Dockerfile
# =====================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/
COPY migrations/ ./migrations/

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

# Create uploads directory
RUN mkdir -p uploads && chown -R node:node /app

USER node

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/app.js"]
