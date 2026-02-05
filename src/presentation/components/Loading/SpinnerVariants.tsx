/**
 * SpinnerVariants Component
 * Différentes variantes de spinners
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export interface SpinnerVariantsProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

/**
 * Spinner en points
 */
export function DotsSpinner({
  size = 'md',
  color = 'text-blue-500',
  className,
}: SpinnerVariantsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            sizeClasses[size],
            'rounded-full bg-current',
            color,
            'animate-pulse'
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Spinner en barres
 */
export function BarsSpinner({
  size = 'md',
  color = 'text-blue-500',
  className,
}: SpinnerVariantsProps) {
  const barWidth = size === 'sm' ? 'w-1' : size === 'md' ? 'w-1.5' : size === 'lg' ? 'w-2' : 'w-3';
  const barHeight = sizeClasses[size];

  return (
    <div className={cn('flex items-end gap-1', className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            barWidth,
            barHeight,
            'bg-current rounded',
            color,
            'animate-pulse'
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Spinner en cercle
 */
export function CircleSpinner({
  size = 'md',
  color = 'text-blue-500',
  className,
}: SpinnerVariantsProps) {
  return (
    <div
      className={cn(
        sizeClasses[size],
        'border-2 border-current border-t-transparent rounded-full animate-spin',
        color,
        className
      )}
    />
  );
}

/**
 * Spinner en onde
 */
export function WaveSpinner({
  size = 'md',
  color = 'text-blue-500',
  className,
}: SpinnerVariantsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            size === 'sm' ? 'w-0.5' : size === 'md' ? 'w-1' : size === 'lg' ? 'w-1.5' : 'w-2',
            size === 'sm' ? 'h-3' : size === 'md' ? 'h-4' : size === 'lg' ? 'h-6' : 'h-8',
            'bg-current rounded-full',
            color,
            'animate-pulse'
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1.2s',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Spinner en pulsation
 */
export function PulseSpinner({
  size = 'md',
  color = 'text-blue-500',
  className,
}: SpinnerVariantsProps) {
  return (
    <div
      className={cn(
        sizeClasses[size],
        'rounded-full bg-current animate-ping',
        color,
        className
      )}
    />
  );
}

