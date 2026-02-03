'use client';

/**
 * ModuleSubSidebar — Arborescence de dossiers/catégories générique type Outlook.
 * Utilise la configuration ModuleConfig (SubSidebarSection[]).
 *
 * Contrat :
 * - Présentation uniquement : pas de fetch, pas de store.
 * - Props : sections, selectedId, onSelect, headerLabel.
 * - Page gère : chargement des dossiers, changement de dossier.
 */

import React, { useState } from 'react';
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
import { cn } from '@/lib/utils';
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
          'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
          'focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-1',
          selected
            ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-900 dark:text-sky-100 font-medium'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
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
            className="shrink-0 p-0.5 -m-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
            aria-expanded={expanded}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onSelect?.(item.id)}
          className="flex-1 flex items-center gap-2 min-w-0 text-left"
          aria-current={selected ? 'true' : undefined}
          aria-label={`${item.label}${item.badge != null && item.badge > 0 ? `, ${item.badge}` : ''}`}
        >
          {icon && (
            <span
              className="shrink-0 text-slate-500 dark:text-slate-400"
              style={item.color ? { color: item.color } : undefined}
            >
              {icon}
            </span>
          )}
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge != null && item.badge > 0 && (
            <span className="shrink-0 text-xs font-semibold text-sky-600 dark:text-sky-400">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </button>
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
    <div className={cn('flex flex-col h-full', className)}>
      {headerLabel && (
        <div className="shrink-0 px-3 py-3 border-b border-slate-200 dark:border-slate-800/60">
          <p
            className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate"
            title={headerLabel}
          >
            {headerLabel}
          </p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Dossiers">
        {sections.map((section) => (
          <div key={section.title} className="mb-2">
            <div
              className={cn(
                'px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400',
                section.collapsible && 'cursor-pointer'
              )}
            >
              {section.title}
            </div>
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
  );
}
