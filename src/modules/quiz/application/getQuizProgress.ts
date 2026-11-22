import { NotFoundError } from '../../../shared/domain/errors';
import { UseCase } from '../../../shared/application/UseCase';
import type { QuizRepository } from '../domain/quiz.repository';
import type { QuizProgressRepository } from '../domain/quizProgress.repository';
import type { QuizPresenter, QuizProgressDto } from './quiz.dto';

export interface GetQuizProgressInput {
  userId: string;
  quizId: string;
}

export class GetQuizProgressUseCase extends UseCase<GetQuizProgressInput, QuizProgressDto> {
  constructor(
    private readonly quizzes: QuizRepository,
    private readonly progress: QuizProgressRepository,
    private readonly presenter: QuizPresenter,
  ) {
    super();
  }

  async execute(input: GetQuizProgressInput): Promise<QuizProgressDto> {
    const quiz = await this.quizzes.findPublishedById(input.quizId);
    if (!quiz) {
      throw new NotFoundError('El cuestionario no existe o aun no esta publicado.');
    }

    const progress = await this.progress.findByUserAndQuiz(input.userId, input.quizId);
    return this.presenter.toProgress(input.quizId, progress);
  }
}
