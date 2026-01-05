# ============================================
# Base stage
# ============================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ============================================
# Dependencies stage
# ============================================
FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/core/package.json ./packages/core/

RUN npm ci

# ============================================
# Builder stage
# ============================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build packages first
RUN npm run build --workspace=@npfs/types
RUN npm run build --workspace=@npfs/core

# Build Next.js app
RUN npm run build --workspace=@npfs/web

# ============================================
# Development stage
# ============================================
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build packages for development
RUN npm run build --workspace=@npfs/types
RUN npm run build --workspace=@npfs/core

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "dev"]

# ============================================
# Production runner stage
# ============================================
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Set the correct permission for prerender cache
RUN mkdir -p ./apps/web/.next
RUN chown nextjs:nodejs ./apps/web/.next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
