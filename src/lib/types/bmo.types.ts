// ============================================
// Types pour le module BMO (Maître d'Ouvrage)
// ============================================

// --- Enums ---
export type Priority = 'urgent' | 'high' | 'normal' | 'low';
export type BadgeType = 'urgent' | 'warning' | 'success' | 'info' | 'gold' | 'default' | 'gray';
export type ProjectStatus = 'active' | 'blocked' | 'completed' | 'pending';
export type EmployeeStatus = 'active' | 'mission' | 'absent' | 'conge';
export type DemandStatus = 'pending' | 'validated' | 'rejected';
export type ExchangeStatus = 'pending' | 'resolved' | 'escalated' | 'info';
export type ArbitrationStatus = 'pending' | 'resolved';
export type RecoveryStatus = 'relance' | 'huissier' | 'contentieux';
export type ContractType = 'CDI' | 'CDD' | 'Stage' | 'Freelance';

// --- Bureau ---
export interface Bureau {
  code: string;
  name: string;
  icon: string;
  color: string;
  head: string;
  agents: number;
  tasks: number;
  completion: number;
  budget: string;
  desc: string;
}

// --- Détails Bureau (NOUVEAU) ---
export interface BureauDetails {
  code: string;
  platforms: BureauPlatform[];
  organigramme: BureauOrgMember[];
  stats: {
    projectsActive: number;
    projectsCompleted: number;
    budgetTotal: string;
    budgetUsed: string;
    validationsMonth: number;
    avgResponseTime: string;
  };
  recentActivities: {
    id: string;
    action: string;
    date: string;
    agent: string;
  }[];
}

export interface BureauPlatform {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface BureauOrgMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  phone: string;
  status: EmployeeStatus;
  isHead: boolean;
}

// --- Employé (enrichi pour système proactif RH) ---
export interface Employee {
  id: string;
  name: string;
  initials: string;
  role: string;
  bureau: string;
  status: EmployeeStatus;
  email: string;
  phone: string;
  salary: string;
  skills: string[];
  delegated?: boolean;
  // Nouveaux champs RH proactif
  criticalSkills?: string[]; // Compétences critiques détenues
  isSinglePointOfFailure?: boolean; // Risque mono-compétence
  hireDate?: string;
  managerId?: string;
  nextEvaluation?: string;
}

export interface EmployeeDetails {
  employeeId: string;
  contractType: ContractType;
  contractStart: string;
  contractEnd?: string;
  emergencyContact: string;
  address: string;
  bankAccount: string;
  socialSecurity: string;
  // Nouveaux champs RH enrichis
  congesRestants: number; // Jours de congés restants
  congesPris: number; // Jours pris cette année
  retards: number; // Nombre de retards ce mois
  absencesNonJustifiees: number; // Absences non justifiées
  absencesJustifiees: number; // Absences justifiées (maladie, etc.)
  derniereEvaluation?: string; // Date dernière évaluation
  scoreEvaluation?: number; // Dernier score (0-100)
  formations?: EmployeeFormation[];
  sanctions?: EmployeeSanction[];
  promotions?: EmployeePromotion[];
}

export interface EmployeeFormation {
  id: string;
  title: string;
  date: string;
  duration: string;
  status: 'completed' | 'in_progress' | 'planned';
  certificate?: string;
}

export interface EmployeeSanction {
  id: string;
  type: 'avertissement' | 'blame' | 'mise_a_pied' | 'autre';
  date: string;
  motif: string;
  decidedBy: string;
}

export interface EmployeePromotion {
  id: string;
  date: string;
  fromRole: string;
  toRole: string;
  fromSalary: string;
  toSalary: string;
  decidedBy: string;
}

// --- Projet ---
// =========================
// PROJET UNIVERSEL
// =========================

export type ProjectDomain = 'travaux' | 'fournitures' | 'services' | 'logistique';

export interface Project {
  id: string;
  name: string;
  client: string; // ⚠️ Conservé pour compatibilité rétroactive
  clientIds: string[];        // ✅ Plusieurs clients
  buildingIds: string[];      // ✅ Plusieurs bâtiments
  domains: ProjectDomain[];   // ✅ Multi-domaine
  nomenclatureFamilies: string[]; // ex: ['F10-02', 'S20-01', 'C10-01']
  budget: string;
  spent: string;
  progress: number;
  status: ProjectStatus;
  bureau: string;
  team: number;
  decisionBMO?: DecisionBMO; // 🔑 CHAMP CLÉ : DÉCISION BMO (traçabilité RACI)
}

// --- Bâtiment ---
export interface Building {
  id: string;      // BLDG-01
  name: string;    // "Bâtiment A - Urgences"
  type: string;    // "sanitaire", "bureaux", "logement"
  surface: number; // m²
}

// --- Projet avec Budget détaillé (NOUVEAU) ---
export interface ProjectBudget {
  projectId: string;
  budgetEstimatif: number;      // Budget initial estimé
  budgetPrevisionnel: number;   // Budget réel + 5% (plafond autorisé)
  budgetReel: number;           // Budget actuellement dépensé
  seuilAlerte: number;          // Seuil à partir duquel on alerte (généralement budgetReel)
  depassementAutorise: boolean; // Si le BMO a donné son accord
  dateAccordDepassement?: string;
  motifDepassement?: string;
  historique: BudgetHistoryItem[];
}

export interface BudgetHistoryItem {
  date: string;
  type: 'depense' | 'ajustement' | 'accord_depassement';
  montant: number;
  description: string;
  validatedBy?: string;
}

// --- Alerte Budget (NOUVEAU) ---
export interface BudgetAlert {
  id: string;
  projectId: string;
  projectName: string;
  bureau: string;
  budgetPrevisionnel: number;
  budgetActuel: number;
  depassement: number;          // Montant du dépassement
  depassementPourcent: number;  // % de dépassement
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  approvedBy?: string;
  motif: string;
}

// --- Demande ---
export interface Demand {
  id: string;
  bureau: string;
  icon: string;
  type: string;
  subject: string;
  priority: Priority;
  amount: string;
  date: string;
  status?: DemandStatus;
}

// --- Délégation ---
export interface Delegation {
  id: string;
  type: string;
  agent: string;
  initials: string;
  scope: string;
  start: string;
  end: string;
  status: 'active' | 'expired' | 'revoked';
  usageCount: number;
}

// --- Décision ---
export interface Decision {
  id: string;
  type: string;
  subject: string;
  date: string;
  author: string;
  status: 'executed' | 'pending' | 'cancelled';
  hash: string;
}

// =========================
// NOMENCLATURE INTERNE (type CPV)
// =========================

