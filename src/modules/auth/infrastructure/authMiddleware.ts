import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../../shared/domain/errors';
import { UserRole } from '../../../shared/domain/roles';
import { asyncHandler } from '../../../shared/infrastructure/http/asyncHandler';
import type { TokenService } from '../domain/ports';
import type { UserRepository } from '../domain/user.repository';

export abstract class Guard {
  abstract verify(req: Request): Promise<void> | void;

  handle = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    await this.verify(req);
    next();
  });
}

export class AuthGuard extends Guard {
  constructor(
    private readonly tokens: TokenService,
    private readonly users: UserRepository,
  ) {
    super();
  }

  async verify(req: Request): Promise<void> {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Debes iniciar sesión para continuar.');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedError('Debes iniciar sesión para continuar.');
    }

    const payload = this.tokens.verify(token);
    const user = await this.users.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('La cuenta asociada a esta sesión ya no existe.');
    }

    req.user = user.toPublic();
  }
}

export class RoleGuard extends Guard {
  verify(req: Request): void {
    if (!req.user) {
      throw new UnauthorizedError('Debes iniciar sesión para continuar.');
    }
    if (req.user.role !== UserRole.Admin) {
      throw new ForbiddenError('Esta sección es exclusiva para administradores.');
    }
  }
}
