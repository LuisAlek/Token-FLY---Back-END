import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../../config/env';
import { UnauthorizedError } from '../../domain/errors';
import { USER_ROLES, UserRole } from '../../domain/roles';
import type { TokenService, TokenSubject } from '../../../modules/auth/domain/ports';

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
  username: string;
}

export class JwtTokenService implements TokenService {
  sign(subject: TokenSubject): string {
    return jwt.sign(
      { sub: subject.id, role: subject.role, username: subject.username },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] },
    );
  }

  verify(token: string): AuthTokenPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === 'string') {
      throw new UnauthorizedError('El token de acceso no es válido.');
    }

    const { sub, role, username } = decoded as Record<string, unknown>;
    if (
      typeof sub !== 'string' ||
      typeof username !== 'string' ||
      typeof role !== 'string' ||
      !USER_ROLES.includes(role as UserRole)
    ) {
      throw new UnauthorizedError('El token de acceso no es válido.');
    }

    return { sub, role: role as UserRole, username };
  }
}