export type NomenclatureDomain = 'F' | 'S' | 'C' | 'T' | 'L'; // Fournitures, Services, Conception, Travaux, Logistique

export type FamilyCode = `${NomenclatureDomain}${number}${number}-${number}${number}`;

export interface NomenclatureFamily {
  code: FamilyCode;
  label: string;
  domain: NomenclatureDomain;
  parent?: string; // ex: "F10"
  cpvRef?: string[];
  keywords?: string[];
  allowMixedWith?: FamilyCode[]; // ex: livraison peut se mélanger
}

// =========================
// BON DE COMMANDE (homogène par famille)
// =========================

export interface BCLine {
  id: string;
  familyCode: FamilyCode; // ✅ Doit correspondre à la famille du BC
  designation: string;
  qty: number;
  unitPriceHT: number;
}

export interface PurchaseOrder {
  id: string;
  project: string; // ⚠️ Conservé pour compatibilité rétroactive
  projectId: string;       // ✅ Lié à un projet (même multi-client)
  familyCode: FamilyCode; // ✅ 1 seule famille par BC (conformité interne)
  subject: string;
  supplier: string;
  supplierId?: string;
  amount: string;
  requestedBy: string;
  bureau: string;
  date: string;
  dateLimit?: string; // Date limite de validation
  priority: Priority;
  status: DemandStatus | 'audit_required' | 'approved' | 'rejected';
  lines?: BCLine[]; // Lignes détaillées du bon de commande
  decisionBMO?: DecisionBMO; // 🔑 CHAMP CLÉ : DÉCISION BMO (traçabilité RACI)
}

// --- Contrat ---
export interface Contract {
  id: string;
  type: string;
  subject: string;
  partner: string;
  amount: string;
  preparedBy: string;
  bureau: string;
  date: string;
  expiry: string;
  status: DemandStatus;
}

// --- Paiement ---
export interface Payment {
  id: string;
  type: string;
  ref: string;
  beneficiary: string;
  amount: string;
  project: string;
  validatedBy: string;
  bureau: string;
  date: string;
  dueDate: string;
  status: DemandStatus;
}

// --- Facture ---
export interface Invoice {
  id: string;
  fournisseur: string;
  objet: string;
  montant: string;
  projet: string;
  dateFacture: string;
  dateEcheance: string;
  status: DemandStatus;
  validatedBy: string | null;
  bureau: string;
  decisionBMO?: DecisionBMO; // 🔑 CHAMP CLÉ : DÉCISION BMO (traçabilité RACI)
}

// --- Avenant ---
export interface Amendment {
  id: string;
  contratRef: string;
  objet: string;
  partenaire: string;
  impact: 'Financier' | 'Délai' | 'Technique';
  montant: string | null;
  justification: string;
  status: DemandStatus;
  preparedBy: string;
  bureau: string;
  date: string;
  decisionBMO?: DecisionBMO; // 🔑 CHAMP CLÉ : DÉCISION BMO (traçabilité RACI)
}

// --- Dossier bloqué ---
export interface BlockedDossier {
  id: string;
  type: string;
  subject: string;
  amount: string;
  bureau: string;
  responsible: string;
  blockedSince: string;
  delay: number;
  reason: string;
  project: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  /** Statut (optionnel, utilisé par API et mocks) */
  status?: string;
  /** SLA (optionnel) */
  sla?: string | { ok?: boolean; atRisk?: boolean; breached?: boolean };
  /** Description détaillée (optionnel) */
  description?: string;
}

// --- Demande RH (enrichi avec traçabilité audit) ---
export interface HRRequest {
  id: string;
  type: 'Congé' | 'Dépense' | 'Maladie' | 'Déplacement' | 'Paie';
  subtype: string;
  agent: string;
  agentId?: string;
  initials: string;
  bureau: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  amount?: string;
  destination?: string;
  reason: string;
  status: DemandStatus;
  date: string;
  priority: Priority;
  // Traçabilité audit RH
  validatedBy?: string;
  validatedAt?: string;
  validationComment?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  documents?: HRRequestDocument[];
  impactSubstitution?: string; // ID de la substitution créée si absence
  impactFinance?: string; // ID de l'entrée finance si dépense payée
  hash?: string; // SHA3-256 pour anti-contestation
  decisionBMO?: DecisionBMO; // 🔑 CHAMP CLÉ : DÉCISION BMO (traçabilité RACI)
}

export interface HRRequestDocument {
  id: string;
  type: 'certificat_medical' | 'ordre_mission' | 'justificatif' | 'facture' | 'autre';
  name: string;
  date: string;
  url?: string;
}

// --- Mission (nouveau) ---
export type MissionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'late';

export interface MissionObjective {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  completedAt?: string;
  completedBy?: string;
}

export interface MissionProof {
  id: string;
  type: 'photo' | 'compte_rendu' | 'document' | 'signature' | 'autre';
  title: string;
  date: string;
  uploadedBy: string;
  url?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  bureaux: string[]; // Bureaux impliqués
  participants: {
    employeeId: string;
    employeeName: string;
    role: 'responsable' | 'participant' | 'support';
  }[];
  startDate: string;
  endDate: string;
  progress: number; // 0-100
  status: MissionStatus;
  priority: Priority;
  objectives: MissionObjective[];
  proofs: MissionProof[];
  linkedProject?: string;
  linkedLitigation?: string;
  budget?: string;
  budgetUsed?: string;
  impactFinancier?: string; // Description impact financier
  impactJuridique?: string; // Description impact juridique
  decisions?: string[]; // IDs des décisions liées
  createdBy: string;
  createdAt: string;
  decisionBMO?: DecisionBMO; // 🔑 CHAMP CLÉ : DÉCISION BMO (traçabilité RACI)
}

// --- Évaluation (nouveau) ---
export type EvaluationStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface EvaluationCriteria {
  id: string;
  name: string;
  score: number; // 0-5
  weight: number; // Pondération
  comment?: string;
}

export interface EvaluationRecommendation {
  id: string;
  type: 'formation' | 'promotion' | 'augmentation' | 'recadrage' | 'mutation' | 'autre';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  approvedBy?: string;
  approvedAt?: string;
  implementedAt?: string;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  bureau: string;
  evaluatorId: string;
  evaluatorName: string;
  date: string;
  period: string; // Ex: "2025-S1", "2025-Annuel"
  status: EvaluationStatus;
  scoreGlobal: number; // 0-100
  criteria: EvaluationCriteria[];
  strengths: string[];
  improvements: string[];
  recommendations: EvaluationRecommendation[];
  employeeComment?: string;
  nextEvaluation?: string;
  documents?: {
    id: string;
    type: 'compte_rendu' | 'objectifs' | 'autre';
    name: string;
    date: string;
  }[];
  hash?: string; // SHA3-256 pour traçabilité
}

