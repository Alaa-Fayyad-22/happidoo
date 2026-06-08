# OPTIONAL — you only need this if you actually want to containerize the app.
# It is NOT required for the CI pipeline above (the Docker step was removed).
#
# BEFORE this works you must add the following to next.config.js / next.config.ts:
#     const nextConfig = { output: 'standalone' }
# Without it, the .next/standalone folder this Dockerfile copies won't exist.

# 1. Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma 
RUN npm ci

# 2. Build the app
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma client must be generated before the build
RUN npx prisma generate
# Build-time env vars (Supabase/Prisma/Resend) are passed via --build-arg
# or docker compose; bare `docker build` will use whatever is baked in.
RUN npm run build

# 3. Run the app (small final image)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]