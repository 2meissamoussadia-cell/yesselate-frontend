'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Eye, EyeOff, RotateCcw, Save, X } from 'lucide-react';

interface Section {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

interface DashboardLayoutEditorProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  onSave?: (sections: Section[]) => void;
  onReset?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardLayoutEditor({
  sections: initialSections,
  onSectionsChange,
  onSave,
  onReset,
  isOpen,
  onClose,
}: DashboardLayoutEditorProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleToggleVisibility = useCallback(
    (id: string) => {
      const updated = sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s));
      setSections(updated);
      onSectionsChange(updated);
    },
    [sections, onSectionsChange]
  );

  const handleMove = useCallback(
    (fromIndex: number, toIndex: number) => {
      const updated = [...sections];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      const reordered = updated.map((s, idx) => ({ ...s, order: idx }));
      setSections(reordered);
      onSectionsChange(reordered);
    },
    [sections, onSectionsChange]
  );

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(sections);
      addToast('Layout sauvegardé', 'success');
    }
  }, [sections, onSave, addToast]);

  const handleReset = useCallback(() => {
    if (onReset) {
      onReset();
      setSections(initialSections);
      addToast('Layout réinitialisé', 'info');
    }
  }, [onReset, initialSections, addToast]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card
          className={cn(
            'w-full max-w-2xl pointer-events-auto max-h-[80vh] overflow-y-auto',
            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b border-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <GripVertical className="w-4 h-4" />
                Personnaliser le Dashboard
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-8 w-8 p-0"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-slate-400 mb-4">
              Réorganisez et masquez les sections selon vos préférences
            </p>

            <div className="space-y-2">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={cn(
                    'p-3 rounded-lg border flex items-center gap-3',
                    darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-gray-50 border-gray-200',
                    draggedIndex === index && 'opacity-50'
                  )}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedIndex !== null && draggedIndex !== index) {
                      handleMove(draggedIndex, index);
                      setDraggedIndex(index);
                    }
                  }}
                  onDragEnd={() => setDraggedIndex(null)}
                >
                  <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">{section.label}</span>
                      <Badge variant={section.visible ? 'success' : 'default'} className="text-[9px]">
                        {section.visible ? 'Visible' : 'Masqué'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleVisibility(section.id)}
                    className="h-7 w-7 p-0"
                    aria-label={section.visible ? 'Masquer' : 'Afficher'}
                  >
                    {section.visible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSave}
                className="text-xs flex-1"
              >
                <Save className="w-3 h-3 mr-1" />
                Sauvegarder
              </Button>
              {onReset && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleReset}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Réinitialiser
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

