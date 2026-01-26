// lib/dashboard/currency.ts
// Phase P12: Helper de conversion de devise (optionnel)
// Récupération des taux de change depuis la base de données

import { pgPool } from '@/lib/server/db/pool';

/**
 * Cache mémoire simple pour les taux (60s)
 */
const rateCache = new Map<string, { rate: number; expiresAt: number }>();
const CACHE_TTL_MS = 60_000; // 60 secondes

/**
 * Récupère le taux de change entre deux devises
 * 
 * @param base - Devise de base (ex: 'EUR')
 * @param quote - Devise cible (ex: 'XOF')
 * @returns Taux de change (1 si base === quote, ou depuis la DB)
 * 
 * @example
 * const rate = await getRate('EUR', 'XOF'); // 655.957
 */
export async function getRate(base: string, quote: string): Promise<number> {
  // Même devise = taux 1
  if (base === quote) return 1;

  // Vérifier le cache
  const cacheKey = `${base}:${quote}`;
  const cached = rateCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.rate;
  }

  // Récupérer depuis la DB
  const client = await pgPool.connect();
  try {
    const { rows } = await client.query(
      `SELECT rate FROM exchange_rates 
       WHERE base_currency = $1 AND quote_currency = $2 
       ORDER BY as_of DESC 
       LIMIT 1`,
      [base, quote]
    );

    const rate = rows[0]?.rate ? Number(rows[0].rate) : 1;

    // Mettre en cache
    rateCache.set(cacheKey, {
      rate,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return rate;
  } finally {
    client.release();
  }
}

/**
 * Convertit un montant d'une devise à une autre
 * 
 * @param amount - Montant à convertir
 * @param fromCurrency - Devise source (ex: 'EUR')
 * @param toCurrency - Devise cible (ex: 'XOF')
 * @returns Montant converti
 * 
 * @example
 * const converted = await convertAmount(100, 'EUR', 'XOF'); // 65595.7
 */
export async function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;
  
  const rate = await getRate(fromCurrency, toCurrency);
  return amount * rate;
}

/**
 * Invalide le cache des taux (utile après mise à jour des taux)
 */
export function invalidateRateCache(): void {
  rateCache.clear();
}
