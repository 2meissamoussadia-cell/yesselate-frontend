'use client';

import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, User, Calendar, MapPin, FileText, 
  DollarSign, Phone, Mail, Clock, Package,
  Shield, CheckCircle, AlertTriangle, Info, Download,
  TrendingUp, FileCheck, History, MessageSquare, Link2
} from 'lucide-react';
import type { EnrichedBC } from '@/lib/types/document-validation.types';
import { BCLignesTable } from './BCLignesTable';

interface BCDetailsExpandedProps {
  bc: EnrichedBC;
}

export function BCDetailsExpanded({ bc }: BCDetailsExpandedProps) {
  const { darkMode } = useAppStore();

  const pourcentageBudgetUtilise = bc.projetDetails?.budgetTotal 
    ? ((bc.projetDetails.budgetUtilise || 0) / bc.projetDetails.budgetTotal * 100).toFixed(1)
    : null;

  const getFiabiliteColor = (fiabilite?: string) => {
    switch (fiabilite) {
      case 'excellent': return 'text-emerald-400';
      case 'bon': return 'text-green-400';
      case 'moyen': return 'text-yellow-400';
      case 'faible': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getFiabiliteBadge = (fiabilite?: string) => {
    switch (fiabilite) {
      case 'excellent': return 'success';
      case 'bon': return 'success';
      case 'moyen': return 'warning';
      case 'faible': return 'urgent';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between py-2 border-b border-slate-700/30">
              <span className="text-slate-400 flex items-center gap-2">
                <FileText className="w-3 h-3" />
                N° BC
              </span>
              <span className="font-mono font-bold text-emerald-400">{bc.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700/30">
              <span className="text-slate-400 flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Date d'émission
              </span>
              <span>{new Date(bc.dateEmission).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700/30">
              <span className="text-slate-400 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Date limite
              </span>
              <span className={cn(
                new Date(bc.dateLimite) < new Date() ? 'text-red-400 font-semibold' : ''
              )}>
                {new Date(bc.dateLimite).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700/30">
              <span className="text-slate-400 flex items-center gap-2">
                <User className="w-3 h-3" />
                Bureau émetteur
              </span>
              <Badge variant="info">{bc.bureauEmetteur}</Badge>
            </div>
            {bc.demandeur && (
              <>
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400">Demandeur</span>
                  <span>{bc.demandeur.nom}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400">Fonction</span>
                  <span>{bc.demandeur.fonction}</span>
                </div>
                {bc.demandeur.email && (
                  <div className="flex justify-between py-2 border-b border-slate-700/30">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      Email
                    </span>
                    <a href={`mailto:${bc.demandeur.email}`} className="text-blue-400 hover:underline text-xs">
                      {bc.demandeur.email}
                    </a>
                  </div>
                )}
                {bc.demandeur.telephone && (
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      Téléphone
                    </span>
                    <a href={`tel:${bc.demandeur.telephone}`} className="text-blue-400 hover:underline">
                      {bc.demandeur.telephone}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fournisseur */}
      {bc.fournisseurDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Informations fournisseur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-700/30">
              <span className="text-slate-400">Nom</span>
              <span className="font-medium">{bc.fournisseurDetails.nom}</span>
            </div>
            {bc.fournisseurDetails.siret && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">SIRET</span>
                <span className="font-mono text-xs">{bc.fournisseurDetails.siret}</span>
              </div>
            )}
            {(bc.fournisseurDetails.adresse || bc.fournisseurDetails.ville) && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  Adresse
                </span>
                <span className="text-right text-xs">
                  {bc.fournisseurDetails.adresse && <div>{bc.fournisseurDetails.adresse}</div>}
                  {bc.fournisseurDetails.codePostal && bc.fournisseurDetails.ville && (
                    <div>{bc.fournisseurDetails.codePostal} {bc.fournisseurDetails.ville}</div>
                  )}
                  {bc.fournisseurDetails.pays && <div>{bc.fournisseurDetails.pays}</div>}
                </span>
              </div>
            )}
            {bc.fournisseurDetails.contactCommercial && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400 flex items-center gap-2">
                  <User className="w-3 h-3" />
                  Contact commercial
                </span>
                <span>{bc.fournisseurDetails.contactCommercial}</span>
              </div>
            )}
            {bc.fournisseurDetails.telephone && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400 flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  Téléphone
                </span>
                <a href={`tel:${bc.fournisseurDetails.telephone}`} className="text-blue-400 hover:underline">
                  {bc.fournisseurDetails.telephone}
                </a>
              </div>
            )}
            {bc.fournisseurDetails.email && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400 flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  Email
                </span>
                <a href={`mailto:${bc.fournisseurDetails.email}`} className="text-blue-400 hover:underline text-xs">
                  {bc.fournisseurDetails.email}
                </a>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Fiabilité</span>
              <div className="flex items-center gap-2">
                {bc.fournisseurDetails.historiqueCommandes !== undefined && (
                  <span className="text-xs text-slate-400">
                    {bc.fournisseurDetails.historiqueCommandes} commande(s)
                  </span>
                )}
                {bc.fournisseurDetails.fiabilite && (
                  <Badge variant={getFiabiliteBadge(bc.fournisseurDetails.fiabilite)} className="text-xs">
                    {bc.fournisseurDetails.fiabilite}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projet */}
      {bc.projetDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4" />
              Informations projet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-700/30">
              <span className="text-slate-400">Code projet</span>
              <span className="font-mono text-orange-400 font-semibold">{bc.projet}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700/30">
              <span className="text-slate-400">Nom projet</span>
              <span className="font-medium">{bc.projetDetails.nom}</span>
            </div>
            {bc.projetDetails.responsable && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Responsable projet</span>
                <span>{bc.projetDetails.responsable}</span>
              </div>
            )}
            {bc.projetDetails.budgetTotal && (
              <>
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400">Budget total projet</span>
                  <span className="font-mono font-bold">{bc.projetDetails.budgetTotal.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400">Budget utilisé</span>
                  <span className="font-mono">{bc.projetDetails.budgetUtilise?.toLocaleString('fr-FR') || '0'} FCFA</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400">Budget restant</span>
                  <span className={cn(
                    'font-mono font-bold',
                    (bc.projetDetails.budgetRestant || 0) < bc.montantTTC ? 'text-red-400' : 'text-emerald-400'
                  )}>
                    {bc.projetDetails.budgetRestant?.toLocaleString('fr-FR') || '0'} FCFA
                  </span>
                </div>
                {pourcentageBudgetUtilise && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Utilisation du budget</span>
                      <span className="text-xs font-semibold">{pourcentageBudgetUtilise}%</span>
                    </div>
                    <div className={cn(
                      'h-2 rounded-full overflow-hidden',
                      darkMode ? 'bg-slate-700' : 'bg-gray-200'
                    )}>
                      <div
                        className={cn(
                          'h-full transition-all',
                          parseFloat(pourcentageBudgetUtilise) > 90 ? 'bg-red-500' :
                          parseFloat(pourcentageBudgetUtilise) > 75 ? 'bg-orange-500' :
                          'bg-emerald-500'
                        )}
                        style={{ width: `${Math.min(parseFloat(pourcentageBudgetUtilise), 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            {bc.projetDetails.avancement !== undefined && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Avancement projet</span>
                  <span className="text-xs font-semibold">{bc.projetDetails.avancement}%</span>
                </div>
                <div className={cn(
                  'h-2 rounded-full overflow-hidden',
                  darkMode ? 'bg-slate-700' : 'bg-gray-200'
                )}>
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${bc.projetDetails.avancement}%` }}
                  />
                </div>
              </div>
            )}
            {bc.projetDetails.statut && (
              <div className="flex justify-between py-2 border-t border-slate-700/30 pt-2">
                <span className="text-slate-400">Statut</span>
                <Badge variant="info">{bc.projetDetails.statut}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Montants et TVA */}
      <Card className="border-amber-500/30 bg-amber-500/10">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            Montants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-700/30">
            <span className="text-slate-400">Montant HT</span>
            <span className="font-mono font-bold">
              {bc.montantHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-700/30">
            <span className="text-slate-400">TVA ({bc.tva}%)</span>
            <span className="font-mono">
              {(bc.montantTTC - bc.montantHT).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-400 font-semibold">Montant TTC</span>
            <span className="font-mono font-bold text-amber-400 text-lg">
              {bc.montantTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FCFA
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Lignes du bon de commande */}
      {bc.lignes && bc.lignes.length > 0 && (
        <BCLignesTable
          lignes={bc.lignes}
          montantHT={bc.montantHT}
          tva={bc.tva}
          montantTTC={bc.montantTTC}
        />
      )}

      {/* Adresse de livraison */}
      {bc.livraison && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Adresse de livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {bc.livraison.adresse && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Adresse</span>
                <span className="text-right">{bc.livraison.adresse}</span>
              </div>
            )}
            {(bc.livraison.ville || bc.livraison.codePostal) && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Ville / Code postal</span>
                <span>
                  {bc.livraison.codePostal} {bc.livraison.ville}
                  {bc.livraison.pays && `, ${bc.livraison.pays}`}
                </span>
              </div>
            )}
            {bc.livraison.contactLivraison && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400 flex items-center gap-2">
                  <User className="w-3 h-3" />
                  Contact livraison
                </span>
                <span>{bc.livraison.contactLivraison}</span>
              </div>
            )}
            {bc.livraison.telephone && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400 flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  Téléphone
                </span>
                <a href={`tel:${bc.livraison.telephone}`} className="text-blue-400 hover:underline">
                  {bc.livraison.telephone}
                </a>
              </div>
            )}
            {bc.livraison.dateLivraisonPrevue && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Date livraison prévue
                </span>
                <span>{new Date(bc.livraison.dateLivraisonPrevue).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            {bc.livraison.instructions && (
              <div className="pt-2 border-t border-slate-700/30">
                <p className="text-xs text-slate-400 mb-1">Instructions :</p>
                <p className="text-sm">{bc.livraison.instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conditions de paiement */}
      {bc.paiement && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Conditions de paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {bc.paiement.mode && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Mode de paiement</span>
                <span className="capitalize">{bc.paiement.mode}</span>
              </div>
            )}
            {bc.paiement.delai !== undefined && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Délai de paiement</span>
                <span>{bc.paiement.delai} jours</span>
              </div>
            )}
            {bc.paiement.echeance && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Date d'échéance
                </span>
                <span>{new Date(bc.paiement.echeance).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            {bc.paiement.acompte !== undefined && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Acompte</span>
                <span>{bc.paiement.acompte}%</span>
              </div>
            )}
            {bc.paiement.conditions && (
              <div className="pt-2 border-t border-slate-700/30">
                <p className="text-xs text-slate-400 mb-1">Conditions :</p>
                <p className="text-sm">{bc.paiement.conditions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documents joints */}
      {bc.documents && bc.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Documents joints ({bc.documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bc.documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    darkMode ? 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.nom}</p>
                      <p className="text-xs text-slate-400">
                        {doc.taille} • {new Date(doc.dateUpload).toLocaleDateString('fr-FR')} • {doc.uploadPar}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Références */}
      {bc.references && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Références
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {bc.references.commandeInterne && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Commande interne</span>
                <span className="font-mono text-blue-400">{bc.references.commandeInterne}</span>
              </div>
            )}
            {bc.references.dossierAchat && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Dossier achat</span>
                <span className="font-mono text-blue-400">{bc.references.dossierAchat}</span>
              </div>
            )}
            {bc.references.appelOffre && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Appel d'offres</span>
                <span className="font-mono text-blue-400">{bc.references.appelOffre}</span>
              </div>
            )}
            {bc.references.contrat && (
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Contrat</span>
                <span className="font-mono text-blue-400">{bc.references.contrat}</span>
              </div>
            )}
            {bc.references.bonCommandeClient && (
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Bon de commande client</span>
                <span className="font-mono text-blue-400">{bc.references.bonCommandeClient}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes internes */}
      {bc.notes && bc.notes.length > 0 && (
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Notes internes ({bc.notes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bc.notes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    darkMode ? 'border-slate-700/50 bg-slate-900/50' : 'border-gray-200 bg-white'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-semibold">{note.auteur}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(note.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {note.prive && (
                      <Badge variant="default" className="text-xs">Privé</Badge>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.contenu}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
