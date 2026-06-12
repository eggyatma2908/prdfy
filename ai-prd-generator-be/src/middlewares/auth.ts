import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';
import { UnauthorizedError } from '../errors/errors';
import { prisma } from '../lib/prismaClient';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    if (!session?.user) {
      return next(new UnauthorizedError());
    }

    const rawCreatorEmail = process.env.CREATOR_EMAIL || 'eggyatmariansyah@gmail.com';
    const creatorEmail = rawCreatorEmail.replace(/^['"]|['"]$/g, '').trim();
    if (session.user.email.toLowerCase() === creatorEmail.toLowerCase() && session.user.tier !== 'superadministrator') {
      try {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { tier: 'superadministrator' }
        });
        session.user.tier = 'superadministrator';
      } catch (dbErr) {
        console.error('Failed to auto-upgrade creator to superadministrator in DB:', dbErr);
      }
    }

    req.user = session.user;
    next();
  } catch (err) {
    next(new UnauthorizedError());
  }
}
