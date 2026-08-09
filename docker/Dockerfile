# ---------- build dos 3 frontends ----------
FROM node:20 AS build
WORKDIR /app

# Instala deps de todos os workspaces (usa o lockfile do monorepo)
COPY . .
RUN npm ci

# Build: shared (core/events) -> dashboard -> transacoes -> shell
# (usa os .env.production: VITE_API_URL=/api, remotes em /remotes/*)
RUN npm run build

# ---------- serve com Caddy (estático + proxy /api) ----------
FROM caddy:2-alpine
COPY docker/Caddyfile /etc/caddy/Caddyfile

# Shell na raiz; remotes em /remotes/*
COPY --from=build /app/shell/dist /srv
COPY --from=build /app/dashboard/dist /srv/remotes/dashboard
COPY --from=build /app/transacoes/dist/transacoes /srv/remotes/transacoes

EXPOSE 80 443
