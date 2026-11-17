import { NotFoundError } from '../../../shared/domain/errors';
import { UseCase } from '../../../shared/application/UseCase';
import type { PublicUser } from '../../auth/domain/user.entity';
import type { Comment } from '../domain/comment.entity';
import type { CommentRepository } from '../domain/comment.repository';
import type { ContentPolicy } from '../domain/contentPolicy';
import type { CommentListDto, CommentPresenter } from './comment.dto';

export interface ListCommentsInput {
  page: number;
  limit: number;
  actor: PublicUser;
}

export interface CreateCommentInput {
  rawContent: string;
  isAnonymous: boolean;
  actor: PublicUser;
}

export interface UpdateCommentInput {
  commentId: string;
  rawContent: string;
  isAnonymous: boolean;
  actor: PublicUser;
}

export interface DeleteCommentInput {
  commentId: string;
  actor: PublicUser;
}

export abstract class CommentUseCase<TInput, TOutput> extends UseCase<TInput, TOutput> {
  protected constructor(
    protected readonly comments: CommentRepository,
    protected readonly presenter: CommentPresenter,
  ) {
    super();
  }

  protected async requireComment(commentId: string): Promise<Comment> {
    const existing = await this.comments.findById(commentId);
    if (!existing) {
      throw new NotFoundError('El comentario no existe.');
    }
    return existing;
  }
}

export class ListCommentsUseCase extends CommentUseCase<ListCommentsInput, CommentListDto> {
  constructor(comments: CommentRepository, presenter: CommentPresenter) {
    super(comments, presenter);
  }

  async execute(input: ListCommentsInput): Promise<CommentListDto> {
    const result = await this.comments.list(input.page, input.limit);
    return {
      items: result.items.map((comment) => this.presenter.toDto(comment, input.actor)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
    };
  }
}

export class CreateCommentUseCase extends CommentUseCase<
  CreateCommentInput,
  ReturnType<CommentPresenter['toDto']>
> {
  constructor(
    comments: CommentRepository,
    presenter: CommentPresenter,
    private readonly policy: ContentPolicy,
  ) {
    super(comments, presenter);
  }

  async execute(input: CreateCommentInput): Promise<ReturnType<CommentPresenter['toDto']>> {
    const content = this.policy.assert(input.rawContent);
    const comment = await this.comments.create({
      authorId: input.actor.id,
      authorUsername: input.actor.username,
      content,
      isAnonymous: input.isAnonymous,
    });
    return this.presenter.toDto(comment, input.actor);
  }
}

export class UpdateCommentUseCase extends CommentUseCase<
  UpdateCommentInput,
  ReturnType<CommentPresenter['toDto']>
> {
  constructor(
    comments: CommentRepository,
    presenter: CommentPresenter,
    private readonly policy: ContentPolicy,
  ) {
    super(comments, presenter);
  }

  async execute(input: UpdateCommentInput): Promise<ReturnType<CommentPresenter['toDto']>> {
    const existing = await this.requireComment(input.commentId);
    existing.assertCanModify(input.actor);

    const content = this.policy.assert(input.rawContent);
    const updated = await this.comments.update(input.commentId, {
      content,
      isAnonymous: input.isAnonymous,
    });
    if (!updated) {
      throw new NotFoundError('El comentario no existe.');
    }
    return this.presenter.toDto(updated, input.actor);
  }
}

export class DeleteCommentUseCase extends CommentUseCase<DeleteCommentInput, void> {
  constructor(comments: CommentRepository, presenter: CommentPresenter) {
    super(comments, presenter);
  }

  async execute(input: DeleteCommentInput): Promise<void> {
    const existing = await this.requireComment(input.commentId);
    existing.assertCanModify(input.actor);
    await this.comments.remove(input.commentId);
  }
}
