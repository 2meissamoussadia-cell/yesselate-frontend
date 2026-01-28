/**
 * Script batch pour générer tous les composants dashboard restants
 * Usage: node scripts/generate-all-dashboard-components.js
 */

const { execSync } = require('child_process');
const path = require('path');

const components = [
  // Performance - Bureaux (12 composants)
  ['PerformanceBureauxAllPage', 'performance::bureaux::all', 'Tous les Bureaux'],
  ['PerformanceBureauxBmoPage', 'performance::bureaux::bmo', 'BMO'],
  ['PerformanceBureauxBfPage', 'performance::bureaux::bf', 'BF'],
  ['PerformanceBureauxBjPage', 'performance::bureaux::bj', 'BJ'],
  ['PerformanceBureauxBctPage', 'performance::bureaux::bct', 'BCT'],
  ['PerformanceBureauxBopPage', 'performance::bureaux::bop', 'BOP'],
  ['PerformanceBureauxBcgPage', 'performance::bureaux::bcg', 'BCG'],
  ['PerformanceBureauxBjaPage', 'performance::bureaux::bja', 'BJA'],
  ['PerformanceBureauxBrcPage', 'performance::bureaux::brc', 'BRC'],
  ['PerformanceBureauxBplPage', 'performance::bureaux::bpl', 'BPL'],
  ['PerformanceBureauxBexPage', 'performance::bureaux::bex', 'BEX'],
  ['PerformanceBureauxComparaisonPage', 'performance::bureaux::comparaison', 'Comparaison Bureaux'],
  
  // Risks - Critical (2 composants)
  ['RisksCriticalRisquesPage', 'risks::critical::risques', 'Risques Critiques'],
  ['RisksCriticalAlertesPage', 'risks::critical::alertes', 'Alertes Critiques'],
  
  // Risks - Warnings (2 composants)
  ['RisksWarningsMoyensPage', 'risks::warnings::moyens', 'Risques Moyens'],
  ['RisksWarningsFaiblesPage', 'risks::warnings::faibles', 'Risques Faibles'],
  
  // Risks - Type (4 composants)
  ['RisksTypePaiementsRetardPage', 'risks::type::paiements-retard', 'Paiements en Retard'],
  ['RisksTypeContratsExpiresPage', 'risks::type::contrats-expires', 'Contrats Expirés'],
  ['RisksTypeBlocagesPage', 'risks::type::blocages', 'Blocages'],
  ['RisksTypeAlertesSystemePage', 'risks::type::alertes-systeme', 'Alertes Système'],
  
  // Risks - Analyse (3 composants)
  ['RisksAnalyseTendancesPage', 'risks::analyse::tendances', 'Tendances des Risques'],
  ['RisksAnalyseCausesRacinesPage', 'risks::analyse::causes-racines', 'Causes Racines'],
  ['RisksAnalysePrevisionsPage', 'risks::analyse::previsions', 'Prévisions des Risques'],
  
  // Risks - Actions Correctives (2 composants)
  ['RisksActionsCorrectivesEnCoursPage', 'risks::actions-correctives::en-cours', 'Actions Correctives En Cours'],
  ['RisksActionsCorrectivesPlanifieesPage', 'risks::actions-correctives::planifiees', 'Actions Correctives Planifiées'],
  
  // Decisions - Pending (3 composants)
  ['DecisionsPendingUrgentesPage', 'decisions::pending::urgentes', 'Décisions Urgentes'],
  ['DecisionsPendingNormalesPage', 'decisions::pending::normales', 'Décisions Normales'],
  ['DecisionsPendingPlanifieesPage', 'decisions::pending::planifiees', 'Décisions Planifiées'],
  
  // Decisions - Executed (3 composants)
  ['DecisionsExecutedRecentesPage', 'decisions::executed::recentes', 'Décisions Récentes'],
  ['DecisionsExecutedAnciennesPage', 'decisions::executed::anciennes', 'Décisions Anciennes'],
  ['DecisionsExecutedParTypePage', 'decisions::executed::par-type', 'Décisions Par Type'],
  
  // Decisions - Timeline (3 composants)
  ['DecisionsTimelineChronologiquePage', 'decisions::timeline::chronologique', 'Timeline Chronologique'],
  ['DecisionsTimelineParTypePage', 'decisions::timeline::par-type', 'Timeline Par Type'],
  ['DecisionsTimelineParAuteurPage', 'decisions::timeline::par-auteur', 'Timeline Par Auteur'],
  
  // Decisions - Audit (3 composants)
  ['DecisionsAuditTracesPage', 'decisions::audit::traces', 'Traces d\'Audit'],
  ['DecisionsAuditRapportsPage', 'decisions::audit::rapports', 'Rapports d\'Audit'],
  ['DecisionsAuditConformitePage', 'decisions::audit::conformite', 'Conformité'],
  
  // Decisions - Modeles (3 composants)
  ['DecisionsModelesSubstitutionPage', 'decisions::modeles::substitution', 'Modèles de Substitution'],
  ['DecisionsModelesDelegationPage', 'decisions::modeles::delegation', 'Modèles de Délégation'],
  ['DecisionsModelesArbitragePage', 'decisions::modeles::arbitrage', 'Modèles d\'Arbitrage'],
  
  // Realtime - Monitoring (3 composants)
  ['RealtimeMonitoringVueGlobalePage', 'realtime::monitoring::vue-globale', 'Vue Globale'],
  ['RealtimeMonitoringMetriquesPage', 'realtime::monitoring::metriques', 'Métriques'],
  ['RealtimeMonitoringPerformancePage', 'realtime::monitoring::performance', 'Performance'],
  
  // Realtime - Alerts (3 composants)
  ['RealtimeAlertsActivesPage', 'realtime::alerts::actives', 'Alertes Actives'],
  ['RealtimeAlertsResoluesPage', 'realtime::alerts::resolues', 'Alertes Résolues'],
  ['RealtimeAlertsHistoriquePage', 'realtime::alerts::historique', 'Historique des Alertes'],
  
  // Realtime - Notifications (3 composants)
  ['RealtimeNotificationsNonLuesPage', 'realtime::notifications::non-lues', 'Notifications Non Lues'],
  ['RealtimeNotificationsToutesPage', 'realtime::notifications::toutes', 'Toutes les Notifications'],
  ['RealtimeNotificationsPreferencesPage', 'realtime::notifications::preferences', 'Préférences Notifications'],
  
  // Realtime - Sync (3 composants)
  ['RealtimeSyncEtatPage', 'realtime::sync::etat', 'État de Synchronisation'],
  ['RealtimeSyncHistoriquePage', 'realtime::sync::historique', 'Historique de Synchronisation'],
  ['RealtimeSyncConfigurationPage', 'realtime::sync::configuration', 'Configuration Synchronisation'],
  
  // Administration - Settings (3 composants)
  ['AdminSettingsDashboardPage', 'administration::settings::dashboard', 'Paramètres Dashboard'],
  ['AdminSettingsKpisPage', 'administration::settings::kpis', 'Paramètres KPIs'],
  ['AdminSettingsNotificationsPage', 'administration::settings::notifications', 'Paramètres Notifications'],
  
  // Administration - Users (2 composants)
  ['AdminUsersListePage', 'administration::users::liste', 'Liste des Utilisateurs'],
  ['AdminUsersPermissionsPage', 'administration::users::permissions', 'Permissions Utilisateurs'],
  
  // Administration - Permissions (2 composants)
  ['AdminPermissionsRolesPage', 'administration::permissions::roles', 'Rôles'],
  ['AdminPermissionsAccesPage', 'administration::permissions::acces', 'Accès'],
  
  // Administration - Logs (2 composants)
  ['AdminLogsActivitePage', 'administration::logs::activite', 'Logs d\'Activité'],
  ['AdminLogsSystemePage', 'administration::logs::systeme', 'Logs Système'],
];

console.log(`🚀 Génération de ${components.length} composants...\n`);

let successCount = 0;
let errorCount = 0;

components.forEach(([componentName, routeKey, title], index) => {
  try {
    console.log(`[${index + 1}/${components.length}] Génération de ${componentName}...`);
    execSync(`node scripts/generate-dashboard-component.js ${componentName} "${routeKey}"`, {
      stdio: 'pipe',
      cwd: path.join(__dirname, '..'),
    });
    successCount++;
  } catch (error) {
    console.error(`❌ Erreur pour ${componentName}:`, error.message);
    errorCount++;
  }
});

console.log(`\n✅ Génération terminée!`);
console.log(`   - Succès: ${successCount}`);
console.log(`   - Erreurs: ${errorCount}`);
console.log(`\n📋 N'oubliez pas d'exécuter: node scripts/add-registry-entries.js`);
