# ---- Stufe 1: Qualitätssicherung ------------------------------------------
# Lint und Unit-Tests laufen im Build. Schlägt ein Test fehl, entsteht kein Image.
FROM node:22.11-alpine AS test
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run lint && npm test

# ---- Stufe 2: Laufzeit-Image ---------------------------------------------
# Basis-Image mit fester Version (kein :latest), nur nginx + statische Dateien.
FROM nginx:1.27-alpine AS runtime

ARG GIT_SHA=unknown
LABEL org.opencontainers.image.title="hello-devops" \
      org.opencontainers.image.revision="${GIT_SHA}"
ENV GIT_SHA=${GIT_SHA}

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Wird beim Containerstart ausgeführt und schreibt version.json aus den Umgebungsvariablen.
COPY docker/40-write-version.sh /docker-entrypoint.d/40-write-version.sh
RUN chmod +x /docker-entrypoint.d/40-write-version.sh

# Dateien bewusst aus der Test-Stufe kopieren: so baut BuildKit Stufe 1 immer mit.
COPY --from=test /app/src/ /usr/share/nginx/html/

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
