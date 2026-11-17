import { UserRole } from '../../../shared/domain/roles';

export interface UserProps {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  termsAcceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get termsAcceptedAt(): Date | null {
    return this.props.termsAcceptedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isAdmin(): boolean {
    return this.props.role === UserRole.Admin;
  }

  toPublic(): PublicUser {
    return {
      id: this.props.id,
      username: this.props.username,
      email: this.props.email,
      role: this.props.role,
      createdAt: this.props.createdAt,
    };
  }
}
