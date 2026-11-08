# =============================================================================
# AEGIS BY AIVO — FRONTEND WEB & COCKPIT SOC / ESG (AGPLv3)
# Multi-stage build : Node.js 22 (Astro + Vue 3) -> Nginx Alpine (< 25 MB RAM)
# =============================================================================

FROM node:22-alpine AS builder

WORKDIR /app

# Activation de pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copie des dépendances
COPY package.json ./

# Installation des paquets
RUN pnpm install --frozen-lockfile=false

# Copie du code source et assets
COPY . ./

# Compilation statique de l'application Astro
RUN pnpm build

# -----------------------------------------------------------------------------
# Étape finale d'exécution : Serveur Nginx durci & sobre
# -----------------------------------------------------------------------------
FROM nginx:alpine AS runner

# Copie des fichiers compilés
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuration Nginx unifiée (Cockpit & Portail Open Source)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
