import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { PRDService } from '../services/prdService';
import { AIService } from '../services/aiService';
import { BadRequestError, ForbiddenError } from '../errors/errors';
import { prisma } from '../lib/prismaClient';

export class PRDController {
  private prdService: PRDService;
  private aiService: AIService;

  constructor() {
    this.prdService = new PRDService();
    this.aiService = new AIService();
  }

  getDocuments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const documents = await this.prdService.getDocuments(req.user.id);
      res.json(documents);
    } catch (err) {
      next(err);
    }
  };

  getDocumentDetail = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const document = await this.prdService.getDocumentDetail(id, req.user.id);
      res.json(document);
    } catch (err) {
      next(err);
    }
  };

  createDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (user?.tier === 'superadministrator') {
        // No limit!
      } else if (user?.tier === 'premium') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const countToday = await prisma.pRDDocument.count({
          where: {
            userId: req.user.id,
            createdAt: {
              gte: startOfToday,
            },
          },
        });
        if (countToday >= 5) {
          throw new ForbiddenError('Batas harian tercapai. Pengguna Premium hanya dapat membuat maksimal 5 PRD per hari.');
        }
      } else {
        const countTotal = await prisma.pRDDocument.count({ where: { userId: req.user.id } });
        if (countTotal >= 1) {
          throw new ForbiddenError('Batas tercapai. Pengguna free tier hanya dapat membuat 1 PRD. Silakan upgrade ke Premium!');
        }
      }
      const doc = await this.prdService.createDocument(req.body, req.user.id);
      res.json(doc);
    } catch (err) {
      next(err);
    }
  };

  updateDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const doc = await this.prdService.updateDocument(id, req.body, req.user.id);
      res.json(doc);
    } catch (err) {
      next(err);
    }
  };

  deleteDocument = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.prdService.deleteDocument(id, req.user.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getVersions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const versions = await this.prdService.getVersions(id, req.user.id);
      res.json(versions);
    } catch (err) {
      next(err);
    }
  };

  saveVersion = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const version = await this.prdService.saveVersion(id, req.body, req.user.id);
      res.json(version);
    } catch (err) {
      next(err);
    }
  };

  generatePRD = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { prompt, title, options } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user) {
        throw new ForbiddenError('Pengguna tidak ditemukan.');
      }

      if (user.tier === 'superadministrator') {
        // No limit!
      } else if (user.tier === 'premium') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const countToday = await prisma.pRDDocument.count({
          where: {
            userId: req.user.id,
            createdAt: {
              gte: startOfToday,
            },
          },
        });
        if (countToday >= 5) {
          throw new ForbiddenError('Batas harian tercapai. Pengguna Premium hanya dapat membuat maksimal 5 PRD per hari.');
        }
      } else {
        const countTotal = await prisma.pRDDocument.count({ where: { userId: req.user.id } });
        if (countTotal >= 1) {
          throw new ForbiddenError('Batas tercapai. Pengguna free tier hanya dapat membuat 1 PRD. Silakan upgrade ke Premium!');
        }
      }

      if (!apiKey || apiKey.trim().length === 0) {
        throw new BadRequestError('API Server error: GEMINI_API_KEY is not configured on the backend server (.env).');
      }

      this.aiService.generatePRDStream(res, apiKey, model, prompt, title, options, () => {
        console.log(`Gemini AI generation stream completed for user: ${req.user.id}`);
      });
    } catch (err) {
      next(err);
    }
  };

  chatRevision = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { message, currentPRD } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (!user || (user.tier !== 'premium' && user.tier !== 'superadministrator')) {
        throw new ForbiddenError('Asisten AI hanya tersedia untuk pengguna Premium/Superadministrator. Silakan upgrade!');
      }

      if (!apiKey || apiKey.trim().length === 0) {
        throw new BadRequestError('API Server error: GEMINI_API_KEY is not configured on the backend server (.env).');
      }

      const reply = await this.aiService.getChatRevision(apiKey, model, message, currentPRD);
      res.json(reply);
    } catch (err) {
      next(err);
    }
  };
}
