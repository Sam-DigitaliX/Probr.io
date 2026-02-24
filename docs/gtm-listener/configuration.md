# Configuration du GTM Listener

Ce guide détaille toutes les options de configuration du tag **Probr — Server-Side Listener**.

## Paramètres du tag

### Probr Ingest Endpoint

| Propriété | Valeur |
|---|---|
| **Type** | URL (texte) |
| **Obligatoire** | Oui |
| **Validation** | Doit commencer par `https://` |

L'URL de l'API d'ingestion Probr vers laquelle les données de monitoring sont envoyées.

**Valeurs possibles :**

- **Probr Cloud** : `https://api.probr.io/ingest`
- **Self-hosted** : `https://votre-instance.example.com/api/ingest`

### Probr Ingest Key

| Propriété | Valeur |
|---|---|
| **Type** | Texte |
| **Obligatoire** | Oui |

La clé d'authentification pour votre site. Chaque site dans Probr possède sa propre clé.

**Où la trouver** : Dashboard Probr > Sites > votre site > Paramètres > Clé d'ingestion

> **Sécurité** : cette clé est envoyée côté serveur uniquement (sGTM → Probr API). Elle n'est jamais exposée côté client.

### Track user data quality

| Propriété | Valeur |
|---|---|
| **Type** | Checkbox |
| **Par défaut** | Activé |

Quand activé, le tag vérifie la **présence** (pas le contenu) des champs de données utilisateur dans l'objet `user_data` de l'événement :

| Champ vérifié | Chemin dans l'événement |
|---|---|
| Email | `user_data.email_address` |
| Téléphone | `user_data.phone_number` |
| Prénom | `user_data.address.first_name` |
| Nom | `user_data.address.last_name` |
| Ville | `user_data.address.city` |
| Pays | `user_data.address.country` |

> **Important** : Probr ne collecte **aucune donnée personnelle**. Il vérifie uniquement si les champs sont renseignés (`true`/`false`), jamais leur valeur.

### Tag IDs to Exclude

| Propriété | Valeur |
|---|---|
| **Type** | Texte |
| **Par défaut** | Vide |

Liste d'IDs de tags séparés par des virgules. Ces tags seront ignorés dans le monitoring.

**Usage principal** : exclure le tag Probr lui-même pour éviter une boucle.

**Exemple** : `42` ou `42, 58, 103`

### Send Mode

| Propriété | Valeur |
|---|---|
| **Type** | Liste déroulante |
| **Par défaut** | Per event |

Voir la section détaillée [Modes d'envoi](./send-modes.md).

### Batch Size

| Propriété | Valeur |
|---|---|
| **Type** | Nombre |
| **Par défaut** | 50 |
| **Visible si** | Send Mode = Batched |

Le nombre d'événements à accumuler avant d'envoyer un batch. Voir [Modes d'envoi](./send-modes.md).

## Données collectées automatiquement

En plus des paramètres configurables, le tag collecte automatiquement :

### Informations du conteneur

| Donnée | Source | Description |
|---|---|---|
| `container_id` | `getContainerVersion()` | ID unique du conteneur sGTM |
| `timestamp_ms` | `getTimestampMillis()` | Horodatage de l'événement en millisecondes |

### Résultats d'exécution des tags

Pour chaque tag qui s'exécute lors d'un événement :

| Donnée | Description |
|---|---|
| `id` | ID numérique du tag dans GTM |
| `name` | Nom du tag (si les métadonnées sont configurées) |
| `status` | `success`, `failure`, `timeout`, ou `exception` |
| `execution_time` | Durée d'exécution en millisecondes |

### Qualité e-commerce

Sur les événements `purchase`, `begin_checkout`, `add_to_cart`, et `add_payment_info`, le tag vérifie la présence de :

| Champ | Chemin dans l'événement |
|---|---|
| Valeur | `value` |
| Devise | `currency` |
| ID transaction | `transaction_id` |
| Articles | `items` |

## Permissions requises

Le tag nécessite les permissions server-side suivantes :

| Permission | Usage |
|---|---|
| **send_http** | Envoyer les données à l'API Probr |
| **read_event_data** | Lire le nom d'événement, user_data, et les paramètres e-commerce |
| **access_template_storage** | Stocker le buffer en mode batched |
| **read_container_data** | Lire l'ID du conteneur |
| **logging** | Logs de debug en mode Preview |

Ces permissions sont déclarées dans le template et validées par Google lors de la revue Gallery.
