# Authentification API

## Modele d'authentification

Probr utilise deux mecanismes d'authentification differents selon l'endpoint :

| Groupe d'endpoints | Authentification | Description |
|---|---|---|
| `POST /api/ingest` | Header `X-Probr-Key` | Cle d'ingestion (auto-generee par site) |
| Tous les autres `/api/*` | Aucune (version actuelle) | Securiser via reseau/firewall |
| `GET /health` | Aucune | Health check public |

## Authentification par cle d'ingestion

L'endpoint d'ingestion necessite une cle API transmise via le header HTTP `X-Probr-Key`.

### Header

```
X-Probr-Key: votre_cle_ingestion_ici
```

### Exemple

```bash
curl -X POST https://votre-instance-probr/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-Probr-Key: abc123def456..." \
  -d '{"container_id": "GTM-XXXXXX", "event_name": "page_view", "timestamp_ms": 1708770000000}'
```

## Comment fonctionnent les cles d'ingestion

- Chaque site recoit une cle d'ingestion **auto-generee** a la creation (token URL-safe de 32 octets)
- Les cles sont **scopees par site** : une cle ne peut envoyer des donnees que pour le site auquel elle est rattachee
- Les cles sont transmises **cote serveur uniquement** (sGTM -> API Probr) — jamais exposees dans le navigateur client
- Les cles sont uniques dans toute la base de donnees

## Ou trouver votre cle

La cle d'ingestion est retournee quand vous creez ou recuperez un site via l'API :

```bash
# Recuperer un site (inclut ingest_key dans la reponse)
curl -s https://votre-instance-probr/api/sites/{site_id}
```

La cle se trouve dans le champ `ingest_key` de la reponse. Configurez-la dans le champ "Probr Ingest Key" du tag GTM Listener.

## Rotation des cles

Pour faire une rotation de cle, il faut actuellement supprimer et recreer le site (la cle est auto-generee). Un endpoint dedie de rotation pourra etre ajoute dans une version future.

## Recommandations de securite

1. **Securite au niveau reseau** : Les endpoints de gestion n'ayant pas d'authentification dans la version actuelle, restreignez l'acces a l'API Probr via des regles de firewall, VPN ou authentification par reverse proxy
2. **Ne jamais exposer les cles cote client** : Le tag GTM Listener s'execute cote serveur, les cles ne sont jamais visibles par les utilisateurs finaux
3. **Surveillez l'endpoint `/health`** : Mettez en place un monitoring externe pour detecter si votre instance Probr tombe

## Codes de reponse d'authentification

| Code | Signification |
|---|---|
| `202` | Ingestion acceptee |
| `401` | Cle d'ingestion manquante ou invalide |
| `404` | Site non trouve ou inactif |
