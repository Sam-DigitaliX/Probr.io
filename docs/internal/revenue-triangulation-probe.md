# Spec — Probe `revenue_triangulation`

> **Statut** : spec validée, non implémentée
> **Version** : 0.1 (2026-04-28)
> **Source** : brief Sam × Claude du 28 avril 2026 (`iCloud/1 - PROJETS/Probr.io/probr-io-brief-revenue-triangulation.md`)
> **Périmètre** : doc interne de cadrage, non destinée à BookStack

---

## 1. Contexte business

Dans une stack e-commerce moderne, la donnée de conversion transite par 3 systèmes parallèles qui devraient être cohérents :

1. **Backend** (Magento, Shopify, PrestaShop, WooCommerce…) — vérité commerciale
2. **GA4** — analytique navigateur, alimenté par GTM
3. **Plateformes publicitaires** (Google Ads, Meta, Microsoft Ads, TikTok…) — alimentées via GTM client + sGTM

En pratique, des écarts apparaissent en permanence : variable GTM buggée, tag mal configuré, container preprod publié en prod, conversions zombies, double tracking, match rate Enhanced Conversions qui chute, sGTM endpoint mort, etc. **Aucun outil de monitoring sur le marché ne fait cette triangulation 3-sources nativement** : ObservePoint, DataTrue, Trackingplan, DataBuck, Stape Monitoring couvrent tous une fraction du problème.

C'est le **gap stratégique majeur** que Probr.io doit combler. Cette probe est la feature la plus différenciante du produit et probablement celle qui justifiera l'abonnement à elle seule pour les agences et consultants tracking.

## 2. Cas client de référence

Cas e-commerce médical premium (DE/FR/LU/IT/ES, Magento 2 + WeltPixel + sGTM Stape, ~250 commandes/sem, ~85K€/sem TTC). Symptôme : "les valeurs Google Ads ne font que descendre, jamais remonter".

| Source | Conversions | Revenue |
|---|---|---|
| Backend | 243 | 70 019 € HT |
| GA4 (toutes sources) | 243 | 82 352 € |
| Google Ads (Paid Shopping) | 51,58 | 21 390 € |

Ratio attendu Backend HT / GA4 ≈ 0,85 (TTC vs HT). Ratio observé : conversions OK à 92,8% mais **valeur reportée à -16% systématique** sur la majorité des produits, jusqu'à **-88% / -94%** sur certains SKUs.

**Cause racine** : une variable GTM (Custom JavaScript) appliquait `value − shipping − tax` sur un `value` déjà HT, soit `HT × 0,84`. Bug propagé silencieusement à Google Ads, Meta CAPI, Microsoft Ads pendant **2+ mois en production** sans alerte d'aucun outil. Diagnostic manuel : ~80h de consultant.

**Ce qu'une probe `revenue_triangulation` aurait fait** : détecter en 24-48h que `GAds_value / Backend_HT ≈ 0,84` constant sur 100% des transactions = signature d'un bug systémique, pas une variation aléatoire.

## 3. Vision fonctionnelle

La probe doit, pour chaque site déclaré dans Probr.io :

1. **S'exécuter périodiquement** (interval configurable, défaut : 24h)
2. **Récupérer 3 datasets** sur la même fenêtre temporelle :
   - Revenue backend (via `MonitoringBatch` existant + `POST /api/ingest/{ingest_key}`)
   - Revenue GA4 (Google Analytics Data API, segmenté par canal)
   - Revenue ad platforms (Google Ads + Meta + Microsoft Ads, segmenté par campagne)
3. **Calculer les ratios attendus** :
   - `backend_HT / GA4_all_sources` — devrait être ~0,85 (selon TVA)
   - `gads_paid_shopping_value / GA4_paid_shopping_value` — devrait être ~1,0
   - `Σ(items.price × qty) / value` au sein des hits — devrait être 1,0
4. **Détecter les anomalies** :
   - Écart de ratio > seuil configurable (défaut : 10%)
   - Tendance dégradée sur 7 jours glissants
   - Apparition de SKUs "zombies" (conversion ad mais pas de commande backend)
   - Chute du match rate Enhanced Conversions
5. **Émettre des alertes** via les canaux déjà câblés : Slack webhook, SMTP, in-app
6. **Stocker l'historique** pour audit a posteriori et comparaisons temporelles

## 4. Architecture cible

### 4.1 Data model

**Phase 1 — Aucune nouvelle table.** Réutilise l'existant :
- `ProbeConfig.config` (JSON) — sources activées, seuils, fenêtre d'évaluation
- `ProbeResult.details` (JSON) — payload structuré avec les 3 valeurs comparées, ratios calculés, anomalies détectées

Schéma indicatif de `ProbeResult.details` :

