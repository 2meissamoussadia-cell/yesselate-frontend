'use client';

/**
 * ModuleSubSidebar — Arborescence de dossiers/catégories générique type Outlook.
 * Utilise la configuration ModuleConfig (SubSidebarSection[]).
 *
 * Contrat :
 * - Présentation uniquement : pas de fetch, pas de store.
 * - Props : sections, selectedId, onSelect, headerLabel.
 * - Page gère : chargement des dossiers, changement de dossier.
 * 
 * Améliorations v2 :
 * - Hover effects subtils avec bordure gauche
 * - Badges compteurs uniformisés
 * - Focus visible WCAG
 * - Tooltips sur labels tronqués
 * - Section headers plus subtils
 */

import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronDown,
  ChevronRight,
  Inbox,
  Send,
  FileEdit,
  Trash2,
  Archive,
  Folder,
  AlertCircle,
  AlertTriangle,
  Clock,
  Wrench,
  Calendar,
  CheckCircle,
  Shield,
  DollarSign,
  Scale,
  Gavel,
  History,
  List,
  Map,
  FolderKanban,
  FileText,
  Receipt,
  CreditCard,
  Lightbulb,
  Zap,
  Activity,
  MapPin,
  ShoppingCart,
  Building2,
  ShieldCheck,
  BookOpen,
  ScrollText,
  Database,
  Video,
  FolderOpen,
  Eye,
  XCircle,
  Paperclip,
  Flag,
  Hammer,
  Package,
  Users,
  ClipboardCheck,
  UserCheck,
  CheckCircle2,
  ChevronsDown,
  ChevronsUp,
  Minus,
  Star,
  UserPlus,
  Briefcase,
  Truck,
  ArrowLeftRight,
  Files,
  Building,
  LayoutDashboard,
  TrendingUp,
  Award,
  Target,
  FileBarChart,
  FileCheck,
  CalendarDays,
  FileSpreadsheet,
  Printer,
  Share2,
  PlayCircle,
  PauseCircle,
  HardHat,
  Paintbrush,
  FileSearch,
  ClipboardList,
  TrendingDown,
  Type,
  Search,
  Leaf,
  Box,
  Droplet,
  Route,
  GitBranch,
  Edit,
  MessageSquare,
  Layers,
  File,
  BarChart3,
  User,
  CalendarRange,
  PackageCheck,
  FlaskConical,
  ListChecks,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SubSidebarSection, SubSidebarItem } from '@/lib/types/module.types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Inbox, Send, FileEdit, Trash2, Archive, Folder,
  AlertCircle, AlertTriangle, Clock, Wrench, Calendar, CheckCircle, Shield, DollarSign,
  Scale, Gavel, History, List, Map, FolderKanban, FileText, Receipt, CreditCard,
  Lightbulb, Zap, Activity, MapPin, ShoppingCart, Building2, ShieldCheck,
  BookOpen, ScrollText, Database, Video, FolderOpen, Eye, XCircle, Paperclip, Flag,
  Hammer, Package, Users,
  ClipboardCheck, UserCheck, CheckCircle2, ChevronsDown, ChevronsUp, Minus,
  Star, UserPlus, Briefcase, Truck, ArrowLeftRight, Files, Building,
  LayoutDashboard, TrendingUp, Award, Target, FileBarChart, FileCheck,
  CalendarDays, FileSpreadsheet, Printer, Share2,
  PlayCircle, PauseCircle, HardHat, Paintbrush, FileSearch, ClipboardList,
  TrendingDown, Type,
  Search, Leaf, Box, Droplet, Route, GitBranch, Edit, MessageSquare, Layers, File,
  BarChart3,
  User,
  CalendarRange,
  PackageCheck,
  FlaskConical,
  ListChecks,
};

const systemTypeMap: Record<string, string> = {
  inbox: 'Inbox', sent: 'Send', drafts: 'FileEdit', trash: 'Trash2', archive: 'Archive',
};

function getIcon(iconName: string, systemType?: string): React.ReactNode {
  const name = (systemType && systemTypeMap[systemType]) || iconName;
  const IconComponent = iconMap[name] ?? Folder;
  return <IconComponent className="h-4 w-4" />;
}

