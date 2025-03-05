# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Increase system limits for file watching
RUN ulimit -n 65535

# Install dependencies needed for node-gyp and Prisma
RUN apk add --no-cache libc6-compat python3 make g++ openssl openssl-dev

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Increase system limits for file watching
RUN ulimit -n 65535

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generate Prisma Client
RUN npx prisma generate

# Disable file watching during build to prevent inotify issues
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Build application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install necessary production dependencies including OpenSSL
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["node", "server.js"] 