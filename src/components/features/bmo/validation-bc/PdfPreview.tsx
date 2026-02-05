'use client';

import React, { useRef, useState } from "react";
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Download, Printer, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PdfPreview({
  pdfUrl,
  scrollContainerRef,
}: {
  pdfUrl: string;
  scrollContainerRef: React.RefObject<HTMLElement>;
}) {
  const { darkMode } = useAppStore();
  const [interactive, setInteractive] = useState(false);

  const handleDownload = () => {
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `bon-de-commande.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const iframe = document.querySelector('iframe[title="Aperçu PDF"]') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className={cn(
      "relative rounded-2xl border overflow-hidden",
      darkMode 
        ? "border-white/10 bg-white/5" 
        : "border-gray-200 bg-gray-50"
    )}>
      <div className={cn(
        "flex items-center justify-between px-4 py-2 border-b",
        darkMode ? "border-white/10" : "border-gray-200"
      )}>
        <div className={cn(
          "text-sm font-semibold",
          darkMode ? "text-white/80" : "text-gray-700"
        )}>
          Aperçu Bon de commande (format papier)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className={cn(
              darkMode 
                ? "bg-white/10 hover:bg-white/15 text-white border-white/20" 
                : "bg-white hover:bg-gray-100"
            )}
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className={cn(
              darkMode 
                ? "bg-white/10 hover:bg-white/15 text-white border-white/20" 
                : "bg-white hover:bg-gray-100"
            )}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInteractive((v) => !v)}
            className={cn(
              "border-cyan-500/30",
              interactive
                ? darkMode 
                  ? "bg-cyan-500/25 hover:bg-cyan-500/35 text-cyan-200" 
                  : "bg-cyan-50 hover:bg-cyan-100 text-cyan-700"
                : darkMode 
                  ? "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200" 
                  : "bg-cyan-50/50 hover:bg-cyan-100 text-cyan-600"
            )}
          >
            <Maximize2 className="w-4 h-4 mr-2" />
            {interactive ? "Désactiver interaction" : "Interagir PDF"}
          </Button>
        </div>
      </div>

      {/* Zone de preview */}
      <div className="relative h-[520px]">
        {/* Overlay capteur de scroll (désactivé si interactive=true) */}
        {!interactive && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onWheel={(e) => {
              // WHY: Rediriger la molette vers le conteneur parent pour éviter le scroll dans le PDF
              e.preventDefault();
              e.stopPropagation();
              const scroller = scrollContainerRef.current;
              if (!scroller) return;
              // WHY: Utiliser requestAnimationFrame pour éviter les conflits de scroll
              requestAnimationFrame(() => {
                scroller.scrollBy({ top: e.deltaY, behavior: "auto" });
              });
            }}
            onTouchMove={(e) => {
              // WHY: Gérer aussi le scroll tactile
              const scroller = scrollContainerRef.current;
              if (!scroller) return;
              const touch = e.touches[0];
              if (touch) {
                const deltaY = touch.clientY - (scroller as any).__lastTouchY || 0;
                (scroller as any).__lastTouchY = touch.clientY;
                requestAnimationFrame(() => {
                  scroller.scrollBy({ top: deltaY, behavior: "auto" });
                });
              }
            }}
            onClick={() => setInteractive(true)}
            title="Cliquez pour interagir avec le PDF"
            style={{ touchAction: 'none' }}
          />
        )}

        {/* Iframe PDF */}
        <iframe
          className="absolute inset-0 w-full h-full"
          src={pdfUrl}
          style={{ border: 0, pointerEvents: interactive ? 'auto' : 'none' }}
          title="Aperçu PDF"
          // Si pas interactif, on coupe aussi les events pour éviter piège
          {...(!interactive ? { tabIndex: -1 } : {})}
        />
      </div>
    </div>
  );
}