```json
{
  "window": {"start": "2026-04-21T00:00:00Z", "end": "2026-04-28T00:00:00Z"},
  "sources": {
    "backend": {"revenue": 70019.00, "currency": "EUR", "conversions": 243, "basis": "ht"},
    "ga4":     {"revenue": 82352.00, "currency": "EUR", "conversions": 243, "basis": "ttc"},
    "google_ads": {"revenue": 21390.00, "currency": "EUR", "conversions": 51.58, "segment": "paid_shopping"}
  },
  "ratios": {
    "backend_ht_over_ga4_ttc": 0.850,
    "gads_over_ga4_paid_shopping": 0.842
  },
  "anomalies": [
    {"code": "value_amputated", "severity": "critical", "evidence": "gads/backend = 0.84 constant on 100% of txns", "delta_pct": -15.97}
  ]
}
```

**Phase 2 (différée)** — Si l'historisation pose des problèmes de perf ou de query (ex. graphes 30 jours qui doivent agréger N résultats journaliers), introduire une table dédiée :

```python
class TriangulationSnapshot(Base):
    __tablename__ = "triangulation_snapshots"
    id: UUID
    site_id: UUID FK
    window_start: datetime
    window_end: datetime
    backend_revenue: Decimal
    ga4_revenue: Decimal
    ad_platforms_revenue: dict  # {"google_ads": ..., "meta": ..., "microsoft_ads": ...}
    ratios: dict
    anomaly_codes: list[str]
    captured_at: datetime
```

→ Décision Phase 2 à prendre une fois Phase 1 vivante avec données réelles.

### 4.2 Connecteurs externes

Nouvelle abstraction nécessaire : authentification persistée par site et par plateforme.

```python
class OAuthConnection(Base):
    __tablename__ = "oauth_connections"
    id: UUID
    site_id: UUID FK
    provider: Enum  # "google", "meta", "microsoft"
    scopes: list[str]
    access_token: str (encrypted)
    refresh_token: str (encrypted) | None
    expires_at: datetime | None
    metadata: dict  # account_id, customer_id, ad_account_id selon provider
```

**Providers ciblés** :

| Provider | API | Auth | Scope minimum |
|---|---|---|---|
| GA4 | Google Analytics Data API v1 (`google-analytics-data`) | OAuth Google | `analytics.readonly` |
| Google Ads | Google Ads API v17+ | OAuth Google (scope distinct) | `adwords` |
| Meta Ads | Marketing API | Long-lived user token (60j) | `ads_read` |
| Microsoft Ads | Bing Ads API v13 | OAuth Microsoft | `ads.manage` |

GA4 et Google Ads partagent la même OAuth Google → un seul flow utilisateur peut couvrir les deux. À implémenter au moins pour la phase MVP (Google), puis Meta puis Microsoft Ads.

### 4.3 Probe class

Hérite du contrat `BaseProbe` existant (`probes/base.py`) sans modification de l'ABC.

```python
# backend/app/probes/revenue_triangulation.py

from app.probes.base import BaseProbe, ProbeResultData
from app.models import ProbeStatus

class RevenueTriangulationProbe(BaseProbe):
    """Cross-checks revenue values across backend, GA4 and ad platforms.

    Config options (in probe_config):
        sources: list[str]              # ["backend", "ga4", "google_ads", "meta", "microsoft_ads"]
        window_days: int                # Lookback window, default 7
        warning_threshold_pct: float    # Ratio deviation triggering warning, default 10.0
        critical_threshold_pct: float   # Ratio deviation triggering critical, default 20.0
        expected_ht_ratio: float        # Backend_HT / GA4_TTC expected ratio, default 0.85 (FR std VAT 20%)
        currency: str                   # ISO 4217, default "EUR"
    """

    async def execute(self, site_config: dict, probe_config: dict) -> ProbeResultData:
        # 1. Load 3 datasets in parallel (asyncio.gather)
        # 2. Compute ratios
        # 3. Compare to thresholds
        # 4. Detect zombie SKUs (set difference between ad conversions and backend SKUs)
        # 5. Build details payload + status
        ...
```

Pas de héritage entre probes ni de système de composition à ce stade — le brief évoque "des probes qui se composent" comme piste, mais ça reste une abstraction prématurée. On code la triangulation comme une probe autonome qui appelle directement les APIs nécessaires.

### 4.4 Algorithme de détection d'anomalies

Trois classes d'anomalies à détecter (codes pour le payload `details.anomalies[].code`) :

