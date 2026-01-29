/**
 * Données mock finances globales — CA, Trésorerie, Créances, Dettes, Marge.
 * Cashflow 3 mois passés + 3 mois futurs (prévision).
 * Par chantier : Budget vs Dépensé %, Marge prévisionnelle, Rentabilité (ROI).
 */

export type TresorerieStatus = 'sain' | 'attention' | 'critique';
export type MargeStatus = 'ok' | 'sous_objectif';

export interface FinancesGlobalesMock {
  /** Mois concerné (ex. Janvier 2026) */
  moisLabel: string;
  moisKey: string; // YYYY-MM
  /** CA réalisé (FCFA) */
  caRealise: number;
  /** CA prévu (FCFA) */
  caPrevu: number;
  /** Trésorerie (FCFA) */
  tresorerie: number;
  tresorerieStatus: TresorerieStatus;
  /** Créances clients (FCFA) */
  creances: number;
  /** Nombre de créances > 30 jours */
  creancesPlus30j: number;
  /** Dettes fournisseurs (FCFA) */
  dettes: number;
  /** Marge moyenne (%) */
  margeMoyennePct: number;
  /** Objectif marge (%) */
  margeObjectifPct: number;
  margeStatus: MargeStatus;
}

export interface CashflowMonthMock {
  mois: string;
  label: string; // "Jan", "Fév", etc.
  /** Entrées (FCFA) */
  entrees: number;
  /** Sorties (FCFA) */
  sorties: number;
  /** Solde = entrées - sorties */
  solde: number;
  /** true = prévisionnel */
  previsionnel?: boolean;
}

export interface FinancesChantierMock {
  chantierId: string;
  chantierNom?: string;
  /** Budget alloué (FCFA) */
  budget: number;
  /** Dépensé (FCFA) */
  depense: number;
  /** Budget vs Dépensé (%) */
  depensePct: number;
  /** Marge prévisionnelle (%) */
  margePct: number;
  /** Rentabilité estimée / ROI (%) */
  rentabilitePct: number;
}

const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();

function monthLabel(m: number, y: number) {
  const d = new Date(y, m, 1);
  return d.toLocaleDateString('fr-FR', { month: 'short' });
}

/** Finances globales — exemple Janvier 2026 */
export const financesGlobales: FinancesGlobalesMock = {
  moisLabel: new Date(currentYear, currentMonth, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
  moisKey: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`,
  caRealise: 45_000_000,
  caPrevu: 50_000_000,
  tresorerie: 12_000_000,
  tresorerieStatus: 'sain',
  creances: 8_000_000,
  creancesPlus30j: 3,
  dettes: 5_200_000,
  margeMoyennePct: 22,
  margeObjectifPct: 20,
  margeStatus: 'ok',
};

/** Cashflow : 3 mois passés + 3 mois futurs (prévision) */
export const cashflowMois: CashflowMonthMock[] = (() => {
  const out: CashflowMonthMock[] = [];
  for (let i = -3; i <= 3; i++) {
    const m = currentMonth + i;
    const y = currentYear + Math.floor(m / 12);
    const month = ((m % 12) + 12) % 12;
    const label = monthLabel(month, y);
    const entrees = 14_000_000 + i * 800_000 + (i * 17) % 300_000;
    const sorties = 12_000_000 + i * 700_000 + (i * 13) % 250_000;
    out.push({
      mois: `${y}-${String(month + 1).padStart(2, '0')}`,
      label,
      entrees: Math.round(entrees),
      sorties: Math.round(sorties),
      solde: Math.round(entrees - sorties),
      previsionnel: i > 0,
    });
  }
  return out;
})();

/** Finances par chantier — Budget vs Dépensé, Marge, ROI */
export const financesParChantier: FinancesChantierMock[] = [
  { chantierId: 'RENOV-042', chantierNom: 'Villa Almadies', budget: 1_200_000, depense: 890_000, depensePct: 74, margePct: 23, rentabilitePct: 18 },
  { chantierId: 'REPAR-015', chantierNom: 'Résidence Commerçants', budget: 800_000, depense: 620_000, depensePct: 77.5, margePct: 19, rentabilitePct: 12 },
  { chantierId: 'RENOV-038', chantierNom: 'Diaspora Phase 2', budget: 2_100_000, depense: 1_650_000, depensePct: 78.6, margePct: 25, rentabilitePct: 22 },
  { chantierId: 'REPAR-009', chantierNom: 'Particuliers', budget: 450_000, depense: 380_000, depensePct: 84.4, margePct: 18, rentabilitePct: 10 },
  { chantierId: 'RENOV-031', chantierNom: 'Établissements', budget: 1_800_000, depense: 1_200_000, depensePct: 66.7, margePct: 21, rentabilitePct: 16 },
  { chantierId: 'RENOV-027', chantierNom: 'Commerçants', budget: 950_000, depense: 720_000, depensePct: 75.8, margePct: 24, rentabilitePct: 20 },
];

export function getFinancesChantier(chantierId: string): FinancesChantierMock | undefined {
  return financesParChantier.find((f) => f.chantierId === chantierId);
}
