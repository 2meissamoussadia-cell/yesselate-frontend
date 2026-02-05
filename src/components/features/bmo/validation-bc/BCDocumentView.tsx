'use client';

import { useRef } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { 
  Download, Printer
} from 'lucide-react';
import type { EnrichedBC } from '@/lib/types/document-validation.types';
import { enrichBCWithDefaults } from '@/lib/utils/bc-enricher';
import { BonDeCommandePreview } from './BonDeCommandePreview';
import { convertBCToPreviewData } from '@/lib/utils/bc-to-preview-data';

interface BCDocumentViewProps {
  bc: EnrichedBC;
}

export function BCDocumentView({ bc }: BCDocumentViewProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Enrichir automatiquement le BC avec des données par défaut si nécessaire
  const enrichedBC = enrichBCWithDefaults(bc);
  
  // Convertir le BC en données pour l'aperçu
  const previewData = convertBCToPreviewData(enrichedBC);

  const handlePrint = () => {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      win.focus();
      win.print();
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    addToast('Génération du PDF en cours...', 'info');
    // TODO: Implémenter la génération PDF complète
    // Pour l'instant, utiliser l'impression du navigateur
    handlePrint();
  };

  return (
    <div className={cn(
      'w-full',
      darkMode ? 'bg-slate-900' : 'bg-white'
    )}>
      {/* Actions */}
      <div className="flex justify-end gap-2 mb-4 print:hidden">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Télécharger PDF
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </Button>
      </div>

      {/* Aperçu du bon de commande avec le nouveau composant */}
      <div className="w-full">
        <BonDeCommandePreview
          data={previewData}
          height={1200}
          className="w-full"
        />
      </div>
    </div>
  );
}
