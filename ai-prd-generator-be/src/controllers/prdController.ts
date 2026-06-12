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
      const rawCreatorEmail = process.env.CREATOR_EMAIL || 'eggyatmariansyah@gmail.com';
      const creatorEmail = rawCreatorEmail.replace(/^['"]|['"]$/g, '').trim();
      const isSuperAdmin = user?.tier === 'superadministrator' || (user?.email && user.email.toLowerCase() === creatorEmail.toLowerCase());

      if (isSuperAdmin) {
        // No limit!
      } else if (user?.tier === 'premium') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        let countToday = user.premiumCount;
        const lastGen = user.premiumLastGen;

        if (!lastGen || new Date(lastGen).getTime() < startOfToday.getTime()) {
          countToday = 0;
        }

        if (countToday >= 5) {
          throw new ForbiddenError('Batas harian tercapai. Pengguna Premium hanya dapat membuat maksimal 5 PRD per hari.');
        }
      } else {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const gen1 = user?.freeGen1;
        const gen2 = user?.freeGen2;

        const isGen1Active = gen1 && new Date(gen1).getTime() >= thirtyDaysAgo.getTime();
        const isGen2Active = gen2 && new Date(gen2).getTime() >= thirtyDaysAgo.getTime();

        if (isGen1Active && isGen2Active) {
          throw new ForbiddenError('Batas tercapai. Pengguna free tier hanya dapat membuat maksimal 2 PRD per bulan. Silakan upgrade ke Premium!');
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

      const rawCreatorEmail = process.env.CREATOR_EMAIL || 'eggyatmariansyah@gmail.com';
      const creatorEmail = rawCreatorEmail.replace(/^['"]|['"]$/g, '').trim();
      const isSuperAdmin = user.tier === 'superadministrator' || user.email.toLowerCase() === creatorEmail.toLowerCase();

      if (isSuperAdmin) {
        // No limit!
      } else if (user.tier === 'premium') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        let countToday = user.premiumCount;
        const lastGen = user.premiumLastGen;

        if (!lastGen || new Date(lastGen).getTime() < startOfToday.getTime()) {
          countToday = 0;
        }

        if (countToday >= 5) {
          throw new ForbiddenError('Batas harian tercapai. Pengguna Premium hanya dapat membuat maksimal 5 PRD per hari.');
        }
      } else {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const gen1 = user.freeGen1;
        const gen2 = user.freeGen2;

        const isGen1Active = gen1 && new Date(gen1).getTime() >= thirtyDaysAgo.getTime();
        const isGen2Active = gen2 && new Date(gen2).getTime() >= thirtyDaysAgo.getTime();

        if (isGen1Active && isGen2Active) {
          throw new ForbiddenError('Batas tercapai. Pengguna free tier hanya dapat membuat maksimal 2 PRD per bulan. Silakan upgrade ke Premium!');
        }
      }

      if (!apiKey || apiKey.trim().length === 0) {
        throw new BadRequestError('API Server error: GEMINI_API_KEY is not configured on the backend server (.env).');
      }

      this.aiService.generatePRDStream(res, apiKey, model, prompt, title, options, async () => {
        console.log(`Gemini AI generation stream completed for user: ${req.user.id}`);
        try {
          const userObj = await prisma.user.findUnique({ where: { id: req.user.id } });
          if (!userObj) return;

          if (userObj.tier === 'premium') {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            let count = userObj.premiumCount;
            const lastGen = userObj.premiumLastGen;

            if (!lastGen || new Date(lastGen).getTime() < startOfToday.getTime()) {
              count = 0;
            }

            await prisma.user.update({
              where: { id: req.user.id },
              data: {
                premiumCount: count + 1,
                premiumLastGen: new Date(),
              },
            });
          } else if (userObj.tier === 'free') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const gen1 = userObj.freeGen1;
            const gen2 = userObj.freeGen2;

            const isGen1Active = gen1 && new Date(gen1).getTime() >= thirtyDaysAgo.getTime();
            const isGen2Active = gen2 && new Date(gen2).getTime() >= thirtyDaysAgo.getTime();

            if (!isGen2Active) {
              await prisma.user.update({
                where: { id: req.user.id },
                data: { freeGen2: new Date() },
              });
            } else if (!isGen1Active) {
              await prisma.user.update({
                where: { id: req.user.id },
                data: { freeGen1: new Date() },
              });
            } else {
              const date1 = new Date(gen1!);
              const date2 = new Date(gen2!);
              if (date1.getTime() < date2.getTime()) {
                await prisma.user.update({
                  where: { id: req.user.id },
                  data: { freeGen1: new Date() },
                });
              } else {
                await prisma.user.update({
                  where: { id: req.user.id },
                  data: { freeGen2: new Date() },
                });
              }
            }
          }
        } catch (updateErr) {
          console.error('Error updating user generation limits:', updateErr);
        }
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
      if (!user) {
        throw new ForbiddenError('Pengguna tidak ditemukan.');
      }
      const rawCreatorEmail = process.env.CREATOR_EMAIL || 'eggyatmariansyah@gmail.com';
      const creatorEmail = rawCreatorEmail.replace(/^['"]|['"]$/g, '').trim();
      const isSuperAdmin = user.tier === 'superadministrator' || user.email.toLowerCase() === creatorEmail.toLowerCase();

      if (user.tier !== 'premium' && !isSuperAdmin) {
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
