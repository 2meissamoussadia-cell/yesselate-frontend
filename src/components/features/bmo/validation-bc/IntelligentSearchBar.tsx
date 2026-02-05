'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, Sparkles, Zap, AlertTriangle } from 'lucide-react';
import type { PurchaseOrder, Invoice, Amendment } from '@/lib/types/bmo.types';

interface IntelligentSearchBarProps {
  bcs?: PurchaseOrder[];
  factures?: Invoice[];
  avenants?: Amendment[];
  onSelectBC?: (bc: PurchaseOrder) => void;
  onSelectFacture?: (facture: Invoice) => void;
  onSelectAvenant?: (avenant: Amendment) => void;
  activeTab?: 'bc' | 'factures' | 'avenants';
}

export function IntelligentSearchBar({
  bcs = [],
  factures = [],
  avenants = [],
  onSelectBC,
  onSelectFacture,
  onSelectAvenant,
  activeTab,
}: IntelligentSearchBarProps) {
  const { darkMode } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Recherche intelligente
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { bcs: [], factures: [], avenants: [] };

    const query = searchQuery.toLowerCase().trim();
    const results = {
      bcs: bcs.filter(bc => 
        bc.id.toLowerCase().includes(query) ||
        bc.subject.toLowerCase().includes(query) ||
        bc.supplier.toLowerCase().includes(query) ||
        bc.project.toLowerCase().includes(query)
      ).slice(0, 5),
      factures: factures.filter(f => 
        f.id.toLowerCase().includes(query) ||
        f.objet.toLowerCase().includes(query) ||
        f.fournisseur.toLowerCase().includes(query) ||
        f.projet.toLowerCase().includes(query)
      ).slice(0, 5),
      avenants: avenants.filter(a => 
        a.id.toLowerCase().includes(query) ||
        a.objet.toLowerCase().includes(query) ||
        a.contratRef.toLowerCase().includes(query) ||
        a.partenaire.toLowerCase().includes(query)
      ).slice(0, 5),
    };

    return results;
  }, [searchQuery, bcs, factures, avenants]);

  const totalResults = searchResults.bcs.length + searchResults.factures.length + searchResults.avenants.length;

  const handleSelect = (item: PurchaseOrder | Invoice | Amendment, type: 'bc' | 'facture' | 'avenant') => {
    setSearchQuery('');
    setIsFocused(false);
    if (type === 'bc' && onSelectBC) onSelectBC(item as PurchaseOrder);
    if (type === 'facture' && onSelectFacture) onSelectFacture(item as Invoice);
    if (type === 'avenant' && onSelectAvenant) onSelectAvenant(item as Amendment);
  };

  // Détection automatique du type depuis la recherche
  const detectedType = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (query.startsWith('bc-') || query.startsWith('bc_')) return 'bc';
    if (query.startsWith('fac-') || query.startsWith('fac_')) return 'factures';
    if (query.startsWith('avn-') || query.startsWith('avn_')) return 'avenants';
    return null;
  }, [searchQuery]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={`Rechercher par numéro (BC-XXXX, FAC-XXXX, AVN-XXXX), objet, fournisseur, projet...`}
          className={cn(
            'w-full pl-12 pr-12 py-3 rounded-lg border-2 text-sm',
            'bg-slate-800 border-slate-700 text-slate-300',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
            'transition-all',
            isFocused && 'shadow-lg'
          )}
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsFocused(false);
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions IA */}
      {searchQuery && !totalResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 border-blue-500/30 bg-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Aucun résultat trouvé pour "{searchQuery}"</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats de recherche */}
      {isFocused && searchQuery && totalResults > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-2xl max-h-[500px] overflow-y-auto">
          <CardContent className="p-0">
            {/* BC Results */}
            {searchResults.bcs.length > 0 && (
              <div className="border-b border-slate-700/30">
                <div className="p-3 bg-emerald-500/10 border-b border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-xs">BC</Badge>
                    <span className="text-xs text-slate-400">{searchResults.bcs.length} résultat(s)</span>
                  </div>
                </div>
                {searchResults.bcs.map((bc) => (
                  <button
                    key={bc.id}
                    onClick={() => handleSelect(bc, 'bc')}
                    className={cn(
                      'w-full p-3 text-left hover:bg-emerald-500/10 transition-colors border-b border-slate-700/30',
                      darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold text-emerald-400">{bc.id}</span>
                          <Badge variant={bc.priority === 'urgent' ? 'urgent' : bc.priority === 'high' ? 'warning' : 'default'} className="text-[10px]">
                            {bc.priority}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{bc.subject}</p>
                        <p className="text-xs text-slate-400">{bc.supplier} • {bc.project}</p>
                      </div>
                      <span className="text-sm font-bold text-amber-400 ml-4">{bc.amount}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Factures Results */}
            {searchResults.factures.length > 0 && (
              <div className="border-b border-slate-700/30">
                <div className="p-3 bg-blue-500/10 border-b border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="info" className="text-xs">Factures</Badge>
                    <span className="text-xs text-slate-400">{searchResults.factures.length} résultat(s)</span>
                  </div>
                </div>
                {searchResults.factures.map((facture) => (
                  <button
                    key={facture.id}
                    onClick={() => handleSelect(facture, 'facture')}
                    className={cn(
                      'w-full p-3 text-left hover:bg-blue-500/10 transition-colors border-b border-slate-700/30',
                      darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold text-blue-400">{facture.id}</span>
                        </div>
                        <p className="text-sm font-medium">{facture.objet}</p>
                        <p className="text-xs text-slate-400">{facture.fournisseur} • {facture.projet}</p>
                      </div>
                      <span className="text-sm font-bold text-blue-400 ml-4">{facture.montant} FCFA</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Avenants Results */}
            {searchResults.avenants.length > 0 && (
              <div>
                <div className="p-3 bg-purple-500/10 border-b border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">Avenants</Badge>
                    <span className="text-xs text-slate-400">{searchResults.avenants.length} résultat(s)</span>
                  </div>
                </div>
                {searchResults.avenants.map((avenant) => (
                  <button
                    key={avenant.id}
                    onClick={() => handleSelect(avenant, 'avenant')}
                    className={cn(
                      'w-full p-3 text-left hover:bg-purple-500/10 transition-colors border-b border-slate-700/30',
                      darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold text-purple-400">{avenant.id}</span>
                          <Badge variant={avenant.impact === 'Financier' ? 'warning' : avenant.impact === 'Délai' ? 'info' : 'default'} className="text-[10px]">
                            {avenant.impact}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{avenant.objet}</p>
                        <p className="text-xs text-slate-400">{avenant.partenaire} • {avenant.contratRef}</p>
                      </div>
                      {avenant.montant && (
                        <span className="text-sm font-bold text-orange-400 ml-4">+{avenant.montant} FCFA</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Footer avec raccourci clavier */}
            <div className="p-3 bg-slate-800/50 border-t border-slate-700/30">
              <p className="text-xs text-slate-400 text-center">
                Appuyez sur <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Entrée</kbd> pour ouvrir le premier résultat
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

