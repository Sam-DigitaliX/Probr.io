# Reference API complete

## URL de base

Tous les endpoints sont relatifs a l'URL de votre instance Probr :

```
https://votre-instance-probr.com/api
```

## Authentification

- **Endpoints d'ingestion** (`/api/ingest`) : authentifies via le header `X-Probr-Key`
- **Endpoints de gestion** : pas d'authentification requise dans la version actuelle (securiser via reseau/firewall)
- **Health check** (`/health`) : public, pas d'authentification

## Vue d'ensemble des endpoints

### Sante

| Methode | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Verification de sante de l'application |

### Ingestion

| Methode | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ingest` | Recevoir les donnees de monitoring du tag GTM Listener |
| `POST` | `/api/ingest/flush` | Forcer le vidage du buffer d'agregation en memoire |

Voir [POST /ingest](ingest-endpoint.md) pour la documentation detaillee du payload.

### Clients

| Methode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/clients` | Lister tous les clients |
| `GET` | `/api/clients/{id}` | Obtenir un client |
| `POST` | `/api/clients` | Creer un client |
| `PATCH` | `/api/clients/{id}` | Mettre a jour un client |
| `DELETE` | `/api/clients/{id}` | Supprimer un client (cascade) |

Voir [Clients & Sites](../administration/clients-and-sites.md) pour les details.

### Sites

| Methode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sites` | Lister tous les sites |
| `GET` | `/api/sites/{id}` | Obtenir un site |
| `POST` | `/api/sites` | Creer un site |
| `PATCH` | `/api/sites/{id}` | Mettre a jour un site |
| `DELETE` | `/api/sites/{id}` | Supprimer un site (cascade) |

Voir [Clients & Sites](../administration/clients-and-sites.md) pour les details.

### Probes

| Methode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/probes` | Lister les configurations de probes |
| `POST` | `/api/probes` | Creer une probe |
| `PATCH` | `/api/probes/{id}` | Mettre a jour une probe |
| `DELETE` | `/api/probes/{id}` | Supprimer une probe |
| `POST` | `/api/probes/{id}/run` | Declencher manuellement une probe |
| `GET` | `/api/probes/{id}/results` | Obtenir l'historique d'execution d'une probe |

Voir [Gestion des probes](../administration/probes.md) pour les details.

### Alertes

| Methode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/alerts` | Lister les alertes (filtrable) |
| `PATCH` | `/api/alerts/{id}/resolve` | Resoudre manuellement une alerte |

Voir [Gestion des alertes](../monitoring/alerts.md) pour les details.

### Dashboard

| Methode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/overview` | Vue complete du centre de controle |

Voir [Dashboard & Control Room](../monitoring/dashboard.md) pour les details.

### Monitoring

| Methode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/monitoring/sites/{id}/overview` | Aperçu de monitoring agrege |
| `GET` | `/api/monitoring/sites/{id}/batches` | Donnees brutes en series temporelles |
| `GET` | `/api/monitoring/sites/{id}/tags/{name}` | Metriques de sante par tag |

Voir [Monitoring Analytics](../monitoring/analytics.md) pour les details.

## Codes de reponse courants

| Code | Signification |
|---|---|
| `200` | Succes |
| `201` | Ressource creee |
| `202` | Accepte (ingestion) |
| `204` | Supprime (pas de contenu) |
| `401` | Cle d'ingestion invalide |
| `404` | Ressource non trouvee |
| `422` | Erreur de validation (corps de requete invalide) |

## Types de donnees

Tous les IDs sont des **UUIDs** (v4). Tous les timestamps sont en **ISO 8601** avec timezone (`UTC`). Les corps de requete et reponse utilisent **JSON**.
