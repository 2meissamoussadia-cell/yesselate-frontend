'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDelegationWorkspaceStore, type DelegationUIState } from '@/lib/stores/delegationWorkspaceStore';
import { DelegationInboxView } from './views/DelegationInboxView';
import { DelegationViewer, type DelegationModalType } from './DelegationViewer';
import { DelegationCreateWizard } from './views/DelegationCreateWizard';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Key, Inbox, Shield, Clock, Plus, Calendar, Pause, XCircle, UserPlus, FilePlus, Download } from 'lucide-react';

/**
 * DelegationWorkspaceContent
 * ==========================
 * 
 * Composant central qui route vers la bonne vue selon le type d'onglet.
 * Gère aussi les modals d'actions atomiques de manière centralisée.
 * 
 * Règle d'or :
 * - Modals = "agir" (transactions atomiques)
 * - Onglets/Fenêtres = "travailler" (analyse, navigation, décision)
 */

// ============================================
// TYPES (re-export from DelegationViewer)
// ============================================

type ModalType = DelegationModalType;

// ============================================
// COMPONENT
// ============================================

export function DelegationWorkspaceContent() {
  const { tabs, activeTabId, openTab, updateTab, setTabUI, getTabUI } = useDelegationWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  // Modal centralisée
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalContext, setModalContext] = useState<{ delegationId?: string; delegationTitle?: string }>({});

  // Ouvrir une modal avec contexte
  const openModal = useCallback((modal: ModalType, context?: typeof modalContext) => {
    setActiveModal(modal);
    if (context) setModalContext(context);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalContext({});
  }, []);

  // ================================
  // VUE PAR DÉFAUT (pas d'onglet actif)
  // ================================
  if (!activeTab) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70 flex flex-col items-center justify-center text-center min-h-[400px]">
        <Key className="w-16 h-16 text-purple-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">
          Gestion des Délégations
        </h2>
        <p className="text-slate-400 mb-6 max-w-md">
          Gérez les délégations de pouvoirs avec une traçabilité complète. 
          Chaque action génère une décision hashée pour anti-contestation.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:active', 
              type: 'inbox', 
              title: 'Actives', 
              icon: '✅', 
              data: { queue: 'active' } 
            })}
          >
            <Shield className="w-4 h-4 text-emerald-500" /> Actives
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:expiring_soon', 
              type: 'inbox', 
              title: 'Expirent bientôt', 
              icon: '⏰', 
              data: { queue: 'expiring_soon' } 
            })}
          >
            <Clock className="w-4 h-4 text-amber-500" /> Expirent bientôt
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:expired', 
              type: 'inbox', 
              title: 'Expirées', 
              icon: '📅', 
              data: { queue: 'expired' } 
            })}
          >
            <Inbox className="w-4 h-4 text-slate-400" /> Expirées
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:revoked', 
              type: 'inbox', 
              title: 'Révoquées', 
              icon: '⛔', 
              data: { queue: 'revoked' } 
            })}
          >
            <Shield className="w-4 h-4 text-rose-500" /> Révoquées
          </FluentButton>
        </div>

        <div className="mt-8">
          <FluentButton
            variant="primary"
            onClick={() => {
              openTab({
                id: `wizard:create:${Date.now()}`,
                type: 'wizard',
                title: 'Nouvelle délégation',
                icon: '➕',
                data: { action: 'create' },
              });
            }}
          >
            <Plus className="w-4 h-4" /> Nouvelle délégation
          </FluentButton>
        </div>
        
        <p className="text-xs text-slate-400 mt-8">
          Astuce: Utilisez les raccourcis <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">Ctrl+1</kbd> à <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">Ctrl+4</kbd> pour ouvrir les files.
        </p>
      </div>
    );
  }

  // ================================
  // ROUTING PAR TYPE D'ONGLET
  // ================================

  // Inbox (file de travail)
  if (activeTab.type === 'inbox') {
    return <DelegationInboxView tab={activeTab} />;
  }

  // Délégation (viewer avec arborescence)
  if (activeTab.type === 'delegation') {
    const delegationId = activeTab.data?.delegationId || activeTab.id.replace('delegation:', '');
    const ui = getTabUI(activeTab.id) ?? { section: 'overview' as const, explorerOpen: true };

    const handleChangeUI = (patch: Partial<DelegationUIState>) => {
      setTabUI(activeTab.id, patch);
    };

    const handleOpenModal = (modal: ModalType) => {
      openModal(modal, {
        delegationId,
        delegationTitle: activeTab.title,
      });
    };

    return (
      <>
        <DelegationViewer
          tabId={activeTab.id}
          delegationId={delegationId}
          onOpenModal={handleOpenModal}
        />

        {/* ========================================
            MODALS CENTRALISÉES (actions atomiques)
        ======================================== */}

        {/* Modal Prolonger */}
        <FluentModal
          open={activeModal === 'extend'}
          title="Prolonger la délégation"
          onClose={closeModal}
        >
          <ExtendDelegationForm
            delegationId={modalContext.delegationId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </FluentModal>

        {/* Modal Suspendre */}
        <FluentModal
          open={activeModal === 'suspend'}
          title="Suspendre la délégation"
          onClose={closeModal}
        >
          <SuspendDelegationForm
            delegationId={modalContext.delegationId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </FluentModal>

        {/* Modal Révoquer */}
        <FluentModal
          open={activeModal === 'revoke'}
          title="Révoquer la délégation"
          onClose={closeModal}
        >
          <RevokeDelegationForm
            delegationId={modalContext.delegationId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </FluentModal>

        {/* Modal Ajouter acteur */}
        <FluentModal
          open={activeModal === 'add_actor'}
          title="Ajouter un acteur"
          onClose={closeModal}
        >
          <AddActorForm
            delegationId={modalContext.delegationId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </FluentModal>

        {/* Modal Ajouter règle */}
        <FluentModal
          open={activeModal === 'add_policy'}
          title="Ajouter une règle"
          onClose={closeModal}
        >
          <AddPolicyForm
            delegationId={modalContext.delegationId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </FluentModal>

        {/* Modal Ajouter engagement */}
        <FluentModal
          open={activeModal === 'add_engagement'}
          title="Ajouter un engagement"
          onClose={closeModal}
        >
          <AddEngagementForm
            delegationId={modalContext.delegationId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </FluentModal>

        {/* Modal Export audit */}
        <FluentModal
          open={activeModal === 'export_audit'}
          title="Exporter le journal d'audit"
          onClose={closeModal}
        >
          <ExportAuditForm
            delegationId={modalContext.delegationId}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        </FluentModal>
      </>
    );
  }

  // Wizard (création/modification)
  if (activeTab.type === 'wizard') {
    return <DelegationCreateWizard tab={activeTab} />;
  }

  // Report
  if (activeTab.type === 'report') {
    return (
      <div className="p-6 text-center text-slate-400">
        Rapport : {typeof activeTab.data?.reportId === 'string' ? activeTab.data.reportId : 'inconnu'}
      </div>
    );
  }

  // Fallback
  return <div className="p-8 text-center text-slate-400">Vue non gérée: {activeTab.type}</div>;
}

// ============================================
// FORMULAIRES MODALS
// ============================================

interface ModalFormProps {
  delegationId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function ExtendDelegationForm({ delegationId, onSuccess, onCancel }: ModalFormProps) {
  const [newEndDate, setNewEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [decisionRef, setDecisionRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculer la date par défaut (90 jours à partir d'aujourd'hui)
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 90);
    setNewEndDate(defaultDate.toISOString().slice(0, 10));
  }, []);

  const handleSubmit = async () => {
    if (!delegationId || !newEndDate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/delegations/${encodeURIComponent(delegationId)}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: 'CURRENT_USER', // TODO: récupérer l'utilisateur connecté
          actorName: 'Utilisateur courant',
          actorRole: null,
          newEndDate,
          reason: reason || null,
          decisionRef: decisionRef || null,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la prolongation');
        return;
      }
      
      onSuccess();
      // Rafraîchir la page ou recharger les données
      window.location.reload();
    } catch (e) {
      setError('Erreur réseau lors de la prolongation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Prolonger la délégation d&apos;une durée supplémentaire.
      </p>
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 text-sm text-rose-800 dark:text-rose-300">
          {error}
        </div>
      )}
      <div>
        <label className="text-sm text-slate-400">Nouvelle date de fin *</label>
        <input
          type="date"
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={newEndDate}
          onChange={(e) => setNewEndDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          required
        />
      </div>
      <div>
        <label className="text-sm text-slate-400">Référence décision (optionnel)</label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={decisionRef}
          onChange={(e) => setDecisionRef(e.target.value)}
          placeholder="Ex: DÉC-2026-001"
        />
      </div>
      <div>
        <label className="text-sm text-slate-400">Motif (optionnel)</label>
        <textarea
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Raison de la prolongation..."
        />
      </div>
      <div className="flex justify-end gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </FluentButton>
        <FluentButton size="sm" variant="warning" onClick={handleSubmit} disabled={loading || !newEndDate}>
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Prolongation...' : 'Prolonger'}
        </FluentButton>
      </div>
    </div>
  );
}

function SuspendDelegationForm({ delegationId, onSuccess, onCancel }: ModalFormProps) {
  const [reason, setReason] = useState('');
  const [expectedReactivation, setExpectedReactivation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!delegationId || !reason.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/delegations/${encodeURIComponent(delegationId)}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: 'CURRENT_USER',
          actorName: 'Utilisateur courant',
          actorRole: null,
          reason,
          expectedReactivation: expectedReactivation || null,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la suspension');
        return;
      }
      
      onSuccess();
      window.location.reload();
    } catch (e) {
      setError('Erreur réseau lors de la suspension');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 text-sm text-rose-800 dark:text-rose-300">
          {error}
        </div>
      )}
      <p className="text-sm text-slate-400">
        La délégation sera temporairement inactive. Elle pourra être réactivée ultérieurement.
      </p>
      <div>
        <label className="text-sm text-slate-400">Motif de suspension *</label>
        <textarea
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Raison de la suspension..."
          required
        />
      </div>
      <div>
        <label className="text-sm text-slate-400">Réactivation prévue (optionnel)</label>
        <input
          type="date"
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={expectedReactivation}
          onChange={(e) => setExpectedReactivation(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </FluentButton>
        <FluentButton size="sm" variant="warning" onClick={handleSubmit} disabled={loading || !reason.trim()}>
          <Pause className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Suspension...' : 'Suspendre'}
        </FluentButton>
      </div>
    </div>
  );
}

function RevokeDelegationForm({ delegationId, onSuccess, onCancel }: ModalFormProps) {
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!delegationId || !reason.trim() || !confirm) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/delegations/${encodeURIComponent(delegationId)}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: 'CURRENT_USER', // TODO: récupérer l'utilisateur connecté
          actorName: 'Utilisateur courant',
          reason,
        }),
      });
      if (res.ok) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800">
        <p className="text-sm text-rose-800 dark:text-rose-300">
          ⚠️ Cette action est <strong>irréversible</strong>. La délégation sera définitivement révoquée
          et ne pourra plus être utilisée.
        </p>
      </div>
      <div>
        <label className="text-sm text-slate-400">Motif de révocation *</label>
        <textarea
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Raison de la révocation (obligatoire)..."
          required
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={confirm}
          onChange={(e) => setConfirm(e.target.checked)}
          className="rounded"
        />
        Je confirme vouloir révoquer définitivement cette délégation
      </label>
      <div className="flex justify-end gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </FluentButton>
        <FluentButton 
          size="sm" 
          variant="destructive" 
          onClick={handleSubmit} 
          disabled={loading || !reason.trim() || !confirm}
        >
          <XCircle className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Révocation...' : 'Révoquer définitivement'}
        </FluentButton>
      </div>
    </div>
  );
}