// --- Compétence critique (pour analyse mono-compétence) ---
export interface CriticalSkill {
  id: string;
  name: string;
  description: string;
  holders: string[]; // IDs des employés qui la détiennent
  isAtRisk: boolean; // true si un seul holder
  bureau: string;
  importance: 'critical' | 'high' | 'medium';
}

// --- Échange inter-bureaux ---
export interface BureauExchange {
  id: string;
  from: string;
  to: string;
  fromAgent: string;
  toAgent: string;
  subject: string;
  message: string;
  date: string;
  status: ExchangeStatus;
  priority: Priority;
  project?: string;
  attachments?: number;
}

// --- Arbitrage ---
export interface Arbitration {
  id: string;
  subject: string;
  parties: string[];
  description: string;
  requestedBy: string;
  date: string;
  status: ArbitrationStatus;
  impact: 'critical' | 'high' | 'medium' | 'low';
  deadline: string;
  resolution?: string;
}

// --- Message externe ---
export interface ExternalMessage {
  id: string;
  type: string;
  sender: string;
  contact: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: Priority;
  project?: string;
  requiresResponse: boolean;
  decisionBMO?: DecisionBMO; // 🔑 CHAMP CLÉ : DÉCISION BMO (traçabilité RACI)
}

// --- Recouvrement (enrichi pour traçabilité) ---
export interface RecoveryAction {
  id: string;
  date: string;
  type: 'relance_email' | 'relance_courrier' | 'relance_telephone' | 'mise_en_demeure' | 'huissier' | 'contentieux' | 'echeancier' | 'paiement_partiel';
  description: string;
  agent: string;
  montant?: string;
  document?: string; // Référence au document associé
  result?: string;
  hash?: string;
}

export interface RecoveryDocument {
  id: string;
  type: 'courrier' | 'mise_en_demeure' | 'huissier' | 'echeancier' | 'preuve_paiement' | 'autre';
  name: string;
  date: string;
  url?: string;
}

export interface Recovery {
  id: string;
  type: 'Entreprise' | 'Particulier' | 'Institution';
  debiteur: string;
  contact?: string;
  email?: string;
  phone?: string;
  montant: string;
  montantInitial: string;
  montantRecouvre?: string;
  dateEcheance: string;
  delay: number;
  status: RecoveryStatus;
  relances: number;
  lastAction?: string;
  lastActionDate?: string;
  nextAction?: string;
  nextActionDate?: string;
  projet?: string;
  projetName?: string;
  history: RecoveryAction[];
  documents: RecoveryDocument[];
  linkedLitigation?: string; // ID du litige si escaladé
  echeancier?: RecoveryEcheancier;
  decisionBMO?: {
    origin: string;
    decisionId: string;
    hash: string;
    validatorRole: string;
  };
  hash?: string;
  lastActionType?: string;
}

export interface RecoveryEcheancier {
  id: string;
  montantTotal: string;
  nbEcheances: number;
  echeances: {
    numero: number;
    montant: string;
    dateEcheance: string;
    status: 'pending' | 'paid' | 'late';
    datePaiement?: string;
  }[];
}

// --- Litige (enrichi pour traçabilité procédurale) ---
export interface LitigationJournalEntry {
  id: string;
  date: string;
  type: 'acte' | 'audience' | 'decision' | 'signification' | 'expertise' | 'mediation' | 'appel' | 'autre';
  title: string;
  description: string;
  agent?: string;
  document?: string;
  outcome?: string;
}

export interface LitigationDeadline {
  id: string;
  title: string;
  date: string;
  type: 'audience' | 'delai_reponse' | 'signification' | 'expertise' | 'appel' | 'execution' | 'autre';
  status: 'upcoming' | 'urgent' | 'passed' | 'completed';
  description?: string;
  linkedEventId?: string;
}

export interface LitigationDocument {
  id: string;
  type: 'assignation' | 'conclusions' | 'jugement' | 'expertise' | 'correspondance' | 'piece' | 'autre';
  name: string;
  date: string;
  url?: string;
}

export interface Litigation {
  id: string;
  type: 'Commercial' | 'Travail' | 'Assurance' | 'Construction' | 'Autre';
  adversaire: string;
  adversaireContact?: string;
  adversaireAvocat?: string;
  objet: string;
  resume?: string;
  montant: string;
  exposure: string; // Exposition estimée (risque financier max)
  juridiction: string;
  numeroAffaire?: string;
  avocat: string;
  avocatContact?: string;
  status: 'en_cours' | 'audience_prevue' | 'mediation' | 'expertise' | 'appel' | 'clos_gagne' | 'clos_perdu' | 'transaction';
  statusLabel: string;
  prochainRdv?: string;
  prochainRdvType?: string;
  projet?: string;
  projetName?: string;
  dateOuverture: string;
  dateCloture?: string;
  journal: LitigationJournalEntry[];
  deadlines: LitigationDeadline[];
  documents: LitigationDocument[];
  linkedRecovery?: string; // ID du recouvrement source
  linkedArbitrage?: string; // ID de l'arbitrage si demandé
  decision?: {
    date: string;
    type: 'jugement' | 'ordonnance' | 'transaction' | 'desistement';
    outcome: 'favorable' | 'defavorable' | 'mixte';
    montantAccorde?: string;
    resume: string;
  };
  decisionBMO?: DecisionBMO; // 🔑 CHAMP CLÉ : DÉCISION BMO (traçabilité RACI)
}

// --- Événement calendrier (enrichi pour multi-bureaux) ---
export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'visio' | 'deadline' | 'site' | 'delivery' | 'legal' | 'inspection' | 'training' | 'hr' | 'intervention' | 'audit' | 'formation';
  location?: string;
  date: string;
  endDate?: string;
  priority: Priority | 'critical';
  client?: string;
  project?: string;
  supplier?: string;
  employee?: string;
  // Nouveaux champs pour coordination multi-bureaux
  bureau?: string; // Bureau principal responsable
  involvedBureaux?: string[]; // Bureaux impliqués
  estimatedCharge?: number; // Charge estimée en heures
  dependencies?: string[]; // IDs d'événements dépendants
  participants?: ActivityParticipant[];
  documents?: string[]; // IDs de documents liés
  risks?: string[]; // IDs de risques associés
  notes?: ActivityNote[];
  status?: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  conflicts?: ConflictDetection[];
  createdAt?: string;
  createdBy?: string;
  modifiedAt?: string;
  modifiedBy?: string;
}

export interface ActivityParticipant {
  employeeId: string;
  name: string;
  bureau: string;
  role: 'organizer' | 'participant' | 'required' | 'optional';
  confirmed?: boolean;
}

