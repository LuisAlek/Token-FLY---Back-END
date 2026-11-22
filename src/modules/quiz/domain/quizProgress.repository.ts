import type { OptionKey } from './quiz.entity';
import type { QuizProgress } from './quizProgress.entity';

export interface QuizProgressDraft {
  currentIndex: number;
  answers: { questionId: string; selectedKeys: OptionKey[] }[];
  correctByQuestion: Record<string, OptionKey>;
}

export interface QuizProgressRepository {
  findByUserAndQuiz(userId: string, quizId: string): Promise<QuizProgress | null>;
  listByUser(userId: string): Promise<QuizProgress[]>;
  saveDraft(userId: string, quizId: string, draft: QuizProgressDraft): Promise<QuizProgress>;
  markCompleted(userId: string, quizId: string, scorePercent: number): Promise<QuizProgress>;
}
