/**
 * ====================================================================
 * SERVICES: Employees & Documents API
 * Services complets pour employés et documents
 * ====================================================================
 */

import type {
  Employee,
  SubstituteCriteria,
  SubstituteCandidate,
  AvailabilityStatus,
  WorkloadData,
  Document,
} from '@/lib/types/substitution.types';
import { logger } from '@/lib/utils/logger';
import { formatFileSize as formatFileSizeUtil } from '@/lib/data/timeline-documents-mock-data';

// ================================
// EMPLOYEES API SERVICE
// ================================

class EmployeesApiService {
  private baseUrl = '/api/bmo/employees';

  // ================================
  // Search & Retrieval
  // ================================

  async searchEmployees(query: string): Promise<Employee[]> {
    await this.delay(200);
    const { searchEmployeesByName } = await import('@/lib/data/employees-mock-data');
    return searchEmployeesByName(query);
  }

  async getById(id: string): Promise<Employee> {
    await this.delay(150);
    const { mockEmployees } = await import('@/lib/data/employees-mock-data');
    const employee = mockEmployees.find(e => e.id === id);
    if (!employee) throw new Error(`Employee ${id} not found`);
    return employee;
  }

  async getByBureau(bureau: string): Promise<Employee[]> {
    await this.delay(200);
    const { mockEmployees } = await import('@/lib/data/employees-mock-data');
    return mockEmployees.filter(e => e.bureau === bureau);
  }

  async getAll(): Promise<Employee[]> {
    await this.delay(250);
    const { mockEmployees } = await import('@/lib/data/employees-mock-data');
    return mockEmployees;
  }

  // ================================
  // Availability & Workload
  // ================================

  async getAvailability(employeeId: string, date?: Date): Promise<AvailabilityStatus> {
    await this.delay(150);
    const employee = await this.getById(employeeId);
    
    if (employee.disponibilite === 'absent') {
      return {
        available: false,
        reason: 'En absence',
        until: date ? new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000) : undefined,
      };
    }

    if (employee.chargeActuelle > 90) {
      return {
        available: false,
        reason: 'Charge de travail trop élevée',
      };
    }

    return {
      available: true,
    };
  }

  async getWorkload(employeeId: string): Promise<WorkloadData> {
    await this.delay(200);
    const employee = await this.getById(employeeId);
    
    // Simulate workload calculation
    const substitutions = Math.floor(employee.chargeActuelle / 20);
    const projects = Math.floor(employee.chargeActuelle / 30);
    const delegations = Math.floor(employee.chargeActuelle / 40);

    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (employee.chargeActuelle > 70) trend = 'increasing';
    if (employee.chargeActuelle < 30) trend = 'decreasing';

    return {
      current: employee.chargeActuelle,
      substitutions,
      projects,
      delegations,
      capacity: 100 - employee.chargeActuelle,
      trend,
    };
  }

  // ================================
  // Substitute Finding
  // ================================

  async findSubstitutes(criteria: SubstituteCriteria): Promise<SubstituteCandidate[]> {
    await this.delay(300);
    const { mockEmployees } = await import('@/lib/data/employees-mock-data');
    
    let candidates = mockEmployees.filter(e => {
      if (criteria.excludeIds?.includes(e.id)) return false;
      if (criteria.bureau && e.bureau !== criteria.bureau) return false;
      if (criteria.maxWorkload && e.chargeActuelle > criteria.maxWorkload) return false;
      if (e.disponibilite !== 'available') return false;
      return true;
    });

    // Calculate scores
    const scoredCandidates: SubstituteCandidate[] = candidates.map(employee => {
      let score = employee.score; // Base score
      
      // Competences match
      let competencesMatch = 0;
      if (criteria.requiredCompetences) {
        const matchCount = criteria.requiredCompetences.filter(rc =>
          employee.competences.some(ec => ec.toLowerCase().includes(rc.toLowerCase()))
        ).length;
        competencesMatch = (matchCount / criteria.requiredCompetences.length) * 100;
        score = score * 0.6 + competencesMatch * 0.4; // Weighted score
      }

      // Workload factor (lower is better)
      const workloadFactor = (100 - employee.chargeActuelle) / 100;
      score = score * workloadFactor;

      return {
        employee,
        score: Math.round(score),
        reason: this.getSubstituteReason(employee, criteria),
        availability: true,
        workload: employee.chargeActuelle,
        competencesMatch: Math.round(competencesMatch),
        previousSubstitutions: Math.floor(Math.random() * 10), // Mock
      };
    });

    // Sort by score descending
    return scoredCandidates.sort((a, b) => b.score - a.score);
  }

  async getSubstituteScore(employeeId: string, substitutionId: string): Promise<number> {
    await this.delay(150);
    const employee = await this.getById(employeeId);
    
    // Simple scoring algorithm
    let score = employee.score;
    
    // Availability bonus
    if (employee.disponibilite === 'available') score += 10;
    
    // Workload penalty
    if (employee.chargeActuelle > 70) score -= 20;
    if (employee.chargeActuelle > 85) score -= 30;
    
    return Math.max(0, Math.min(100, score));
  }

  // ================================
  // Helpers
  // ================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getSubstituteReason(employee: Employee, criteria: SubstituteCriteria): string {
    const reasons: string[] = [];
    
    if (employee.chargeActuelle < 50) {
      reasons.push('Charge faible');
    }
    if (employee.score >= 90) {
      reasons.push('Excellent score');
    }
    if (criteria.requiredCompetences) {
      const matches = criteria.requiredCompetences.filter(rc =>
        employee.competences.some(ec => ec.toLowerCase().includes(rc.toLowerCase()))
      );
      if (matches.length > 0) {
        reasons.push(`${matches.length} compétence(s) requise(s)`);
      }
    }
    
    return reasons.join(', ') || 'Disponible';
  }
}

