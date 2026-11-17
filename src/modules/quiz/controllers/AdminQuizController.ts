import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../../shared/domain/errors';
import { asyncHandler } from '../../../shared/infrastructure/http/asyncHandler';
import { parseId, parseWith } from '../../../shared/infrastructure/http/validate';
import type {
  CreateQuizUseCase,
  DeleteQuizUseCase,
  GetAdminQuizUseCase,
  ListAdminQuizzesUseCase,
  PublishQuizUseCase,
  UpdateQuizUseCase,
} from '../application/manageQuiz';
import { quizWriteSchema } from './quiz.schemas';

function currentUser(req: Request) {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}

export class AdminQuizController {
  constructor(
    private readonly listAdminQuizzes: ListAdminQuizzesUseCase,
    private readonly getAdminQuiz: GetAdminQuizUseCase,
    private readonly createQuiz: CreateQuizUseCase,
    private readonly updateQuiz: UpdateQuizUseCase,
    private readonly deleteQuiz: DeleteQuizUseCase,
    private readonly publishQuiz: PublishQuizUseCase,
  ) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.listAdminQuizzes.execute(currentUser(req));
    res.status(200).json({ data });
  });

  detail = asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseId(req.params.quizId, 'quizId');
    const data = await this.getAdminQuiz.execute({
      quizId,
      actor: currentUser(req),
    });
    res.status(200).json({ data });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const input = parseWith(quizWriteSchema, req.body);
    const data = await this.createQuiz.execute({
      payload: input,
      actor: currentUser(req),
    });
    res.status(201).json({ data });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseId(req.params.quizId, 'quizId');
    const input = parseWith(quizWriteSchema, req.body);
    const data = await this.updateQuiz.execute({
      quizId,
      payload: input,
      actor: currentUser(req),
    });
    res.status(200).json({ data });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseId(req.params.quizId, 'quizId');
    await this.deleteQuiz.execute({ quizId, actor: currentUser(req) });
    res.status(200).json({ data: { id: quizId } });
  });

  publish = asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseId(req.params.quizId, 'quizId');
    const data = await this.publishQuiz.execute({
      quizId,
      actor: currentUser(req),
    });
    res.status(200).json({ data });
  });
}
