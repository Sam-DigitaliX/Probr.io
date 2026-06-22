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

`revenue_triangulation` — **Phase 1 implementee (2026-06-22)** : source backend (push `/api/ingest/revenue`) + source GA4 (service account) + detection `ratio_drift` (backend_HT / GA4_TTC vs 0.85). Code dans `probes/revenue_triangulation.py` (logique pure `evaluate_triangulation` + classe `RevenueTriangulationProbe`). Spec + roadmap (Phases 2-5) : `docs/internal/revenue-triangulation-probe.md`. Feature strategique majeure.

### Base de donnees — 4 migrations Alembic
1. `001_initial_schema` — tables clients, sites, probe_configs, probe_results, alerts + enums
2. `002_monitoring_batches` — table monitoring_batches + colonne ingest_key sur sites
3. `003` — ajoute la valeur `revenue_triangulation` a l'enum `probetype`
4. `004` — table `backend_revenue` (source push de la probe revenue_triangulation)

## Etat actuel

- Frontend : complet (landing, auth pages, dashboard CRUD, demo dashboard) — **deploye sur Vercel, domaine `https://probr.io`**
- Backend : probes implementes = `http_health` + **`revenue_triangulation` (Phase 1)** — deploye sur Coolify (`running:healthy`), **`https://api.probr.io`** (cert Traefik OK)
- Tests : **backend** (pytest + pytest-asyncio, 35 tests) ; pas de tests frontend
- CI : **GitHub Actions** (`.github/workflows/ci.yml`) sur chaque PR/push, service container `postgres:18` (rejoue les migrations). CD = auto-deploy Vercel + Coolify sur merge `main`.
- Page `/demo` fonctionnelle avec donnees mock (5 clients, 8 sites, 20 probes)
- Auth : pages login/signup presentes, pas de logique d'authentification backend

## Infrastructure / Deploiement

Verifie via MCP Vercel + Hostinger + Coolify le 2026-06-21.

- **Frontend** : Vercel (projet `probr.io`, team DigitaliX), domaine prod **https://probr.io**, Next.js, Node 24.x, **auto-deploy sur push `main`** (chaque merge declenche un deploiement prod).
- **Backend** : Coolify (app `tracking-monitoring`, repo `Sam-DigitaliX/Probr.io`, build dockercompose), statut `running:healthy`. **URL = `https://api.probr.io`** (cert Traefik OK, `/health` 200). Healthcheck : defini dans `docker-compose.yml` (compose) ; l'option app-level Coolify est off (sans impact). `NEXT_PUBLIC_API_URL` (Vercel) pointe sur `https://api.probr.io/api` + CORS `ALLOWED_ORIGINS` inclut `https://probr.io` → dashboard connecte (verifie 2026-06-22).
- **DB** : PostgreSQL standalone gere par Coolify (le `docker-compose.yml` backend ne contient que le service `backend` et pointe vers `${DATABASE_URL}` externe). 2 instances Postgres sur le VPS — a confirmer laquelle sert Probr.
- **DNS** : `probr.io` est gere **chez Vercel** (`ns1/ns2.vercel-dns.com`). ⚠️ Cloudflare gere le NDD **DigitaliX (`digitalix.xyz`)**, PAS `probr.io`. `docs.probr.io` -> VPS. `api.probr.io` -> VPS, **live le 2026-06-22** (declare dans Coolify, cert Traefik OK, `https://api.probr.io/health` => 200). Reste : `NEXT_PUBLIC_API_URL` (Vercel) + `ALLOWED_ORIGINS` (Coolify) quand le front doit taper ce backend.
- **Email** : `samuel@probr.io` = **alias de domaine sur le Google Workspace DigitaliX** (boite reelle = `samuel@digitalix.xyz`, send-as actif). Records dans le DNS Vercel : MX (`smtp.google.com`), SPF (`v=spf1 include:_spf.google.com ~all`), DKIM (`google._domainkey`), DMARC. DMARC en `p=none` (montee quarantine->reject prevue), rapports via **Postmark** (gratuit). ⚠️ Envoi applicatif (Resend) a part : sous-domaine `send.probr.io`, non configure.
- **Docs** : BookStack sur Coolify (`bookstack-probr.io`, `docs.probr.io` -> VPS).
- **VPS** : 1 seul VPS Hostinger (KVM1 : 1 vCPU / 4 Go RAM / 50 Go, Ubuntu 24.04). Tout co-localise : Coolify + proxy Traefik + API Launchpad (`api.digitalix.xyz`) + 2 Postgres + BookStack + backend Probr + n8n (queue mode, hors Coolify). Charge (2026-06-21) : CPU ~21%, RAM ~45%, disque ~19% — confortable.
- **Maintenance a planifier** : Coolify v4.0.0 (en retard), uptime VPS ~33j → snapshot + `apt upgrade` + reboot + Coolify self-update.

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

- `docs/internal/revenue-triangulation-probe.md` — probe `revenue_triangulation` (3-sources backend/GA4/ad platforms). **Plan Phase 1 validé (2026-06-20)** : voir §9.bis pour les décisions d'implémentation.

## Variables d'environnement

