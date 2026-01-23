/**
 * Advanced Color Utilities
 * Helpers pour manipuler les couleurs
 */

/**
 * Convertit hex en RGB (version avancée)
 * Note: hexToRgb existe déjà dans colorUtils.ts
 */
export function hexToRgbAdvanced(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convertit RGB en hex (version avancée)
 * Note: rgbToHex existe déjà dans colorUtils.ts
 */
export function rgbToHexAdvanced(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Convertit RGB en HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convertit HSL en RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Assombrit une couleur
 */
export function darken(hex: string, amount: number): string {
  const rgb = hexToRgbAdvanced(hex);
  if (!rgb) return hex;

  const r = Math.max(0, rgb.r - amount);
  const g = Math.max(0, rgb.g - amount);
  const b = Math.max(0, rgb.b - amount);

  return rgbToHexAdvanced(r, g, b);
}

/**
 * Éclaircit une couleur
 */
export function lighten(hex: string, amount: number): string {
  const rgb = hexToRgbAdvanced(hex);
  if (!rgb) return hex;

  const r = Math.min(255, rgb.r + amount);
  const g = Math.min(255, rgb.g + amount);
  const b = Math.min(255, rgb.b + amount);

  return rgbToHexAdvanced(r, g, b);
}

/**
 * Ajuste l'opacité d'une couleur
 */
export function alpha(hex: string, opacity: number): string {
  const rgb = hexToRgbAdvanced(hex);
  if (!rgb) return hex;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Mélange deux couleurs
 */
export function blend(color1: string, color2: string, ratio: number = 0.5): string {
  const rgb1 = hexToRgbAdvanced(color1);
  const rgb2 = hexToRgbAdvanced(color2);

  if (!rgb1 || !rgb2) return color1;

  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

  return rgbToHexAdvanced(r, g, b);
}

/**
 * Génère une palette de couleurs à partir d'une couleur de base
 */
export function generatePalette(baseColor: string): {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
} {
  const rgb = hexToRgbAdvanced(baseColor);
  if (!rgb) {
    return {
      50: baseColor,
      100: baseColor,
      200: baseColor,
      300: baseColor,
      400: baseColor,
      500: baseColor,
      600: baseColor,
      700: baseColor,
      800: baseColor,
      900: baseColor,
    };
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return {
    50: hslToHex(hsl.h, hsl.s, 95),
    100: hslToHex(hsl.h, hsl.s, 90),
    200: hslToHex(hsl.h, hsl.s, 80),
    300: hslToHex(hsl.h, hsl.s, 70),
    400: hslToHex(hsl.h, hsl.s, 60),
    500: hslToHex(hsl.h, hsl.s, 50),
    600: hslToHex(hsl.h, hsl.s, 40),
    700: hslToHex(hsl.h, hsl.s, 30),
    800: hslToHex(hsl.h, hsl.s, 20),
    900: hslToHex(hsl.h, hsl.s, 10),
  };
}

/**
 * Convertit HSL en hex
 */
function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l);
  return rgbToHexAdvanced(rgb.r, rgb.g, rgb.b);
}

/**
 * Vérifie si une couleur est claire ou sombre (version avancée)
 * Note: isLightColor existe déjà dans colorUtils.ts
 */
export function isLightColorAdvanced(hex: string): boolean {
  const rgb = hexToRgbAdvanced(hex);
  if (!rgb) return false;

  // Calcul de la luminance relative
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

/**
 * Obtient une couleur de texte contrastée (version avancée)
 * Note: getContrastColor existe déjà dans colorUtils.ts
 */
export function getContrastColorAdvanced(hex: string): string {
  return isLightColorAdvanced(hex) ? '#000000' : '#FFFFFF';
}

