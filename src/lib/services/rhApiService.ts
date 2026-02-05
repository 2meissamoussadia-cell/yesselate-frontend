/**
 * Service API pour les demandes RH
 * Centralise toutes les requêtes API vers le backend
 */

const API_BASE = '/api/rh';

// Types
export interface ApiResponse<T = any> {
  data?: T;
  success: boolean;
  message?: string;
  error?: string;
  total?: number;
}

// ============================================
// DEMANDES RH
// ============================================

export const demandesAPI = {
  /**
   * Récupérer toutes les demandes avec filtres optionnels
   */
  getAll: async (filters?: {
    status?: string;
    bureau?: string;
    type?: string;
    priority?: string;
    agentId?: string;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await fetch(`${API_BASE}/demandes?${params.toString()}`);
    return response.json();
  },

  /**
   * Récupérer une demande par ID
   */
  getById: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/demandes?id=${id}`);
    return response.json();
  },

  /**
   * Créer une nouvelle demande
   */
  create: async (data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/demandes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  /**
   * Mettre à jour une demande
   */
  update: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/demandes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    return response.json();
  },

  /**
   * Supprimer une demande
   */
  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/demandes?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  /**
   * Valider une demande
   */
  validate: async (id: string, validatorId: string, comments?: string): Promise<ApiResponse> => {
    return demandesAPI.update(id, {
      status: 'validated',
      validatedBy: validatorId,
      validatedAt: new Date().toISOString(),
      comments,
    });
  },

  /**
   * Rejeter une demande
   */
  reject: async (id: string, validatorId: string, reason: string): Promise<ApiResponse> => {
    return demandesAPI.update(id, {
      status: 'rejected',
      rejectedBy: validatorId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason,
    });
  },
};

// ============================================
// WORKFLOWS
// ============================================

export const workflowsAPI = {
  getAll: async (filters?: { active?: boolean }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) {
      params.append('active', filters.active.toString());
    }
    const response = await fetch(`${API_BASE}/workflows?${params.toString()}`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/workflows?id=${id}`);
    return response.json();
  },

  create: async (data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/workflows`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/workflows?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  toggle: async (id: string, active: boolean): Promise<ApiResponse> => {
    return workflowsAPI.update(id, { active });
  },
};

// ============================================
// DÉLÉGATIONS
// ============================================

export const delegationsAPI = {
  getAll: async (filters?: {
    status?: string;
    delegatorId?: string;
    delegateId?: string;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await fetch(`${API_BASE}/delegations?${params.toString()}`);
    return response.json();
  },

  create: async (data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/delegations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/delegations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/delegations?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ============================================
// RAPPELS
// ============================================

export const remindersAPI = {
  getAll: async (filters?: {
    status?: string;
    priority?: string;
    type?: string;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await fetch(`${API_BASE}/reminders?${params.toString()}`);
    return response.json();
  },

  create: async (data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/reminders`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/reminders?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  complete: async (id: string): Promise<ApiResponse> => {
    return remindersAPI.update(id, { status: 'completed' });
  },

  snooze: async (id: string, hours: number): Promise<ApiResponse> => {
    const newDate = new Date();
    newDate.setHours(newDate.getHours() + hours);
    return remindersAPI.update(id, {
      dueDate: newDate.toISOString(),
      status: 'snoozed',
    });
  },
};

// ============================================
// VALIDATION MULTI-NIVEAUX
// ============================================

