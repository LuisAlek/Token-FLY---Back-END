import type { RequestHandler } from 'express';
import { NotFoundError } from '../../domain/errors';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`La ruta ${req.method} ${req.originalUrl} no existe.`));
};
