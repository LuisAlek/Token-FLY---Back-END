import { NotFoundError } from '../../../shared/domain/errors';
import { UseCase } from '../../../shared/application/UseCase';
import type { OptionKey } from '../domain/quiz.entity';
import type { QuizRepository } from '../domain/quiz.repository';
import type { QuizProgressRepository } from '../domain/quizProgress.repository';
import type { QuizPresenter, QuizProgressDto } from './quiz.dto';

export interface SaveQuizProgressInput {
  userId: string;
  quizId: string;
  currentIndex: number;
  answers: { questionId: string; selectedKeys: OptionKey[] }[];
  correctByQuestion: Record<string, OptionKey>;
}

export class SaveQuizProgressUseCase extends UseCase<SaveQuizProgressInput, QuizProgressDto> {
  constructor(
    private readonly quizzes: QuizRepository,
    private readonly progress: QuizProgressRepository,
    private readonly presenter: QuizPresenter,
  ) {
    super();
  }

  async execute(input: SaveQuizProgressInput): Promise<QuizProgressDto> {
    const quiz = await this.quizzes.findPublishedById(input.quizId);
    if (!quiz) {
      throw new NotFoundError('El cuestionario no existe o aun no esta publicado.');
    }

    const questionIds = new Set(quiz.questions.map((question) => question.id));
    const answers = input.answers
      .filter((answer) => questionIds.has(answer.questionId))
      .map((answer) => ({
        questionId: answer.questionId,
        selectedKeys: Array.from(new Set(answer.selectedKeys)),
      }));

    const correctByQuestion = Object.fromEntries(
      Object.entries(input.correctByQuestion).filter(([questionId]) =>
        questionIds.has(questionId),
      ),
    );

    const maxIndex = Math.max(quiz.questionCount - 1, 0);
    const currentIndex = Math.min(Math.max(input.currentIndex, 0), maxIndex);

    const saved = await this.progress.saveDraft(input.userId, input.quizId, {
      currentIndex,
      answers,
      correctByQuestion,
    });

    return this.presenter.toProgress(input.quizId, saved);
  }
}
