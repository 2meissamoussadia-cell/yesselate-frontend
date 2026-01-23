/**
 * Object Utilities
 * Helpers pour manipuler les objets
 */

/**
 * Omet des clés d'un objet
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * Sélectionne des clés d'un objet
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Transforme les clés d'un objet
 */
export function mapKeys<T extends Record<string, any>>(
  obj: T,
  fn: (key: string) => string
): Record<string, T[keyof T]> {
  return Object.keys(obj).reduce((acc, key) => {
    acc[fn(key)] = obj[key];
    return acc;
  }, {} as Record<string, T[keyof T]>);
}

/**
 * Transforme les valeurs d'un objet
 */
export function mapValues<T extends Record<string, any>, U>(
  obj: T,
  fn: (value: T[keyof T], key: string) => U
): Record<string, U> {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = fn(obj[key], key);
    return acc;
  }, {} as Record<string, U>);
}

/**
 * Filtre un objet selon une condition
 */
export function filterObject<T extends Record<string, any>>(
  obj: T,
  predicate: (value: T[keyof T], key: string) => boolean
): Partial<T> {
  return Object.keys(obj).reduce((acc, key) => {
    if (predicate(obj[key], key)) {
      (acc as Record<string, any>)[key] = obj[key];
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * Merge profond de plusieurs objets
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as Record<string, any>, source[key] as Record<string, any>);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Crée un objet depuis un tableau de paires [key, value]
 */
export function fromEntries<T>(
  entries: Array<[string, T]>
): Record<string, T> {
  return entries.reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {} as Record<string, T>);
}

/**
 * Obtient une valeur imbriquée d'un objet
 */
export function getNestedValue<T>(
  obj: Record<string, any>,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.');
  let current: any = obj;

  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }

  return current !== undefined ? current : defaultValue;
}

/**
 * Définit une valeur imbriquée dans un objet
 */
export function setNestedValue<T extends Record<string, any>>(
  obj: T,
  path: string,
  value: any
): T {
  const keys = path.split('.');
  const result = { ...obj };
  let current: any = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * Vérifie si un objet est vide
 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Compte les propriétés d'un objet
 */
export function objectSize(obj: Record<string, any>): number {
  return Object.keys(obj).length;
}

