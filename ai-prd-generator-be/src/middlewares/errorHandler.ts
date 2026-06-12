import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/errors';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isDev = process.env.NODE_ENV === 'development';

  // 1. Log the error details with timestamp
  console.error(`[${new Date().toISOString()}] Error:`, err);

  // 2. Custom AppErrors (Operational)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.statusCode === 422 && 'errors' in err ? { validationErrors: (err as any).errors } : {})
    });
  }

  // 3. Handle Express JSON parser syntax errors
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Format JSON request body tidak valid.' });
  }

  // 4. Prisma database errors
  if (err.code && err.code.startsWith('P')) {
    // P2002: Unique constraint violation
    if (err.code === 'P2002') {
      const target = err.meta?.target || 'field';
      return res.status(400).json({ error: `Nilai untuk ${target} sudah terdaftar.` });
    }
    // P2025: Record to update/delete not found
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Data yang dituju tidak ditemukan di database.' });
    }
  }

  // 5. Default internal server errors
  const message = isDev ? err.message : 'Terjadi kesalahan internal pada server.';
  res.status(500).json({ 
    error: message,
    ...(isDev ? { stack: err.stack } : {})
  });
}
