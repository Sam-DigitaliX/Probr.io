# API de gestion

Cette page documente tous les endpoints CRUD pour gerer les clients, sites, probes et alertes.

## Clients

### `GET /api/clients`

Lister tous les clients.

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `active_only` | bool | `false` | Ne retourner que les clients actifs |

**Reponse :** `200` — Tableau d'objets client.

```json
[
  {
    "id": "uuid",
    "name": "Acme Corp",
    "email": "ops@acme.com",
    "slack_webhook": "https://hooks.slack.com/services/...",
    "is_active": true,
    "created_at": "2025-02-24T10:00:00Z"
  }
]
```

### `GET /api/clients/{client_id}`

Obtenir un client par son ID.

**Reponse :** `200` — Objet client. `404` si non trouve.

### `POST /api/clients`

Creer un nouveau client.

**Corps de la requete :**

```json
{
  "name": "Acme Corp",
  "email": "ops@acme.com",
  "slack_webhook": "https://hooks.slack.com/services/T.../B.../xxx"
}
```

| Champ | Type | Requis | Description |
|---|---|---|---|
| `name` | string | oui | Nom du client |
| `email` | string | non | Email de contact (utilise pour les notifications d'alertes) |
| `slack_webhook` | string | non | URL du webhook Slack specifique au client |

**Reponse :** `201` — Objet client cree.

### `PATCH /api/clients/{client_id}`

Mettre a jour un client. N'incluez que les champs a modifier.

```json
{ "email": "new-ops@acme.com", "is_active": false }
```

**Reponse :** `200` — Objet client mis a jour.

### `DELETE /api/clients/{client_id}`

Supprimer un client. **Cascade** vers tous les sites, probes, alertes et donnees de monitoring associes.

**Reponse :** `204` — Pas de contenu.

---

## Sites

### `GET /api/sites`

Lister tous les sites.

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `client_id` | UUID | optionnel | Filtrer par client |
| `active_only` | bool | `false` | Ne retourner que les sites actifs |

**Reponse :** `200` — Tableau d'objets site.

### `GET /api/sites/{site_id}`

Obtenir un site par son ID. Retourne l'objet site complet incluant la `ingest_key`.

**Reponse :** `200` — Objet site. `404` si non trouve.

```json
{
  "id": "uuid",
  "client_id": "uuid",
  "name": "acme.com - Production",
  "url": "https://acme.com",
  "sgtm_url": "https://sgtm.acme.com",
  "gtm_web_container_id": "GTM-XXXXX",
  "gtm_server_container_id": "GTM-YYYYYY",
  "ga4_property_id": "123456789",
  "ga4_measurement_id": "G-XXXXXXXX",
  "bigquery_project": null,
  "bigquery_dataset": null,
  "stape_container_id": null,
  "addingwell_container_id": null,
  "cmp_provider": null,
  "ingest_key": "abc123def456...",
  "is_active": true,
  "created_at": "2025-02-24T10:00:00Z"
}
```

### `POST /api/sites`

Creer un nouveau site. La `ingest_key` est auto-generee.

**Corps de la requete :**

```json
{
  "client_id": "uuid",
  "name": "acme.com - Production",
  "url": "https://acme.com",
  "sgtm_url": "https://sgtm.acme.com",
  "gtm_server_container_id": "GTM-XXXXXX"
}
```

| Champ | Type | Requis | Description |
|---|---|---|---|
| `client_id` | UUID | oui | ID du client parent |
| `name` | string | oui | Nom du site |
| `url` | string | oui | URL principale |
| `sgtm_url` | string | non | URL de l'endpoint sGTM |
| `gtm_web_container_id` | string | non | ID du conteneur GTM web |
| `gtm_server_container_id` | string | non | ID du conteneur GTM serveur |
| `ga4_property_id` | string | non | ID de propriete GA4 |
| `ga4_measurement_id` | string | non | ID de mesure GA4 |
| `bigquery_project` | string | non | Projet GCP pour BigQuery |
| `bigquery_dataset` | string | non | Nom du dataset BigQuery |
| `stape_container_id` | string | non | ID du conteneur Stape |
| `addingwell_container_id` | string | non | ID du conteneur Addingwell |
| `cmp_provider` | string | non | Fournisseur CMP (`axeptio`, `didomi`, `cookiebot`, etc.) |

**Reponse :** `201` — Objet site cree (inclut `ingest_key`).

### `PATCH /api/sites/{site_id}`

Mettre a jour un site. N'incluez que les champs a modifier.

**Reponse :** `200` — Objet site mis a jour.

### `DELETE /api/sites/{site_id}`

Supprimer un site. **Cascade** vers toutes les probes, alertes et donnees de monitoring associes.

**Reponse :** `204` — Pas de contenu.

---

## Probes

### `GET /api/probes`

Lister toutes les configurations de probes.

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `site_id` | UUID | optionnel | Filtrer par site |
| `active_only` | bool | `false` | Ne retourner que les probes actives |

**Reponse :** `200` — Tableau d'objets de configuration de probes.

### `POST /api/probes`

Creer une nouvelle configuration de probe.

**Corps de la requete :**

```json
{
  "site_id": "uuid",
  "probe_type": "http_health",
  "config": {},
  "interval_seconds": 300,
  "is_active": true
}
```

| Champ | Type | Requis | Defaut | Description |
|---|---|---|---|---|
| `site_id` | UUID | oui | — | Site cible |
| `probe_type` | string | oui | — | `http_health`, `sgtm_infra`, `gtm_version`, `data_volume`, `bq_events`, `tag_check`, `cmp_check` |
| `config` | object | non | `{}` | Parametres specifiques a la probe |
| `interval_seconds` | int | non | `300` | Intervalle d'execution en secondes |
| `is_active` | bool | non | `true` | Activer la planification immediatement |

**Reponse :** `201` — Objet de configuration de probe cree.

### `PATCH /api/probes/{probe_id}`

Mettre a jour une probe. Les modifications de `interval_seconds` ou `is_active` mettent immediatement a jour le planificateur.

```json
{ "interval_seconds": 60, "is_active": true }
```

**Reponse :** `200` — Objet de configuration de probe mis a jour.

### `DELETE /api/probes/{probe_id}`

Supprimer une probe et la retirer du planificateur.

**Reponse :** `204` — Pas de contenu.

### `POST /api/probes/{probe_id}/run`

Declencher manuellement l'execution d'une probe et retourner le resultat.

**Reponse :** `200` — Objet resultat de probe.

```json
{
  "id": "uuid",
  "probe_config_id": "uuid",
  "status": "ok",
  "response_time_ms": 142.5,
  "message": "HTTP 200 in 142ms",
  "details": null,
  "executed_at": "2025-02-24T10:30:00Z"
}
```

### `GET /api/probes/{probe_id}/results`

Obtenir l'historique des resultats d'une probe.

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `limit` | int | `50` | Nombre maximum de resultats a retourner |

**Reponse :** `200` — Tableau de resultats de probe (les plus recents en premier).

---

## Alertes

### `GET /api/alerts`

Lister les alertes avec filtrage optionnel.

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `site_id` | UUID | optionnel | Filtrer par site |
| `resolved` | bool | optionnel | Filtrer par statut de resolution |
| `limit` | int | `100` | Nombre maximum d'alertes a retourner |

**Reponse :** `200` — Tableau d'objets alerte.

```json
[
  {
    "id": "uuid",
    "site_id": "uuid",
    "probe_config_id": "uuid",
    "severity": "critical",
    "probe_type": "http_health",
    "title": "[CRITICAL] http_health — acme.com",
    "message": "Connection timeout after 10000ms",
    "is_resolved": false,
    "resolved_at": null,
    "notified_at": "2025-02-24T10:31:00Z",
    "created_at": "2025-02-24T10:30:00Z"
  }
]
```

### `PATCH /api/alerts/{alert_id}/resolve`

Resoudre manuellement une alerte. Definit `is_resolved: true` et `resolved_at` a l'heure actuelle.

**Reponse :** `200` — Objet alerte mis a jour.
