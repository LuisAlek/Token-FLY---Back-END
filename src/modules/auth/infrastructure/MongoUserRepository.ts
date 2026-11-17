import type { HydratedDocument } from 'mongoose';
import { User, type UserProps } from '../domain/user.entity';
import type { CreateUserInput, UserRepository } from '../domain/user.repository';
import { UserModel, type UserDocument } from './UserModel';

function mapUser(doc: HydratedDocument<UserDocument>): User {
  const props: UserProps = {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    passwordHash: doc.passwordHash,
    role: doc.role,
    termsAcceptedAt: doc.termsAcceptedAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
  return User.create(props);
}

export class MongoUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();
    return doc ? mapUser(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).select('+passwordHash').exec();
    return doc ? mapUser(doc) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const doc = await UserModel.create(input);
    return mapUser(doc);
  }
}