| Code | Détection | Sévérité par défaut |
|---|---|---|
| `value_amputated` | Ratio source/référence stable et < (1 − threshold) sur N transactions consécutives → bug systémique de calcul de valeur | critical |
| `volume_drop` | Conversions GAds / Backend < (1 − threshold) sur la fenêtre → tag manquant ou container cassé | warning |
| `zombie_sku` | SKU avec conversions ad > 0 mais 0 commande backend dans la fenêtre → produit déréférencé ou attribution rétroactive | warning |
| `enhanced_match_rate_drop` | Match rate Enhanced Conversions < seuil sur GAds → user_data manquant côté tag | warning |
| `currency_mismatch` | Currency reportée ≠ currency configurée site | critical |
| `ratio_drift` | Ratio attendu (ex. backend_ht/ga4_ttc) dérive de plus de threshold sur 7j glissants | warning |

Logique d'évaluation de la sévérité globale du probe result :
- Au moins une anomalie `critical` → `ProbeStatus.CRITICAL`
- Au moins une anomalie `warning` (et aucune critical) → `ProbeStatus.WARNING`
- Aucune anomalie → `ProbeStatus.OK`
- Échec d'appel API ou config manquante → `ProbeStatus.ERROR`

## 5. UX / Frontend

Page dédiée à la probe dans `frontend/src/app/(dashboard)/dashboard/...` (route exacte à définir au moment de l'implémentation), composée de :

- **3 KPI cards en haut** (réutiliser `stats-cards.tsx` ou variante) — Backend / GA4 / Ad Platforms (somme), valeur sur la fenêtre courante
- **Graphe de triangulation 30j** — 3 courbes superposées. Lib à choisir au moment de l'implémentation : **recharts** est probablement le bon défaut (compatible React 19, déclaratif, taille raisonnable). À acter en phase 4.
- **Panneau "Discrepancies"** — liste les anomalies détectées sur la fenêtre, triées par sévérité, avec code + delta + evidence
- **Drill-down par SKU** — modal au clic sur une anomalie de type `zombie_sku` ou `value_amputated`, listant les SKUs incriminés avec liens externes vers GAds / GA4 / backend pour investigation
- **Health badge global** — vert / orange / rouge sur l'état de la triangulation, intégré au `client-status-grid.tsx`

Cohérence design system : dark mode only, glass cards, gradient brand purple→red→orange, icones gradient (`.icon-grad`), Space Grotesk + Inter. Voir `frontend/DESIGN_SYSTEM.md`.

## 6. Roadmap d'implémentation

Découpage en 6 phases successives. Chaque phase produit un livrable testable, indépendamment des suivantes.

### Phase 0 — Spec & cadrage ✅
Cette session. Spec validée, intégrée au repo, référencée depuis `CLAUDE.md`.

### Phase 1 — Probe minimaliste 2-sources (Backend + GA4)
**Objectif** : prouver le concept end-to-end avec le minimum de connecteurs.

Livrables :
- Ajout de `REVENUE_TRIANGULATION = "revenue_triangulation"` dans `ProbeType` enum (`backend/app/models.py`)
- Mirror dans `frontend/src/lib/types.ts`
- Migration Alembic uniquement si l'enum Postgres requiert un `ALTER TYPE` (a priori oui)
- Création `backend/app/probes/revenue_triangulation.py` avec source `backend` (consomme `MonitoringBatch.ecommerce_quality` + montants à pousser depuis le tag listener) et source `ga4` (Google Analytics Data API)
- Détection d'une anomalie : `ratio_drift` sur backend_ht/ga4_ttc
- Pas de frontend dédié à cette phase, juste affichage générique du `ProbeResult` dans le dashboard existant
- Tests d'intégration sur un site de référence (probablement Probr.io lui-même)

Critère d'acceptance : la probe tourne quotidiennement sur un site test, calcule un ratio, émet un `ProbeResult.OK` quand le ratio est nominal et un `WARNING` quand il dérive.

### Phase 2 — Connecteurs OAuth
**Objectif** : permettre aux clients de connecter leurs comptes ad sans intervention manuelle.

Livrables :
- Nouvelle table `oauth_connections` (migration Alembic dédiée)
- Service de chiffrement/déchiffrement des tokens (Fernet ou équivalent, clé via env var)
- Flow OAuth Google (couvre GA4 + GAds)
- Endpoints API : `POST /api/oauth/{provider}/start`, `GET /api/oauth/{provider}/callback`, `GET /api/sites/{id}/connections`, `DELETE /api/oauth/connections/{id}`
- UI minimale : page "Connections" par site avec bouton "Connect Google" / "Disconnect"

Critère d'acceptance : un user peut connecter son compte Google depuis l'UI, le token est stocké chiffré, la probe Phase 1 utilise ce token pour appeler GA4 sans config manuelle.

### Phase 3 — Triangulation 3-sources + détection avancée
**Objectif** : la promesse complète du brief.

Livrables :
- Connecteur Google Ads (auth réutilisée Phase 2)
- Connecteurs Meta (long-lived token) et Microsoft Ads (OAuth distinct)
- Toutes les anomalies du tableau §4.4 implémentées
- Détection SKU zombies (set difference entre `MonitoringBatch.ecommerce_quality.items` et conversions ad par item_id)
- Décision finale sur la table `triangulation_snapshots` (créer ou rester sur `ProbeResult.details`)

Critère d'acceptance : sur un site test avec un bug volontairement introduit (ex. variable GTM qui ampute la valeur de 16%), la probe détecte `value_amputated` en 24-48h et émet une alerte critical.

### Phase 4 — Frontend dédié
**Objectif** : l'UX cible décrite §5.

Livrables :
- Page route dédiée à la probe (route à définir, ex. `/dashboard/sites/[siteId]/triangulation`)
- 3 KPI cards + graphe 30j (recharts à acter)
- Panneau Discrepancies + drill-down SKU
- Health badge intégré dans `client-status-grid`
- Respect du design system

Critère d'acceptance : la page est utilisable en demo, montre des données réelles ou mockées (compléter `demo-data.ts`), respecte le design system (audit par `/design-audit`).

### Phase 5 — Doc utilisateur
**Objectif** : que les clients sachent utiliser la feature.

Livrables :
- `docs/en/monitoring/revenue-triangulation.md` (master)
- `docs/fr/monitoring/revenue-triangulation.md` (traduction)
- Couvre : prérequis, OAuth setup, configuration des seuils, lecture du dashboard, troubleshooting commun
- Mise à jour de `docs/en/administration/probes.md` et son équivalent fr pour mentionner la nouvelle probe

Critère d'acceptance : la doc passe l'import BookStack sans erreur et un lecteur peut configurer la feature de bout en bout sans aide.

## 7. Synergies avec autres probes prévues

Les 6 probes listées dans `CLAUDE.md` ont des liens directs avec `revenue_triangulation` :

- `data_volume` — peut servir de brique de base (compteur d'events GA4) ; à ne pas réimplémenter dans `revenue_triangulation`
- `tag_check` — vérifie la cohérence `value` / `Σ(items.price × qty)` au sein d'un même hit ; complémentaire à la triangulation cross-source
- `gtm_version` — détecter qu'un changement de version GTM coïncide avec un drop de revenue est un signal très fort (corrélation à exploiter)
- `bq_events` — pour les clients ayant l'export BigQuery, source backend alternative plus fiable que `MonitoringBatch`
- `sgtm_infra` — un endpoint sGTM mort cause forcément une chute de revenue côté ad platforms ; corrélation à exploiter

À ce stade on **ne code pas** de système de composition entre probes (abstraction prématurée). Si un pattern récurrent émerge en Phase 3, on le refactorera.

## 8. Open questions

À trancher au fil de l'implémentation, pas bloquantes pour démarrer :

- **Multi-currency** : un site avec plusieurs devises (e-commerce multi-pays) — agréger en une seule devise pivot (laquelle ?) ou produire un payload par devise ?
- **Fenêtre d'attribution** : GAds attribue par date de clic, GA4 par date d'event, le backend par date de commande. Comment aligner ? Fenêtre "loose" tolérante, ou exigence stricte que le client configure ?
- **Cold start** : un site fraîchement onboardé n'a pas 30j de `MonitoringBatch`. Comportement de la probe pendant la période de chauffe ?
- **Jours fériés / soldes** : un drop de revenue le 25 décembre n'est pas une anomalie. Calendrier business à intégrer plus tard ?
- **Lead-gen / SaaS** : le brief mentionne ces extensions (CRM HubSpot/Salesforce, Stripe/Paddle). À traiter comme "Phase 6+" ou comme variante de la Phase 1 ? Probablement variante : la probe est generic sur ses sources, c'est juste le connecteur backend qui change.
- **Privacy / consent** : la triangulation tape des APIs côté serveur, hors enjeu consent côté navigateur. Mais la donnée stockée (revenues + SKUs) est sensible — chiffrement at-rest à valider.

## 9. Liens

- Brief source : `iCloud/1 - PROJETS/Probr.io/probr-io-brief-revenue-triangulation.md`
- `CLAUDE.md` racine — section "Probes" et "Points ouverts"
- `backend/app/probes/base.py` — contrat `BaseProbe`
- `backend/app/probes/http_health.py` — référence d'implémentation
- `backend/app/models.py` — `ProbeType`, `ProbeConfig`, `ProbeResult`, `MonitoringBatch`
- `frontend/src/lib/types.ts` — miroir frontend des enums
- `frontend/DESIGN_SYSTEM.md` — conventions UI