export const multiLevelAPI = {
  getAll: async (filters?: {
    status?: string;
    demandeId?: string;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await fetch(`${API_BASE}/validations/multi-level?${params.toString()}`);
    return response.json();
  },

  create: async (data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/validations/multi-level`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  validateLevel: async (
    id: string,
    levelId: string,
    action: 'approve' | 'reject',
    validatorId: string,
    comments?: string
  ): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/validations/multi-level`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, levelId, action, validatorId, comments }),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/validations/multi-level?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ============================================
// ANALYSES PRÉDICTIVES
// ============================================

export const predictionsAPI = {
  getAll: async (filters?: {
    type?: string;
    impact?: string;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await fetch(`${API_BASE}/analytics/predictions?${params.toString()}`);
    return response.json();
  },

  create: async (data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/analytics/predictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/analytics/predictions?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ============================================
// STATISTIQUES
// ============================================

export const statsAPI = {
  get: async (filters?: {
    startDate?: string;
    endDate?: string;
    bureau?: string;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await fetch(`${API_BASE}/stats?${params.toString()}`);
    return response.json();
  },

  getTrends: async (period?: { start: string; end: string }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/stats/trends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period }),
    });
    return response.json();
  },
};

// ============================================
// DOCUMENTS
// ============================================

export const documentsAPI = {
  getAll: async (filters?: {
    demandeId?: string;
    type?: string;
    status?: string;
    uploadedById?: string;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await fetch(`${API_BASE}/documents?${params.toString()}`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/documents?id=${id}`);
    return response.json();
  },

  upload: async (data: {
    demandeId: string;
    name: string;
    originalName?: string;
    type?: string;
    mimeType?: string;
    size?: number;
    url?: string;
    uploadedBy: { id: string; name: string };
    metadata?: Record<string, unknown>;
    tags?: string[];
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  validate: async (id: string, validatedBy: { id: string; name: string }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/documents`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'validate', validatedBy }),
    });
    return response.json();
  },

  reject: async (
    id: string,
    validatedBy: { id: string; name: string },
    rejectionReason: string
  ): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/documents`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'reject', validatedBy, rejectionReason }),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/documents?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ============================================
// TEMPLATES DE RÉPONSE
// ============================================

export const templatesAPI = {
  getAll: async (filters?: {
    category?: string;
    type?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await fetch(`${API_BASE}/templates?${params.toString()}`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/templates?id=${id}`);
    return response.json();
  },

  create: async (data: {
    name: string;
    description?: string;
    category: string;
    type?: string;
    subject?: string;
    content: string;
    tags?: string[];
    createdBy?: { id: string; name: string };
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<{
    name: string;
    description: string;
    category: string;
    type: string;
    subject: string;
    content: string;
    tags: string[];
    isActive: boolean;
  }>): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/templates`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    return response.json();
  },

  use: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/templates`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'use' }),
    });
    return response.json();
  },

  render: async (id: string, variables: Record<string, string>): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/templates`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'render', variables }),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/templates?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ============================================
// NOTIFICATIONS
// ============================================

export const notificationsAPI = {
  getAll: async (filters?: {
    recipientId?: string;
    type?: string;
    category?: string;
    isRead?: boolean;
    isArchived?: boolean;
    priority?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await fetch(`${API_BASE}/notifications?${params.toString()}`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/notifications?id=${id}`);
    return response.json();
  },

  create: async (data: {
    title: string;
    message: string;
    type?: string;
    category?: string;
    priority?: string;
    recipient: { id: string; name: string; email?: string };
    sender?: { id: string; name: string };
    relatedEntity?: { type: string; id: string; label: string };
    actions?: Array<{ id: string; label: string; action: string; variant: string }>;
    channels?: string[];
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  markAsRead: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'read' }),
    });
    return response.json();
  },

  markAsUnread: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'unread' }),
    });
    return response.json();
  },

  archive: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'archive' }),
    });
    return response.json();
  },

  markAllAsRead: async (ids: string[]): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action: 'read' }),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/notifications?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  clearArchived: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/notifications?clearArchived=true`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ============================================
// RECHERCHE GLOBALE
// ============================================

export const searchAPI = {
  search: async (query: string, options?: {
    types?: string[];
    filters?: Record<string, string>;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (options?.types) params.append('types', options.types.join(','));
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        params.append(key, value);
      });
    }

    const response = await fetch(`${API_BASE}/search?${params.toString()}`);
    return response.json();
  },

  advancedSearch: async (data: {
    query: string;
    types?: string[];
    filters?: Record<string, string>;
    sort?: 'relevance' | 'date' | 'alphabetical';
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ============================================
// AUDIT TRAIL
// ============================================

export const auditAPI = {
  getLogs: async (filters?: {
    action?: string;
    category?: string;
    actorId?: string;
    targetId?: string;
    targetType?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await fetch(`${API_BASE}/audit?${params.toString()}`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/audit?id=${id}`);
    return response.json();
  },

  log: async (data: {
    action: string;
    category: string;
    actor: { id: string; name: string; role: string; ip?: string };
    target?: { type: string; id: string; label: string };
    details: {
      description: string;
      previousValue?: unknown;
      newValue?: unknown;
      changedFields?: string[];
      reason?: string;
    };
    status?: 'success' | 'failure' | 'partial';
    duration?: number;
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  verifyIntegrity: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/audit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_integrity' }),
    });
    return response.json();
  },

  export: async (options?: {
    format?: 'json' | 'csv';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/audit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'export', ...options }),
    });
    return response.json();
  },
};

// ============================================
// AGENTS
// ============================================

