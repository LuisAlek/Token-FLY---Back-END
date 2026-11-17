import { ValidationError } from '../../../shared/domain/errors';
import { ValueObject } from '../../../shared/domain/ValueObject';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 16;

export class Password extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string): Password {
    if (raw.length < PASSWORD_MIN_LENGTH || raw.length > PASSWORD_MAX_LENGTH) {
      throw new ValidationError({
        password: `La contraseña debe tener entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres.`,
      });
    }
    return new Password(raw);
  }
}

export function assertValidPassword(password: string): void {
  Password.create(password);
}
