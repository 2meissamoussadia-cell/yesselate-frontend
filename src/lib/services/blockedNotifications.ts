/**
 * ====================================================================
 * SERVICE: Push Notifications pour Blocked Dossiers
 * ====================================================================
 * 
 * Gestion des notifications navigateur pour les alertes SLA critiques.
 */

import type { SLAAlert, NewBlockingEvent } from './blockedWebSocket';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface NotificationOptions {
  title: string;
  body: string;
  priority: NotificationPriority;
  tag?: string;
  icon?: string;
  badge?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
}

class BlockedNotificationsService {
  private permission: NotificationPermission = 'default';
  private enabled = false;
  private soundEnabled = true;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
      this.loadPreferences();
    }
  }

  /**
   * Demander la permission de notifications
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[Notifications] Not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      this.enabled = true;
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      this.enabled = permission === 'granted';
      
      if (this.enabled) {
        this.savePreferences();
        this.showWelcomeNotification();
      }
      
      return this.enabled;
    } catch (error) {
      console.error('[Notifications] Permission request failed:', error);
      return false;
    }
  }

  /**
   * Envoyer une notification
   */
  async send(options: NotificationOptions): Promise<void> {
    if (!this.enabled || this.permission !== 'granted') {
      console.log('[Notifications] Not enabled or permission denied');
      return;
    }

    try {
      const opts: NotificationOptions & { vibrate?: number[] } = {
        title: options.title,
        body: options.body,
        icon: options.icon || '/icons/alert.png',
        badge: options.badge || '/icons/badge.png',
        tag: options.tag || `blocked-${Date.now()}`,
        requireInteraction: options.requireInteraction ?? (options.priority === 'critical'),
        silent: options.silent ?? false,
        data: options.data,
        vibrate: this.getVibrationPattern(options.priority),
        ...(options.priority && { priority: options.priority as NotificationPriority }),
      };
      const notification = new Notification(options.title, opts);

      // Click handler
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Navigation vers le dossier si data contient dossierId
        if (options.data?.dossierId) {
          window.location.hash = `#dossier-${options.data.dossierId}`;
        }
      };

      // Auto-close pour les notifications non critiques
      if (options.priority !== 'critical' && !options.requireInteraction) {
        setTimeout(() => notification.close(), 8000);
      }

      // Son si activé
      if (this.soundEnabled && !options.silent) {
        this.playSound(options.priority);
      }

    } catch (error) {
      console.error('[Notifications] Failed to send:', error);
    }
  }

  /**
   * Notification pour SLA breach
   */
  async notifySLABreach(alert: SLAAlert): Promise<void> {
    const priority: NotificationPriority = alert.severity === 'critical' ? 'critical' : 'high';
    
    await this.send({
      title: `⚠️ Alerte SLA - ${alert.dossierSubject}`,
      body: `${alert.impact.toUpperCase()} - Retard de ${alert.daysOverdue} jours\nAction requise immédiatement`,
      priority,
      tag: `sla-${alert.dossierId}`,
      requireInteraction: alert.severity === 'critical',
      data: { 
        type: 'sla_breach',
        dossierId: alert.dossierId,
        severity: alert.severity,
      },
    });
  }

  /**
   * Notification pour nouveau blocage
   */
  async notifyNewBlocking(event: NewBlockingEvent): Promise<void> {
    const priority: NotificationPriority = 
      event.dossier.impact === 'critical' ? 'critical' :
      event.dossier.impact === 'high' ? 'high' : 'medium';

    await this.send({
      title: `🚧 Nouveau blocage - ${event.dossier.impact.toUpperCase()}`,
      body: `${event.dossier.subject}\nBureau: ${event.dossier.bureau}\nPar: ${event.createdBy}`,
      priority,
      tag: `new-${event.dossier.id}`,
      requireInteraction: event.dossier.impact === 'critical',
      data: {
        type: 'new_blocking',
        dossierId: event.dossier.id,
      },
    });
  }

  /**
   * Notification pour résolution
   */
  async notifyResolution(dossierId: string, subject: string, method: string): Promise<void> {
    await this.send({
      title: `✅ Blocage résolu`,
      body: `${subject}\nMéthode: ${method}`,
      priority: 'low',
      tag: `resolved-${dossierId}`,
      silent: true,
      data: {
        type: 'resolution',
        dossierId,
      },
    });
  }

  /**
   * Notification pour escalade
   */
  async notifyEscalation(dossierId: string, subject: string, to: string): Promise<void> {
    await this.send({
      title: `📈 Escalade - ${to}`,
      body: `${subject}\nTransmis à ${to}`,
      priority: 'medium',
      tag: `escalate-${dossierId}`,
      data: {
        type: 'escalation',
        dossierId,
      },
    });
  }

  /**
   * Notification de bienvenue
   */
  private showWelcomeNotification(): void {
    this.send({
      title: '🔔 Notifications activées',
      body: 'Vous recevrez des alertes pour les blocages critiques et dépassements SLA',
      priority: 'low',
      silent: true,
    });
  }

  /**
   * Pattern de vibration selon priorité
   */
  private getVibrationPattern(priority: NotificationPriority): number[] {
    switch (priority) {
      case 'critical':
        return [200, 100, 200, 100, 200];
      case 'high':
        return [200, 100, 200];
      case 'medium':
        return [200];
      default:
        return [];
    }
  }

  /**
   * Jouer un son selon priorité
   */
  private playSound(priority: NotificationPriority): void {
    if (!this.soundEnabled) return;

    try {
      const audio = new Audio();
      
      // Différents sons selon la priorité
      switch (priority) {
        case 'critical':
          audio.src = '/sounds/alert-critical.mp3';
          break;
        case 'high':
          audio.src = '/sounds/alert-high.mp3';
          break;
        default:
          audio.src = '/sounds/alert-default.mp3';
      }

      audio.volume = 0.5;
      audio.play().catch(error => {
        console.log('[Notifications] Could not play sound:', error);
      });
    } catch (error) {
      console.error('[Notifications] Sound error:', error);
    }
  }

  /**
   * Préférences
   */
  private loadPreferences(): void {
    if (typeof window === 'undefined') return;

    try {
      const prefs = localStorage.getItem('blocked:notification-prefs');
      if (prefs) {
        const { enabled, soundEnabled } = JSON.parse(prefs);
        this.enabled = enabled && this.permission === 'granted';
        this.soundEnabled = soundEnabled ?? true;
      }
    } catch (error) {
      console.error('[Notifications] Failed to load preferences:', error);
    }
  }

  private savePreferences(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('blocked:notification-prefs', JSON.stringify({
        enabled: this.enabled,
        soundEnabled: this.soundEnabled,
      }));
    } catch (error) {
      console.error('[Notifications] Failed to save preferences:', error);
    }
  }

  /**
   * Getters & Setters
   */
  isEnabled(): boolean {
    return this.enabled && this.permission === 'granted';
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled && this.permission === 'granted';
    this.savePreferences();
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.savePreferences();
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Test notification
   */
  async sendTestNotification(): Promise<void> {
    await this.send({
      title: '🧪 Test de notification',
      body: 'Si vous voyez ceci, les notifications fonctionnent correctement !',
      priority: 'low',
      silent: false,
    });
  }
}

// Export singleton
export const blockedNotifications = new BlockedNotificationsService();