export const agentsAPI = {
  getAll: async (filters?: {
    bureau?: string;
    status?: string;
    search?: string;
    poste?: string;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await fetch(`${API_BASE}/agents?${params.toString()}`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/agents?id=${id}`);
    return response.json();
  },

  create: async (data: {
    name: string;
    email: string;
    bureau: string;
    poste: string;
    phone?: string;
    dateEmbauche?: string;
    soldeConges?: number;
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<{
    name: string;
    email: string;
    bureau: string;
    poste: string;
    phone: string;
    status: string;
    soldeConges: number;
  }>): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/agents`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/agents?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ============================================
// BUDGETS
// ============================================

export const budgetsAPI = {
  getAll: async (filters?: {
    bureau?: string;
    year?: number;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await fetch(`${API_BASE}/budgets?${params.toString()}`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/budgets?id=${id}`);
    return response.json();
  },

  create: async (data: {
    bureau: string;
    year: number;
    total: number;
    categories?: Record<string, number>;
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<{
    total: number;
    categories: Record<string, number>;
  }>): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/budgets`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    return response.json();
  },

  addExpense: async (id: string, expense: {
    amount: number;
    category: string;
    description: string;
    demandeId?: string;
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/budgets`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'add_expense', expense }),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/budgets?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ============================================
// COMMENTAIRES
// ============================================

export const commentsAPI = {
  getByDemande: async (demandeId: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/comments?demandeId=${demandeId}`);
    return response.json();
  },

  create: async (data: {
    demandeId: string;
    content: string;
    author: { id: string; name: string };
    isInternal?: boolean;
    mentions?: string[];
    parentId?: string;
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, content: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/comments`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, content }),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/comments?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  addReaction: async (id: string, emoji: string, userId: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/comments`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'add_reaction', emoji, userId }),
    });
    return response.json();
  },
};

// ============================================
// ABSENCES
// ============================================

export const absencesAPI = {
  getAll: async (filters?: {
    agentId?: string;
    bureau?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await fetch(`${API_BASE}/absences?${params.toString()}`);
    return response.json();
  },

  create: async (data: {
    agentId: string;
    agentName: string;
    type: string;
    dateDebut: string;
    dateFin: string;
    description?: string;
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/absences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<{
    dateDebut: string;
    dateFin: string;
    type: string;
    description: string;
  }>): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/absences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/absences?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ============================================
// ACTIVITÉ
// ============================================

export const activityAPI = {
  getAll: async (filters?: {
    type?: string;
    actorId?: string;
    targetId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await fetch(`${API_BASE}/activity?${params.toString()}`);
    return response.json();
  },

  log: async (data: {
    type: string;
    actor: { id: string; name: string };
    target?: { type: string; id: string; label: string };
    description: string;
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ============================================
// FAVORIS
// ============================================

export const favoritesAPI = {
  getAll: async (filters?: {
    userId?: string;
    entityType?: string;
    isPinned?: boolean;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await fetch(`${API_BASE}/favorites?${params.toString()}`);
    return response.json();
  },

  check: async (userId: string, entityId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE}/favorites?userId=${userId}&entityId=${entityId}`
    );
    return response.json();
  },

  add: async (data: {
    userId: string;
    entityType: string;
    entityId: string;
    entityLabel: string;
    entityMetadata?: Record<string, unknown>;
    notes?: string;
    tags?: string[];
    isPinned?: boolean;
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<{
    notes: string;
    tags: string[];
    isPinned: boolean;
  }>): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/favorites`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    return response.json();
  },

  togglePin: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/favorites`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'toggle_pin' }),
    });
    return response.json();
  },

  reorder: async (positions: Record<string, number>): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/favorites`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'batch', action: 'reorder', positions }),
    });
    return response.json();
  },

  remove: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/favorites?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  removeByEntity: async (userId: string, entityId: string): Promise<ApiResponse> => {
    const response = await fetch(
      `${API_BASE}/favorites?userId=${userId}&entityId=${entityId}`,
      { method: 'DELETE' }
    );
    return response.json();
  },
};

// ============================================
// RAPPORTS
// ============================================

export const reportsAPI = {
  getAll: async (filters?: {
    type?: string;
    category?: string;
    isPublic?: boolean;
    createdById?: string;
    scheduled?: boolean;
  }): Promise<ApiResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const response = await fetch(`${API_BASE}/reports?${params.toString()}`);
    return response.json();
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/reports?id=${id}`);
    return response.json();
  },

  create: async (data: {
    name: string;
    description?: string;
    type?: string;
    category: string;
    format?: string;
    parameters?: Record<string, unknown>;
    schedule?: Record<string, unknown>;
    createdBy?: { id: string; name: string };
    isPublic?: boolean;
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  generate: async (reportId: string, parameters?: Record<string, unknown>): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', reportId, parameters }),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    schedule: Record<string, unknown>;
    isPublic: boolean;
  }>): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/reports`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...data }),
    });
    return response.json();
  },

  toggleSchedule: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/reports`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'toggle_schedule' }),
    });
    return response.json();
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/reports?id=${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// ============================================
// PARAMÈTRES UTILISATEUR (déclaré avant export default)
// ============================================

export const settingsAPI = {
  get: async (userId: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/settings?userId=${userId}`);
    return response.json();
  },

  update: async (userId: string, updates: {
    preferences?: Record<string, unknown>;
    dashboard?: Record<string, unknown>;
    workspace?: Record<string, unknown>;
    notifications?: Record<string, unknown>;
    shortcuts?: Record<string, unknown>;
  }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...updates }),
    });
    return response.json();
  },

  reset: async (userId: string, section?: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, section }),
    });
    return response.json();
  },
};

// Export par défaut de tous les services
export default {
  demandes: demandesAPI,
  workflows: workflowsAPI,
  delegations: delegationsAPI,
  reminders: remindersAPI,
  multiLevel: multiLevelAPI,
  predictions: predictionsAPI,
  stats: statsAPI,
  documents: documentsAPI,
  templates: templatesAPI,
  notifications: notificationsAPI,
  search: searchAPI,
  audit: auditAPI,
  agents: agentsAPI,
  budgets: budgetsAPI,
  comments: commentsAPI,
  absences: absencesAPI,
  activity: activityAPI,
  favorites: favoritesAPI,
  reports: reportsAPI,
  settings: settingsAPI,
};
