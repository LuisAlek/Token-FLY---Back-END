import type { PublicUser } from '../../modules/auth/domain/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}

export {};
