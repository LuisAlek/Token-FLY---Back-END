import { ForbiddenError } from '../../../shared/domain/errors';
import { UserRole } from '../../../shared/domain/roles';
import type { PublicUser } from '../../auth/domain/user.entity';

export interface CommentProps {
  id: string;
  authorId: string;
  authorUsername: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentDto {
  id: string;
  content: string;
  authorName: string;
  isAnonymous: boolean;
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment {
  private constructor(private readonly props: CommentProps) {}

  static create(props: CommentProps): Comment {
    return new Comment(props);
  }

  get id(): string {
    return this.props.id;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get authorUsername(): string {
    return this.props.authorUsername;
  }

  get content(): string {
    return this.props.content;
  }

  get isAnonymous(): boolean {
    return this.props.isAnonymous;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isOwner(actor: PublicUser): boolean {
    return this.props.authorId === actor.id;
  }

  authorDisplayName(): string {
    return this.props.isAnonymous ? 'Anónimo' : this.props.authorUsername;
  }

  assertCanModify(actor: PublicUser): void {
    if (actor.role !== UserRole.Admin && !this.isOwner(actor)) {
      throw new ForbiddenError('Solo puedes editar o eliminar tus propios comentarios.');
    }
  }
}
