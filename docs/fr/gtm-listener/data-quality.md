# Suivi de la qualité des données

Probr analyse automatiquement la qualité des données qui transitent dans votre conteneur sGTM. Cette page explique les métriques de qualité et comment les interpréter.

## Qualité des données utilisateur (Enhanced Conversions)

### Pourquoi c'est important

Les Enhanced Conversions (conversions améliorées) de Google Ads, Meta CAPI, et d'autres plateformes dépendent de la présence de données utilisateur first-party :

- **Email** → matching utilisateur pour l'attribution
- **Téléphone** → signal complémentaire pour le matching
- **Adresse** (prénom, nom, ville, pays) → améliore le taux de match

Un taux de présence faible = un taux de match faible = des conversions attribuées en moins = un ROAS sous-estimé.

### Ce que Probr vérifie

Pour chaque événement, Probr vérifie la **présence** (non vide) des champs suivants :

| Champ | Path dans l'événement sGTM | Impact |
|---|---|---|
| Email | `user_data.email_address` | Critique — signal principal pour le matching |
| Téléphone | `user_data.phone_number` | Important — améliore le taux de match de ~15% |
| Prénom | `user_data.address.first_name` | Utile — matching d'adresse |
| Nom | `user_data.address.last_name` | Utile — matching d'adresse |
| Ville | `user_data.address.city` | Complémentaire |
| Pays | `user_data.address.country` | Complémentaire |

### Objectifs recommandés

| Métrique | Objectif | Critique si en dessous de |
|---|---|---|
| Taux de présence email | >70% sur les conversions | <40% |
| Taux de présence téléphone | >30% | <10% |
| Taux de présence adresse | >50% | <20% |

> Ces objectifs s'appliquent aux événements de **conversion** (purchase, generate_lead, sign_up). Il est normal que les page_view aient un taux plus faible.

### Comment améliorer les taux

Si vos taux sont faibles :

1. **Vérifiez votre dataLayer client-side** : les données `user_data` sont-elles bien poussées dans le dataLayer avant l'événement de conversion ?
2. **Vérifiez le client sGTM** : le client (GA4, custom) transmet-il bien le `user_data` dans l'event data ?
3. **Formulaires** : assurez-vous que vos formulaires de checkout/login collectent ces données et les rendent disponibles dans le dataLayer
4. **Consentement** : si vous utilisez un CMP, vérifiez que le consentement marketing est bien accordé avant l'envoi des données utilisateur

---

## Qualité des données e-commerce

### Pourquoi c'est important

Des données e-commerce incomplètes causent :

- **Perte de revenue tracking** dans GA4 si `value` ou `currency` manque
- **Déduplication impossible** si `transaction_id` manque (achats comptés en double)
- **Rapports articles cassés** si `items` manque (pas de product performance)

### Ce que Probr vérifie

Sur les événements `purchase`, `begin_checkout`, `add_to_cart`, et `add_payment_info` :

| Champ | Path | Impact si absent |
|---|---|---|
| `value` | `value` | Revenue non tracké |
| `currency` | `currency` | Revenue en devise inconnue |
| `transaction_id` | `transaction_id` | Risque de doublons |
| `items` | `items` | Pas de données produit |

### Objectifs recommandés

| Métrique | Objectif |
|---|---|
| value présent sur purchase | **100%** |
| currency présent sur purchase | **100%** |
| transaction_id présent sur purchase | **100%** |
| items présent sur purchase | **>95%** |

> Sur `add_to_cart` et `begin_checkout`, un taux de 100% pour `items` est attendu. Pour `value`, il peut varier selon votre implémentation.

---

## Dashboard qualité

Dans le dashboard Probr, l'onglet **Data Quality** affiche :

1. **Score global** : pourcentage pondéré de complétude des données
2. **Tendances** : évolution des taux de présence sur 7/30 jours
3. **Alertes** : notification si un taux passe en dessous du seuil critique
4. **Détail par événement** : breakdown par type d'événement (purchase vs page_view vs add_to_cart)

### Interprétation du score global

| Score | Interprétation |
|---|---|
| **90-100%** | Excellent — votre implémentation est solide |
| **70-89%** | Bon — quelques améliorations possibles |
| **50-69%** | Attention — des données manquent régulièrement |
| **<50%** | Critique — problème d'implémentation à corriger |
