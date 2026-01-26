# Phase P12.b - Exports Localisés Riches (XLSX/PDF)

## 🎯 Objectif

Étendre l'API d'export pour supporter XLSX natif (formatage localisé) et PDF riche (HTML→PDF avec RTL/CJK), tout en conservant la compatibilité avec CSV/JSON existants.

**Règle** : Aucun impact sur l'UX. Le routeur avancé, le registry, la Sidebar/Subnav et la KPI Bar restent inchangés.

---

## ✅ Implémentation

### 1. XLSX Natif (exceljs)

**Fichier** : `lib/server/dashboard/export/xlsxFormatter.ts`

**Fonctionnalités** :
- Formatage localisé (monnaie, dates, pourcentages)
- Styles (en-têtes, freeze panes, autofilter)
- Largeurs de colonnes automatiques
- Support RTL (direction dans les options)

**Formatage selon locale** :
- **EUR (fr-FR)** : `# ##0,00" €"`
- **XOF (fr-FR)** : `# ##0" FCFA"`
- **USD/GBP** : `"$"* #,##0.00_-`
- **Dates** : `yyyy-mm-dd`
- **Pourcentages** : `0.00%`

### 2. API d'Export Étendue

**Fichier** : `app/api/export/dashboard/route.ts`

**Formats supportés** :
- `csv` : CSV avec séparateur localisé (Phase P12)
- `json` : JSON brut
- `excel` : CSV avec mime Excel (compatibilité)
- `xlsx` : **XLSX natif avec formatage** (Phase P12.b)
- `pdf` : **PDF riche** (Phase P12.b - placeholder pour l'instant)

**Sécurité** :
- Rate limiting : 20 exports/IP, refill 1/s
- Limite de lignes : 100 000 max
- Limite de taille : 50 MB max
- Timeout : 60s
- Hash SHA-256 : Scellement des fichiers

### 3. PDF Riche (À Implémenter)

**Fichier** : `lib/server/dashboard/export/pdfFormatter.ts`

**Notes d'implémentation** (voir Phase P12) :
- HTML→PDF via Chromium headless (puppeteer/playwright)
- Template HTML avec Handlebars/React SSR
- Support RTL : `dir="rtl"`, polices NotoSansArabic
- Support CJK : NotoSansCJK si nécessaire
- Styles imprimables (A4 paysage/portrait)

**Status** : 📝 Placeholder JSON pour l'instant (sera remplacé par HTML→PDF)

---

## 📊 Utilisation

### Format XLSX

```typescript
// Dans la KPI Bar ou un composant
const onExport = async (format: 'csv' | 'json' | 'xlsx' | 'pdf') => {
  const url = `/api/export/dashboard?main=${main}&sub=${sub}&leaf=${leaf}&format=${format}`;
  window.open(url, '_blank');
};
```

### Headers de Réponse

**XLSX** :
- `Content-Type`: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `X-Content-Hash`: `sha256:...` (scellement)
- `X-Export-Rows`: Nombre de lignes
- `X-Export-Size-MB`: Taille du fichier (MB)

**PDF** (quand implémenté) :
- `Content-Type`: `application/pdf`
- `X-Content-Hash`: `sha256:...`
- `X-PDF-Status`: `rendered` (ou `placeholder` actuellement)

---

## 🔧 Configuration

### Dépendances

```bash
npm install exceljs
# Pour PDF riche (quand implémenté) :
npm install puppeteer  # ou playwright
```

### Variables d'Environnement

```env
# Redis (pour rate limiting - Phase P11)
REDIS_URL=redis://localhost:6379
```

### Limites Configurables

Dans `app/api/export/dashboard/route.ts` :
```typescript
const MAX_EXPORT_ROWS = 100_000; // Limite de lignes
const MAX_EXPORT_SIZE_MB = 50; // Limite de taille (MB)
const EXPORT_TIMEOUT_MS = 60_000; // Timeout 60s
```

---

## 🧪 Tests

### Checklist de Validation

#### XLSX

- [ ] Formatage monnaie EUR correct (2 décimales, symbole €)
- [ ] Formatage monnaie XOF correct (0 décimales, FCFA)
- [ ] Formatage dates correct (yyyy-mm-dd)
- [ ] Formatage pourcentages correct
- [ ] En-têtes stylés (gras, fond gris)
- [ ] Freeze panes (première ligne)
- [ ] Autofilter activé
- [ ] Largeurs de colonnes automatiques
- [ ] Hash SHA-256 présent
- [ ] Headers `X-Export-Rows` et `X-Export-Size-MB` présents

#### PDF (Quand Implémenté)

- [ ] RTL fonctionnel (ar-MA)
- [ ] Polices arabes chargées (NotoSansArabic)
- [ ] Mise en page A4 correcte
- [ ] Styles imprimables
- [ ] Hash SHA-256 présent

#### Sécurité

- [ ] Rate limiting fonctionnel (20 exports/IP)
- [ ] Limite de lignes respectée (100k max)
- [ ] Limite de taille respectée (50 MB max)
- [ ] Timeout respecté (60s)
- [ ] Sanitization des noms de fichiers

---

## ⚠️ Risques & Atténuations

### 1. Performance

**Risque** : Génération XLSX/PDF lente pour gros volumes

**Atténuation** :
- ✅ Limites de taille/lignes
- ✅ Timeout 60s
- ✅ Rate limiting restrictif
- ✅ Génération en mémoire (pas de fichiers temporaires)

### 2. Mémoire

**Risque** : Consommation mémoire élevée pour gros exports

**Atténuation** :
- ✅ Limite de 50 MB par fichier
- ✅ Limite de 100k lignes
- ✅ Streaming possible pour CSV (déjà implémenté)

### 3. PDF Riche

**Risque** : Chromium headless lourd en ressources

**Atténuation** :
- ✅ Pool de navigateurs (quand implémenté)
- ✅ Cache des templates HTML
- ✅ Timeout strict
- ✅ Job asynchrone pour très gros PDFs (futur)

---

## 🚀 Déploiement

### Étapes

1. **Installer dépendances** :
   ```bash
   npm install exceljs
   ```

2. **Vérifier Redis** (pour rate limiting) :
   ```env
   REDIS_URL=redis://localhost:6379
   ```

3. **Tester XLSX** :
   ```bash
   curl -H "x-tenant-id: <tenant>" -H "x-user-id: <user>" \
     "http://localhost:3000/api/export/dashboard?main=performance&format=xlsx" \
     -o test.xlsx
   ```

4. **Vérifier headers** :
   ```bash
   curl -I -H "x-tenant-id: <tenant>" -H "x-user-id: <user>" \
     "http://localhost:3000/api/export/dashboard?main=performance&format=xlsx"
   ```

### Validation

- [ ] XLSX s'ouvre correctement dans Excel/LibreOffice
- [ ] Formatage monnaie/dates correct selon locale
- [ ] Rate limiting fonctionnel
- [ ] Hash SHA-256 présent
- [ ] Pas de régression sur CSV/JSON

---

## 📝 Prochaines Étapes

### PDF Riche (À Implémenter)

1. **Installer puppeteer/playwright** :
   ```bash
   npm install puppeteer
   ```

2. **Créer template HTML** :
   - Handlebars ou React SSR
   - Styles imprimables (A4)
   - Support RTL/CJK

3. **Implémenter `formatAsPDF()`** :
   - Charger template
   - Injecter données + i18n
   - Rendre HTML→PDF
   - Retourner Buffer

4. **Intégrer dans route** :
   - Remplacer placeholder JSON
   - Ajouter timeout/stats

---

**Status** : ✅ XLSX natif implémenté — PDF riche en préparation
