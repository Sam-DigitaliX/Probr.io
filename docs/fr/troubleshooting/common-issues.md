# Problèmes courants

## Le tag ne se déclenche pas

### Symptôme
Le tag Probr Listener n'apparaît pas dans le mode Preview de GTM, ou apparaît avec le statut "Not Fired".

### Causes et solutions

| Cause | Solution |
|---|---|
| **Trigger manquant** | Vérifiez que le trigger "All Events" (ou votre trigger custom) est bien attaché au tag |
| **Tag en pause** | Vérifiez que le tag n'est pas en pause dans GTM |
| **Version non publiée** | Publiez une nouvelle version du conteneur |
| **Conteneur client-side** | Le tag est conçu pour un conteneur **server-side** uniquement. Vérifiez que vous êtes dans le bon conteneur |

---

## Le tag se déclenche mais aucune donnée dans Probr

### Symptôme
En mode Preview, le tag montre "Succeeded" mais aucune donnée n'apparaît dans le dashboard Probr.

### Vérifications

1. **Endpoint correct ?**
   - Vérifiez l'URL dans la configuration du tag
   - Testez avec curl :
   ```bash
   curl -X POST https://api.probr.io/ingest \
     -H "Content-Type: application/json" \
     -H "X-Probr-Key: VOTRE_CLÉ" \
     -d '{"container_id":"test","event_name":"test","timestamp_ms":0,"tags":[]}'
   ```
   - Vous devriez recevoir `{"status": "ok"}`

2. **Clé API correcte ?**
   - Vérifiez que la clé correspond bien au site dans le dashboard Probr
   - Vérifiez qu'elle n'a pas été révoquée

3. **Firewall / réseau ?**
   - Si votre sGTM est derrière un firewall, vérifiez que les requêtes sortantes vers `api.probr.io` (port 443) sont autorisées

4. **Mode Preview vs Production**
   - Le mode Preview de GTM peut parfois avoir un comportement différent de la production
   - Vérifiez aussi en production (attendez quelques minutes après publication)

---

## Erreur "send failed (4xx)" dans la console

### 401 — Unauthorized
La clé API est manquante ou invalide.

**Solution** : vérifiez le champ "Probr Ingest Key" dans la configuration du tag.

### 403 — Forbidden
La clé a été révoquée ou le site est désactivé.

**Solution** : allez dans le dashboard Probr > Sites > vérifiez le statut du site et de la clé.

### 429 — Rate Limited
Vous dépassez la limite de requêtes par seconde de votre plan.

**Solutions** :
- Passez en mode **batched** pour réduire le nombre de requêtes
- Augmentez votre plan Probr
- Vérifiez que vous n'avez pas plusieurs tags Probr qui se déclenchent sur le même événement

---

## Les noms de tags n'apparaissent pas dans le dashboard

### Symptôme
Le dashboard montre "tag_15", "tag_22" au lieu des vrais noms de tags.

### Cause
Les métadonnées de tag ne sont pas configurées dans GTM.

### Solution
Pour chaque tag de votre conteneur :

1. Ouvrez le tag dans GTM
2. **Advanced Settings** > **Additional Tag Metadata**
3. Cochez **Include tag name**
4. Publiez une nouvelle version

---

## Données user_data toujours à false

### Symptôme
Le dashboard montre 0% de présence email/phone/address alors que vous envoyez ces données.

### Causes possibles

1. **Données envoyées dans le mauvais format**
   Le tag vérifie le path standard GA4 :
   ```
   user_data.email_address
   user_data.phone_number
   user_data.address.first_name
   ```
   Si vos données sont dans un path différent (ex. `user.email`), elles ne seront pas détectées.

2. **Données absentes côté serveur**
   Le client sGTM (GA4, custom) ne transmet peut-être pas le `user_data` dans l'event data.
   - Vérifiez dans le mode Preview, onglet **Event Data**, que `user_data` est bien présent

3. **Consentement non accordé**
   Si votre CMP bloque l'envoi de `user_data` sans consentement marketing, les données ne seront pas présentes dans les événements sans consentement.

---

## Données e-commerce toujours vides

### Symptôme
Les métriques e-commerce sont toutes à 0% alors que vous avez des achats.

### Cause
Le tag ne vérifie les données e-commerce que sur ces événements :
- `purchase`
- `begin_checkout`
- `add_to_cart`
- `add_payment_info`

Si vos événements utilisent des noms différents (ex. `buy`, `checkout`), les données e-commerce ne seront pas vérifiées.

### Solution
Utilisez les noms d'événements standard GA4.

---

## Mode batched : données perdues au redémarrage

### Symptôme
Des "trous" dans les données, souvent corrélés avec des redémarrages d'instances Cloud Run.

### Cause
Le buffer batch est stocké dans `templateDataStorage`, qui est en mémoire par instance. Quand une instance est terminée (scale down, redéploiement), le buffer non envoyé est perdu.

### Solutions

1. **Réduisez la taille du batch** pour que les flush soient plus fréquents
2. **Passez en mode per-event** si la perte de données est inacceptable
3. **Stabilisez vos instances** : configurez un minimum d'instances > 0 dans Cloud Run (ou équivalent)

---

## Le tag ralentit mon conteneur

### Symptôme
Augmentation du temps de réponse du conteneur sGTM après l'ajout du tag Probr.

### Réponse courte
**Le tag Probr ne ralentit pas votre conteneur.** Il appelle `data.gtmOnSuccess()` immédiatement, avant même que les données ne soient envoyées. L'envoi HTTP se fait de manière **non-bloquante** dans le callback `addEventCallback`.

### Si vous observez quand même un ralentissement

1. Vérifiez que le ralentissement n'est pas dû à un autre tag ajouté en même temps
2. Vérifiez la latence vers l'endpoint Probr (devrait être <100ms)
3. En mode batched, le `templateDataStorage` ajoute une opération de lecture/écriture, mais son impact est négligeable (<1ms)
