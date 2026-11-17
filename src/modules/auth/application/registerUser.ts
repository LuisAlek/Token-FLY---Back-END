import { ConflictError, ValidationError } from '../../../shared/domain/errors';
import { UserRole } from '../../../shared/domain/roles';
import { UseCase } from '../../../shared/application/UseCase';
import { assertValidEmail } from '../domain/email.vo';
import { assertValidPassword } from '../domain/password.vo';
import type { PasswordHasher, TokenService } from '../domain/ports';
import type { UserRepository } from '../domain/user.repository';
import type { AuthResult } from './authResult';

export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export class RegisterUserUseCase extends UseCase<RegisterUserInput, AuthResult> {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {
    super();
  }

  async execute(input: RegisterUserInput): Promise<AuthResult> {
    const username = input.username.trim();
    const email = assertValidEmail(input.email);
    assertValidPassword(input.password);

    const errors: Record<string, string> = {};
    if (!username) {
      errors.username = 'El nombre de usuario es obligatorio.';
    } else if (username.length > 30) {
      errors.username = 'El nombre de usuario no puede superar los 30 caracteres.';
    }
    if (input.password !== input.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    if (!input.termsAccepted) {
      errors.termsAccepted = 'Debes aceptar los términos y condiciones.';
    }
    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError('Ya existe una cuenta registrada con este correo.', {
        email: 'Este correo ya está registrado.',
      });
    }

    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({
      username,
      email,
      passwordHash,
      role: UserRole.User,
      termsAcceptedAt: input.termsAccepted ? new Date() : null,
    });

    const publicUser = user.toPublic();
    return {
      token: this.tokens.sign(publicUser),
      user: publicUser,
    };
  }
}
