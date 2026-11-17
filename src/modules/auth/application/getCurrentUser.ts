import { UnauthorizedError } from '../../../shared/domain/errors';
import { UseCase } from '../../../shared/application/UseCase';
import type { PublicUser } from '../domain/user.entity';
import type { UserRepository } from '../domain/user.repository';

export class GetCurrentUserUseCase extends UseCase<string, PublicUser> {
  constructor(private readonly users: UserRepository) {
    super();
  }

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedError('La cuenta asociada a esta sesión ya no existe.');
    }
    return user.toPublic();
  }
}
