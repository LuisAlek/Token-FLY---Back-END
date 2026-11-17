import { NotFoundError } from '../../../shared/domain/errors';
import { UseCase } from '../../../shared/application/UseCase';
import type { QuizRepository } from '../domain/quiz.repository';
import type { QuizEvaluator, QuizSubmissionResult, SubmittedAnswer } from '../domain/quizEvaluator';

export interface SubmitQuizInput {
  quizId: string;
  answers: SubmittedAnswer[];
}

export class SubmitQuizUseCase extends UseCase<SubmitQuizInput, QuizSubmissionResult> {
  constructor(
    private readonly quizzes: QuizRepository,
    private readonly evaluator: QuizEvaluator,
  ) {
    super();
  }

  async execute(input: SubmitQuizInput): Promise<QuizSubmissionResult> {
    const quiz = await this.quizzes.findPublishedById(input.quizId);
    if (!quiz) {
      throw new NotFoundError('El cuestionario no existe o aun no esta publicado.');
    }
    return this.evaluator.evaluate(quiz, input.answers);
  }
}
