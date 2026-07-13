# Container image for the app. Built in CI (see .github/workflows/ci.yml) and
# relies on `output: 'standalone'` in next.config.ts to produce the
# .next/standalone folder the runner stage copies.

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

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# have to exist during `npm run build` rather than only at runtime. ARGs are
# scoped to the stage that declares them — these must stay in the builder stage.
# Passed in via --build-arg (see .github/workflows/ci.yml); the placeholder
# defaults only exist so a bare `docker build` still produces an image.
ARG NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder-anon-key"
ARG NEXT_PUBLIC_WHATSAPP_NUMBER=""
ARG DATABASE_URL=""
ARG DIRECT_URL=""

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL

# Prisma client must be generated before the build
RUN npx prisma generate
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