/**
 * Composant Image optimisé pour Next.js
 * Ajoute automatiquement la prop `sizes` si elle est manquante
 * 
 * @example
 * <AppImage src="/logo.png" alt="Logo" fill />
 * <AppImage src="/logo.png" alt="Logo" width={100} height={100} />
 */

'use client';

import Image, { ImageProps } from 'next/image';
import { useMemo } from 'react';

interface AppImageProps extends Omit<ImageProps, 'sizes'> {
  sizes?: string;
  /**
   * Taille par défaut si `fill` est utilisé sans `sizes`
   * @default "100vw"
   */
  defaultSizes?: string;
}

/**
 * Composant Image Next.js avec gestion automatique de `sizes`
 * 
 * Si `fill` est utilisé sans `sizes`, ajoute automatiquement `sizes="100vw"`
 * pour éviter les warnings Next.js.
 */
export function AppImage({
  fill,
  sizes,
  defaultSizes = '100vw',
  ...props
}: AppImageProps) {
  // ✅ Mémoriser la valeur de sizes
  const finalSizes = useMemo(() => {
    // Si sizes est fourni, l'utiliser
    if (sizes) return sizes;
    
    // Si fill est utilisé sans sizes, utiliser defaultSizes
    if (fill) return defaultSizes;
    
    // Sinon, ne pas inclure sizes (Next.js le gérera automatiquement)
    return undefined;
  }, [fill, sizes, defaultSizes]);

  // Si fill est utilisé, inclure sizes
  if (fill) {
    return (
      <Image
        {...props}
        fill
        sizes={finalSizes}
      />
    );
  }

  // Sinon, utiliser Image normalement
  return (
    <Image
      {...props}
      sizes={finalSizes}
    />
  );
}

export default AppImage;
