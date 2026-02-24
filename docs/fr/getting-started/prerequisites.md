# Prérequis et installation

## Prérequis

Avant de commencer, assurez-vous d'avoir :

1. **Un conteneur Google Tag Manager Server-Side** fonctionnel et recevant du trafic
2. **Une instance Probr en fonctionnement** (self-hosted via Docker) avec au moins un site configure
3. **Acces editeur** (ou superieur) au conteneur GTM server-side

## Etape 1 : Creer votre site dans Probr

Utilisez l'API Probr pour creer un client et un site :

```bash
# 1. Creer un client
curl -X POST https://votre-instance-probr/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name": "Mon Entreprise", "email": "ops@monentreprise.com"}'

# 2. Creer un site (utilisez le client_id de la reponse ci-dessus)
curl -X POST https://votre-instance-probr/api/sites \
  -H "Content-Type: application/json" \
  -d '{"client_id": "<client-uuid>", "name": "monsite.com - Production", "url": "https://monsite.com", "sgtm_url": "https://sgtm.monsite.com"}'
```

La reponse inclura une **Cle d'ingestion** (`ingest_key`) auto-generee — vous en aurez besoin a l'etape suivante.

Voir [Clients & Sites](../administration/clients-and-sites.md) pour la reference API complete.

## Étape 2 : Installer le tag Probr Listener

### Option A : Depuis la GTM Community Template Gallery (recommandé)

1. Dans votre conteneur GTM **server-side**, allez dans **Templates** > **Tag Templates**
2. Cliquez sur **Search Gallery**
3. Recherchez **"Probr"**
4. Cliquez sur **Probr — Server-Side Listener** puis **Add to workspace**
5. Confirmez l'ajout

### Option B : Import manuel

1. Téléchargez le fichier `template.tpl` depuis le [repo GitHub](https://github.com/Sam-DigitaliX/probr-gtm-listener)
2. Dans GTM server-side, allez dans **Templates** > **Tag Templates** > **New**
3. Cliquez sur les **trois points** (⋮) en haut à droite > **Import**
4. Sélectionnez le fichier `template.tpl` téléchargé
5. Cliquez sur **Save**

## Étape 3 : Créer le tag

1. Allez dans **Tags** > **New**
2. **Tag Configuration** : sélectionnez **Probr — Server-Side Listener**
3. Remplissez les champs :

| Champ | Valeur |
|---|---|
| **Probr Ingest Endpoint** | `https://votre-instance-probr/api/ingest` |
| **Probr Ingest Key** | La `ingest_key` de l'etape 1 |
| **Track user data quality** | ✅ Coché (recommandé) |
| **Send mode** | Per event (recommandé) |

4. **Triggering** : sélectionnez le trigger **All Events** (ou créez un trigger personnalisé)
5. Nommez le tag : `Probr - Listener`
6. Cliquez sur **Save**

## Étape 4 : Exclure le tag Probr du monitoring

Pour éviter une boucle de rétroaction (le tag Probr qui se monitore lui-même) :

1. Notez l'**ID** du tag Probr Listener (visible dans l'URL quand vous éditez le tag, ou dans la liste des tags)
2. Éditez le tag Probr Listener
3. Dans le champ **Tag IDs to Exclude**, entrez l'ID noté
4. Sauvegardez

## Étape 5 : Ajouter les métadonnées de tags (recommandé)

Pour que Probr affiche les **noms** des tags (et pas seulement leurs IDs) :

1. Pour chaque tag important dans votre conteneur, ouvrez ses paramètres
2. Dépliez **Advanced Settings** > **Additional Tag Metadata**
3. Cochez **Include tag name** (`name` = `true`)
4. Sauvegardez

Cela permet à Probr d'identifier chaque tag par son nom dans le dashboard.

## Étape 6 : Publier

1. Cliquez sur **Submit** dans GTM
2. Ajoutez une note de version (ex. "Ajout monitoring Probr")
3. Cliquez sur **Publish**

Les données commenceront à apparaître dans votre dashboard Probr en quelques secondes.

## Vérification

Pour vérifier que tout fonctionne :

1. Ouvrez le **mode Preview** de votre conteneur sGTM
2. Envoyez un événement test depuis votre site
3. Vérifiez que le tag **Probr - Listener** se déclenche avec le statut **Succeeded**
4. Dans votre dashboard Probr, vérifiez que l'événement apparaît dans le flux temps réel

## Prochaine étape

Consultez la [documentation détaillée du GTM Listener](../gtm-listener/configuration.md) pour les options avancées.
