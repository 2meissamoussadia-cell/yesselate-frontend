/**
 * Type pour les composants icônes (Lucide, etc.) acceptant className.
 * Évite l'erreur "Type 'string' is not assignable to type 'never'" sur Icon className.
 */
import type React from 'react';

export type IconComponent = React.ComponentType<{ className?: string; size?: number }>;
