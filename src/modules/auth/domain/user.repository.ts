import type { UserRole } from '../../../shared/domain/roles';
import type { User } from './user.entity';

export interface CreateUserInput {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  termsAcceptedAt: Date | null;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}
