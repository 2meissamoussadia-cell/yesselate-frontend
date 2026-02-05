/**
 * Bouton d'export de données avec menu déroulant
 */

'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Download, FileText, BarChart3, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { zIndexClass } from '../../utils/zIndex';

interface ExportButtonProps {
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function ExportButton({
  onExportCSV,
  onExportJSON,
  label = 'Exporter',
  className,
  disabled = false,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Mémoriser les handlers pour éviter les re-renders
  const handleExportCSV = useCallback(() => {
    onExportCSV?.();
    setIsOpen(false);
  }, [onExportCSV]);

  const handleExportJSON = useCallback(() => {
    onExportJSON?.();
    setIsOpen(false);
  }, [onExportJSON]);

  const handleToggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Mémoriser className pour éviter les re-renders
  const buttonClassName = useMemo(() => cn(
    'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all',
    'bg-slate-800/50 border border-slate-700/50 text-slate-300 whitespace-nowrap',
    'hover:bg-slate-800/70 hover:border-slate-600/50',
    'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'min-w-0 flex-shrink-0',
    isOpen && 'bg-slate-800/70 border-slate-600/50'
  ), [isOpen]);

  const chevronClassName = useMemo(() => cn(
    'h-3 w-3 transition-transform',
    isOpen && 'rotate-180'
  ), [isOpen]);

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggleMenu}
            disabled={disabled}
            className={buttonClassName}
            aria-label="Exporter les données"
            aria-expanded={isOpen}
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate min-w-0">{label}</span>
            <ChevronDown className={cn(chevronClassName, 'flex-shrink-0')} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Exporter les données au format CSV ou JSON</p>
        </TooltipContent>
      </Tooltip>

      {isOpen && (
        <>
          <div
            className={cn("fixed inset-0", zIndexClass('overlay'))}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className={cn(
              'absolute right-0 top-full mt-2 w-44 sm:w-48 min-w-0',
              zIndexClass('dropdownMenu'),
              'bg-slate-900/95 border border-slate-700/50 rounded-lg shadow-xl backdrop-blur-xl',
              'animate-fadeIn overflow-hidden'
            )}
          >
            <div className="p-1.5 sm:p-2 space-y-0.5 sm:space-y-1 min-w-0">
              {onExportCSV && (
                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors text-left min-w-0"
                >
                  <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate min-w-0">Exporter en CSV</span>
                </button>
              )}
              {onExportJSON && (
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors text-left min-w-0"
                >
                  <BarChart3 className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate min-w-0">Exporter en JSON</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

