# ===== Stage 1: Build TypeScript =====
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies (including dev deps for TypeScript build)
RUN npm ci

# Copy TypeScript config + source
COPY tsconfig*.json ./
COPY src ./src

# Compile TS -> JS in /dist
RUN npm run build


# ===== Stage 2: Runtime Image =====
FROM node:20-alpine AS runtime

WORKDIR /usr/src/app

# Environment defaults (can be overridden via compose)
ENV NODE_ENV=production
ENV PORT=3000
ENV STORE_BACKEND=redis
ENV REDIS_URL=redis://redis:6379

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled JS output from builder
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

# Start app (defined in package.json)
CMD ["npm", "start"]
