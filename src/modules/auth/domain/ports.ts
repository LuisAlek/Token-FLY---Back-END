import type { PublicUser } from './user.entity';

export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, passwordHash: string): Promise<boolean>;
}

export interface TokenSubject {
  id: string;
  role: PublicUser['role'];
  username: string;
}

export interface TokenService {
  sign(subject: TokenSubject): string;
  verify(token: string): { sub: string; role: PublicUser['role']; username: string };
}
