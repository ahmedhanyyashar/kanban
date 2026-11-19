# One image for the whole app: the API, and the web app it serves, so both share one address.
# Build context is the workspace root: `docker build -f apps/backend/Dockerfile .`
# The same major as .nvmrc, so the image runs what CI tests
FROM node:24-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/eslint-config/package.json packages/eslint-config/
COPY packages/typescript-config/package.json packages/typescript-config/
COPY packages/shared/package.json packages/shared/
COPY packages/api-client/package.json packages/api-client/
COPY packages/ui/package.json packages/ui/
COPY apps/backend/package.json apps/backend/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
COPY . .
# `prisma generate` reads this to load its config but never connects
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
# No VITE_API_URL: the web app calls the address it was served from.
# Pass both to put a "Try the demo" button on the sign-in page (a public demo account).
ARG VITE_DEMO_EMAIL
ARG VITE_DEMO_PASSWORD
RUN pnpm turbo run build --filter=backend --filter=web
# What the API needs to run and nothing else: its production dependencies, the built workspace
# packages copied in (no symlinks), and the files listed in its package.json.
RUN pnpm --filter backend deploy --prod --legacy /out
# better-auth lists vitest as an optional peer, and the workspace has it, so vite and its glob matcher (picomatch,
# GHSA-fc5q-39xc-vjpf, no patched release yet) come along. Nothing at run time loads them: leave them out.
# Remove this when picomatch 4.0.8 is published.
RUN cd /out/node_modules/.pnpm && rm -rf vitest@* vite@* @vitest+* picomatch@* fdir@* tinyglobby@*

# The runner does not start from `base`: it needs neither pnpm nor npm, whose bundled packages
# would be scanned and patched with the image for nothing.
FROM node:24-alpine AS runner
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack /opt/yarn-*
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nestjs /out ./
# the built web app, which the API serves (see WEB_DIST)
COPY --from=builder --chown=nestjs:nestjs /app/apps/web/dist ./web

USER nestjs

EXPOSE 3001
ENV PORT=3001
ENV WEB_DIST=/app/web

# Apply migrations before serving: the Prisma CLI is a production dependency for this.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main.js"]
