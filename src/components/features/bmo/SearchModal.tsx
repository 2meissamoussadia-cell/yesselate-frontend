'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  demands,
  projects,
  employees,
  bureaux,
  bcToValidate,
  contractsToSign,
  arbitrages,
} from '@/lib/data';

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
}

export function SearchModal() {
  const router = useRouter();
  const { darkMode } = useAppStore();
  const { showSearch, setShowSearch, searchQuery, setSearchQuery, addToast } = useBMOStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Construire l'index de recherche
  const searchIndex: SearchResult[] = useMemo(() => {
    const items: SearchResult[] = [];

    // Demandes
    demands.forEach((d) => {
      items.push({
        type: 'Demande',
        id: d.id,
        title: d.subject,
        subtitle: `${d.bureau} • ${d.amount}`,
        icon: d.icon,
        route: '/maitre-ouvrage/demandes',
      });
    });

    // Projets
    projects.forEach((p) => {
      items.push({
        type: 'Projet',
        id: p.id,
        title: p.name,
        subtitle: `${p.client} • ${p.budget}`,
        icon: '🏗️',
        route: '/maitre-ouvrage/projets-en-cours',
      });
    });

    // Employés
    employees.forEach((e) => {
      items.push({
        type: 'Employé',
        id: e.id,
        title: e.name,
        subtitle: `${e.role} • ${e.bureau}`,
        icon: '👤',
        route: '/maitre-ouvrage/employes',
      });
    });

    // Bureaux
    bureaux.forEach((b) => {
      items.push({
        type: 'Bureau',
        id: b.code,
        title: b.name,
        subtitle: `${b.agents} agents • ${b.head}`,
        icon: b.icon,
        route: '/maitre-ouvrage/arbitrages-vivants',
      });
    });

    // BC à valider
    bcToValidate.forEach((bc) => {
      items.push({
        type: 'BC',
        id: bc.id,
        title: bc.subject,
        subtitle: `${bc.supplier} • ${bc.amount}`,
        icon: '📋',
        route: '/maitre-ouvrage/validation-bc',
      });
    });

    // Contrats
    contractsToSign.forEach((c) => {
      items.push({
        type: 'Contrat',
        id: c.id,
        title: c.subject,
        subtitle: `${c.partner} • ${c.amount}`,
        icon: '📜',
        route: '/maitre-ouvrage/validation-contrats',
      });
    });

    // Arbitrages
    arbitrages.forEach((a) => {
      items.push({
        type: 'Arbitrage',
        id: a.id,
        title: a.subject,
        subtitle: a.parties.join(' vs '),
        icon: '⚖️',
        route: '/maitre-ouvrage/arbitrages-vivants',
      });
    });

    // Pages
    const pages = [
      { id: 'dashboard', title: 'Tableau de bord', icon: '📊', route: '/maitre-ouvrage/dashboard' },
      { id: 'demandes', title: 'Demandes', icon: '📋', route: '/maitre-ouvrage/demandes' },
      { id: 'projets-en-cours', title: 'Projets en cours', icon: '🏗️', route: '/maitre-ouvrage/projets-en-cours' },
      { id: 'employes', title: 'Employés', icon: '👤', route: '/maitre-ouvrage/employes' },
      { id: 'arbitrages-vivants', title: 'Gouvernance & Décisions', icon: '🎯', route: '/maitre-ouvrage/arbitrages-vivants' },
      { id: 'calendrier', title: 'Calendrier', icon: '📅', route: '/maitre-ouvrage/calendrier' },
      { id: 'delegations', title: 'Délégations', icon: '🔑', route: '/maitre-ouvrage/delegations' },
      { id: 'validation-bc', title: 'Validation BC', icon: '✅', route: '/maitre-ouvrage/validation-bc' },
      { id: 'validation-contrats', title: 'Contrats', icon: '📜', route: '/maitre-ouvrage/validation-contrats' },
      { id: 'validation-paiements', title: 'Paiements', icon: '💳', route: '/maitre-ouvrage/validation-paiements' },
      { id: 'echanges-structures', title: 'Échanges Structures', icon: '💬', route: '/maitre-ouvrage/echanges-structures' },
      { id: 'arbitrages-vivants', title: 'Arbitrages Vivants', icon: '⚖️', route: '/maitre-ouvrage/arbitrages-vivants' },
      { id: 'decisions', title: 'Décisions', icon: '⚖️', route: '/maitre-ouvrage/decisions' },
      { id: 'recouvrements', title: 'Recouvrements', icon: '📜', route: '/maitre-ouvrage/recouvrements' },
    ];

    pages.forEach((p) => {
      items.push({
        type: 'Page',
        id: p.id,
        title: p.title,
        subtitle: 'Navigation',
        icon: p.icon,
        route: p.route,
      });
    });

    return items;
  }, []);

  // Filtrer les résultats
  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return searchIndex
      .filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query) ||
          item.subtitle.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query)
      )
      .slice(0, 10);
  }, [searchQuery, searchIndex]);

  // Raccourci clavier Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(!showSearch);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
      if (showSearch && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const selected = results[selectedIndex];
          if (selected) {
            router.push(selected.route);
            setShowSearch(false);
            setSearchQuery('');
            addToast(`Navigation vers ${selected.title}`, 'info');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, results, selectedIndex, router, setShowSearch, setSearchQuery, addToast]);

  // Reset index quand les résultats changent
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.route);
    setShowSearch(false);
    setSearchQuery('');
    addToast(`Navigation vers ${result.title}`, 'info');
  };

  return (
    <Dialog open={showSearch} onOpenChange={setShowSearch}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden"
        onClose={() => setShowSearch(false)}
      >
        {/* Barre de recherche */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700">
          <span className="text-xl">🔍</span>
          <input
            type="text"
            placeholder="Rechercher demandes, projets, employés, pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'flex-1 bg-transparent text-lg outline-none',
              darkMode ? 'placeholder:text-slate-400' : 'placeholder:text-gray-400'
            )}
            autoFocus
          />
          <kbd className="px-2 py-1 rounded bg-slate-700 text-[10px] text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Résultats */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {searchQuery.trim() === '' ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm">Commencez à taper pour rechercher...</p>
              <p className="text-xs mt-2">
                Recherchez par ID, nom, type ou contenu
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-4xl mb-2">🔍</p>
              <p className="text-sm">Aucun résultat pour "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result, i) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    selectedIndex === i
                      ? 'bg-orange-500/20 border border-orange-500/30'
                      : darkMode
                      ? 'hover:bg-slate-700/50'
                      : 'hover:bg-gray-100'
                  )}
                >
                  <span className="text-xl w-8 text-center">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-[9px]">
                        {result.type}
                      </Badge>
                      <span className="font-mono text-[10px] text-orange-400">
                        {result.id}
                      </span>
                    </div>
                    <p className="font-semibold text-sm truncate">{result.title}</p>
                    <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                  </div>
                  <span className="text-slate-400">→</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-slate-700 text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigation</span>
            <span>↵ Sélectionner</span>
            <span>ESC Fermer</span>
          </div>
          <span>{results.length} résultat(s)</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
