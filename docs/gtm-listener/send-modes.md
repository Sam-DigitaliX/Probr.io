# Modes d'envoi

Le tag Probr Listener supporte deux modes d'envoi des données vers l'API.

## Per Event (recommandé)

**Un appel HTTP par événement.**

```
Événement page_view  →  POST /ingest  →  Probr API
Événement purchase   →  POST /ingest  →  Probr API
Événement add_to_cart →  POST /ingest  →  Probr API
```

### Avantages

- **Temps réel** : chaque événement apparaît immédiatement dans le dashboard
- **Aucune perte de données** : pas de buffer en mémoire, donc aucun risque de perte si l'instance sGTM redémarre
- **Simplicité** : pas de configuration supplémentaire

### Inconvénients

- **Plus de requêtes HTTP** : une requête par événement. Sur un site à très fort trafic (>100k événements/heure), cela génère un volume de requêtes significatif
- **Latence réseau** : chaque requête a sa propre latence (bien que le tag soit non-bloquant)

### Quand l'utiliser

- Sites à trafic faible à moyen (<100k événements/heure)
- Quand le monitoring temps réel est prioritaire
- En phase de debug ou de mise en place initiale
- En cas de doute : **commencez par ce mode**

### Payload envoyé

```json
{
  "container_id": "GTM-XXXXXX",
  "event_name": "purchase",
  "timestamp_ms": 1708790400000,
  "tags": [
    {
      "id": "15",
      "name": "GA4 - Event",
      "status": "success",
      "execution_time": 120
    },
    {
      "id": "22",
      "name": "Meta CAPI",
      "status": "success",
      "execution_time": 350
    }
  ],
  "user_data": {
    "has_email": true,
    "has_phone": false,
    "has_first_name": true,
    "has_last_name": true,
    "has_city": false,
    "has_country": true
  },
  "ecommerce": {
    "has_value": true,
    "has_currency": true,
    "has_transaction_id": true,
    "has_items": true
  }
}
```

---

## Batched (trafic élevé)

**Accumule N événements en mémoire, puis envoie un résumé agrégé.**

```
Événement 1  ─┐
Événement 2  ─┤
...           ─┤── Buffer (templateDataStorage)
Événement 49 ─┤
Événement 50 ─┘──► POST /ingest (batch agrégé) → Probr API
```

### Avantages

- **Moins de requêtes HTTP** : un seul appel pour N événements
- **Charge réseau réduite** : adapté aux sites à très fort trafic
- **Payload optimisé** : les données sont agrégées (compteurs), pas les événements bruts

### Inconvénients

- **Pas temps réel** : les données apparaissent dans le dashboard par fenêtres (tous les N événements)
- **Risque de perte** : si l'instance sGTM est terminée avant le flush du buffer, les événements en attente sont perdus
- **Buffer par instance** : chaque instance Cloud Run maintient son propre buffer indépendant

### Quand l'utiliser

- Sites à très fort trafic (>100k événements/heure)
- Quand la réduction de charge réseau est prioritaire sur le temps réel
- Environnements stables avec peu de redémarrages d'instances

### Configuration du batch

| Paramètre | Description | Par défaut |
|---|---|---|
| **Batch Size** | Nombre d'événements avant envoi | 50 |

**Recommandations de taille de batch :**

| Trafic | Batch size recommandé |
|---|---|
| 100k - 500k événements/heure | 50 (défaut) |
| 500k - 1M événements/heure | 100 |
| >1M événements/heure | 200 |

> Ne dépassez pas 500 : le risque de perte de données en cas de redémarrage augmente avec la taille du buffer.

### Payload envoyé (batch agrégé)

```json
{
  "container_id": "GTM-XXXXXX",
  "batch": true,
  "window_start_ms": 1708790400000,
  "window_end_ms": 1708790460000,
  "total_events": 50,
  "event_counts": {
    "page_view": 32,
    "purchase": 5,
    "add_to_cart": 8,
    "begin_checkout": 3,
    "view_item": 2
  },
  "tag_metrics": {
    "GA4 - Event": {
      "success": 48,
      "failure": 2,
      "timeout": 0,
      "exception": 0,
      "total_exec_ms": 6240,
      "count": 50
    },
    "Meta CAPI": {
      "success": 45,
      "failure": 3,
      "timeout": 2,
      "exception": 0,
      "total_exec_ms": 17500,
      "count": 50
    }
  },
  "user_data_quality": {
    "email": 42,
    "phone": 15,
    "address": 38,
    "total": 50
  },
  "ecommerce_quality": {
    "value": 5,
    "currency": 5,
    "transaction_id": 4,
    "items": 5,
    "total": 5
  }
}
```

### Comment lire les métriques agrégées

- **tag_metrics** : pour calculer le taux de succès d'un tag, divisez `success` par `count`
  - Exemple : Meta CAPI → 45/50 = **90% de succès**
  - Temps moyen d'exécution : `total_exec_ms / count` → 17500/50 = **350ms**

- **user_data_quality** : pour calculer le taux de présence email, divisez `email` par `total`
  - Exemple : 42/50 = **84% des événements ont un email**

- **ecommerce_quality** : même logique, rapporté aux événements e-commerce uniquement
  - Exemple : `transaction_id` 4/5 = **80% des achats ont un transaction_id**

---

## Comparatif

| Critère | Per Event | Batched |
|---|---|---|
| Temps réel | Oui | Non (par fenêtres) |
| Requêtes HTTP | 1 par événement | 1 par N événements |
| Perte de données possible | Non | Oui (si restart) |
| Configuration | Aucune | Batch size |
| Recommandé pour | La majorité des sites | Sites à très fort trafic |
