import { UnauthorizedError } from '../../../shared/domain/errors';
import { UseCase } from '../../../shared/application/UseCase';
import { normalizeEmail } from '../domain/email.vo';
import type { PasswordHasher, TokenService } from '../domain/ports';
import type { UserRepository } from '../domain/user.repository';
import type { AuthResult } from './authResult';

export interface LoginUserInput {
  email: string;
  password: string;
}

export class LoginUserUseCase extends UseCase<LoginUserInput, AuthResult> {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {
    super();
  }

  async execute(input: LoginUserInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(normalizeEmail(input.email));
    const invalid = new UnauthorizedError('Correo o contraseña incorrectos.', {
      password: 'Correo o contraseña incorrectos.',
    });

    if (!user) {
      throw invalid;
    }

    const matches = await this.hasher.compare(input.password, user.passwordHash);
    if (!matches) {
      throw invalid;
    }

    const publicUser = user.toPublic();
    return {
      token: this.tokens.sign(publicUser),
      user: publicUser,
    };
  }
}