export interface ActivityNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  type?: 'info' | 'warning' | 'critical';
}

export interface ConflictDetection {
  type: 'overlap' | 'resource' | 'absence' | 'overload' | 'dependency';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  conflictingEventIds?: string[];
  conflictingResource?: string;
  detectedAt: string;
}

// --- Tâche ---
export interface Task {
  id: string;
  text: string;
  priority: Priority;
  due: string;
  done: boolean;
  bureau: string;
}

// --- Rappel ---
export interface Reminder {
  id: string;
  title: string;
  time: string;
  urgent: boolean;
  icon: string;
}

// --- Note ---
export interface Note {
  id: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'red' | 'purple';
  date: string;
  pinned: boolean;
}

// --- Notification ---
export interface Notification {
  id: number;
  title: string;
  desc: string;
  unread: boolean;
  icon: string;
  time: string;
}

// --- Alerte système ---
export interface SystemAlert {
  id: string;
  title: string;
  type: 'critical' | 'warning' | 'success' | 'info';
  action: string;
}

// --- Toast ---
export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

// --- Statistiques temps réel ---
export interface LiveStats {
  demandesEnCours: number;
  validationsJour: number;
  montantTraite: string;
  alertesCritiques: number;
  tauxValidation: number;
  tempsReponse: string;
}

// --- KPIs animés ---
export interface AnimatedKPIs {
  demands: number;
  validated: number;
  projects: number;
  blocked: number;
  budget: number;
  employees: number;
  bureaux: number;
  delegations: number;
}

// --- Navigation ---
export interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
  badgeType?: BadgeType;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

// --- Données de performance ---
export interface PerformanceData {
  month: string;
  validations: number;
  demandes: number;
  budget: number;
  rejets: number;
}

// --- Matrice RACI ---
export interface RACIRow {
  activity: string;
  BMO: 'R' | 'A' | 'C' | 'I';
  BF: 'R' | 'A' | 'C' | 'I';
  BM: 'R' | 'A' | 'C' | 'I';
  BA: 'R' | 'A' | 'C' | 'I';
  BCT: 'R' | 'A' | 'C' | 'I';
  BQC: 'R' | 'A' | 'C' | 'I';
  BJ: 'R' | 'A' | 'C' | 'I';
}

// --- Audit ---
export interface AuditItem {
  id: string;
  type: string;
  status: 'conforme' | 'attention' | 'non-conforme';
  score: number;
  lastCheck: string;
  nextCheck: string;
}

// --- Organigramme ---
export interface OrgMember {
  id?: string;
  name: string;
  role: string;
  initials: string;
  skills?: string[];
}

export interface OrgBureau {
  code: string;
  head: OrgMember;
  members: OrgMember[];
}

export interface Organigramme {
  dg: OrgMember;
  bureaux: OrgBureau[];
}

// --- Consigne ---
export interface Consigne {
  id: string;
  bureau: string;
  from: string;
  title: string;
  content: string;
  date: string;
  priority: Priority;
  status: 'active' | 'archived';
  acknowledgement: string[];
}

// --- Substitution ---
export interface Substitution {
  ref: string;
  bureau: string;
  icon: string;
  desc: string;
  amount: string;
  delay: number;
  reason: string;
}

// --- Action de Substitution (NOUVEAU) ---
export type SubstitutionActionType = 
  | 'instruire'           // Instruire le dossier
  | 'valider'             // Valider à la place
  | 'rejeter'             // Rejeter la demande
  | 'annuler'             // Annuler la demande
  | 'deleguer'            // Déléguer à un autre agent
  | 'demander_info';      // Demander des informations complémentaires

export interface SubstitutionAction {
  id: string;
  dossierRef: string;
  dossierType: string;
  dossierSubject: string;
  dossierAmount: string;
  dossierBureau: string;
  dossierResponsible: string;
  dossierReason: string;
  actionType: SubstitutionActionType;
  traitant: string;           // Agent désigné pour traiter
  traitantId: string;
  deadline: string;
  instructions?: string;
  createdAt: string;
  createdBy: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

// --- Timeline ---
export interface TimelineItem {
  type: 'validated' | 'substitution' | 'delegation' | 'alert' | 'payment' | 'contract';
  title: string;
  desc: string;
  time: string;
  bureau: string;
}

// --- Message IA ---
export interface AIMessage {
  type: 'user' | 'bot';
  text: string;
}

// --- Élément recherchable ---
export interface SearchableItem {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  page: string;
}

// ============================================
// NOUVEAUX TYPES - Journalisation, Paramètres, Stats
// ============================================

// --- Log d'action (Journalisation) ---
export type ActionLogType = 
  | 'validation'
  | 'rejection' 
  | 'substitution'
  | 'delegation'
  | 'creation'
  | 'modification'
  | 'suppression'
  | 'connexion'
  | 'deconnexion'
  | 'export'
  | 'import'
  | 'budget_alert'
  | 'budget_approval'
  | 'audit'
  | 'request_complement'
  | 'escalation'
  // Actions calendrier
  | 'modifier'
  | 'replanifier'
  | 'terminer'
  | 'supprimer'
  | 'annuler'
  | 'creer'
  | 'assigner-bureau'
  | 'escalader'
  | 'changer-statut'
  | 'mass-done'
  | 'mass-cancel'
  | 'mass-replan'
  // Actions déplacements
  | 'generate_ordre_mission'
  | 'approve'
  // Actions échanges structures
  | 'respond'
  | 'escalate'
  | 'close'
  | 'create'
  // Actions audit
  | 'create_action'
  | 'resolve_finding'
  | 'start_finding'
  | 'update_action_status'
  | 'generate_report'
  // Actions validation paiements
  | 'blocage'
  | 'complement'
  | 'bf_validation'
  | 'export_evidence'
  // Actions employés
  | 'view_profile'
  | 'mitigation_plan'
  | 'edit'
  | 'evaluate'
  // Actions contrats
  | 'signature'
  | 'renvoi'
  | 'arbitrage'
  // Actions system logs
  | 'integrity_scan_start'
  | 'integrity_scan_end'
  | 'incident_create'
  | 'export_evidence_pack'
  | 'verify_hash'
  // Actions recouvrements
  | 'relance'
  | 'escalade'
  // Actions organigramme
  | 'update_position'
  // Actions évaluations
  | 'view'
  | 'validate_recommendation'
  | 'schedule_formation'
  | 'download_cr'
  // Actions bloqués
  | 'substitution_open'
  | 'resolution'
  | 'bulk'
  // Actions conférences
  | 'create_from_dossier'
  | 'join'
  | 'copy_link'
  | 'generate_summary'
  | 'validate_summary'
  | 'extract_decisions'
  | 'open_calendar'
  | 'open_integrations'
  | 'open_visio'
  // Actions tickets clients
  | 'assign'
  | 'convert_to_project'
  | 'response'
  // Actions déplacements
  | 'generate_ordre_mission'
  | 'approve'
  | 'reject'
  // Actions échanges
  | 'respond'
  | 'forward'
  | 'archive'
  | 'transfer'
  // Actions employés & RH
  | 'view_profile'
  | 'view'
  | 'update'
  | 'delete'
  | 'assign'
  | 'unassign'
  | 'activate'
  | 'deactivate'
  | 'send'
  | 'receive'
  | 'complete'
  | 'cancel'
  | 'schedule'
  | 'reschedule';

export interface ActionLog {
  id: string;
  timestamp: string;          // ISO date string
  userId: string;
  userName: string;
  userRole: string;
  action: ActionLogType;
  module: string;             // Ex: 'validation-bc', 'substitution', 'employes'
  targetId?: string;          // ID de l'élément concerné
  targetType?: string;        // Type de l'élément (BC, Paiement, Employé, etc.)
  targetLabel?: string;       // Libellé lisible
  details?: string;           // Détails supplémentaires
  ipAddress?: string;
  userAgent?: string;
  previousValue?: string;     // Pour les modifications
  newValue?: string;          // Pour les modifications
  bureau?: string;
  hash?: string;              // 🔑 Hash de traçabilité (SHA-256)
  decisionId?: unknown;       // Référence à une décision BMO
  meta?: Record<string, unknown>; // Métadonnées supplémentaires
}

// --- Paramètres utilisateur ---
export interface UserSettings {
  userId: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
    role: string;
    bureau: string;
  };
  preferences: {
    language: 'fr' | 'en';
    timezone: string;
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    currency: 'FCFA' | 'EUR' | 'USD';
    theme: 'dark' | 'light' | 'system';
    sidebarCollapsed: boolean;
    compactMode: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    urgentOnly: boolean;
    digest: 'realtime' | 'hourly' | 'daily' | 'weekly';
    categories: {
      validations: boolean;
      blocages: boolean;
      budgets: boolean;
      rh: boolean;
      litiges: boolean;
    };
  };
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    sessionTimeout: number;    // en minutes
    trustedDevices: string[];
  };
}

