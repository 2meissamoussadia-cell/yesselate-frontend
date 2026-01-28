'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import {
  User, Building2, MapPin, Calendar, DollarSign, FileText, 
  Phone, Mail, Clock, CheckCircle, AlertTriangle, Package,
  Truck, CreditCard, History, MessageSquare, Link as LinkIcon,
  Download, Eye, TrendingUp, Users, Percent, Target
} from 'lucide-react';
import type { EnrichedBC, EnrichedFacture, EnrichedAvenant } from '@/lib/types/document-validation.types';
import { BCLignesTable } from './BCLignesTable';

interface DocumentDetailsTabsProps {
  document: EnrichedBC | EnrichedFacture | EnrichedAvenant;
  documentType: 'bc' | 'facture' | 'avenant';
}

export function DocumentDetailsTabs({ document, documentType }: DocumentDetailsTabsProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  if (documentType === 'bc') {
    const bc = document as EnrichedBC;
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
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Bon de commande N°</span>
                <span className="font-mono font-bold text-blue-400">{bc.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Date d'émission</span>
                <span className="font-medium">{new Date(bc.dateEmission).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Date limite</span>
                <span className="font-medium">{new Date(bc.dateLimite).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Statut</span>
                <Badge 
                  variant={
                    bc.status === 'validated' ? 'success' :
                    bc.status === 'anomaly_detected' ? 'urgent' :
                    bc.status === 'correction_requested' ? 'warning' :
                    'info'
                  }
                >
                  {bc.status === 'validated' ? 'Validé' :
                   bc.status === 'anomaly_detected' ? 'Anomalie' :
                   bc.status === 'correction_requested' ? 'Correction demandée' :
                   'En attente'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demandeur */}
        {bc.demandeur && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                Demandeur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Nom</span>
                <span className="font-medium">{bc.demandeur.nom}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Fonction</span>
                <span className="font-medium">{bc.demandeur.fonction}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-700/30">
                <span className="text-slate-400">Bureau</span>
                <BureauTag bureau={bc.demandeur.bureau} />
              </div>
              {bc.demandeur.email && (
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </span>
                  <span className="font-medium">{bc.demandeur.email}</span>
                </div>
              )}
              {bc.demandeur.telephone && (
                <div className="flex justify-between py-2">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Téléphone
                  </span>
                  <span className="font-medium">{bc.demandeur.telephone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Fournisseur */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Fournisseur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-700/30">
              <span className="text-slate-400">Nom</span>
              <span className="font-medium">{bc.fournisseur}</span>
            </div>
            {bc.fournisseurDetails && (
              <>
                {bc.fournisseurDetails.siret && (
                  <div className="flex justify-between py-2 border-b border-slate-700/30">
                    <span className="text-slate-400">SIRET</span>
                    <span className="font-mono text-xs">{bc.fournisseurDetails.siret}</span>
                  </div>
                )}
                {bc.fournisseurDetails.adresse && (
                  <div className="flex justify-between py-2 border-b border-slate-700/30">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Adresse
                    </span>
                    <span className="text-right max-w-[60%]">
                      {bc.fournisseurDetails.adresse}
                      {bc.fournisseurDetails.codePostal && `, ${bc.fournisseurDetails.codePostal}`}
                      {bc.fournisseurDetails.ville && ` ${bc.fournisseurDetails.ville}`}
                    </span>
                  </div>
                )}
                {bc.fournisseurDetails.telephone && (
                  <div className="flex justify-between py-2 border-b border-slate-700/30">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Téléphone
                    </span>
                    <span className="font-medium">{bc.fournisseurDetails.telephone}</span>
                  </div>
                )}
                {bc.fournisseurDetails.email && (
                  <div className="flex justify-between py-2 border-b border-slate-700/30">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email
                    </span>
                    <span className="font-medium">{bc.fournisseurDetails.email}</span>
                  </div>
                )}
                {bc.fournisseurDetails.contactCommercial && (
                  <div className="flex justify-between py-2 border-b border-slate-700/30">
                    <span className="text-slate-400">Contact commercial</span>
                    <span className="font-medium">{bc.fournisseurDetails.contactCommercial}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400">Historique</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="info" className="text-xs">
                      {bc.fournisseurDetails.historiqueCommandes || 0} commande(s)
                    </Badge>
                    {bc.fournisseurDetails.fiabilite && (
                      <Badge 
                        variant={
                          bc.fournisseurDetails.fiabilite === 'excellent' ? 'success' :
                          bc.fournisseurDetails.fiabilite === 'bon' ? 'info' :
                          bc.fournisseurDetails.fiabilite === 'moyen' ? 'warning' :
                          'urgent'
                        }
                        className="text-xs"
                      >
                        {bc.fournisseurDetails.fiabilite}
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Projet */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Projet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-700/30">
              <span className="text-slate-400">Référence</span>
              <span className="font-mono text-orange-400 font-semibold">{bc.projet}</span>
            </div>
            {bc.projetDetails && (
              <>
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400">Nom</span>
                  <span className="font-medium">{bc.projetDetails.nom}</span>
                </div>
                {bc.projetDetails.responsable && (
                  <div className="flex justify-between py-2 border-b border-slate-700/30">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Responsable
                    </span>
                    <span className="font-medium">{bc.projetDetails.responsable}</span>
                  </div>
                )}
                {bc.projetDetails.budgetTotal && (
                  <div className="flex justify-between py-2 border-b border-slate-700/30">
                    <span className="text-slate-400 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Budget total
                    </span>
                    <span className="font-mono font-bold">
                      {bc.projetDetails.budgetTotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                )}
                {bc.projetDetails.budgetRestant !== undefined && (
                  <div className="flex justify-between py-2 border-b border-slate-700/30">
                    <span className="text-slate-400">Budget restant</span>
                    <span className={cn(
                      'font-mono font-bold',
                      bc.projetDetails.budgetRestant < bc.montantTTC ? 'text-red-400' : 'text-emerald-400'
                    )}>
                      {bc.projetDetails.budgetRestant.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                )}
                {bc.projetDetails.avancement !== undefined && (
                  <div className="flex justify-between py-2 border-b border-slate-700/30">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      Avancement
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bc.projetDetails.avancement}%</span>
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${bc.projetDetails.avancement}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {bc.projetDetails.statut && (
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Statut projet</span>
                    <Badge variant="info" className="text-xs">{bc.projetDetails.statut}</Badge>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Montants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
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

        {/* Livraison */}
        {bc.livraison && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {bc.livraison.adresse && (
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Adresse
                  </span>
                  <span className="text-right max-w-[60%]">
                    {bc.livraison.adresse}
                    {bc.livraison.codePostal && `, ${bc.livraison.codePostal}`}
                    {bc.livraison.ville && ` ${bc.livraison.ville}`}
                  </span>
                </div>
              )}
              {bc.livraison.contactLivraison && (
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400">Contact</span>
                  <span className="font-medium">{bc.livraison.contactLivraison}</span>
                </div>
              )}
              {bc.livraison.telephone && (
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Téléphone
                  </span>
                  <span className="font-medium">{bc.livraison.telephone}</span>
                </div>
              )}
              {bc.livraison.dateLivraisonPrevue && (
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date prévue
                  </span>
                  <span className="font-medium">
                    {new Date(bc.livraison.dateLivraisonPrevue).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              {bc.livraison.instructions && (
                <div className="py-2">
                  <span className="text-slate-400 block mb-2">Instructions</span>
                  <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-800/50' : 'bg-gray-100')}>
                    <p className="text-sm">{bc.livraison.instructions}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Paiement */}
        {bc.paiement && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Conditions de paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {bc.paiement.mode && (
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400">Mode de paiement</span>
                  <Badge variant="info" className="text-xs capitalize">
                    {bc.paiement.mode}
                  </Badge>
                </div>
              )}
              {bc.paiement.delai && (
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Délai
                  </span>
                  <span className="font-medium">{bc.paiement.delai} jours</span>
                </div>
              )}
              {bc.paiement.echeance && (
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Échéance
                  </span>
                  <span className="font-medium">
                    {new Date(bc.paiement.echeance).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
              {bc.paiement.acompte !== undefined && (
                <div className="flex justify-between py-2 border-b border-slate-700/30">
                  <span className="text-slate-400">Acompte</span>
                  <span className="font-medium">
                    {typeof bc.paiement.acompte === 'number' && bc.paiement.acompte < 100 
                      ? `${bc.paiement.acompte}%` 
                      : `${bc.paiement.acompte} FCFA`}
                  </span>
                </div>
              )}
              {bc.paiement.conditions && (
                <div className="py-2">
                  <span className="text-slate-400 block mb-2">Conditions</span>
                  <div className={cn('p-3 rounded-lg', darkMode ? 'bg-slate-800/50' : 'bg-gray-100')}>
                    <p className="text-sm">{bc.paiement.conditions}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Références */}
        {bc.references && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Références
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
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
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {bc.documents && bc.documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents joints ({bc.documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {bc.documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    darkMode ? 'border-slate-700/30 bg-slate-800/30 hover:bg-slate-800/50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      doc.type === 'pdf' ? 'bg-red-500/20' :
                      doc.type === 'excel' ? 'bg-green-500/20' :
                      doc.type === 'word' ? 'bg-blue-500/20' :
                      'bg-slate-500/20'
                    )}>
                      <FileText className={cn(
                        'w-5 h-5',
                        doc.type === 'pdf' ? 'text-red-400' :
                        doc.type === 'excel' ? 'text-green-400' :
                        doc.type === 'word' ? 'text-blue-400' :
                        'text-slate-400'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.nom}</p>
                      <p className="text-xs text-slate-400">
                        {doc.taille} • {doc.uploadPar} • {new Date(doc.dateUpload).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addToast(`Ouverture de ${doc.nom}`, 'info')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addToast(`Téléchargement de ${doc.nom}`, 'info')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {bc.notes && bc.notes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Notes ({bc.notes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bc.notes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    darkMode ? 'border-slate-700/30 bg-slate-800/30' : 'border-gray-200 bg-gray-50'
                  )}
                >
                  <p className="text-sm mb-2">{note.contenu}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{note.auteur}</span>
                    <span>{new Date(note.date).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Pour les factures et avenants, on peut retourner une version simplifiée ou développer séparément
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informations du document</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">Détails en cours de développement</p>
        </CardContent>
      </Card>
    </div>
  );
}

