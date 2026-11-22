import type {
  OptionKey,
  Question,
  Quiz,
  QuizStatus,
  QuizSummary,
} from '../domain/quiz.entity';
import type { QuizProgress } from '../domain/quizProgress.entity';

export interface QuizProgressSummaryDto {
  completed: boolean;
  inProgress: boolean;
  answeredCount: number;
  scorePercent: number;
  completedAt: Date | null;
}

export interface PublicQuizSummaryDto {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  status: QuizStatus;
  updatedAt: Date;
  progress: QuizProgressSummaryDto;
}

export interface PublicQuizOptionDto {
  key: OptionKey;
  text: string;
}

export interface PublicQuizQuestionDto {
  id: string;
  statement: string;
  options: PublicQuizOptionDto[];
}

export interface PublicQuizDetailDto {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  questions: PublicQuizQuestionDto[];
}

export interface QuizProgressDto {
  quizId: string;
  currentIndex: number;
  answers: { questionId: string; selectedKeys: OptionKey[] }[];
  correctByQuestion: Record<string, OptionKey>;
  completed: boolean;
  inProgress: boolean;
  answeredCount: number;
  scorePercent: number;
  completedAt: Date | null;
  updatedAt: Date | null;
}

export interface AdminQuestionDto {
  id: string;
  statement: string;
  correctOption: string;
  incorrectOptions: string[];
  explanation: string;
}

export interface AdminQuizDetailDto {
  id: string;
  title: string;
  description: string;
  status: QuizStatus;
  questions: AdminQuestionDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class QuizPresenter {
  toPublicSummary(quiz: Quiz, progress: QuizProgress | null = null): PublicQuizSummaryDto {
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz.questionCount,
      status: quiz.status,
      updatedAt: quiz.updatedAt,
      progress: {
        completed: progress?.completed ?? false,
        inProgress: progress?.inProgress ?? false,
        answeredCount: progress?.answeredCount ?? 0,
        scorePercent: progress?.scorePercent ?? 0,
        completedAt: progress?.completedAt ?? null,
      },
    };
  }

  toProgress(quizId: string, progress: QuizProgress | null): QuizProgressDto {
    return {
      quizId,
      currentIndex: progress?.currentIndex ?? 0,
      answers: progress?.answers.map((answer) => ({
        questionId: answer.questionId,
        selectedKeys: [...answer.selectedKeys],
      })) ?? [],
      correctByQuestion: { ...(progress?.correctByQuestion ?? {}) },
      completed: progress?.completed ?? false,
      inProgress: progress?.inProgress ?? false,
      answeredCount: progress?.answeredCount ?? 0,
      scorePercent: progress?.scorePercent ?? 0,
      completedAt: progress?.completedAt ?? null,
      updatedAt: progress?.updatedAt ?? null,
    };
  }

  toPublicDetail(quiz: Quiz): PublicQuizDetailDto {
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz.questionCount,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        statement: question.statement,
        options: question.options.map((option) => ({
          key: option.key,
          text: option.text,
        })),
      })),
    };
  }

  toAdminDetail(quiz: Quiz): AdminQuizDetailDto {
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      status: quiz.status,
      questions: quiz.questions.map((question) => {
        const { correct, incorrect } = this.correctAndIncorrect(question);
        return {
          id: question.id,
          statement: question.statement,
          correctOption: correct.text,
          incorrectOptions: incorrect.map((option) => option.text),
          explanation: question.explanation,
        };
      }),
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    };
  }

  toSummaryList(quizzes: Quiz[]): QuizSummary[] {
    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz.questionCount,
      status: quiz.status,
      updatedAt: quiz.updatedAt,
    }));
  }

  private correctAndIncorrect(question: Question) {
    const correct = question.options.find((option) => option.isCorrect);
    const incorrect = question.options.filter((option) => !option.isCorrect);
    if (!correct || incorrect.length !== 3) {
      throw new Error(`La pregunta ${question.id} tiene una configuración inválida.`);
    }
    return { correct, incorrect };
  }
}
