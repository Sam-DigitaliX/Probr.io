# Limites et quotas

## Rate limits

Les limites dépendent de votre plan Probr :

| Plan | Requêtes / seconde | Événements / mois |
|---|---|---|
| **Free** | 10 req/s | 100 000 |
| **Pro** | 100 req/s | 1 000 000 |
| **Business** | 500 req/s | 10 000 000 |
| **Enterprise** | Sur mesure | Sur mesure |

### Comment les limites s'appliquent

- **Requêtes/seconde** : par clé d'ingestion (donc par site)
- **Événements/mois** : total cumulé de tous les événements reçus pour le site
  - En mode per-event : 1 requête = 1 événement
  - En mode batched : 1 requête = N événements (`total_events` dans le payload)

### Dépassement du rate limit

Si le rate limit est dépassé, l'API retourne :

```
HTTP 429 Too Many Requests
```

```json
{
  "error": "rate_limited",
  "retry_after_ms": 1000
}
```

Le tag GTM logguera : `Probr: send failed (429)`

> Les dépassements ponctuels n'entraînent pas de perte de données permanente. Les données du côté du tag ne sont simplement pas renvoyées (mode per-event) ou restent en buffer (mode batched).

### Dépassement du quota mensuel

Quand le quota mensuel est atteint :

- L'API retourne `403` avec `{"error": "quota_exceeded"}`
- Une notification est envoyée par email
- Les données ne sont plus enregistrées jusqu'au renouvellement
- Le tag continue de fonctionner (il log l'erreur mais ne bloque pas l'exécution des autres tags)

## Taille des payloads

| Limite | Valeur |
|---|---|
| Taille maximale du body | 1 MB |
| Nombre max de tags par événement | 500 |

> En pratique, un payload per-event fait ~1-5 KB. Un batch de 200 événements agrégés fait ~10-50 KB.

## Bonnes pratiques

1. **Utilisez le mode batched** si vous approchez des limites de requêtes/seconde
2. **Excluez les tags inutiles** via le champ "Tag IDs to Exclude" pour réduire la taille des payloads
3. **Surveillez votre usage** dans le dashboard Probr > Paramètres > Usage
