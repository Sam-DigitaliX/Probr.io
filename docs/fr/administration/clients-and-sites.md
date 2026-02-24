# Clients & Sites

## Vue d'ensemble

Probr organise le monitoring dans une hierarchie a deux niveaux :

```
Client → Sites → Probes
```

- Un **Client** represente une entreprise ou un projet
- Un **Site** represente une propriete web specifique appartenant a un client
- Chaque site possede sa propre **cle d'ingestion**, ses **configurations de probes** et ses **parametres d'infrastructure de tracking**

## Clients

### Modele de donnees

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant unique auto-genere |
| `name` | string | Nom du client (requis) |
| `email` | string | Email de contact — utilise pour les notifications d'alerte par email |
| `slack_webhook` | string | URL du webhook Slack specifique au client — reçoit les alertes de ce client |
| `is_active` | bool | Si le client est actif (defaut : `true`) |
| `created_at` | datetime | Timestamp de creation |

### Endpoints API

#### `GET /api/clients`

Lister tous les clients.

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `active_only` | bool | `false` | Ne retourner que les clients actifs |

#### `GET /api/clients/{client_id}`

Obtenir un client par son ID.

#### `POST /api/clients`

Creer un nouveau client.

```json
{
  "name": "Acme Corp",
  "email": "ops@acme.com",
  "slack_webhook": "https://hooks.slack.com/services/T.../B.../xxx"
}
```

#### `PATCH /api/clients/{client_id}`

Mettre a jour un client. N'incluez que les champs a modifier.

```json
{
  "email": "new-ops@acme.com"
}
```

#### `DELETE /api/clients/{client_id}`

Supprimer un client et **tous les sites, probes et alertes associes** (cascade).

## Sites

### Modele de donnees

| Champ | Type | Requis | Description |
|---|---|---|---|
| `id` | UUID | auto | Identifiant unique |
| `client_id` | UUID | oui | Client parent |
| `name` | string | oui | Nom du site (ex. "acme.com - Production") |
| `url` | string | oui | URL principale du site web |
| `ingest_key` | string | auto | Cle auto-generee pour l'authentification du GTM Listener |
| `is_active` | bool | auto | Defaut : `true` |

### Champs d'infrastructure de tracking

Ces champs optionnels configurent quelles probes peuvent s'executer et ce qu'elles surveillent :

| Champ | Type | Utilise par | Description |
|---|---|---|---|
| `sgtm_url` | string | `http_health`, `sgtm_infra` | URL de l'endpoint sGTM |
| `gtm_web_container_id` | string | `gtm_version` | ID du conteneur GTM web (ex. `GTM-XXXXX`) |
| `gtm_server_container_id` | string | `gtm_version` | ID du conteneur GTM server |
| `ga4_property_id` | string | — | ID de propriete GA4 (ex. `123456789`) |
| `ga4_measurement_id` | string | — | ID de mesure GA4 (ex. `G-XXXXXXXX`) |
| `bigquery_project` | string | `bq_events` | ID du projet GCP pour BigQuery |
| `bigquery_dataset` | string | `bq_events` | Nom du dataset BigQuery |
| `stape_container_id` | string | `sgtm_infra` | Identifiant du conteneur Stape |
| `addingwell_container_id` | string | `sgtm_infra` | Identifiant du conteneur Addingwell |
| `cmp_provider` | string | `cmp_check` | Nom du fournisseur CMP (`axeptio`, `didomi`, `cookiebot`, etc.) |

### Endpoints API

#### `GET /api/sites`

Lister tous les sites.

| Parametre | Type | Defaut | Description |
|---|---|---|---|
| `client_id` | UUID | optionnel | Filtrer par client |
| `active_only` | bool | `false` | Ne retourner que les sites actifs |

#### `GET /api/sites/{site_id}`

Obtenir un site par son ID. Retourne l'objet site complet incluant la `ingest_key`.

#### `POST /api/sites`

Creer un nouveau site. La `ingest_key` est auto-generee.

```json
{
  "client_id": "uuid",
  "name": "acme.com - Production",
  "url": "https://acme.com",
  "sgtm_url": "https://sgtm.acme.com",
  "gtm_server_container_id": "GTM-XXXXXX"
}
```

#### `PATCH /api/sites/{site_id}`

Mettre a jour un site. N'incluez que les champs a modifier.

```json
{
  "sgtm_url": "https://new-sgtm.acme.com",
  "stape_container_id": "abc-123"
}
```

#### `DELETE /api/sites/{site_id}`

Supprimer un site et **toutes les probes, alertes et donnees de monitoring associees** (cascade).

## Cles d'ingestion

Chaque site reçoit une **cle d'ingestion** auto-generee a la creation. Cette cle est utilisee par le tag GTM Listener pour authentifier les requetes vers l'endpoint `POST /api/ingest`.

- Les cles sont des tokens URL-safe de 32 octets
- Les cles sont uniques pour tous les sites
- Pour renouveler une cle, supprimez et recreez le site (ou mettez a jour via l'API quand la rotation sera implementee)

La cle d'ingestion est retournee dans la reponse `SiteRead` et doit etre configuree dans le champ "Probr Ingest Key" du tag GTM Listener.
