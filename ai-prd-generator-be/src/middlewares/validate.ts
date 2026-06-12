import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/errors';

export const validateCreateDocument = (req: Request, res: Response, next: NextFunction) => {
  const { id, title, sections } = req.body;

  if (!id || typeof id !== 'string') {
    return next(new BadRequestError('ID dokumen harus berupa string dan tidak boleh kosong.'));
  }
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return next(new BadRequestError('Judul dokumen harus berupa string dan tidak boleh kosong.'));
  }
  if (!sections || !Array.isArray(sections)) {
    return next(new BadRequestError('Sections harus berupa array yang valid.'));
  }

  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    if (!s.id || typeof s.id !== 'string') {
      return next(new BadRequestError(`Section pada indeks ${i} tidak memiliki ID yang valid.`));
    }
    if (!s.title || typeof s.title !== 'string') {
      return next(new BadRequestError(`Section pada indeks ${i} tidak memiliki Title yang valid.`));
    }
    if (s.content === undefined || typeof s.content !== 'string') {
      return next(new BadRequestError(`Section pada indeks ${i} tidak memiliki Content yang valid.`));
    }
  }

  next();
};

export const validateUpdateDocument = (req: Request, res: Response, next: NextFunction) => {
  const { title, status, sections } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    return next(new BadRequestError('Judul dokumen harus berupa string dan tidak boleh kosong.'));
  }
  if (sections !== undefined) {
    if (!Array.isArray(sections)) {
      return next(new BadRequestError('Sections harus berupa array yang valid.'));
    }
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      if (!s.id || typeof s.id !== 'string') {
        return next(new BadRequestError(`Section pada indeks ${i} tidak memiliki ID yang valid.`));
      }
      if (!s.title || typeof s.title !== 'string') {
        return next(new BadRequestError(`Section pada indeks ${i} tidak memiliki Title yang valid.`));
      }
      if (s.content === undefined || typeof s.content !== 'string') {
        return next(new BadRequestError(`Section pada indeks ${i} tidak memiliki Content yang valid.`));
      }
    }
  }

  next();
};

export const validateGeneratePRD = (req: Request, res: Response, next: NextFunction) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return next(new BadRequestError('Prompt ide fitur harus berupa string dan tidak boleh kosong.'));
  }

  next();
};

export const validateChat = (req: Request, res: Response, next: NextFunction) => {
  const { message, currentPRD } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return next(new BadRequestError('Pesan chat revisi harus berupa string dan tidak boleh kosong.'));
  }
  if (!currentPRD || typeof currentPRD !== 'object') {
    return next(new BadRequestError('Data PRD aktif saat ini harus dilampirkan sebagai objek.'));
  }
  if (!currentPRD.title || !currentPRD.sections || !Array.isArray(currentPRD.sections)) {
    return next(new BadRequestError('Objek data PRD aktif harus memiliki title dan list sections yang valid.'));
  }

  next();
};
