/**
 * Bouton d'export de données avec menu déroulant
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, BarChart3, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  const handleExportCSV = () => {
    onExportCSV?.();
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    onExportJSON?.();
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              'bg-slate-800/50 border border-slate-700/50 text-slate-300',
              'hover:bg-slate-800/70 hover:border-slate-600/50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isOpen && 'bg-slate-800/70 border-slate-600/50'
            )}
            aria-label="Exporter les données"
            aria-expanded={isOpen}
          >
            <Download className="h-4 w-4" />
            <span>{label}</span>
            <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Exporter les données au format CSV ou JSON</p>
        </TooltipContent>
      </Tooltip>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className={cn(
              'absolute right-0 top-full mt-2 w-48 z-50',
              'bg-slate-900/95 border border-slate-700/50 rounded-lg shadow-xl backdrop-blur-xl',
              'animate-fadeIn'
            )}
          >
            <div className="p-2 space-y-1">
              {onExportCSV && (
                <button
                  onClick={handleExportCSV}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors text-left"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Exporter en CSV
                </button>
              )}
              {onExportJSON && (
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors text-left"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Exporter en JSON
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

