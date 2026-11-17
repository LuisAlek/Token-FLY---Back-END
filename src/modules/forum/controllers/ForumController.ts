import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../../shared/domain/errors';
import { asyncHandler } from '../../../shared/infrastructure/http/asyncHandler';
import { parseId, parseWith } from '../../../shared/infrastructure/http/validate';
import type {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  ListCommentsUseCase,
  UpdateCommentUseCase,
} from '../application/manageComments';
import { commentListQuerySchema, commentWriteSchema } from './forum.schemas';

function currentUser(req: Request) {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}

export class ForumController {
  constructor(
    private readonly listComments: ListCommentsUseCase,
    private readonly createComment: CreateCommentUseCase,
    private readonly updateComment: UpdateCommentUseCase,
    private readonly deleteComment: DeleteCommentUseCase,
  ) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const query = parseWith(commentListQuerySchema, req.query);
    const data = await this.listComments.execute({
      page: query.page,
      limit: query.limit,
      actor: currentUser(req),
    });
    res.status(200).json({ data });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const input = parseWith(commentWriteSchema, req.body);
    const data = await this.createComment.execute({
      rawContent: input.content,
      isAnonymous: input.isAnonymous,
      actor: currentUser(req),
    });
    res.status(201).json({ data });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const commentId = parseId(req.params.commentId, 'commentId');
    const input = parseWith(commentWriteSchema, req.body);
    const data = await this.updateComment.execute({
      commentId,
      rawContent: input.content,
      isAnonymous: input.isAnonymous,
      actor: currentUser(req),
    });
    res.status(200).json({ data });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const commentId = parseId(req.params.commentId, 'commentId');
    await this.deleteComment.execute({ commentId, actor: currentUser(req) });
    res.status(200).json({ data: { id: commentId } });
  });
}