// --- Statistiques Clients ---
export interface Client {
  id: string;
  name: string;
  type: 'particulier' | 'entreprise' | 'institution' | 'ong';
  satisfaction: number; // 1-5
  projects: string[]; // IDs de projets
  // Champs existants conservés pour compatibilité
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  registrationDate?: string;
  status?: 'active' | 'inactive' | 'prospect';
}

export interface ClientStats {
  id: string;
  clientId: string;
  clientName: string;
  clientType: 'particulier' | 'entreprise' | 'institution';
  
  // Projets
  projectsTotal: number;
  projectsActive: number;
  projectsCompleted: number;
  projectsCancelled: number;
  
  // Financier
  chiffreAffairesTotal: number;
  chiffreAffairesAnnee: number;
  paiementsEnCours: number;
  paiementsEnRetard: number;
  montantImpaye: number;
  
  // Satisfaction & Relation
  scoreQualite: number;        // 0-100
  nbReclamations: number;
  nbLitiges: number;
  anciennete: number;          // en mois
  dernierContact: string;
  
  // Historique projets
  projects: ClientProjectSummary[];
}

export interface ClientProjectSummary {
  projectId: string;
  projectName: string;
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
  budget: number;
  paid: number;
  remaining: number;
}

// --- Stats globales clients (pour dashboard) ---
export interface ClientsGlobalStats {
  totalClients: number;
  clientsActifs: number;
  clientsParticuliers: number;
  clientsEntreprises: number;
  clientsInstitutions: number;
  nouveauxClientsMois: number;
  chiffreAffairesTotalAnnee: number;
  tauxFidelisation: number;
  scoreSatisfactionMoyen: number;
  topClients: {
    clientId: string;
    clientName: string;
    chiffreAffaires: number;
  }[];
  repartitionParType: {
    type: string;
    count: number;
    percentage: number;
  }[];
  evolutionMensuelle: {
    month: string;
    nouveaux: number;
    chiffreAffaires: number;
  }[];
}

// ============================================
// TYPES FINANCE & CONTENTIEUX
// ============================================

// --- Gain financier ---
export type GainCategory = 
  | 'paiement_client'      // Paiement reçu d'un client
  | 'retenue_garantie'     // Libération de retenue de garantie
  | 'penalite_recue'       // Pénalité reçue d'un fournisseur
  | 'remboursement'        // Remboursement (assurance, trop-perçu, etc.)
  | 'subvention'           // Subvention reçue
  | 'autre';

// =============== TYPES BMO ===============
export type RACIRole = 'A' | 'R'; // Accountable / Responsible

// WHY: Chaque décision BMO doit avoir un hash SHA3-256 horodaté pour garantir l'intégrité et la traçabilité
// Le rôle RACI ('A' ou 'R') détermine qui est responsable de la validation
export interface BMODecision {
  decisionId: string;        // ex: DEC-20250405-001
  origin: string;            // ex: "validation-bc", "arbitrages", "validation-paiements"
  validatorRole: RACIRole;   // "A" = BMO (Accountable), "R" = BM/BA/BJ (Responsible)
  hash: string;              // SHA3-256 horodaté - garantit l'intégrité et la traçabilité
  comment?: string;
}

// Décision BMO pour pilotage financier (RACI) - Alias pour compatibilité
export type DecisionBMO = BMODecision;

export interface FinancialGain {
  id: string;
  date: string;
  category: GainCategory;
  categoryLabel: string;
  description: string;
  montant: number;
  projet?: string;
  projetName?: string;
  client?: string;
  clientName?: string;
  reference?: string; // Référence facture, contrat, etc.
  justificatif?: string; // Lien vers le document
  validatedBy?: string;
  validatedAt?: string;
  hash?: string; // SHA3-256 pour traçabilité
  decisionBMO?: DecisionBMO; // Information de pilotage BMO (RACI)
}

// --- Perte financière ---
export type LossCategory = 
  | 'penalite_retard'      // Pénalité pour retard
  | 'malfacon'             // Coût de reprise malfaçon
  | 'sinistre'             // Sinistre non couvert
  | 'creance_irrecuperable' // Créance passée en perte
  | 'frais_contentieux'    // Frais d'avocat, huissier, etc.
  | 'provision_litige'     // Provision pour litige
  | 'autre';

