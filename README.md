# DLBSEPDOCD01_D_DEV_OPS – hello-devops

Hello-World-Webanwendung (HTML/JS, ausgeliefert über nginx) als Demonstrator für eine
CI/CD-Pipeline mit **GitHub**, **GitHub Actions**, **Docker**, der **GitHub Container
Registry (GHCR)** und **Docker Compose**.

## Ablauf

```
feature/*  ──PR (Squash)──▶  dev  ──PR (Merge-Commit)──▶  main
   │                          │                            │
   ci.yml                     dev.yml                      release.yml
   Commit-Titel prüfen        Image bauen + testen         getestetes Image befördern
   Lint + Unit-Tests          push :sha-<commit>           Version aus Commits (SemVer)
   Image bauen + Smoke-Test   Deploy Staging (:8081)       Git-Tag + GitHub Release
                                                           Freigabe ▶ Deploy Produktion (:8080)
```

| Workflow | Auslöser | Aufgabe |
|---|---|---|
| `ci.yml` | Pull Request nach `dev` oder `main` | Quality Gate: Conventional-Commit-Titel, ESLint, HTMLHint, Unit-Tests, Docker-Build, Smoke-Test |
| `dev.yml` | Push auf `dev` | Build, Push `ghcr.io/bohlbi/dlbsepdocd01_d_dev_ops:sha-<commit>`, Deployment Staging |
| `release.yml` | Push auf `main` | Retag des Staging-Images zu `:<version>` und `:latest`, Tag `v<version>`, Release Notes, Deployment Produktion nach Freigabe |
| `rollback.yml` | manuell | Produktion auf eine frühere Version zurücksetzen |
| `_build.yml` | wird aufgerufen | gemeinsamer Build- und Smoke-Test-Schritt |

### Image Promotion („build once, deploy many“)

`main` baut nicht neu. Der Merge-Commit `dev → main` hat den getesteten `dev`-Commit als
zweiten Elternteil (`HEAD^2`). Ist der Code identisch (`git diff --quiet HEAD^2 HEAD`),
bekommt dessen Image `:sha-<commit>` lediglich zusätzliche Tags. Weicht `main` ab
(z. B. Hotfix), wird als Rückfallebene neu gebaut.

### Versionierung

Commit-Nachrichten folgen [Conventional Commits](https://www.conventionalcommits.org/de/v1.0.0/):
`typ(scope): beschreibung`.

| Commit | Version |
|---|---|
| `fix(page): Tippfehler korrigiert` | Patch |
| `feat(page): Begrüßung nach Tageszeit` | Minor |
| `feat(api)!: …` oder `BREAKING CHANGE:` im Text | Major |
| `chore`, `docs`, `ci`, `test`, `refactor`, `style` | kein Release |

`scripts/next-version.mjs` berechnet die nächste Version aus den Commits seit dem letzten Tag
`vX.Y.Z` (Logik in `scripts/semver.mjs`, getestet in `test/semver.test.js`).

## Lokal entwickeln

```bash
npm ci
npm run lint
npm test
docker build -t hello-devops:local .
IMAGE=hello-devops:local APP_ENV=local PORT=8080 docker compose -f deploy/docker-compose.yml up -d
# http://localhost:8080
```

## Einrichtung auf GitHub (einmalig)

1. **Repository anlegen** und dieses Projekt pushen (Branches `main` und `dev`):
   ```bash
   git remote add origin git@github.com:BohlBi/DLBSEPDOCD01_D_DEV_OPS.git
   git push -u origin main dev
   ```
2. **Merge-Strategien** (*Settings → General → Pull Requests*): „Allow squash merging“
   und „Allow merge commits“ aktiv lassen, „Allow rebase merging“ deaktivieren.
3. **Branch Protection** (*Settings → Rules → Rulesets*), für `dev` und `main`:
   - Require a pull request before merging (für `main` zusätzlich 1 Approval)
   - Require status checks to pass: `quality`, `build / build`, für `dev` zusätzlich `commit-message`
   - Block force pushes
4. **Environments** (*Settings → Environments*):
   - `staging`: keine Freigabe nötig, Deployment-Branch nur `dev`
   - `production`: *Required reviewers* eintragen (= manuelle Freigabe), Deployment-Branch nur `main`
5. **Self-hosted Runner** (*Settings → Actions → Runners → New self-hosted runner*) auf dem
   Linux-Rechner bzw. Server mit Docker und Docker Compose installieren. Er führt die
   Deploy-Jobs aus; Staging läuft dort auf Port 8081, Produktion auf Port 8080.
   Repository privat halten oder unter *Settings → Actions* für Pull Requests aus Forks
   eine Freigabe verlangen, damit kein fremder Code auf dem Runner läuft.
6. **Workflow-Rechte** (*Settings → Actions → General*): „Read and write permissions“ für den
   `GITHUB_TOKEN`, damit Tags, Releases und Images geschrieben werden können.
