import { Request, Response, NextFunction } from 'express';
import { auth } from '../lib/auth';
import { fromNodeHeaders } from 'better-auth/node';
import { UnauthorizedError } from '../errors/errors';

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
    req.user = session.user;
    next();
  } catch (err) {
    next(new UnauthorizedError());
  }
}