```
DATABASE_URL=postgresql+asyncpg://...
APP_ENV=development|production
SECRET_KEY=<random-hex-32>
ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api
SLACK_WEBHOOK_URL=        # optionnel
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM  # optionnel
GA4_SERVICE_ACCOUNT_JSON= # JSON (string) du service account GA4 — probe revenue_triangulation. Le client ajoute l'email du SA en lecture sur sa propriete GA4.
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

## Prochaines etapes (reprise — derniere session 2026-06-22)

Phase 1 `revenue_triangulation` **code-complete, deployee, dashboard connecte a la prod**. Au prochain demarrage, reprendre dans cet ordre :

1. **WS6 — mettre la probe en service (E2E reel)** — le prochain blocage concret :
   - (a) creer un **projet Google Cloud + service account**, mettre le JSON dans `GA4_SERVICE_ACCOUNT_JSON` (env Coolify backend) ;
   - (b) le client ajoute l'email du SA **en lecture** sur sa propriete GA4 + renseigner `ga4_property_id` sur le Site ;
   - (c) creer client+site (via le dashboard `probr.io/dashboard`, desormais branche), pousser de vrais totaux Magento via `POST https://api.probr.io/api/ingest/revenue` (header `X-Probr-Key` = `ingest_key` du Site), creer un `ProbeConfig` `revenue_triangulation`, declencher, verifier `ProbeResult` + `Alert`.
2. **Auth backend** — l'API admin (`/api/clients`, `/api/sites`) est **publique** sur api.probr.io. Bloquant avant d'ouvrir a des clients.
3. **Doc utilisateur** `revenue_triangulation` (niveau SaaS) + recheck perimetre doc global.
4. **Maintenance infra** (voir workspace `infra-vps`) : Coolify v4.0.0 + uptime VPS ~33j → snapshot + apt upgrade + reboot + Coolify self-update.
5. **Tag sGTM** `probr-sgtm-monitoring` : soumission Community Template Gallery (prerequis : endpoint ingest prod stable — OK maintenant — + doc `docs.probr.io/gtm-listener` en ligne).
6. Decisions differees : source GA4 **BigQuery vs Data API** (Phase 3) ; `app.probr.io` (separation marketing/app, non urgent) ; **Resend** pour envoi applicatif (`send.probr.io`).

## Points ouverts

- [ ] Implementation des 6 probes restants (sgtm_infra, gtm_version, data_volume, bq_events, tag_check, cmp_check)
- [x] `revenue_triangulation` **Phase 1 FAITE (2026-06-22)** — WS0-WS5, 35 tests verts en CI. Reste : **WS6 validation E2E sur vrai client** (projet GCP + service account, SA ajoute en lecture sur GA4 client, push vrais totaux Magento). Phases 2-5 (OAuth self-service, connecteurs natifs, 3 sources, frontend dedie, doc) : voir spec.
- [ ] Trancher source GA4 : Data API (echantillonne) vs export BigQuery (raw, non echantillonne, par SKU) — pressenti Phase 3. Voir spec §9.bis.
- [ ] **Documentation utilisateur `revenue_triangulation`** (docs.probr.io / BookStack) — niveau doc SaaS : guide d'installation complet (creation service account GA4 + ajout du SA en lecture sur la propriete GA4 du client, alimentation de la source backend / push Magento, configuration des seuils de la probe), lecture/interpretation des resultats, troubleshooting, prerequis. = Phase 5 de la spec. **Rechecker le perimetre doc global du SaaS** (onboarding, comptes, alerting, etc.) a cette occasion.
- [ ] Authentification backend (JWT ou session)
- [~] Tests : backend en place (pytest + pytest-asyncio + CI) ; tests frontend a faire
- [x] CI backend (GitHub Actions, postgres service container, rejoue migrations). CD = auto-deploy Vercel + Coolify sur merge `main`.
- [ ] Notifications alertes (Slack webhook + email sont cables mais non testes)
- [x] Email `samuel@probr.io` — FAIT 2026-06-22 via alias de domaine Google Workspace (MX/SPF/DKIM/DMARC dans DNS Vercel, DMARC p=none + rapports Postmark). Voir section Infrastructure. (L'ancienne note "Resend + Cloudflare Email Routing" etait fausse : DNS sur Vercel, pas Cloudflare.)
- [ ] Resend pour l'envoi applicatif (alertes) : sous-domaine `send.probr.io` (SPF + DKIM Resend), distinct de la boite humaine `samuel@probr.io`
- [ ] Role-based access (multi-tenant par client)
- [x] Backend sur domaine dedie **`https://api.probr.io`** (FAIT 2026-06-22, cert Traefik OK, `/health` 200). Reste (non bloquant) : `NEXT_PUBLIC_API_URL` (Vercel) + `ALLOWED_ORIGINS` (Coolify) quand le front doit taper ce backend.
- [ ] Tag sGTM `probr-sgtm-monitoring` (repo lie, custom template GTM v1.0.0, non soumis) : decouple de revenue_triangulation Phase 1 (le tag alimente `MonitoringBatch`, pas les sources de la probe). Sequencement retenu : Phase 1 -> deploiement prod (endpoint ingest live) -> soumission Community Template Gallery. Prerequis avant soumission : endpoint ingest prod stable + doc `docs.probr.io/gtm-listener` en ligne (delai review Gallery 2-3j). Co-evolution avec la probe en Phase 3 (le tag devra envoyer les vraies valeurs ecommerce, pas juste leur presence).
