# Limites et quotas

## Taille des payloads

| Limite | Valeur |
|---|---|
| Taille maximale du body | 1 MB |
| Nombre max de tags par evenement | 500 |

> En pratique, un payload per-event fait ~1-5 KB. Un batch de 200 evenements agreges fait ~10-50 KB.

## Agregation en memoire

L'endpoint d'ingestion utilise une couche d'agregation en memoire pour minimiser la charge d'ecriture en base de donnees :

- Les evenements sont agreges dans des **fenetres d'1 minute** par site et conteneur
- Le buffer est **vide toutes les 30 secondes** vers la base de donnees
- Seules les fenetres de minute completees sont videes (la minute en cours reste en memoire)
- Vous pouvez forcer un vidage via `POST /api/ingest/flush` (utile pour le debug)

## Comportement des limites

La version self-hosted actuelle de Probr **n'applique pas** de rate limits ni de quotas mensuels. Les performances sont limitees uniquement par les ressources de votre serveur (CPU, memoire, base de donnees).

### Recommandations

Pour garder votre instance performante :

1. **Utilisez le mode batched** pour les sites a fort trafic (>100 evenements/seconde) afin de reduire le nombre de requetes HTTP
2. **Excluez les tags inutiles** via le champ "Tag IDs to Exclude" pour reduire la taille des payloads
3. **Surveillez la taille de la base de donnees** — les batches de monitoring s'accumulent avec le temps ; envisagez de mettre en place une politique de retention (ex. supprimer les batches de plus de 90 jours)
4. **Scalez horizontalement** si necessaire — le buffer d'agregation est par instance, plusieurs instances backend peuvent partager la charge

## Bonnes pratiques

1. **Utilisez le mode batched** si votre site genere de gros volumes d'evenements
2. **Excluez les tags inutiles** via le champ "Tag IDs to Exclude" pour reduire la taille des payloads
3. **Definissez des intervalles de probe adaptes** — 5 minutes (300s) est un bon defaut ; ne descendez pas en dessous de 60s sauf necessite
4. **Surveillez l'endpoint `/health`** de votre instance Probr pour vous assurer qu'elle reste operationnelle
