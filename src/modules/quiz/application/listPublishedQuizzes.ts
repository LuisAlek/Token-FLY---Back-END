import { UseCase } from '../../../shared/application/UseCase';
import type { QuizRepository } from '../domain/quiz.repository';
import type { PublicQuizSummaryDto, QuizPresenter } from './quiz.dto';

export class ListPublishedQuizzesUseCase extends UseCase<void, PublicQuizSummaryDto[]> {
  constructor(
    private readonly quizzes: QuizRepository,
    private readonly presenter: QuizPresenter,
  ) {
    super();
  }

  async execute(): Promise<PublicQuizSummaryDto[]> {
    const published = await this.quizzes.listPublished();
    return published.map((quiz) => this.presenter.toPublicSummary(quiz));
  }
}
