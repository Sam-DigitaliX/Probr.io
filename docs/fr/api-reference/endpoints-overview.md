# Vue d'ensemble de l'API

## URL de base

Tous les endpoints sont relatifs a l'URL de votre instance Probr :

```
https://votre-instance-probr.com/api
```

## Authentification

- **Endpoints d'ingestion** (`/api/ingest`) : authentifies via le header `X-Probr-Key`
- **Endpoints de gestion** : pas d'authentification requise dans la version actuelle (securiser via reseau/firewall)
- **Health check** (`/health`) : public, pas d'authentification

Voir [Authentification](authentication.md) pour les details.

## Tous les endpoints

| Methode | Endpoint | Description | Docs |
|---|---|---|---|
| `GET` | `/health` | Verification de sante | — |
| `POST` | `/api/ingest` | Recevoir les donnees du tag GTM Listener | [Ingest API](ingest-endpoint.md) |
| `POST` | `/api/ingest/flush` | Forcer le vidage du buffer | [Monitoring API](monitoring-api.md) |
| `GET` | `/api/clients` | Lister les clients | [Management API](management-api.md) |
| `GET` | `/api/clients/{id}` | Obtenir un client | [Management API](management-api.md) |
| `POST` | `/api/clients` | Creer un client | [Management API](management-api.md) |
| `PATCH` | `/api/clients/{id}` | Mettre a jour un client | [Management API](management-api.md) |
| `DELETE` | `/api/clients/{id}` | Supprimer un client (cascade) | [Management API](management-api.md) |
| `GET` | `/api/sites` | Lister les sites | [Management API](management-api.md) |
| `GET` | `/api/sites/{id}` | Obtenir un site | [Management API](management-api.md) |
| `POST` | `/api/sites` | Creer un site | [Management API](management-api.md) |
| `PATCH` | `/api/sites/{id}` | Mettre a jour un site | [Management API](management-api.md) |
| `DELETE` | `/api/sites/{id}` | Supprimer un site (cascade) | [Management API](management-api.md) |
| `GET` | `/api/probes` | Lister les probes | [Management API](management-api.md) |
| `POST` | `/api/probes` | Creer une probe | [Management API](management-api.md) |
| `PATCH` | `/api/probes/{id}` | Mettre a jour une probe | [Management API](management-api.md) |
| `DELETE` | `/api/probes/{id}` | Supprimer une probe | [Management API](management-api.md) |
| `POST` | `/api/probes/{id}/run` | Declencher une probe | [Management API](management-api.md) |
| `GET` | `/api/probes/{id}/results` | Historique d'une probe | [Management API](management-api.md) |
| `GET` | `/api/alerts` | Lister les alertes | [Management API](management-api.md) |
| `PATCH` | `/api/alerts/{id}/resolve` | Resoudre une alerte | [Management API](management-api.md) |
| `GET` | `/api/dashboard/overview` | Vue du centre de controle | [Monitoring API](monitoring-api.md) |
| `GET` | `/api/monitoring/sites/{id}/overview` | Apercu de monitoring | [Monitoring API](monitoring-api.md) |
| `GET` | `/api/monitoring/sites/{id}/batches` | Series temporelles | [Monitoring API](monitoring-api.md) |
| `GET` | `/api/monitoring/sites/{id}/tags/{name}` | Sante par tag | [Monitoring API](monitoring-api.md) |

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
