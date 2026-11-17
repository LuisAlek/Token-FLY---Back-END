import type { PublicUser } from '../domain/user.entity';

export interface AuthResult {
  token: string;
  user: PublicUser;
}
