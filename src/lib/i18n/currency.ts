// src/lib/i18n/currency.ts
// Phase P12: Helper de conversion de devise côté front (optionnel)
// Conversion à l'affichage selon préférence utilisateur

/**
 * Convertit un montant si nécessaire selon les préférences utilisateur
 * 
 * @param amount - Montant en devise de référence (ex: EUR depuis API)
 * @param fromCurrency - Devise source (ex: 'EUR')
 * @param toCurrency - Devise cible (ex: 'XOF')
 * @param rate - Taux de change (optionnel, si non fourni retourne amount)
 * @returns Montant converti ou original si même devise ou pas de taux
 * 
 * @example
 * const { currency: uiCur } = useI18n();
 * const priceEuros = 100; // depuis API
 * const price = convertIfNeeded(priceEuros, 'EUR', uiCur, rate);
 * const label = fmt.currency(price, uiCur, { maximumFractionDigits: uiCur === 'XOF' ? 0 : 2 });
 */
export function convertIfNeeded(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rate?: number
): number {
  // Même devise = pas de conversion
  if (fromCurrency === toCurrency) return amount;
  
  // Pas de taux fourni = retourner le montant original
  if (!rate || rate === 1) return amount;
  
  // Convertir
  return amount * rate;
}