function AddActorForm({ delegationId, onSuccess, onCancel }: ModalFormProps) {
  const [userName, setUserName] = useState('');
  const [roleType, setRoleType] = useState('CO_APPROVER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!delegationId || !userName.trim()) return;
    setLoading(true);
    try {
      // TODO: appeler l'API pour ajouter l'acteur
      await new Promise(r => setTimeout(r, 500));
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-400">Personne *</label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Nom de la personne..."
        />
      </div>
      <div>
        <label className="text-sm text-slate-400">Rôle *</label>
        <select
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={roleType}
          onChange={(e) => setRoleType(e.target.value)}
        >
          <option value="CO_APPROVER">Co-validateur</option>
          <option value="CONTROLLER">Contrôleur</option>
          <option value="AUDITOR">Auditeur</option>
          <option value="WITNESS">Témoin</option>
          <option value="BACKUP">Suppléant</option>
          <option value="IMPACTED">Impacté</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </FluentButton>
        <FluentButton size="sm" variant="primary" onClick={handleSubmit} disabled={loading || !userName.trim()}>
          <UserPlus className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Ajout...' : 'Ajouter'}
        </FluentButton>
      </div>
    </div>
  );
}

function AddPolicyForm({ delegationId, onSuccess, onCancel }: ModalFormProps) {
  const [action, setAction] = useState('APPROVE_PAYMENT');
  const [maxAmount, setMaxAmount] = useState(0);
  const [requiresDual, setRequiresDual] = useState(false);
  const [requiresLegal, setRequiresLegal] = useState(false);
  const [requiresFinance, setRequiresFinance] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!delegationId) return;
    setLoading(true);
    try {
      // TODO: appeler l'API pour ajouter la policy
      await new Promise(r => setTimeout(r, 500));
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-400">Type d&apos;action *</label>
        <select
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="APPROVE_PAYMENT">Valider paiement</option>
          <option value="SIGN_CONTRACT">Signer contrat</option>
          <option value="APPROVE_PURCHASE_ORDER">Valider BC</option>
          <option value="VALIDATE_CHANGE_ORDER">Valider avenant</option>
          <option value="COMMIT_BUDGET">Engager budget</option>
          <option value="APPROVE_EXPENSE">Approuver dépense</option>
        </select>
      </div>
      <div>
        <label className="text-sm text-slate-400">Plafond (XOF)</label>
        <input
          type="number"
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={maxAmount}
          onChange={(e) => setMaxAmount(Number(e.target.value))}
          placeholder="0 = illimité"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded" checked={requiresDual} onChange={(e) => setRequiresDual(e.target.checked)} />
          Double validation
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded" checked={requiresLegal} onChange={(e) => setRequiresLegal(e.target.checked)} />
          Visa juridique
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded" checked={requiresFinance} onChange={(e) => setRequiresFinance(e.target.checked)} />
          Visa finance
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </FluentButton>
        <FluentButton size="sm" variant="primary" onClick={handleSubmit} disabled={loading}>
          <FilePlus className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Ajout...' : 'Ajouter'}
        </FluentButton>
      </div>
    </div>
  );
}

