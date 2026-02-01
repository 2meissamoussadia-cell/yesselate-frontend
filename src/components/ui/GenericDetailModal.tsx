'use client';

/**
 * GenericDetailModal - Pattern Modal Overlay Unifié
 * 
 * Composant réutilisable pour afficher les détails d'un élément
 * avec navigation prev/next, tabs dynamiques, et actions contextuelles
 * 
 * Usage:
 * - Préserve le contexte (liste visible en arrière-plan)
 * - Navigation rapide entre items
 * - UX moderne et fluide
 * - Multitâche possible
 */

import React, { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ================================
// Types
// ================================

export interface TabConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  content: React.ReactNode;
}

export interface ActionButton {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface GenericDetailModalProps {
  // Contrôle
  isOpen: boolean;
  onClose: () => void;
  
  // Contenu principal
  title: string;
  subtitle?: string;
  headerBadge?: React.ReactNode;
  statusBadge?: {
    label: string;
    variant: 'default' | 'warning' | 'critical' | 'success' | 'info';
  };
  
  // Tabs
  tabs: TabConfig[];
  defaultActiveTab?: string;
  defaultTab?: string;
  
  // Actions
  actions?: ActionButton[];
  
  // Navigation
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  navigationLabel?: string;
  
  // Actions secondaires
  secondaryActions?: ActionButton[];
  
  // Options
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  loading?: boolean;
  className?: string;
}

// ================================
// Composant Principal
// ================================

export function GenericDetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  headerBadge,
  statusBadge,
  tabs,
  defaultActiveTab: defaultActiveTabProp,
  defaultTab,
  actions,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
  size = 'lg',
  loading = false,
  className,
}: GenericDetailModalProps) {
  const defaultActiveTab = defaultActiveTabProp ?? defaultTab;
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id);

  // Reset active tab when modal opens
  useEffect(() => {
    if (isOpen && defaultActiveTab) {
      setActiveTab(defaultActiveTab);
    }
  }, [isOpen, defaultActiveTab]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC pour fermer
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Arrow keys pour navigation prev/next
      if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        e.preventDefault();
        onPrevious();
      }
      if (e.key === 'ArrowRight' && hasNext && onNext) {
        e.preventDefault();
        onNext();
      }
      
      // Ctrl+Tab / Ctrl+Shift+Tab pour navigation entre tabs
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
        if (e.shiftKey) {
          // Prev tab
          const newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          setActiveTab(tabs[newIndex].id);
        } else {
          // Next tab
          const newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          setActiveTab(tabs[newIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, tabs, hasNext, hasPrevious, onNext, onPrevious, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-[95vw]',
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl',
          'flex flex-col max-h-[90vh]',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                {title}
              </h2>
              {headerBadge}
              {statusBadge && (
                <Badge
                  variant={
                    statusBadge.variant === 'critical' ? 'destructive' :
                    statusBadge.variant === 'warning' ? 'default' :
                    statusBadge.variant === 'success' ? 'default' :
                    'gray'
                  }
                  className={cn(
                    statusBadge.variant === 'success' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                    statusBadge.variant === 'info' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                    statusBadge.variant === 'warning' && 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                  )}
                >
                  {statusBadge.label}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* Navigation prev/next */}
            {(onPrevious || onNext) && (
              <div className="flex items-center gap-1 mr-2 border-r border-gray-200 dark:border-gray-700 pr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  title="Précédent (←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNext}
                  disabled={!hasNext}
                  title="Suivant (→)"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              title="Fermer (ESC)"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs Navigation */}
        {tabs.length > 1 && (
          <div className="flex items-center gap-1 px-6 pt-4 border-b border-gray-200 dark:border-gray-800">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
                  'flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-b-2 border-blue-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <Badge variant="gray" className="ml-1">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            activeTabData?.content
          )}
        </div>

        {/* Footer Actions */}
        {actions && actions.length > 0 && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            {actions.map(action => (
              <Button
                key={action.id}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
              >
                {action.loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : action.icon ? (
                  <span className="mr-2">{action.icon}</span>
                ) : null}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ================================
// Export
// ================================

export default GenericDetailModal;
