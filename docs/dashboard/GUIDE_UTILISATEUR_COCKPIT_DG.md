# Guide utilisateur — Cockpit DG V5 (NICE RÉNOVATION)

## Vue d’ensemble

Le **Cockpit DG** est la centrale de commandement du tableau de bord : une seule page pour voir l’état global, les alertes, les prédictions et lancer des actions (paiements, huissier, broadcast, etc.).

**Accès** : Tableau de bord → vue d’accueil / Cockpit (selon la navigation).

---

## 1. Bloc Briefing (IA)

- **Texte** : résumé en 3 phrases (rafraîchi toutes les 60 s).
- **Pastille** : vert / jaune / rouge selon l’état global.
- **Top 3 risques** et **opportunités** : listes dérivées du briefing.

---

## 2. Prédictions ML

- **Risque retard**, **Risque budget**, **Score qualité**, **Satisfaction client** : indicateurs mis à jour (ex. toutes les 5 min).
- En **mode hors ligne** : dernières valeurs en cache avec indication « Données en cache ».

---

## 3. Barre Executive (en bas de l’écran)

- **?** : aide des raccourcis clavier.
- **FR | EN** : langue pour les commandes vocales.
- **Micro** : activer / désactiver la reconnaissance vocale (FR, EN, Wolof).
- **Actions** : ouvrir le panneau des 12 actions rapides.

### Actions rapides (panneau)

- **Urgence** : mode urgence chantiers.
- **Orange Money / Wave** : déclencher un paiement (stub).
- **Huissier** : certification UCIE (stub).
- **Contrat Auto** : génération de contrat (stub).
- **Broadcast** : annonce à toutes les équipes (stub).
- **Call Team**, **Report**, **Forecast**, **Archiver**, etc. : autres actions selon la config.

Les boutons peuvent **passer à la ligne** sur petit écran (pas de scroll horizontal).

---

## 4. Raccourcis clavier

- **?** : afficher / masquer l’aide des raccourcis.
- **Ctrl+Shift+E** : Urgence.
- **Ctrl+Shift+O** : Orange Money.
- **Ctrl+Shift+W** : Wave.
- **Ctrl+Shift+H** : Huissier.
- Autres raccourcis listés dans l’aide (?).

---

## 5. Commandes vocales

- Cliquer sur le **micro**, parler en français ou en anglais (ex. « Urgence chantier 042 », « Orange Money », « Wave »).
- Les suggestions s’affichent pendant l’écoute.
- Wolof : reconnu via des patterns prédéfinis.

---

## 6. Mode hors ligne / PWA

- **Indicateur** : « Mode hors ligne — données en cache » ou « Données affichées depuis le cache » lorsque les données viennent du cache (IndexedDB).
- L’app est **installable** (PWA) : « Ajouter à l’écran d’accueil » depuis le navigateur.
- **Notifications push** : si activées, une bannière propose « Activer les notifications ? » (Oui / Plus tard).

---

## 7. Cartes « Accès aux modules métier »

- Chaque carte ouvre un module du tableau de bord (Demandes, Budget, Validations, Projets, Alertes, Risques, Décisions, etc.).
- Clic = navigation vers la vue correspondante.

---

## 8. Dépannage rapide

- **Pas de briefing / prédictions** : vérifier la connexion ; en offline, les dernières valeurs en cache s’affichent.
- **Micro ne réagit pas** : autoriser le micro dans le navigateur ; vérifier que la page est en HTTPS (sauf localhost).
- **Barre Executive qui dépasse** : normalement plus de scroll horizontal ; recharger la page. Si problème persistant, signaler (navigateur, taille d’écran).
- **Erreur « t is not defined »** : corrigée côté technique ; si elle réapparaît, recharger et signaler.

---

## 9. Parcours type pour un DG

1. Ouvrir le **Tableau de bord** et aller sur le **Cockpit**.
2. Lire le **Briefing** et la **pastille** (vert / jaune / rouge).
3. Consulter les **Prédictions ML** (retard, budget, qualité).
4. Utiliser **Actions** pour une action rapide (paiement, huissier, broadcast, etc.) ou le **micro** pour une commande vocale.
5. Cliquer sur une **carte module** pour aller dans le détail (Demandes, Validations, etc.).

---

*Document associé : [COCKPIT_DG_V5_ROADMAP.md](./COCKPIT_DG_V5_ROADMAP.md) (feuille de route technique).*
