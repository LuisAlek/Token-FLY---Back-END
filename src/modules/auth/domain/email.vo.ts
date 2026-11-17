import { ValidationError } from '../../../shared/domain/errors';
import { ValueObject } from '../../../shared/domain/ValueObject';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.(co|com)$/i;

export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string): Email {
    const normalized = normalizeEmail(raw);
    if (!EMAIL_REGEX.test(normalized)) {
      throw new ValidationError({
        email: 'Ingresa un correo válido que termine en .co o .com.',
      });
    }
    return new Email(normalized);
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function assertValidEmail(email: string): string {
  return Email.create(email).getValue();
}
