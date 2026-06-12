import { prisma } from '../lib/prismaClient';

export class PRDRepository {
  async findManyByUserId(userId: string) {
    return prisma.pRDDocument.findMany({
      where: { userId },
      include: { sections: true }
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return prisma.pRDDocument.findFirst({
      where: { id, userId },
      include: { sections: true }
    });
  }

  async create(data: {
    id: string;
    title: string;
    description: string;
    version: number;
    tags: string;
    userId: string;
    sections: Array<{ id: string; title: string; content: string }>;
  }) {
    return prisma.pRDDocument.create({
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        version: data.version,
        tags: data.tags,
        userId: data.userId,
        sections: {
          create: data.sections.map((s) => ({
            sectionId: s.id,
            title: s.title,
            content: s.content
          }))
        }
      },
      include: { sections: true }
    });
  }

  async update(
    id: string,
    data: {
      title: string;
      description: string;
      version: number;
      tags: string;
      sections: Array<{ id: string; title: string; content: string }>;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Update metadata
      const doc = await tx.pRDDocument.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          version: data.version,
          tags: data.tags,
          updatedAt: new Date()
        }
      });

      // 2. Clear old sections
      await tx.pRDSection.deleteMany({
        where: { prdId: id }
      });

      // 3. Create new sections
      if (data.sections && data.sections.length > 0) {
        await tx.pRDSection.createMany({
          data: data.sections.map((s) => ({
            prdId: id,
            sectionId: s.id,
            title: s.title,
            content: s.content
          }))
        });
      }

      return doc;
    });
  }

  async delete(id: string) {
    return prisma.pRDDocument.delete({
      where: { id }
    });
  }

  async findVersionsByPrdId(prdId: string) {
    return prisma.pRDVersion.findMany({
      where: { prdId },
      orderBy: { version: 'desc' }
    });
  }

  async createVersion(data: {
    prdId: string;
    version: number;
    changeSummary: string;
    sectionsSnapshot: string;
  }) {
    return prisma.pRDVersion.create({
      data: {
        prdId: data.prdId,
        version: data.version,
        changeSummary: data.changeSummary,
        sectionsSnapshot: data.sectionsSnapshot
      }
    });
  }

  async deleteVersionsNewerThanOrEqual(prdId: string, version: number) {
    return prisma.pRDVersion.deleteMany({
      where: {
        prdId,
        version: {
          gte: version
        }
      }
    });
  }
}