function AddEngagementForm({ delegationId, onSuccess, onCancel }: ModalFormProps) {
  const [engagementType, setEngagementType] = useState('OBLIGATION');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!delegationId || !title.trim()) return;
    setLoading(true);
    try {
      // TODO: appeler l'API pour ajouter l'engagement
      await new Promise(r => setTimeout(r, 500));
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-400">Type *</label>
        <select
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={engagementType}
          onChange={(e) => setEngagementType(e.target.value)}
        >
          <option value="OBLIGATION">Obligation</option>
          <option value="PROHIBITION">Interdiction</option>
          <option value="REPORTING">Reporting</option>
          <option value="DOCUMENTATION">Documentation requise</option>
          <option value="ALERT">Alerte</option>
          <option value="COMPLIANCE">Conformité</option>
        </select>
      </div>
      <div>
        <label className="text-sm text-slate-400">Titre *</label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de l'engagement..."
        />
      </div>
      <div>
        <label className="text-sm text-slate-400">Description</label>
        <textarea
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description détaillée..."
        />
      </div>
      <div className="flex justify-end gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </FluentButton>
        <FluentButton size="sm" variant="primary" onClick={handleSubmit} disabled={loading || !title.trim()}>
          <FilePlus className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Ajout...' : 'Ajouter'}
        </FluentButton>
      </div>
    </div>
  );
}

function ExportAuditForm({ delegationId, onSuccess, onCancel }: ModalFormProps) {
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('pdf');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!delegationId) return;
    setLoading(true);
    try {
      window.open(`/api/delegations/${encodeURIComponent(delegationId)}/export?format=${format}`, '_blank');
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Télécharger le journal d&apos;audit complet de cette délégation.
      </p>
      <div>
        <label className="text-sm text-slate-400">Format</label>
        <select
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={format}
          onChange={(e) => setFormat(e.target.value as typeof format)}
        >
          <option value="pdf">PDF (document imprimable)</option>
          <option value="csv">CSV (tableur)</option>
          <option value="json">JSON (données structurées)</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <FluentButton size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </FluentButton>
        <FluentButton size="sm" variant="primary" onClick={handleExport} disabled={loading}>
          <Download className="w-3.5 h-3.5 mr-1" />
          {loading ? 'Export...' : 'Télécharger'}
        </FluentButton>
      </div>
    </div>
  );
}
