import type { PublicUser } from '../../auth/domain/user.entity';
import type { Comment, CommentDto } from '../domain/comment.entity';
import { UserRole } from '../../../shared/domain/roles';

export interface CommentListDto {
  items: CommentDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CommentPresenter {
  toDto(comment: Comment, actor: PublicUser): CommentDto {
    const isOwner = comment.isOwner(actor);
    const canModerate = actor.role === UserRole.Admin;
    return {
      id: comment.id,
      content: comment.content,
      authorName: comment.authorDisplayName(),
      isAnonymous: comment.isAnonymous,
      isOwner,
      canEdit: isOwner || canModerate,
      canDelete: isOwner || canModerate,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
