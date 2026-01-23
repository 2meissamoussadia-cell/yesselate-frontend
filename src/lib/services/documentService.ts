/**
 * Service de Gestion de Documents
 * =================================
 * 
 * Upload, stockage, preview et téléchargement de fichiers
 */

// ============================================
// TYPES
// ============================================

export interface Document {
  id: string;
  nom: string;
  type: string; // MIME type
  taille: number; // bytes
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  module: string;
  entityId: string;
  entityType: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface DocumentFilters {
  module?: string;
  entityId?: string;
  type?: string;
  uploadedBy?: string;
  dateDebut?: string;
  dateFin?: string;
  tags?: string[];
}

// ============================================
// SERVICE
// ============================================

class DocumentService {
  private baseUrl = '/api/documents';

  /**
   * Upload un document
   */
  async uploadDocument(
    file: File,
    metadata: {
      module: string;
      entityId: string;
      entityType: string;
      tags?: string[];
    },
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Document> {
    // Simulation d'upload avec progression
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        await this.delay(100);
        onProgress({
          loaded: (file.size * i) / 100,
          total: file.size,
          percentage: i,
        });
      }
    } else {
      await this.delay(1000);
    }

    // Mock document créé
    const doc: Document = {
      id: `DOC-${Date.now()}`,
      nom: file.name,
      type: file.type,
      taille: file.size,
      url: URL.createObjectURL(file),
      thumbnailUrl: this.isImage(file.type) ? URL.createObjectURL(file) : undefined,
      uploadedBy: 'current-user-id',
      uploadedByName: 'Utilisateur Actuel',
      uploadedAt: new Date().toISOString(),
      module: metadata.module,
      entityId: metadata.entityId,
      entityType: metadata.entityType,
      tags: metadata.tags || [],
    };

    return doc;
  }

  /**
   * Upload multiple documents
   */
  async uploadMultiple(
    files: File[],
    metadata: {
      module: string;
      entityId: string;
      entityType: string;
      tags?: string[];
    },
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<Document[]> {
    const documents: Document[] = [];

    for (let i = 0; i < files.length; i++) {
      const doc = await this.uploadDocument(
        files[i],
        metadata,
        onProgress ? (progress) => onProgress(i, progress) : undefined
      );
      documents.push(doc);
    }

    return documents;
  }

  /**
   * Récupère les documents d'une entité
   */
  async getDocuments(
    module: string,
    entityId: string
  ): Promise<Document[]> {
    await this.delay(400);

    // Mock de documents
    return [
      {
        id: 'DOC-001',
        nom: 'Plan_technique.pdf',
        type: 'application/pdf',
        taille: 2450000,
        url: '/mock/doc1.pdf',
        uploadedBy: 'user-1',
        uploadedByName: 'Ahmed Diallo',
        uploadedAt: '2026-01-08T10:30:00Z',
        module,
        entityId,
        entityType: 'projet',
        tags: ['technique', 'urgent'],
      },
      {
        id: 'DOC-002',
        nom: 'Photo_chantier.jpg',
        type: 'image/jpeg',
        taille: 1850000,
        url: '/mock/photo1.jpg',
        thumbnailUrl: '/mock/photo1_thumb.jpg',
        uploadedBy: 'user-2',
        uploadedByName: 'Fatou Sall',
        uploadedAt: '2026-01-09T14:20:00Z',
        module,
        entityId,
        entityType: 'projet',
        tags: ['photo'],
      },
    ];
  }

  /**
   * Supprime un document (soft delete recommandé)
   */
  async deleteDocument(documentId: string): Promise<void> {
    await this.delay(300);
    // En production: marquer comme supprimé plutôt que vraiment supprimer
  }

  /**
   * Télécharge un document
   */
  async downloadDocument(document: Document): Promise<Blob> {
    await this.delay(500);

    // Mock: retourne un blob vide
    return new Blob(['Mock document content'], { type: document.type });
  }

  /**
   * Génère une URL de preview pour un document
   */
  getPreviewUrl(documentId: string): string {
    return `${this.baseUrl}/${documentId}/preview`;
  }

  /**
   * Vérifie si un type MIME est une image
   */
  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Vérifie si un type MIME est un PDF
   */
  isPDF(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  /**
   * Vérifie si un type MIME est prévisualisable
   */
  isPreviewable(mimeType: string): boolean {
    return this.isImage(mimeType) || this.isPDF(mimeType);
  }

  /**
   * Formate la taille d'un fichier
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Valide un fichier avant upload
   */
  validateFile(
    file: File,
    options?: {
      maxSize?: number; // en bytes
      allowedTypes?: string[];
    }
  ): { valid: boolean; error?: string } {
    // Vérifier la taille
    if (options?.maxSize && file.size > options.maxSize) {
      return {
        valid: false,
        error: `Fichier trop volumineux (max: ${this.formatSize(options.maxSize)})`,
      };
    }

    // Vérifier le type
    if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Type de fichier non autorisé`,
      };
    }

    return { valid: true };
  }

  /**
   * Recherche de documents
   */
  async searchDocuments(filters: DocumentFilters): Promise<Document[]> {
    await this.delay(400);
    // En production: appel API avec filtres
    return [];
  }

  /**
   * Ajoute des tags à un document
   */
  async addTags(documentId: string, tags: string[]): Promise<Document> {
    await this.delay(200);
    // Mock
    return {} as Document;
  }

  /**
   * Retire des tags d'un document
   */
  async removeTags(documentId: string, tags: string[]): Promise<Document> {
    await this.delay(200);
    return {} as Document;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const documentService = new DocumentService();