export interface ModuleSubSidebarProps {
  /** Sections à afficher (dossiers, catégories) */
  sections: SubSidebarSection[];
  /** ID de l'élément sélectionné */
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Libellé optionnel en tête (ex: nom du module) */
  headerLabel?: string;
  className?: string;
}

function ItemRow({
  item,
  selectedId,
  onSelect,
  level = 0,
}: {
  item: SubSidebarItem;
  selectedId?: string;
  onSelect?: (id: string) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  const selected = selectedId === item.id;
  const icon = getIcon(item.icon, item.systemType);

  return (
    <>
      <div
        className={cn(
          'group relative w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg',
          'transition-all duration-150 ease-out text-left',
          // Bordure gauche hover (style Outlook)
          'before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full',
          'before:bg-transparent before:transition-colors before:duration-150',
          // Focus visible WCAG
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-1',
          selected
            ? [
                'bg-sky-100 dark:bg-sky-900/50',
                'text-sky-900 dark:text-sky-100 font-medium',
                'before:bg-sky-500',
              ]
            : [
                'text-slate-700 dark:text-slate-300',
                'hover:bg-slate-100 dark:hover:bg-slate-800/60',
                'hover:before:bg-slate-300 dark:hover:before:bg-slate-600',
              ]
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            className={cn(
              'shrink-0 p-1 -m-0.5 rounded-md',
              'hover:bg-slate-200/80 dark:hover:bg-slate-700/80',
              'transition-colors duration-100',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500'
            )}
            aria-expanded={expanded}
            aria-label={expanded ? 'Réduire' : 'Développer'}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onSelect?.(item.id)}
              className="flex-1 flex items-center gap-2.5 min-w-0 text-left"
              aria-current={selected ? 'page' : undefined}
            >
              {icon && (
                <span
                  className={cn(
                    'shrink-0 transition-colors duration-150',
                    selected
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )}
                  style={item.color ? { color: item.color } : undefined}
                >
                  {icon}
                </span>
              )}
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span
                  className={cn(
                    'shrink-0 inline-flex items-center justify-center',
                    'min-w-[22px] h-[22px] px-1.5 rounded-full',
                    'text-xs font-semibold',
                    'transition-colors duration-150',
                    selected
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  )}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="font-medium">{item.label}</p>
            {item.badge != null && item.badge > 0 && (
              <p className="text-xs text-slate-500">{item.badge} élément{item.badge > 1 ? 's' : ''}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
      {hasChildren &&
        expanded &&
        item.children!.map((child) => (
          <ItemRow
            key={child.id}
            item={child}
            selectedId={selectedId}
            onSelect={onSelect}
            level={level + 1}
          />
        ))}
    </>
  );
}

export function ModuleSubSidebar({
  sections,
  selectedId,
  onSelect,
  headerLabel,
  className,
}: ModuleSubSidebarProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <div className={cn('flex flex-col h-full bg-white dark:bg-slate-950/50', className)}>
        {/* Header avec titre du module */}
        {headerLabel && (
          <div className="shrink-0 px-4 py-4 border-b border-slate-200 dark:border-slate-800/60">
            <h2
              className="text-base font-semibold text-slate-800 dark:text-slate-200 truncate"
              title={headerLabel}
            >
              {headerLabel}
            </h2>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 scrollbar-dashboard" aria-label="Navigation par dossiers">
          {sections.map((section, sectionIndex) => (
            <div key={section.title} className={cn(sectionIndex > 0 && 'mt-4')}>
              {/* Section header - plus subtil */}
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 mb-1',
                  'text-[11px] font-medium uppercase tracking-wider',
                  'text-slate-500 dark:text-slate-400',
                  section.collapsible && 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                <span className="flex-1">{section.title}</span>
                {/* Compteur total de la section */}
                {section.items.reduce((acc, item) => acc + (item.badge ?? 0), 0) > 0 && (
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    {section.items.reduce((acc, item) => acc + (item.badge ?? 0), 0)}
                  </span>
                )}
              </div>
              {/* Items */}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    selectedId={selectedId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </TooltipProvider>
  );
}