export interface FinancialLoss {
  id: string;
  date: string;
  category: LossCategory;
  categoryLabel: string;
  description: string;
  montant: number;
  projet?: string;
  projetName?: string;
  fournisseur?: string;
  incident?: string; // Lien vers l'incident/litige source
  reference?: string;
  justificatif?: string;
  decision?: string; // Lien vers la décision d'arbitrage
  decisionDate?: string;
  validatedBy?: string;
  validatedAt?: string;
  hash?: string;
  decisionBMO?: DecisionBMO; // Information de pilotage BMO (RACI)
}

// --- Entrée de trésorerie ---
export type TreasuryEntryType = 
  | 'encaissement'         // Entrée d'argent
  | 'decaissement'         // Sortie d'argent
  | 'provision'            // Provision comptable
  | 'regularisation';      // Régularisation

export type TreasurySource = 
  | 'paiement'             // Issu des paiements (paymentsN1)
  | 'recouvrement'         // Issu des recouvrements
  | 'litige'               // Issu d'un litige
  | 'exploitation';        // Autre exploitation

export interface TreasuryEntry {
  id: string;
  date: string;
  type: TreasuryEntryType;
  source: TreasurySource;
  sourceRef?: string; // ID du paiement, recouvrement ou litige source
  description: string;
  montant: number; // Positif pour encaissement, négatif pour décaissement
  soldeApres: number;
  projet?: string;
  projetName?: string;
  tiers?: string; // Client, fournisseur, etc.
  validatedBy?: string;
  decisionBMO?: DecisionBMO; // Information de pilotage BMO (RACI)
}

// --- Facture reçue ---
export type FactureStatut =
  | 'à_vérifier'
  | 'conforme'
  | 'non_conforme'
  | 'payée'
  | 'rejetée';

export interface Facture {
  id: string;               // F-2026-0012
  dateEmission: string;     // '12/12/2025'
  dateReception: string;    // '15/12/2025'
  fournisseur: string;      // 'SENFER'
  chantier: string;         // 'Chantier Dakar Nord'
  chantierId: string;       // 'CH-2025-DKN'
  referenceBC: string;      // 'BC-2025-0154'
  montantHT: number;        // 38000000
  montantTTC: number;       // 45600000
  description: string;      // 'Fourniture béton C30/37 – lot 2'
  statut: FactureStatut;
  commentaire?: string;
  decisionBMO?: DecisionBMO; // 🔑 CHAMP CLÉ : DÉCISION BMO (comme dans les gains/pertes)
}

// --- Structure Financials enrichie ---
export interface Financials {
  // Résumé global
  totalGains: number;
  totalPertes: number;
  resultatNet: number;
  tauxMarge: number;
  
  // Détails
  gains: FinancialGain[];
  pertes: FinancialLoss[];
  
  // Trésorerie
  tresorerieActuelle: number;
  tresoreriePrevisionnelle: number; // Projection à 30 jours
  treasury: TreasuryEntry[];
  
  // Évolution mensuelle
  evolution: {
    month: string;
    gains: number;
    pertes: number;
    solde: number;
  }[];
  
  // Répartition par catégorie
  gainsParCategorie: {
    category: GainCategory;
    label: string;
    montant: number;
    percentage: number;
  }[];
  pertesParCategorie: {
    category: LossCategory;
    label: string;
    montant: number;
    percentage: number;
  }[];
  
  // Indicateurs
  kpis: {
    margeNette: number;
    ratioRecouvrement: number; // % des créances recouvrées
    expositionLitiges: number; // Total exposition litiges
    provisionContentieux: number;
  };
}

// --- Stats Finance & Contentieux (pour dashboard) ---
export interface FinanceContentieuxStats {
  // Finances
  totalGains: number;
  totalPertes: number;
  resultatNet: number;
  tresorerieActuelle: number;
  
  // Recouvrements
  totalARecouvrer: number;
  nbDossiersRecouvrement: number;
  prochainActionRecouvrement?: {
    id: string;
    debiteur: string;
    action: string;
    date: string;
  };
  
  // Litiges
  nbLitigesEnCours: number;
  expositionTotale: number;
  prochainRdvLitige?: {
    id: string;
    adversaire: string;
    type: string;
    date: string;
  };
  
  // Alertes
  alertes: {
    type: 'recouvrement_urgent' | 'echeance_litige' | 'creance_risque' | 'budget_depasse';
    message: string;
    severity: 'critical' | 'warning' | 'info';
    link?: string;
  }[];
}

// ============================================
// GOUVERNANCE & SYSTÈME
// ============================================

// --- Bureau enrichi pour gouvernance ---
export interface BureauGovernance {
  code: string;
  name: string;
  head: string;
  headId: string;
  agents: number;
  charge: number; // % charge de travail
  completion: number; // % tâches complétées
  budget: string;
  budgetUsed: string;
  goulots: string[]; // points de blocage identifiés
  lastModified: string;
  modifiedBy: string;
  raciActivities: string[]; // activités où ce bureau est R ou A
  history: BureauHistoryEntry[];
}

export interface BureauHistoryEntry {
  id: string;
  date: string;
  action: 'responsable_change' | 'budget_adjust' | 'agent_add' | 'agent_remove' | 'config_change';
  description: string;
  author: string;
  previousValue?: string;
  newValue?: string;
}

// --- Organigramme enrichi ---
export interface OrgChange {
  id: string;
  date: string;
  type: 'promotion' | 'mutation' | 'depart' | 'arrivee' | 'restructuration';
  description: string;
  affectedPositions: string[];
  author: string;
  decisionId?: string; // lien vers registre décisions
  hash?: string;
}

// --- Délégation enrichie ---
export interface DelegationEnriched extends Delegation {
  createdBy: string;
  createdAt: string;
  lastUsed?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  suspensionReason?: string;
  history: DelegationHistoryEntry[];
  decisionId: string; // lien vers registre décisions
  hash: string;
}

export interface DelegationHistoryEntry {
  id: string;
  date: string;
  action: 'created' | 'used' | 'extended' | 'suspended' | 'reactivated' | 'expired';
  description: string;
  author: string;
  targetDocument?: string; // BC, Contrat validé avec cette délégation
}

// --- Decision enrichie ---
export interface DecisionEnriched extends Decision {
  category: 'validation' | 'substitution' | 'delegation' | 'arbitrage' | 'sanction' | 'budget' | 'structurel';
  description: string;
  justification: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  linkedDocuments: string[];
  linkedBureaux: string[];
  witnesses?: string[];
  validUntil?: string;
  verificationStatus: 'verified' | 'pending' | 'failed';
  verifiedAt?: string;
  verifiedBy?: string;
}