// ================================
// DOCUMENTS API SERVICE
// ================================

class DocumentsApiService {
  private baseUrl = '/api/bmo/documents';

  // ================================
  // Upload & Download
  // ================================

  async upload(file: File, metadata: { entityType: string; entityId: string; uploadedBy: string }): Promise<Document> {
    await this.delay(1000); // Simulate upload time
    
    const doc: Document = {
      id: `DOC-${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: `/documents/${file.name}`,
      entityType: metadata.entityType as any,
      entityId: metadata.entityId,
      uploadedBy: metadata.uploadedBy,
      uploadedAt: new Date(),
      metadata: {},
    };

    logger.debug('Document uploaded', { component: 'employees-documents-api', docId: doc.id });
    return doc;
  }

  async uploadMultiple(files: File[], metadata: { entityType: string; entityId: string; uploadedBy: string }): Promise<Document[]> {
    await this.delay(1500);
    
    const docs = files.map(file => ({
      id: `DOC-${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: `/documents/${file.name}`,
      entityType: metadata.entityType as any,
      entityId: metadata.entityId,
      uploadedBy: metadata.uploadedBy,
      uploadedAt: new Date(),
      metadata: {},
    }));

    logger.debug('Multiple documents uploaded', { component: 'employees-documents-api', count: docs.length });
    return docs;
  }

  async download(documentId: string): Promise<Blob> {
    await this.delay(500);
    // Mock blob
    const blob = new Blob(['Mock document content'], { type: 'application/pdf' });
    logger.debug('Document downloaded', { component: 'employees-documents-api', documentId });
    return blob;
  }

  async getPreviewUrl(documentId: string): Promise<string> {
    await this.delay(200);
    return `/documents/preview/${documentId}`;
  }

  // ================================
  // Management
  // ================================

  async delete(documentId: string): Promise<void> {
    await this.delay(300);
    logger.debug('Document deleted', { component: 'employees-documents-api', documentId });
  }

  async getByEntity(entityType: string, entityId: string): Promise<Document[]> {
    await this.delay(250);
    const { getDocumentsByEntity } = await import('@/lib/data/timeline-documents-mock-data');
    return getDocumentsByEntity(entityType, entityId);
  }

  async updateMetadata(documentId: string, metadata: Partial<any>): Promise<Document> {
    await this.delay(300);
    const { mockDocuments } = await import('@/lib/data/timeline-documents-mock-data');
    const doc = mockDocuments.find(d => d.id === documentId);
    
    if (!doc) throw new Error(`Document ${documentId} not found`);

    const updated: Document = {
      ...doc,
      metadata: {
        ...doc.metadata,
        ...metadata,
      },
    };

    logger.debug('Document metadata updated', { component: 'employees-documents-api', documentId: updated.id });
    return updated;
  }

  // ================================
  // Helpers
  // ================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  formatFileSize(bytes: number): string {
    return formatFileSizeUtil(bytes);
  }

  getFileIcon(type: string): string {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('image')) return '🖼️';
    if (type.includes('acad')) return '📐';
    return '📎';
  }
}

// ================================
// EXPORTS
// ================================

export const employeesApiService = new EmployeesApiService();
export const documentsApiService = new DocumentsApiService();

export type { EmployeesApiService, DocumentsApiService };

