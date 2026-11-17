import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../../domain/errors';
import { env } from '../../../config/env';

interface MongoServerError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      errors: error.errors,
    });
    return;
  }

  if (error instanceof TokenExpiredError || error instanceof JsonWebTokenError) {
    res.status(401).json({
      message: 'Tu sesión expiró o el token no es válido. Inicia sesión nuevamente.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string> = {};
    for (const [field, detail] of Object.entries(error.errors)) {
      errors[field] = detail.message;
    }
    res.status(422).json({
      message: 'Los datos no cumplen las reglas de negocio.',
      code: 'VALIDATION_ERROR',
      errors,
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      message: 'El identificador enviado no es válido.',
      code: 'BAD_REQUEST',
    });
    return;
  }

  const mongoError = error as MongoServerError;
  if (mongoError?.code === 11000) {
    const duplicated = Object.keys(mongoError.keyValue ?? {})[0] ?? 'campo';
    res.status(409).json({
      message: 'Ya existe un registro con esos datos.',
      code: 'CONFLICT',
      errors: { [duplicated]: 'Este valor ya está registrado.' },
    });
    return;
  }

  if (
    error instanceof SyntaxError &&
    'status' in error &&
    (error as { status?: number }).status === 400
  ) {
    res.status(400).json({
      message: 'El cuerpo de la solicitud no contiene un JSON válido.',
      code: 'BAD_REQUEST',
    });
    return;
  }

  if (env.NODE_ENV !== 'test') {
    console.error('[TokenFLY] Error no controlado:', error);
  }

  res.status(500).json({
    message: 'Ocurrió un error inesperado. Intenta nuevamente.',
    code: 'INTERNAL_ERROR',
  });
};
