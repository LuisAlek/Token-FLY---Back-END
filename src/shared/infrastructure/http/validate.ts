import { z, type ZodTypeAny } from 'zod';
import { BadRequestError, ValidationError, type FieldErrors } from '../../domain/errors';

export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.map(String).join('.') : '_form';
    errors[field] ??= issue.message;
  }

  return errors;
}

export function parseWith<T extends ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(zodFieldErrors(result.error));
  }
  return result.data;
}

export function parseId(value: unknown, field = 'id'): string {
  if (typeof value !== 'string' || !/^[a-f0-9]{24}$/i.test(value)) {
    throw new BadRequestError('El identificador enviado no es válido.', {
      [field]: 'Identificador inválido.',
    });
  }
  return value;
}
