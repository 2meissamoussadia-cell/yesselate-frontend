'use client';

import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Calendar } from 'lucide-react';
import type { DocumentSignature, SignatoryProfile } from '@/lib/types/document-validation.types';

interface SignatureBlockProps {
  signature: DocumentSignature;
  signatoryProfile?: SignatoryProfile;
  showDetails?: boolean;
  compact?: boolean;
}

export function SignatureBlock({
  signature,
  signatoryProfile,
  showDetails = true,
  compact = false,
}: SignatureBlockProps) {
  const { darkMode } = useAppStore();
  
  const signedDate = new Date(signature.signedAt);
  const formattedDate = signedDate.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = signedDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className={cn(
      'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5',
      compact && 'p-2'
    )}>
      <CardContent className={cn('p-4', compact && 'p-2')}>
        <div className={cn('flex items-start gap-4', compact && 'gap-2')}>
          {/* Logo et Tampon */}
          <div className="flex flex-col items-center gap-2">
            {signature.logoUrl ? (
              <img 
                src={signature.logoUrl} 
                alt="Logo" 
                className={cn('w-16 h-16 object-contain', compact && 'w-12 h-12')}
              />
            ) : (
              <div className={cn(
                'w-16 h-16 rounded-lg bg-emerald-500/20 flex items-center justify-center',
                compact && 'w-12 h-12'
              )}>
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
            )}
            {signature.stampUrl ? (
              <img 
                src={signature.stampUrl} 
                alt="Tampon" 
                className={cn('w-20 h-20 object-contain opacity-80', compact && 'w-16 h-16')}
              />
            ) : (
              <div className={cn(
                'w-20 h-20 rounded-full border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 text-xs font-bold text-center px-2',
                compact && 'w-16 h-16 text-[10px]'
              )}>
                TAMPON<br />OFFICIEL
              </div>
            )}
          </div>

          {/* Signature et Informations */}
          <div className="flex-1 space-y-2">
            {/* Statut de validation */}
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-emerald-400">Document Validé</span>
              <Badge variant="success" className="text-xs">
                Signé Électroniquement
              </Badge>
            </div>

            {/* Informations du signataire */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={cn('font-semibold', compact ? 'text-sm' : 'text-base')}>
                  {signature.signatoryName}
                </span>
              </div>
              <div className="text-sm text-slate-400">
                {signature.signatoryFunction}
              </div>
            </div>

            {/* Signature visuelle */}
            {signature.signatureImageUrl ? (
              <div className="mt-2">
                <img 
                  src={signature.signatureImageUrl} 
                  alt="Signature" 
                  className={cn('h-12 object-contain opacity-90', compact && 'h-8')}
                />
              </div>
            ) : (
              <div className={cn(
                'mt-2 font-signature text-emerald-400 border-b-2 border-emerald-400/50 pb-1',
                compact ? 'text-lg' : 'text-2xl'
              )}>
                {signature.signatoryName.split(' ').map(n => n[0]).join('')}
              </div>
            )}

            {/* Date et heure */}
            {showDetails && (
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-3 pt-2 border-t border-slate-700/30">
                <Calendar className="w-3 h-3" />
                <span>{formattedDate} à {formattedTime}</span>
              </div>
            )}

            {/* Hash de traçabilité */}
            {showDetails && (
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Hash: {signature.signatureHash.slice(0, 20)}...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour générer une signature
export function generateSignature(
  documentId: string,
  documentType: 'bc' | 'facture' | 'avenant',
  signatoryProfile: SignatoryProfile
): DocumentSignature {
  const now = new Date();
  const hashInput = `${documentId}-${documentType}-${signatoryProfile.id}-${now.toISOString()}`;
  
  // Générer un hash SHA3-256 simulé
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(16, '0');
  const signatureHash = `SHA3-256:${hexHash}${Math.random().toString(16).slice(2, 10)}`;

  return {
    id: `SIG-${Date.now()}`,
    documentId,
    documentType,
    signatoryName: signatoryProfile.name,
    signatoryFunction: signatoryProfile.function,
    signedAt: now.toISOString(),
    signatureHash,
    signatureImageUrl: signatoryProfile.signatureImageUrl,
  };
}

