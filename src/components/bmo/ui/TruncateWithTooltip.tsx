'use client';

/**
 * TruncateWithTooltip — Texte tronqué avec tooltip automatique
 * 
 * Caractéristiques :
 * - Détection automatique de la troncature
 * - Tooltip uniquement si texte tronqué
 * - Support multiligne
 * - Accessible (aria-label)
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/cn';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface TruncateWithTooltipProps {
  /** Texte à afficher */
  children: React.ReactNode;
  /** Nombre de lignes max (1 = single line truncate) */
  lines?: 1 | 2 | 3;
  /** Largeur max (CSS) */
  maxWidth?: string | number;
  /** Contenu du tooltip (par défaut = children) */
  tooltipContent?: React.ReactNode;
  /** Position du tooltip */
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  /** Délai d'apparition du tooltip (ms) */
  tooltipDelay?: number;
  /** Classes additionnelles */
  className?: string;
  /** Tag HTML */
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4';
}

export function TruncateWithTooltip({
  children,
  lines = 1,
  maxWidth,
  tooltipContent,
  tooltipSide = 'top',
  tooltipDelay = 300,
  className,
  as: Tag = 'span',
}: TruncateWithTooltipProps) {
  const textRef = useRef<HTMLElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const checkTruncation = useCallback(() => {
    const el = textRef.current;
    if (!el) return;

    if (lines === 1) {
      // Single line: compare scrollWidth vs clientWidth
      setIsTruncated(el.scrollWidth > el.clientWidth);
    } else {
      // Multi-line: compare scrollHeight vs clientHeight
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [lines]);

  useEffect(() => {
    checkTruncation();
    
    // Re-check on resize
    const observer = new ResizeObserver(checkTruncation);
    if (textRef.current) {
      observer.observe(textRef.current);
    }
    
    return () => observer.disconnect();
  }, [checkTruncation, children]);

  const truncateClasses = cn(
    lines === 1 && 'truncate',
    lines === 2 && 'line-clamp-2',
    lines === 3 && 'line-clamp-3',
    className
  );

  const style: React.CSSProperties = maxWidth 
    ? { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }
    : {};

  const textElement = (
    <Tag
      ref={textRef as React.Ref<HTMLDivElement>}
      className={truncateClasses}
      style={style}
      title={undefined} // Remove native title, we use tooltip
    >
      {children}
    </Tag>
  );

  if (!isTruncated) {
    return textElement;
  }

  return (
    <TooltipProvider delayDuration={tooltipDelay}>
      <Tooltip>
        <TooltipTrigger asChild>
          {textElement}
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} className="max-w-md">
          {tooltipContent ?? children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * TruncatedTitle — Titre tronqué avec tooltip
 */
export function TruncatedTitle({
  children,
  level = 3,
  className,
  ...props
}: Omit<TruncateWithTooltipProps, 'as'> & {
  level?: 1 | 2 | 3 | 4;
}) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
  return (
    <TruncateWithTooltip
      as={Tag}
      className={cn(
        level === 1 && 'text-2xl font-bold',
        level === 2 && 'text-xl font-semibold',
        level === 3 && 'text-lg font-semibold',
        level === 4 && 'text-base font-medium',
        className
      )}
      {...props}
    >
      {children}
    </TruncateWithTooltip>
  );
}

/**
 * TruncatedText — Texte tronqué avec tooltip
 */
export function TruncatedText({
  children,
  className,
  ...props
}: Omit<TruncateWithTooltipProps, 'as'>) {
  return (
    <TruncateWithTooltip
      as="span"
      className={cn('text-sm', className)}
      {...props}
    >
      {children}
    </TruncateWithTooltip>
  );
}

/**
 * TruncatedDescription — Description tronquée avec tooltip (multiligne)
 */
export function TruncatedDescription({
  children,
  lines = 2,
  className,
  ...props
}: Omit<TruncateWithTooltipProps, 'as'>) {
  return (
    <TruncateWithTooltip
      as="p"
      lines={lines}
      className={cn('text-sm text-slate-500 dark:text-slate-400', className)}
      {...props}
    >
      {children}
    </TruncateWithTooltip>
  );
}

/**
 * Hook pour détecter si un texte est tronqué
 */
export function useIsTruncated(ref: React.RefObject<HTMLElement | null>) {
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const isSingleLine = el.scrollWidth > el.clientWidth;
      const isMultiLine = el.scrollHeight > el.clientHeight;
      setIsTruncated(isSingleLine || isMultiLine);
    };

    check();
    
    const observer = new ResizeObserver(check);
    observer.observe(el);
    
    return () => observer.disconnect();
  }, [ref]);

  return isTruncated;
}
