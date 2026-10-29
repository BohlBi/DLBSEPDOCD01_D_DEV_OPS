# DLBSEPDOCD01_D_DEV_OPS

## Lokal starten

Voraussetzung: Docker

```bash
docker build -t hello-devops:local .
IMAGE=hello-devops:local docker compose -f deploy/docker-compose.yml up -d
```

Aufrufen unter http://localhost:8080

Stoppen:

```bash
IMAGE=hello-devops:local docker compose -f deploy/docker-compose.yml down
```
