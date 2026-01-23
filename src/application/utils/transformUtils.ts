/**
 * Transform Utilities
 * Helpers pour transformer des données
 */

/**
 * Transforme un tableau en objet avec clé personnalisée
 */
export function arrayToObject<T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string, T> {
  return array.reduce((obj, item) => {
    obj[String(keyFn(item))] = item;
    return obj;
  }, {} as Record<string, T>);
}

/**
 * Transforme un objet en tableau
 */
export function objectToArray<T>(
  obj: Record<string, T>,
  keyAsProperty: boolean = false
): Array<T & { key?: string }> {
  return Object.entries(obj).map(([key, value]) => {
    if (keyAsProperty) {
      return { ...value, key } as T & { key: string };
    }
    return value as T & { key?: string };
  });
}

/**
 * Mappe un tableau en transformant chaque élément
 */
export function mapArray<T, U>(
  array: T[],
  transform: (item: T, index: number) => U
): U[] {
  return array.map(transform);
}

/**
 * Filtre et transforme un tableau
 */
export function filterMap<T, U>(
  array: T[],
  predicate: (item: T) => boolean,
  transform: (item: T) => U
): U[] {
  return array.filter(predicate).map(transform);
}

/**
 * Réduit un tableau en accumulant une valeur
 */
export function reduceArray<T, U>(
  array: T[],
  reducer: (acc: U, item: T, index: number) => U,
  initialValue: U
): U {
  return array.reduce(reducer, initialValue);
}

/**
 * Transforme des données pour un graphique
 */
export function transformForChart<T>(
  data: T[],
  config: {
    xKey: keyof T | ((item: T) => string | number);
    yKey: keyof T | ((item: T) => number);
    name?: string;
  }
): Array<{ name: string | number; value: number; [key: string]: any }> {
  return data.map(item => ({
    name: typeof config.xKey === 'function' 
      ? config.xKey(item) 
      : (item[config.xKey] as string | number),
    value: typeof config.yKey === 'function'
      ? config.yKey(item)
      : item[config.yKey] as number,
    ...item,
  }));
}

/**
 * Normalise des données entre 0 et 1
 */
export function normalizeData(values: number[]): number[] {
  if (values.length === 0) return [];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  if (range === 0) return values.map(() => 1);
  
  return values.map(val => (val - min) / range);
}

/**
 * Standardise des données (moyenne 0, écart-type 1)
 */
export function standardizeData(values: number[]): number[] {
  if (values.length === 0) return [];
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return values.map(() => 0);
  
  return values.map(val => (val - mean) / stdDev);
}

/**
 * Agrège des données par période
 */
export function aggregateByPeriod<T>(
  data: T[],
  config: {
    dateKey: keyof T | ((item: T) => Date | string);
    valueKey: keyof T | ((item: T) => number);
    period: 'day' | 'week' | 'month' | 'quarter' | 'year';
    aggregateFn?: (values: number[]) => number;
  }
): Array<{ period: string; value: number; count: number }> {
  const { dateKey, valueKey, period, aggregateFn = (vals) => vals.reduce((a, b) => a + b, 0) } = config;
  
  const grouped: Record<string, number[]> = {};
  
  data.forEach(item => {
    const date = typeof dateKey === 'function' ? dateKey(item) : item[dateKey];
    const dateObj = typeof date === 'string' ? new Date(date) : (date as Date);
    const periodKey = getPeriodKey(dateObj, period);
    
    if (!grouped[periodKey]) {
      grouped[periodKey] = [];
    }
    
    const value = typeof valueKey === 'function' ? valueKey(item) : item[valueKey] as number;
    grouped[periodKey].push(value);
  });
  
  return Object.entries(grouped).map(([period, values]) => ({
    period,
    value: aggregateFn(values),
    count: values.length,
  }));
}

function getPeriodKey(date: Date, period: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const quarter = Math.floor(month / 3) + 1;
  const week = getWeekNumber(date);
  
  switch (period) {
    case 'day':
      return `${year}-${String(month).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    case 'week':
      return `${year}-W${String(week).padStart(2, '0')}`;
    case 'month':
      return `${year}-${String(month).padStart(2, '0')}`;
    case 'quarter':
      return `${year}-Q${quarter}`;
    case 'year':
      return String(year);
    default:
      return String(year);
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Pivot un tableau (transpose)
 */
export function pivotTable<T extends Record<string, any>>(
  data: T[],
  rowKey: keyof T,
  colKey: keyof T,
  valueKey: keyof T
): Record<string, Record<string, any>> {
  const result: Record<string, Record<string, any>> = {};
  
  data.forEach(item => {
    const row = String(item[rowKey]);
    const col = String(item[colKey]);
    const value = item[valueKey];
    
    if (!result[row]) {
      result[row] = {};
    }
    
    result[row][col] = value;
  });
  
  return result;
}

