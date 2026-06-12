import { PRDRepository } from '../repositories/prdRepository';
import { NotFoundError } from '../errors/errors';

export class PRDService {
  private prdRepository: PRDRepository;

  constructor() {
    this.prdRepository = new PRDRepository();
  }

  async getDocuments(userId: string) {
    const docs = await this.prdRepository.findManyByUserId(userId);
    return docs.map((doc) => this.formatPRD(doc));
  }

  async getDocumentDetail(id: string, userId: string) {
    const doc = await this.prdRepository.findByIdAndUserId(id, userId);
    if (!doc) {
      throw new NotFoundError('Dokumen tidak ditemukan atau Anda tidak memiliki akses.');
    }
    return this.formatPRD(doc);
  }

  async createDocument(data: any, userId: string) {
    const doc = await this.prdRepository.create({
      id: data.id,
      title: data.title,
      description: data.description || '',
      version: data.version || 1,
      tags: data.tags ? data.tags.join(',') : '',
      userId,
      sections: data.sections
    });
    return this.formatPRD(doc);
  }

  async updateDocument(id: string, data: any, userId: string) {
    const existingDoc = await this.prdRepository.findByIdAndUserId(id, userId);
    if (!existingDoc) {
      throw new NotFoundError('Dokumen tidak ditemukan atau Anda tidak memiliki akses.');
    }

    if (data.version !== undefined && data.version <= existingDoc.version) {
      await this.prdRepository.deleteVersionsNewerThanOrEqual(id, data.version);
    }

    const updated = await this.prdRepository.update(id, {
      title: data.title !== undefined ? data.title : existingDoc.title,
      description: data.description !== undefined ? data.description : existingDoc.description,
      version: data.version !== undefined ? data.version : existingDoc.version,
      tags: data.tags ? data.tags.join(',') : existingDoc.tags,
      sections: data.sections
    });

    return this.getDocumentDetail(updated.id, userId);
  }

  async deleteDocument(id: string, userId: string) {
    const existingDoc = await this.prdRepository.findByIdAndUserId(id, userId);
    if (!existingDoc) {
      throw new NotFoundError('Dokumen tidak ditemukan atau Anda tidak memiliki akses.');
    }
    await this.prdRepository.delete(id);
    return { success: true, message: 'Dokumen berhasil dihapus.' };
  }

  async getVersions(prdId: string, userId: string) {
    const doc = await this.prdRepository.findByIdAndUserId(prdId, userId);
    if (!doc) {
      throw new NotFoundError('Dokumen tidak ditemukan atau Anda tidak memiliki akses.');
    }

    const versions = await this.prdRepository.findVersionsByPrdId(prdId);
    return versions.map((v) => ({
      id: v.id,
      prd_id: v.prdId,
      version: v.version,
      change_summary: v.changeSummary,
      created_at: v.createdAt.toISOString(),
      sections: JSON.parse(v.sectionsSnapshot)
    }));
  }

  async saveVersion(prdId: string, data: any, userId: string) {
    const doc = await this.prdRepository.findByIdAndUserId(prdId, userId);
    if (!doc) {
      throw new NotFoundError('Dokumen tidak ditemukan atau Anda tidak memiliki akses.');
    }

    const newVer = await this.prdRepository.createVersion({
      prdId,
      version: data.version,
      changeSummary: data.change_summary || '',
      sectionsSnapshot: JSON.stringify(data.sections)
    });

    return {
      id: newVer.id,
      prd_id: newVer.prdId,
      version: newVer.version,
      change_summary: newVer.changeSummary,
      created_at: newVer.createdAt.toISOString(),
      sections: JSON.parse(newVer.sectionsSnapshot)
    };
  }

  private formatPRD(doc: any) {
    const SECTION_ORDER = [
      'overview',
      'requirements_specification',
      'core_features',
      'user_flow',
      'system_architecture',
      'database_schema',
      'tech_stack_recommendation'
    ];

    const sortedSections = [...doc.sections]
      .sort((a, b) => SECTION_ORDER.indexOf(a.sectionId) - SECTION_ORDER.indexOf(b.sectionId))
      .map((s) => ({ id: s.sectionId, title: s.title, content: s.content }));

    return {
      id: doc.id,
      title: doc.title,
      description: doc.description,
      version: doc.version,
      created_at: doc.createdAt.toISOString(),
      updated_at: doc.updatedAt.toISOString(),
      tags: doc.tags ? doc.tags.split(',') : [],
      sections: sortedSections
    };
  }
}
