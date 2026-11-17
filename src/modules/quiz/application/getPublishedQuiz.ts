import { NotFoundError } from '../../../shared/domain/errors';
import { UseCase } from '../../../shared/application/UseCase';
import type { QuizRepository } from '../domain/quiz.repository';
import type { PublicQuizDetailDto, QuizPresenter } from './quiz.dto';

export class GetPublishedQuizUseCase extends UseCase<string, PublicQuizDetailDto> {
  constructor(
    private readonly quizzes: QuizRepository,
    private readonly presenter: QuizPresenter,
  ) {
    super();
  }

  async execute(quizId: string): Promise<PublicQuizDetailDto> {
    const quiz = await this.quizzes.findPublishedById(quizId);
    if (!quiz) {
      throw new NotFoundError('El cuestionario no existe o aun no esta publicado.');
    }
    return this.presenter.toPublicDetail(quiz);
  }
}
