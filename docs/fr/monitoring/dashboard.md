# Dashboard & Control Room

## Vue d'ensemble

Le dashboard Probr offre un centre de controle centralise pour surveiller l'etat de sante de tous vos clients, sites et probes en temps reel. L'endpoint principal retourne une vue hierarchique :

```
Client → Sites → Probes → Derniers resultats
```

Chaque niveau agrege le statut de ses enfants selon un systeme de **priorite au pire statut**.

## Hierarchie des statuts

Probr utilise quatre niveaux de statut, du plus grave au moins grave :

| Statut | Priorite | Signification |
|---|---|---|
| `critical` | Maximale | Une probe a detecte une panne majeure |
| `error` | Haute | L'execution de la probe a elle-meme echoue |
| `warning` | Moyenne | Un seuil a ete depasse |
| `ok` | Normale | Tout fonctionne correctement |

Le statut global d'un site est le **pire** statut parmi ses probes actives. Le statut global d'un client est le **pire** statut parmi ses sites actifs.

## Endpoint API

### `GET /api/dashboard/overview`

Retourne la vue complete du centre de controle avec tous les clients actifs, leurs sites, les statuts des probes et les alertes recentes.

**Schema de reponse :**

```json
{
  "total_clients": 3,
  "total_sites": 8,
  "total_ok": 6,
  "total_warning": 1,
  "total_critical": 1,
  "clients": [
    {
      "client_id": "uuid",
      "client_name": "Acme Corp",
      "overall_status": "warning",
      "total_sites": 2,
      "sites_ok": 1,
      "sites_warning": 1,
      "sites_critical": 0,
      "active_alerts": 1,
      "sites": [
        {
          "site_id": "uuid",
          "site_name": "acme.com - Production",
          "site_url": "https://acme.com",
          "overall_status": "ok",
          "probes": [
            {
              "probe_type": "http_health",
              "status": "ok",
              "message": "HTTP 200 in 142ms",
              "last_check": "2025-02-24T10:30:00Z",
              "response_time_ms": 142.5
            }
          ],
          "active_alerts": 0
        }
      ]
    }
  ],
  "recent_alerts": [
    {
      "id": "uuid",
      "site_id": "uuid",
      "probe_config_id": "uuid",
      "severity": "warning",
      "probe_type": "http_health",
      "title": "[WARNING] http_health — staging.acme.com",
      "message": "HTTP 503 — Service Unavailable",
      "is_resolved": false,
      "resolved_at": null,
      "notified_at": "2025-02-24T10:31:00Z",
      "created_at": "2025-02-24T10:30:00Z"
    }
  ]
}
```

### Champs de la reponse

| Champ | Type | Description |
|---|---|---|
| `total_clients` | int | Nombre de clients actifs |
| `total_sites` | int | Nombre de sites actifs tous clients confondus |
| `total_ok` / `total_warning` / `total_critical` | int | Nombre de sites par statut |
| `clients[]` | array | Liste des aperçus clients |
| `clients[].sites[]` | array | Liste des aperçus sites pour ce client |
| `clients[].sites[].probes[]` | array | Dernier resultat pour chaque probe active |
| `recent_alerts` | array | 20 dernieres alertes (resolues et non resolues) |

## Fonctionnement

1. L'endpoint charge tous les **clients actifs** avec leurs sites et configurations de probes
2. Pour chaque probe active, il recupere le **dernier resultat** en base de donnees
3. Il compte les **alertes non resolues** par site
4. Il calcule les **statuts agreges** de bas en haut (probe → site → client)
5. Il retourne les **20 dernieres alertes** tous sites confondus

## Cas d'usage

- **Monitoring en un coup d'oeil** : voir quels clients/sites necessitent une attention
- **Investigation** : identifier quelle probe specifique a declenche un probleme
- **Flux d'alertes** : consulter les alertes recentes et leur statut de resolution
- **Reporting SLA** : suivre la disponibilite sur l'ensemble de votre portefeuille client
