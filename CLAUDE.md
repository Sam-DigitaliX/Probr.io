# CLAUDE.md — Probr.io

## Stack technique

### Frontend
- **Next.js 16.1.6** (App Router) + **React 19.2.3** + **TypeScript 5**
- **Tailwind CSS v4** — config CSS-first via `@theme inline` dans `globals.css` (pas de `tailwind.config.ts`)
- **Lucide React** pour les icones SVG
- **clsx + tailwind-merge + cva** pour les utilitaires de classes
- **ESLint 9** (flat config)

### Backend
- **FastAPI 0.115.6** + **Uvicorn 0.34.0**
- **SQLAlchemy 2.0.36** (async, asyncpg driver)
- **PostgreSQL** via **asyncpg 0.30.0**
- **Alembic 1.14.1** pour les migrations
- **Pydantic 2.10.4** + **pydantic-settings 2.7.1**
- **APScheduler 3.10.4** pour l'execution periodique des probes
- **Httpx 0.28.1** pour les requetes HTTP async

## Architecture

### Frontend (`frontend/src/`)
```
app/
  (dashboard)/dashboard/    # Zone authentifiee — clients, sites, probes, alerts
  (public)/                 # Pages publiques — landing, login, signup, brand, demo
  layout.tsx                # Root layout (SvgGradientDefs + EvervaultGlow)
  globals.css               # Design tokens Tailwind v4 (@theme inline)
components/
  ui/                       # Primitives UI (badge, button, card, modal, input, select, table, status-dot, gradient-icon)
  dashboard/                # Composants dashboard (stats-cards, alerts-feed, client-status-grid)
  layout/                   # Sidebar + bottom nav mobile
lib/
  api.ts                    # Client HTTP (fetch wrapper vers API backend)
  types.ts                  # Types TypeScript partages
  demo-data.ts              # Donnees mock pour /demo
  utils.ts                  # cn() helper
```

### Backend (`backend/app/`)
```
main.py                     # App FastAPI, CORS, lifespan (scheduler), 7 routers sous /api
config.py                   # Settings via pydantic-settings (.env)
database.py                 # AsyncSession factory
models.py                   # Modeles SQLAlchemy (clients, sites, probe_configs, probe_results, alerts, monitoring_batches)
schemas.py                  # Schemas Pydantic
api/                        # 7 routers: clients, sites, probes, alerts, dashboard, monitoring, ingest
probes/                     # Moteur de probes: base.py (ABC), http_health.py, runner.py, scheduler.py
services/                   # alert_service.py (Slack webhook + SMTP)
```

### Probes (7 types implementes/prevus + 1 planifiee)
`http_health`, `sgtm_infra`, `gtm_version`, `data_volume`, `bq_events`, `tag_check`, `cmp_check`

Probe planifiee (spec validee, non implementee) : `revenue_triangulation` — voir `docs/internal/revenue-triangulation-probe.md`. Detecte les ecarts de valeur entre 3 sources (backend / GA4 / ad platforms). Feature strategique majeure.

### Base de donnees — 2 migrations Alembic
1. `001_initial_schema` — tables clients, sites, probe_configs, probe_results, alerts + enums
2. `002_monitoring_batches` — table monitoring_batches + colonne ingest_key sur sites

## Etat actuel

- Frontend : complet (landing, auth pages, dashboard CRUD, demo dashboard)
- Backend : structure en place, seul `http_health` probe est implemente
- Pas de tests (ni frontend ni backend)
- Pas de CI/CD
- Page `/demo` fonctionnelle avec donnees mock (5 clients, 8 sites, 20 probes)
- Auth : pages login/signup presentes, pas de logique d'authentification backend

## Conventions de code

### CSS / Design
- **Dark mode only** — fond `hsl(240 15% 6%)`
- **Gradient brand** : Purple `hsl(276 51% 47%)` -> Red `hsl(0 98% 55%)` -> Orange `hsl(35 97% 63%)`
- **Icones** : toutes en gradient via `stroke: url(#icon-grad)` — classe CSS `.icon-grad` (defini dans globals.css). Le SVG `<linearGradient id="icon-grad">` est rendu 1x dans le root layout via `<SvgGradientDefs />`
- **Hover icones** : inversion via `.icon-grad-hover-white` (stroke passe a white au hover du parent `.group`)
- **Bordures cartes** :
  - `.ev-card` — bordure animee (conic-gradient tournant via `@property --ev-border-angle`)
  - `.glass-stat-card` — bordure statique gradient (mask-composite: exclude)
  - `.glass-card-interactive` — bordure simple `border-white/6%`
- **Glassmorphism** : `bg-glass`, `backdrop-blur-2xl`, `border-glass-border`
- **Typo** : Space Grotesk (titres) + Inter (corps)

### TypeScript
- Strict mode
- Types dans `lib/types.ts`, interfaces prefixees par le domaine (DashboardClient, ProbeResult, etc.)
- Pas de barrel exports

### Backend Python
- Async partout (async def, AsyncSession)
- Routers FastAPI avec prefix `/api`
- Modeles SQLAlchemy 2.0 (mapped_column, Mapped)

## Decisions d'architecture

1. **Tailwind v4 CSS-first** — tokens dans `@theme inline {}` au lieu d'un fichier JS config
2. **SVG gradient global** — 1 seul `<linearGradient>` dans le DOM, reference par `url(#icon-grad)` partout
3. **Route groups Next.js** — `(public)` et `(dashboard)` pour separer layouts
4. **Demo standalone** — `/demo` n'a aucune dependance backend, donnees 100% mock dans `demo-data.ts`
5. **Probe system** — classe abstraite `BaseProbe`, execution via `runner.py`, scheduling via APScheduler
6. **GTM Listener ingest** — endpoint `POST /api/ingest/{ingest_key}` recoit les donnees du tag GTM serveur
7. **Animated borders** — `@property --ev-border-angle` + `mask-composite: exclude` pour l'effet conic-gradient animee

## Specs internes

Specs de features avant implementation, non destinees a BookStack. Distinct de `docs/{en,fr}/` qui contient la doc utilisateur.

- `docs/internal/revenue-triangulation-probe.md` — probe `revenue_triangulation` (3-sources backend/GA4/ad platforms)

## Variables d'environnement

```
DATABASE_URL=postgresql+asyncpg://...
APP_ENV=development|production
SECRET_KEY=<random-hex-32>
ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api
SLACK_WEBHOOK_URL=        # optionnel
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM  # optionnel
```

## Commandes

```bash
# Frontend
cd frontend && npm run dev      # Dev server :3000
cd frontend && npm run build    # Build production
cd frontend && npm run lint     # ESLint

# Backend
cd backend && alembic upgrade head              # Migrations
cd backend && uvicorn app.main:app --reload     # Dev server :8000
```

## Points ouverts

- [ ] Implementation des 6 probes restants (sgtm_infra, gtm_version, data_volume, bq_events, tag_check, cmp_check)
- [ ] Implementation probe `revenue_triangulation` (feature strategique, spec dans `docs/internal/revenue-triangulation-probe.md`)
- [ ] Authentification backend (JWT ou session)
- [ ] Tests unitaires et d'integration
- [ ] CI/CD pipeline
- [ ] Notifications alertes (Slack webhook + email sont cables mais non testes)
- [ ] Setup email samuel@probr.io (Resend + Cloudflare Email Routing)
- [ ] Role-based access (multi-tenant par client)
- [ ] Deploiement production (Docker compose present mais non valide)
