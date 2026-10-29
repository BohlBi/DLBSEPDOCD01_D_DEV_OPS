#!/bin/sh
# Schreibt die Versionsinfo beim Start des Containers.
# Das Image bleibt dadurch über alle Umgebungen identisch, Version und Umgebung
# kommen als Konfiguration aus docker-compose (APP_VERSION, APP_ENV).
set -eu
cat > /usr/share/nginx/html/version.json <<EOF
{"version":"${APP_VERSION:-dev}","environment":"${APP_ENV:-local}","commit":"${GIT_SHA:-unknown}"}
EOF
