'use client';

/**
 * DashboardViewLayout — Layout tableau de bord avec grille de widgets.
 * PHASE 2C : modules exécution (Gouvernance, Admin, Cockpit).
 */

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Settings,
  RefreshCw,
  Download,
  Share2,
  Maximize2,
  Minimize2,
  Grid3x3,
  List,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ResponsiveGridLayout,
  useContainerWidth,
  type Layout,
  type LayoutItem,
} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export interface DashboardWidget {
  id: string;
  type: 'stat' | 'chart' | 'table' | 'list' | 'gauge' | 'progress' | 'custom';
  title: string;
  component: ReactNode;
  defaultSize?: { w: number; h: number };
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
  refreshable?: boolean;
  exportable?: boolean;
}

export interface DashboardSection {
  id: string;
  title?: string;
  widgets: DashboardWidget[];
  layout?: Layout;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface DashboardViewLayoutProps {
  sidebar?: ReactNode;
  sidebarWidth?: number;
  sidebarCollapsible?: boolean;

  sections: DashboardSection[];

  editable?: boolean;
  onLayoutChange?: (layout: Layout) => void;
  onWidgetRefresh?: (widgetId: string) => void;
  onWidgetExport?: (widgetId: string, format: 'pdf' | 'excel' | 'csv') => void;

  gridCols?: { lg: number; md: number; sm: number; xs: number };
  rowHeight?: number;

  className?: string;
}

export function DashboardViewLayout({
  sidebar,
  sidebarWidth = 280,
  sections,
  editable = false,
  onLayoutChange,
  onWidgetRefresh,
  onWidgetExport,
  gridCols = { lg: 12, md: 10, sm: 6, xs: 4 },
  rowHeight = 100,
  className,
}: DashboardViewLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullscreenWidget, setFullscreenWidget] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const { width: containerWidth, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: false,
  });

  const generateDefaultLayouts = (section: DashboardSection): Layout => {
    if (section.layout?.length) return section.layout;

    const items: LayoutItem[] = [];
    let currentY = 0;
    let currentX = 0;

    section.widgets.forEach((widget) => {
      const defaultW = widget.defaultSize?.w ?? 4;
      const defaultH = widget.defaultSize?.h ?? 3;

      if (currentX + defaultW > gridCols.lg) {
        currentX = 0;
        currentY += defaultH;
      }

      items.push({
        i: widget.id,
        x: currentX,
        y: currentY,
        w: defaultW,
        h: defaultH,
        minW: widget.minSize?.w,
        minH: widget.minSize?.h,
        maxW: widget.maxSize?.w,
        maxH: widget.maxSize?.h,
      });

      currentX += defaultW;
    });

    return items;
  };

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const renderWidget = (widget: DashboardWidget, isFullscreen = false) => (
    <div
      data-widget={widget.id}
      className={cn(
        'bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col',
        isFullscreen && 'fixed inset-4 z-50'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50',
          editable && 'cursor-grab active:cursor-grabbing drag-handle'
        )}
      >
        <h3 className="font-semibold text-sm">{widget.title}</h3>

        <div className="flex items-center gap-1">
          {widget.refreshable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onWidgetRefresh?.(widget.id)}
              aria-label="Actualiser"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}

          {widget.exportable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Exporter">
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onWidgetExport?.(widget.id, 'pdf')}>
                  Exporter PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onWidgetExport?.(widget.id, 'excel')}>
                  Exporter Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onWidgetExport?.(widget.id, 'csv')}>
                  Exporter CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!isFullscreen ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFullscreenWidget(widget.id)}
              aria-label="Plein écran"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFullscreenWidget(null)}
              aria-label="Réduire"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">{widget.component}</div>
    </div>
  );

  const fullscreenWidgetData = fullscreenWidget
    ? sections.flatMap((s) => s.widgets).find((w) => w.id === fullscreenWidget)
    : null;

  return (
    <div className={cn('flex h-screen bg-slate-100 dark:bg-slate-950', className)}>
      {sidebar && !sidebarCollapsed && (
        <div
          className="flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto"
          style={{ width: sidebarWidth }}
        >
          {sidebar}
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h1 className="text-lg font-semibold">Tableau de bord</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                aria-label="Vue grille"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                aria-label="Vue liste"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser tout
            </Button>

            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>

            {editable && (
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Personnaliser
              </Button>
            )}
          </div>
        </div>

        <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {sections.map((section) => {
            const isCollapsed = collapsedSections.has(section.id);
            const layout = generateDefaultLayouts(section);

            return (
              <div key={section.id} className="space-y-4">
                {section.title && (
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {section.title}
                    </h2>

                    {section.collapsible && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSectionCollapse(section.id)}
                      >
                        {isCollapsed ? 'Afficher' : 'Masquer'}
                      </Button>
                    )}
                  </div>
                )}

                {!isCollapsed && (
                  <>
                    {viewMode === 'grid' && mounted && containerWidth > 0 ? (
                      <ResponsiveGridLayout
                        width={containerWidth}
                        className="layout"
                        layouts={{ lg: layout, md: layout, sm: layout }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
                        cols={gridCols}
                        rowHeight={rowHeight}
                        margin={[16, 16]}
                        containerPadding={[0, 0]}
                        dragConfig={{
                          enabled: editable,
                          handle: editable ? '.drag-handle' : undefined,
                          threshold: 3,
                          bounded: true,
                        }}
                        resizeConfig={{
                          enabled: editable,
                          handles: ['se', 's', 'e'],
                        }}
                        onLayoutChange={(currentLayout: Layout) => {
                          onLayoutChange?.(currentLayout);
                        }}
                      >
                        {section.widgets.map((widget) => (
                          <div key={widget.id}>{renderWidget(widget)}</div>
                        ))}
                      </ResponsiveGridLayout>
                    ) : (
                      <div className="space-y-4">
                        {section.widgets.map((widget) => (
                          <div key={widget.id}>{renderWidget(widget)}</div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {fullscreenWidget && fullscreenWidgetData && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setFullscreenWidget(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && setFullscreenWidget(null)}
          aria-label="Fermer le widget plein écran"
        >
          <div
            className="absolute inset-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {renderWidget(fullscreenWidgetData, true)}
          </div>
        </div>
      )}
    </div>
  );
}
