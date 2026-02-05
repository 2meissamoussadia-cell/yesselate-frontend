// ============================================
// Modal pour afficher la progression des opérations groupées
// ============================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/cn';
import type { BulkOperationProgress } from '@/hooks';

interface BulkProgressModalProps {
  progress: BulkOperationProgress;
  onCancel: () => void;
  title?: string;
}

export function BulkProgressModal({
  progress,
  onCancel,
  title = 'Traitement en cours...',
}: BulkProgressModalProps) {
  if (!progress.isRunning) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">
                {progress.current} / {progress.total}
              </span>
              <span className="text-slate-300 font-semibold">
                {progress.percentage}%
              </span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>

          {progress.currentItem && (
            <p className="text-sm text-slate-400 truncate">
              Traitement: {progress.currentItem}
            </p>
          )}

          {progress.errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-red-400 font-semibold">
                {progress.errors.length} erreur(s)
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {progress.errors.map((error, i) => (
                  <p key={i} className="text-xs text-red-300">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={progress.percentage === 100}
            >
              {progress.percentage === 100 ? 'Terminé' : 'Annuler'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

