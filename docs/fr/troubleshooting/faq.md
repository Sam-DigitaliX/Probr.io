# FAQ

## Questions générales

### Probr collecte-t-il des données personnelles ?

**Non.** Probr ne collecte aucune donnée personnelle (PII). Le tag vérifie uniquement la **présence** des champs (true/false), jamais leur contenu. Aucun email, numéro de téléphone ou adresse n'est transmis à Probr.

### Probr est-il compatible RGPD ?

Oui. Probr ne traite aucune donnée personnelle des visiteurs de votre site. Il analyse uniquement des métadonnées techniques (noms d'événements, statuts de tags, compteurs de présence de champs). Aucun consentement visiteur n'est nécessaire pour le fonctionnement de Probr.

### Probr fonctionne-t-il avec tous les hébergeurs sGTM ?

Oui. Probr est agnostique de l'hébergeur. Il fonctionne avec :
- **Stape** (cloud et on-premise)
- **Addingwell**
- **Google Cloud Run** (self-hosted)
- **AWS** (ECS, Fargate, EC2)
- **Azure** (Container Apps, ACI)
- Tout autre hébergement compatible sGTM

### Probr fonctionne-t-il avec GTM client-side ?

Non. Le tag Probr Listener est conçu exclusivement pour les conteneurs **server-side**. Il utilise des API sandboxed server-side (`addEventCallback`, `sendHttpRequest`, `templateDataStorage`) qui ne sont pas disponibles client-side.

### Combien de sites puis-je monitorer ?

Cela dépend de votre plan :

| Plan | Nombre de sites |
|---|---|
| Free | 1 |
| Pro | 5 |
| Business | 20 |
| Enterprise | Illimité |

---

## Questions techniques

### Le tag Probr impacte-t-il les performances de mon conteneur ?

Non. Le tag :
1. Appelle `data.gtmOnSuccess()` immédiatement (non-bloquant)
2. Envoie les données dans le callback `addEventCallback` qui s'exécute après le traitement de l'événement
3. N'ajoute aucune latence à la réponse HTTP du conteneur vers le navigateur

### Puis-je utiliser Probr avec plusieurs conteneurs ?

Oui. Chaque conteneur sGTM aura son propre tag Probr Listener avec la même clé d'ingestion (si c'est le même site) ou des clés différentes (si ce sont des sites différents). Le dashboard Probr distingue les conteneurs par leur `container_id`.

### Que se passe-t-il si l'API Probr est indisponible ?

Le tag log un message d'erreur dans la console sGTM (`Probr: send failed`) mais **ne bloque jamais** l'exécution des autres tags. Votre tracking continue de fonctionner normalement. Les données pendant l'indisponibilité sont simplement perdues (non renvoyées).

### Puis-je envoyer des données à un endpoint self-hosted ?

Oui. Si vous hébergez votre propre instance Probr, configurez l'URL de votre endpoint dans le champ "Probr Ingest Endpoint" du tag. L'API doit respecter le même format de payload et de réponse (voir [API Reference](../api-reference/ingest-endpoint.md)).

### Comment fonctionne le stockage en mode batched ?

Le tag utilise `templateDataStorage`, une API GTM server-side qui stocke des données en mémoire au niveau de l'instance. Points clés :
- **Pas de persistance** : les données sont perdues si l'instance redémarre
- **Par instance** : chaque instance Cloud Run a son propre buffer
- **Pas de limite de taille** explicite, mais Google recommande de garder les objets stockés raisonnablement petits

### Puis-je utiliser une variable GTM pour l'endpoint ou la clé ?

Oui. Les champs "Probr Ingest Endpoint" et "Probr Ingest Key" acceptent des variables GTM. Vous pouvez par exemple utiliser une variable d'environnement pour différencier production et staging :
- Production : `pk_live_xxx`
- Staging : `pk_test_xxx`

---

## Questions sur le dashboard

### À quelle fréquence le dashboard est-il mis à jour ?

- **Mode per-event** : quasi temps réel (quelques secondes de latence)
- **Mode batched** : à chaque flush de batch (dépend de la taille du batch et du volume de trafic)

### Puis-je configurer des alertes ?

Oui. Dans le dashboard Probr > **Alertes**, vous pouvez configurer des notifications par email ou webhook quand :
- Un tag passe en dessous d'un seuil de succès (ex. <95%)
- Le taux de présence email chute (ex. <50%)
- Le volume d'événements baisse de manière anormale (détection d'anomalie)
- Un tag commence à timeout régulièrement

### Combien de temps les données sont-elles conservées ?

| Plan | Rétention |
|---|---|
| Free | 7 jours |
| Pro | 30 jours |
| Business | 90 jours |
| Enterprise | Sur mesure (jusqu'à 1 an) |
