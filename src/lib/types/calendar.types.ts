// ============================================
// Types pour le calendrier
// ============================================

export type CalendarView = 'week' | 'day' | 'month' | 'agenda' | 'gantt';
export type Priority = 'critical' | 'urgent' | 'normal';
export type Severity = 'critical' | 'warning' | 'info' | 'success';
export type Status = 'open' | 'done' | 'snoozed' | 'ack' | 'blocked' | 'in-progress' | 'cancelled';

export type CalendarKind =
  | 'meeting'
  | 'site-visit'
  | 'validation'
  | 'payment'
  | 'contract'
  | 'deadline'
  | 'absence'
  | 'other';

export interface CalendarItem {
  id: string;
  title: string;
  description?: string;
  kind: CalendarKind;
  bureau?: string;
  assignees?: { id: string; name: string }[];
  start: string; // ISO
  end: string; // ISO
  priority: Priority;
  severity: Severity;
  status: Status;
  linkedTo?: { type: string; id: string; label?: string };
  slaDueAt?: string; // ISO
  project?: string;
  originalSource?: 'agenda' | 'payment' | 'contract' | 'blocked' | 'absence';
  notation?: number;
}

export interface SLAStatus {
  itemId: string;
  isOverdue: boolean;
  daysOverdue: number;
  status: 'ok' | 'warning' | 'blocked' | 'needs_substitution';
  recommendation?: string;
}

export interface FocusMode {
  enabled: boolean;
  showOnly: 'critical' | 'my-items' | 'conflicts' | 'overdue-sla' | 'all';
  myUserId?: string;
}

