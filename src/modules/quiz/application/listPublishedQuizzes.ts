import { UseCase } from '../../../shared/application/UseCase';
import type { QuizRepository } from '../domain/quiz.repository';
import type { QuizProgressRepository } from '../domain/quizProgress.repository';
import type { PublicQuizSummaryDto, QuizPresenter } from './quiz.dto';

export class ListPublishedQuizzesUseCase extends UseCase<string, PublicQuizSummaryDto[]> {
  constructor(
    private readonly quizzes: QuizRepository,
    private readonly progress: QuizProgressRepository,
    private readonly presenter: QuizPresenter,
  ) {
    super();
  }

  async execute(userId: string): Promise<PublicQuizSummaryDto[]> {
    const [published, progress] = await Promise.all([
      this.quizzes.listPublished(),
      this.progress.listByUser(userId),
    ]);
    const progressByQuiz = new Map(progress.map((item) => [item.quizId, item]));

    return published.map((quiz) =>
      this.presenter.toPublicSummary(quiz, progressByQuiz.get(quiz.id) ?? null),
    );
  }
}
