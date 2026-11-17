import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/infrastructure/http/asyncHandler';
import { parseId, parseWith } from '../../../shared/infrastructure/http/validate';
import type { CheckAnswerUseCase } from '../application/checkAnswer';
import type { GetPublishedQuizUseCase } from '../application/getPublishedQuiz';
import type { ListPublishedQuizzesUseCase } from '../application/listPublishedQuizzes';
import type { SubmitQuizUseCase } from '../application/submitQuiz';
import { checkAnswerSchema, submitQuizSchema } from './quiz.schemas';

export class QuizController {
  constructor(
    private readonly listPublishedQuizzes: ListPublishedQuizzesUseCase,
    private readonly getPublishedQuiz: GetPublishedQuizUseCase,
    private readonly checkAnswer: CheckAnswerUseCase,
    private readonly submitQuiz: SubmitQuizUseCase,
  ) {}

  list = asyncHandler(async (_req: Request, res: Response) => {
    const data = await this.listPublishedQuizzes.execute();
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
    const data = await this.submitQuiz.execute({ quizId, answers: input.answers });
    res.status(200).json({ data });
  });
}
