# Introduction

Probr est une plateforme de monitoring pour le tracking server-side (sGTM). Elle analyse en temps réel la qualité de votre implémentation Google Tag Manager côté serveur, indépendamment de votre hébergeur.

## Le problème

Votre conteneur sGTM traite des milliers d'événements par jour. Mais comment savoir si :

- Vos tags se déclenchent correctement ?
- Les données utilisateur (enhanced conversions) sont bien transmises ?
- Les paramètres e-commerce sont complets sur vos conversions ?
- Un tag a commencé à échouer silencieusement après une mise à jour ?

Sans outil de monitoring dédié, vous volez à l'aveugle.

## La solution Probr

Probr installe un **tag listener** dans votre conteneur sGTM qui observe tous les événements et résultats d'exécution des tags, puis envoie ces données à votre dashboard Probr.

### Ce que Probr monitore

| Métrique | Description |
|---|---|
| **Santé des tags** | Taux de succès, échecs, timeouts et exceptions par tag |
| **Temps d'exécution** | Durée d'exécution de chaque tag (en ms) |
| **Volume d'événements** | Nombre d'événements par type (page_view, purchase, etc.) |
| **Qualité des données utilisateur** | Présence des champs enhanced conversions : email, téléphone, adresse |
| **Qualité e-commerce** | Présence de value, currency, transaction_id, items sur les événements de conversion |

### Compatible avec tous les hébergeurs

Probr fonctionne avec **n'importe quel hébergeur sGTM** :

- Stape
- Addingwell
- Google Cloud Run (self-hosted)
- AWS / Azure / autre cloud
- Tout autre setup sGTM

## Architecture

```
Navigateur
    │
    ▼
Conteneur sGTM ──────► Tags (GA4, Meta, TikTok, etc.)
    │                        │
    │                        ▼
    │               addEventCallback
    │                        │
    │                        ▼
    │               Probr Listener Tag
    │                        │
    │                        ▼
    │               POST → Probr API
    │                        │
    │                        ▼
    └──────────────► Probr Dashboard
                    (monitoring temps réel)
```

## Prochaine étape

Suivez le guide [Prérequis et installation](./prerequisites.md) pour commencer.
