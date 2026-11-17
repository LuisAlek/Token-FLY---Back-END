import { z } from 'zod';
import { COMMENT_MAX_LENGTH } from '../domain/contentPolicy';

const contentSchema = z
  .string({ error: 'El comentario es obligatorio.' })
  .trim()
  .min(1, 'El comentario no puede estar vacío.')
  .max(
    COMMENT_MAX_LENGTH,
    `El comentario no puede superar los ${COMMENT_MAX_LENGTH} caracteres.`,
  );

export const commentWriteSchema = z.object({
  content: contentSchema,
  isAnonymous: z.boolean().default(false),
});

export const commentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
