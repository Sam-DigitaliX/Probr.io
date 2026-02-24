# Authentification API

Toutes les requêtes vers l'API Probr doivent être authentifiées.

## Méthode d'authentification

L'API utilise une authentification par **clé API** transmise dans un header HTTP.

### Header

```
X-Probr-Key: votre_clé_ici
```

### Exemple

```bash
curl -X POST https://api.probr.io/ingest \
  -H "Content-Type: application/json" \
  -H "X-Probr-Key: pk_live_abc123def456" \
  -d '{"container_id": "GTM-XXXXXX", "event_name": "test"}'
```

## Types de clés

| Type | Préfixe | Usage |
|---|---|---|
| **Clé d'ingestion** | `pk_live_` | Envoi de données depuis le tag sGTM |
| **Clé de test** | `pk_test_` | Envoi de données de test (ne pollue pas les dashboards production) |

## Où trouver vos clés

1. Connectez-vous au [dashboard Probr](https://app.probr.io)
2. Allez dans **Sites** > sélectionnez votre site
3. Onglet **Paramètres** > section **Clés API**
4. Copiez la clé souhaitée

## Sécurité

- Les clés sont **scoped par site** : une clé ne peut envoyer des données que pour le site auquel elle est rattachée
- Les clés sont transmises **côté serveur uniquement** (sGTM → Probr API) — elles ne sont jamais exposées dans le navigateur client
- Vous pouvez **révoquer et régénérer** une clé à tout moment depuis le dashboard
- Les requêtes avec une clé invalide ou révoquée reçoivent une réponse `401 Unauthorized`

## Rotation des clés

Pour faire une rotation de clé sans interruption :

1. Générez une nouvelle clé dans le dashboard Probr
2. Mettez à jour la clé dans votre tag GTM
3. Publiez la nouvelle version du conteneur sGTM
4. Attendez que toutes les instances aient la nouvelle version
5. Révoquez l'ancienne clé

> Probr accepte les deux clés (ancienne et nouvelle) pendant une période de grâce de 24h après la révocation.

## Codes de réponse d'authentification

| Code | Signification |
|---|---|
| `200` | Succès |
| `401` | Clé manquante ou invalide |
| `403` | Clé révoquée ou site désactivé |
| `429` | Rate limit dépassé (voir [Limites](./rate-limits.md)) |
