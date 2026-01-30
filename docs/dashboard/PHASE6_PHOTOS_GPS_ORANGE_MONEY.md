# Phase 6 — Photos GPS Live + Orange Money

Production YESSALATE : Photos géolocalisées en orbite 3D + paiement Orange Money réel (PAY NOW).

## 1. Photos GPS — Texture dynamique sphères 3D

- **Composant** : `src/modules/dashboard/components/cockpit/GpsPhotosOrbits.tsx`
- 6 dernières photos GPS en orbite autour de chaque sphère chantier (données `photoGpsMock` ou mock S3).
- Badge phase 25/50/75/100% (vert = phase 4, ambre sinon).
- Intégré dans `HealthSphereGrid` et `LiveHealthSpheres` (même position que la sphère).

## 2. Orange Money — Bouton PAY NOW

- **Composant** : `src/modules/dashboard/components/cockpit/OrangeMoneyButton.tsx`
- **Modal détail** : `src/modules/dashboard/components/modals/ChantierDetailModal.tsx`
- Clic sphère → ouverture du modal détail chantier avec bouton « PAY [montant] XOF ».
- Menu contextuel (clic-droit) : action « Payer Orange Money (PAY NOW) » → ouvre le même modal.

### API

- **POST /api/paiements/orange-money**  
  Body : `{ amount, currency: 'XOF', customer: { phone }, reference }`  
  En prod : `ORANGE_MONEY_TOKEN` → appel Orange Money Sandbox.

- **PATCH /api/chantiers/[id]/paye**  
  Body : `{ transactionId }`  
  Marque le chantier comme payé (mock ; en prod = Prisma).

## 3. Upload photos GPS

- **POST /api/photos/gps-upload**  
  FormData : `file`, `chantierId`, `phase`, `gpsLat`, `gpsLng`.  
  Hash SHA256 pour preuve huissier. En prod : S3 Af-South-1 (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).

## 4. Critères de validation Phase 6

- [x] Photos GPS orbitent autour des sphères 3D (6 dernières).
- [x] Badge phase 25/50/75/100% sur les photos.
- [x] Bouton « PAY NOW » → appel `/api/paiements/orange-money` (mock OK).
- [x] Backend `/api/paiements/orange-money` OK.
- [x] Upload photo GPS → hash SHA256 + réponse `url` / `hash` (S3 mock).
- [x] Menu contextuel « Payer Orange Money » + drilldown → modal détail avec PAY NOW.
- [ ] Mobile upload : simuler depuis un client (FormData vers `/api/photos/gps-upload`).

## 5. Déploiement

- **Backend** (Render / Vercel) :  
  `ORANGE_MONEY_TOKEN`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
- **Frontend** : `vercel --prod`.

## 6. Fichiers créés / modifiés

| Fichier | Rôle |
|--------|------|
| `GpsPhotosOrbits.tsx` | Orbites 3D des 6 dernières photos GPS |
| `OrangeMoneyButton.tsx` | Bouton PAY NOW + formatCFA |
| `ChantierDetailModal.tsx` | Modal détail chantier + Orange Money |
| `HealthSphereGrid.tsx` | Intégration GpsPhotosOrbits + drilldown → modal |
| `LiveHealthSpheres.tsx` | Idem |
| `ChantierContextMenu.tsx` | Action « Payer Orange Money » |
| `app/api/paiements/orange-money/route.ts` | API Orange Money |
| `app/api/chantiers/[id]/paye/route.ts` | Marquer chantier payé |
| `app/api/photos/gps-upload/route.ts` | Upload photo GPS + hash SHA256 |