// --- RACI enrichi ---
export interface RACIEnriched {
  activity: string;
  description: string;
  category: 'validation' | 'execution' | 'controle' | 'support';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  roles: Record<string, 'R' | 'A' | 'C' | 'I' | '-'>;
  lastModified: string;
  modifiedBy: string;
  locked: boolean; // seul DG peut modifier si locked
  linkedProcedure?: string;
  decisionBMO?: string; // Décision BMO associée (optionnel)
}

// --- Audit enrichi ---
export interface AuditItemEnriched extends AuditItem {
  description: string;
  category: 'ohada' | 'interne' | 'securite' | 'tracabilite' | 'rgpd';
  responsible: string;
  findings: AuditFinding[];
  actionPlan: AuditAction[];
  documents: string[];
  linkedDecisions: string[];
}

export interface AuditFinding {
  id: string;
  severity: 'critical' | 'major' | 'minor' | 'observation';
  description: string;
  date: string;
  status: 'open' | 'in_progress' | 'resolved';
  resolvedAt?: string;
}

export interface AuditAction {
  id: string;
  title: string;
  responsible: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
}

// --- Échange inter-bureaux enrichi ---
export interface BureauExchangeEnriched extends BureauExchange {
  attachments: ExchangeAttachment[];
  responses: ExchangeResponse[];
  escalatedAt?: string;
  escalatedBy?: string;
  escalationReason?: string;
  closedAt?: string;
  closedBy?: string;
  closureNote?: string;
  decisionId?: string; // si escalade critique
  hash?: string;
}

export interface ExchangeAttachment {
  id: string;
  name: string;
  type: string;
  date: string;
  uploadedBy: string;
}

export interface ExchangeResponse {
  id: string;
  date: string;
  author: string;
  bureau: string;
  content: string;
  attachments?: string[];
}

// --- Message externe enrichi ---
export interface ExternalMessageEnriched extends ExternalMessage {
  linkedProject?: string;
  linkedLitigation?: string;
  linkedRecovery?: string;
  assignedTo?: string;
  assignedAt?: string;
  respondedAt?: string;
  responseMethod?: 'email' | 'courrier' | 'telephone' | 'meeting';
  responseProof?: string;
  archived: boolean;
  archivedAt?: string;
  attachments: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'courrier' | 'email' | 'facture' | 'contrat' | 'autre';
  date: string;
  url?: string;
}

// --- Arbitrage enrichi ---
export interface ArbitrationEnriched extends Arbitration {
  category: 'budget' | 'delai' | 'qualite' | 'contrat' | 'rh' | 'autre';
  requestedBy: string;
  requestedAt: string;
  parties: string[];
  documents: string[];
  hearingDate?: string;
  decisionId?: string;
  justification?: string;
  appeal?: {
    date: string;
    reason: string;
    status: 'pending' | 'accepted' | 'rejected';
  };
  hash: string;
}

// --- API & Intégrations ---
export type ApiStatus = 'active' | 'degraded' | 'error' | 'maintenance';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface ApiEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: ApiStatus;
  callsToday: number;
  callsMonth: number;
  avgResponseTime: number; // ms
  lastCall?: string;
  errorRate: number; // %
  rateLimit: number;
  rateLimitUsed: number;
}

export interface ApiIntegration {
  id: string;
  name: string;
  provider: string;
  type: 'payment' | 'banking' | 'sms' | 'email' | 'storage' | 'erp' | 'other';
  status: IntegrationStatus;
  lastSync?: string;
  lastError?: string;
  credentials: {
    lastRotation: string;
    expiresAt?: string;
    rotationRequired: boolean;
  };
  webhooks: ApiWebhook[];
  logs: ApiLog[];
}

export interface ApiWebhook {
  id: string;
  event: string;
  url: string;
  status: 'active' | 'disabled' | 'failing';
  lastTriggered?: string;
  failureCount: number;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  error?: string;
  ip?: string;
}

// --- Intelligence Artificielle ---
export type AIModuleStatus = 'active' | 'training' | 'disabled' | 'error';

export interface AIModule {
  id: string;
  name: string;
  type: 'analysis' | 'prediction' | 'anomaly' | 'report' | 'recommendation';
  status: AIModuleStatus;
  description: string;
  lastRun?: string;
  nextScheduled?: string;
  accuracy?: number;
  dataSourcesCount: number;
  version: string;
}

export interface AIAnalysisRequest {
  id: string;
  moduleId: string;
  moduleName: string;
  requestedBy: string;
  requestedAt: string;
  target: 'bloques' | 'retards' | 'paiements' | 'litiges' | 'budget' | 'rh' | 'custom';
  targetDescription: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedAt?: string;
  result?: AIAnalysisResult;
  inputs: string[]; // liste des données utilisées (preuve de calcul)
  hash: string; // hash du résultat pour intégrité
}

export interface AIAnalysisResult {
  summary: string;
  findings: {
    type: 'insight' | 'warning' | 'recommendation' | 'anomaly';
    title: string;
    description: string;
    confidence: number;
    affectedItems?: string[];
  }[];
  metrics?: Record<string, number>;
  visualizations?: {
    type: 'chart' | 'table' | 'graph';
    title: string;
    data: unknown;
  }[];
}

// --- Journal Système ---
export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical' | 'security';
export type LogCategory = 'auth' | 'data' | 'system' | 'api' | 'security' | 'audit' | 'user_action';

export interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  source: string; // module/composant source
  message: string;
  details?: Record<string, unknown>;
  userId?: string;
  userName?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  hash: string; // signature pour immutabilité
  linkedEntity?: {
    type: 'decision' | 'delegation' | 'transaction' | 'document';
    id: string;
  };
}

export interface SystemLogFilter {
  levels?: LogLevel[];
  categories?: LogCategory[];
  startDate?: string;
  endDate?: string;
  userId?: string;
  source?: string;
  search?: string;
}

// ============================================
// COORDINATION STRATÉGIQUE - Résolution collective
// ============================================

// Conférence décisionnelle (pas un simple appel visio)
export interface ConferenceDecisionnelle {
  id: string;
  title: string;
  type: 'crise' | 'arbitrage' | 'revue_projet' | 'comite_direction' | 'resolution_blocage';
  status: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
  priority: 'normale' | 'haute' | 'urgente' | 'critique';
  
  // Lien obligatoire avec contexte opérationnel
  linkedContext: {
    type: 'projet' | 'litige' | 'arbitrage' | 'dossier_bloque' | 'risque_critique' | 'recouvrement';
    id: string;
    label: string;
  };
  
  // Planification
  scheduledAt: string;
  duration: number; // minutes
  location: 'visio' | 'presentiel' | 'hybride';
  visioLink?: string;
  
  // Participants avec rôles
  participants: ConferenceParticipant[];
  moderator: string;
  
