import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../../shared/domain/errors';
import { asyncHandler } from '../../../shared/infrastructure/http/asyncHandler';
import { parseId, parseWith } from '../../../shared/infrastructure/http/validate';
import type { CheckAnswerUseCase } from '../application/checkAnswer';
import type { GetPublishedQuizUseCase } from '../application/getPublishedQuiz';
import type { GetQuizProgressUseCase } from '../application/getQuizProgress';
import type { ListPublishedQuizzesUseCase } from '../application/listPublishedQuizzes';
import type { SaveQuizProgressUseCase } from '../application/saveQuizProgress';
import type { SubmitQuizUseCase } from '../application/submitQuiz';
import { checkAnswerSchema, saveQuizProgressSchema, submitQuizSchema } from './quiz.schemas';

function currentUser(req: Request) {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}

export class QuizController {
  constructor(
    private readonly listPublishedQuizzes: ListPublishedQuizzesUseCase,
    private readonly getPublishedQuiz: GetPublishedQuizUseCase,
    private readonly checkAnswer: CheckAnswerUseCase,
    private readonly submitQuiz: SubmitQuizUseCase,
    private readonly getQuizProgress: GetQuizProgressUseCase,
    private readonly saveQuizProgress: SaveQuizProgressUseCase,
  ) {}

  list = asyncHandler(async (req: Request, res: Response) => {
    const data = await this.listPublishedQuizzes.execute(currentUser(req).id);
    res.status(200).json({ data });
  });

  detail = asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseId(req.params.quizId, 'quizId');
    const data = await this.getPublishedQuiz.execute(quizId);
    res.status(200).json({ data });
  });

  check = asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseId(req.params.quizId, 'quizId');
    const input = parseWith(checkAnswerSchema, req.body);
    const data = await this.checkAnswer.execute({
      quizId,
      questionId: input.questionId,
      optionKey: input.optionKey,
    });
    res.status(200).json({ data });
  });

  submit = asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseId(req.params.quizId, 'quizId');
    const input = parseWith(submitQuizSchema, req.body);
    const data = await this.submitQuiz.execute({
      userId: currentUser(req).id,
      quizId,
      answers: input.answers,
    });
    res.status(200).json({ data });
  });

  progress = asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseId(req.params.quizId, 'quizId');
    const data = await this.getQuizProgress.execute({
      userId: currentUser(req).id,
      quizId,
    });
    res.status(200).json({ data });
  });

  saveProgress = asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseId(req.params.quizId, 'quizId');
    const input = parseWith(saveQuizProgressSchema, req.body);
    const data = await this.saveQuizProgress.execute({
      userId: currentUser(req).id,
      quizId,
      currentIndex: input.currentIndex,
      answers: input.answers,
      correctByQuestion: input.correctByQuestion,
    });
    res.status(200).json({ data });
  });
}
