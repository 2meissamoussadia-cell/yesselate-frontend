# Checklist de test — Topbar BMO

À valider manuellement sur **http://localhost:4001/maitre-ouvrage/dashboard** (ou la page BMO active).

---

## 1. Barre de menus (Fichier, Édition, Affichage, Paramétrage, Réglage)

- [ ] **Fichier** : ouverture du menu, liens « Nouvelle demande », « Ouvrir / Documents » fonctionnent
- [ ] **Édition** : menu s’ouvre, « Rechercher » ouvre la palette de recherche (⌘K)
- [ ] **Affichage** : « Replier / Déplier la barre latérale » fonctionne, « Thème : Sombre/Clair » change le thème, « Actualiser la page » recharge
- [ ] **Paramétrage** : **Langue** en tête (Français / English / العربية) change la langue ; Mon profil, Préférences, Notifications présents
- [ ] **Réglage** : **Taille du texte** en tête (Réduire / Normal / Augmenter) change la taille du contenu de la page ; Paramètres du module, Référentiels, etc. présents

---

## 2. Recherche (loupe)

- [ ] Clic sur la loupe ouvre la palette de recherche
- [ ] Clic sur le fond (overlay) ou sur le bouton X ferme la palette
- [ ] Touche Échap ferme la palette
- [ ] La palette n’est pas pleine page (moins agressive)

---

## 3. Fil d’Ariane (centre)

- [ ] **Sur le dashboard** : clic sur le groupe (ex. « PILOTAGE ») ouvre un **menu** avec les 6 sections du pilotage (ou les sections du bloc actif)
- [ ] Sélection d’une section dans le menu change la vue et l’URL
- [ ] Le libellé de la page (droite du fil d’Ariane) est **dynamique** (ex. « Centre d’alertes », « Gouvernance & décisions » selon la section)
- [ ] Clic sur la page (nom à droite) ramène à la première section du bloc actif

---

## 4. Boutons Retour / Avancer (dashboard)

- [ ] Après avoir changé de section, « Retour » (chevron gauche) revient à la vue précédente et met à jour l’URL
- [ ] « Avancer » (chevron droit) rétablit la vue suivante après un Retour

---

## 5. Zone droite (notifications, utilisateur)

- [ ] **Langue** : absente de la zone droite (uniquement dans Paramétrage)
- [ ] **Thème** : absent de la zone droite (uniquement dans Affichage)
- [ ] Clic sur la cloche ouvre les notifications (si implémenté)
- [ ] Menu utilisateur : uniquement « Déconnexion » (pas de doublon Mon profil / Paramètres)

---

## 6. Taille du texte (Réglage)

- [ ] **Réduire** : le contenu de la page (et des modules/sections) est plus petit
- [ ] **Normal** : taille par défaut
- [ ] **Augmenter** : le contenu est plus grand
- [ ] La préférence est conservée après rechargement (persist)

---

## 7. Apparence générale

- [ ] Topbar plus compacte (hauteur réduite, texte en 11px)
- [ ] Séparateurs verticaux entre menus / recherche et entre zone centre / droite
- [ ] Pas d’icônes dans les menus déroulants (Fichier, Édition, etc.)

---

**Note** : Le build production peut échouer pour une autre raison (createLogger client/server). La topbar compile correctement ; les tests ci-dessus se font en mode dev (`yarn dev`).