  // Ordre du jour auto-généré depuis contexte
  agenda: AgendaItem[];
  agendaGeneratedAt?: string;
  agendaGeneratedFrom?: string;
  
  // Compte-rendu décisionnel
  summary?: ConferenceSummary;
  
  // Enregistrement (optionnel, chiffré)
  recording?: {
    enabled: boolean;
    consentCollected: boolean;
    storageRef?: string;
    duration?: number;
    transcriptAvailable?: boolean;
  };
  
  // Traçabilité
  createdAt: string;
  createdBy: string;
  createdFrom?: string;
  decisionsExtracted: string[];
  hash: string;
}

export interface ConferenceParticipant {
  employeeId: string;
  name: string;
  role: 'decideur' | 'rapporteur' | 'expert' | 'observateur' | 'partie_prenante';
  bureau: string;
  presence: 'confirme' | 'en_attente' | 'decline' | 'absent';
  contributionNotes?: string;
}

export interface AgendaItem {
  order: number;
  title: string;
  duration: number;
  type: 'information' | 'discussion' | 'decision' | 'vote';
  presenter?: string;
  linkedDocuments?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  outcome?: string;
  decisionRequired: boolean;
}

export interface ConferenceSummary {
  generatedAt: string;
  generatedBy: 'ia' | 'manual' | 'ia_validated';
  validatedBy?: string;
  validatedAt?: string;
  keyPoints: string[];
  decisionsProposed: ProposedDecision[];
  actionsAssigned: AssignedAction[];
  nextSteps: string[];
  actualParticipants: string[];
  absentees: string[];
  hash: string;
}

export interface ProposedDecision {
  id: string;
  description: string;
  proposedBy: string;
  status: 'proposed' | 'adopted' | 'rejected' | 'deferred';
  votesFor?: number;
  votesAgainst?: number;
  abstentions?: number;
  linkedDecisionId?: string;
}

export interface AssignedAction {
  id: string;
  description: string;
  assignee: string;
  deadline: string;
  priority: 'basse' | 'normale' | 'haute' | 'urgente';
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
}

// Échange inter-bureaux avec INTENTION (pas un chat)
export interface EchangeStructure {
  id: string;
  type: 'demande_info' | 'alerte_risque' | 'proposition_substitution' | 'demande_validation' | 'signalement_blocage' | 'coordination_urgente';
  status: 'ouvert' | 'en_traitement' | 'escalade' | 'resolu' | 'cloture_sans_suite';
  priority: 'normale' | 'haute' | 'urgente' | 'critique';
  
  from: {
    bureau: string;
    employeeId: string;
    employeeName: string;
  };
  to: {
    bureau: string;
    employeeId?: string;
    employeeName?: string;
  };
  
  subject: string;
  content: string;
  expectedResponse: string;
  
  linkedContext: {
    type: 'projet' | 'dossier' | 'client' | 'litige' | 'paiement' | 'contrat';
    id: string;
    label: string;
  };
  
  createdAt: string;
  deadline: string;
  respondedAt?: string;
  closedAt?: string;
  
  reminderSent: boolean;
  reminderSentAt?: string;
  autoEscalationWarning: boolean;
  escalatedAt?: string;
  escalatedTo?: string;
  
  responses: EchangeStructureResponse[];
  
  resolution?: {
    type: 'repondu' | 'escalade' | 'sans_suite' | 'transfere';
    justification: string;
    closedBy: string;
    closedAt: string;
    decisionId?: string;
  };
  
  hash: string;
}

export interface EchangeStructureResponse {
  id: string;
  responderId: string;
  responderName: string;
  responderBureau: string;
  content: string;
  attachments?: string[];
  timestamp: string;
  isResolutive: boolean;
}

// Arbitrage vivant (cellule de crise immersive)
export interface ArbitrageVivant {
  id: string;
  subject: string;
  type: 'conflit_bureaux' | 'blocage_projet' | 'depassement_budget' | 'litige_client' | 'urgence_rh' | 'risque_strategique';
  status: 'ouvert' | 'en_deliberation' | 'decision_requise' | 'tranche' | 'reporte' | 'annule';
  
  context: {
    linkedEntity: {
      type: 'projet' | 'litige' | 'dossier' | 'client' | 'contrat';
      id: string;
      label: string;
    };
    riskLevel: 'faible' | 'modere' | 'eleve' | 'critique';
    financialExposure?: number;
    reputationalImpact?: 'faible' | 'modere' | 'eleve' | 'critique';
    backgroundSummary: string;
    previousAttempts?: string[];
  };
  
  parties: ArbitrageParty[];
  
  timing: {
    createdAt: string;
    deadline: string;
    daysRemaining: number;
    isOverdue: boolean;
    extensions: Array<{
      requestedAt: string;
      requestedBy: string;
      newDeadline: string;
      justification: string;
      approved: boolean;
    }>;
  };
  
  decisionOptions: DecisionOption[];
  documents: ArbitrageDocument[];
  hearings: ArbitrageHearing[];
  
  decision?: {
    selectedOption: string;
    customDecision?: string;
    decidedBy: string;
    decidedAt: string;
    motif: string;
    consequences: string[];
    implementationSteps: string[];
    followUpDate?: string;
    decisionId: string;
    hash: string;
  };
  
  postponement?: {
    postponedAt: string;
    postponedBy: string;
    justification: string;
    newDeadline: string;
    additionalInfoRequired: string[];
  };
  
  createdBy: string;
  createdFrom?: string;
  hash: string;
}

export interface ArbitrageParty {
  employeeId: string;
  name: string;
  bureau: string;
  role: 'demandeur' | 'defendeur' | 'temoin' | 'expert' | 'decideur' | 'observateur';
  raciRole?: 'R' | 'A' | 'C' | 'I';
  position?: string;
  documentsProvided?: string[];
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  suggestedBy: 'ia' | 'partie' | 'expert' | 'dg';
  pros: string[];
  cons: string[];
  estimatedImpact: {
    financial?: number;
    timeline?: string;
    risk?: 'faible' | 'modere' | 'eleve';
  };
  supportedBy: string[];
}

export interface ArbitrageDocument {
  id: string;
  type: 'contrat' | 'facture' | 'email' | 'rapport' | 'preuve' | 'temoignage' | 'analyse';
  title: string;
  uploadedBy: string;
  uploadedAt: string;
  forParty?: string;
  url: string;
}

export interface ArbitrageHearing {
  id: string;
  scheduledAt: string;
  duration: number;
  type: 'audition' | 'confrontation' | 'deliberation' | 'prononce';
  participants: string[];
  status: 'planifie' | 'termine' | 'annule';
  notes?: string;
  conferenceId?: string;
}
