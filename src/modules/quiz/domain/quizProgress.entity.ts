import type { OptionKey } from './quiz.entity';

export interface QuizProgressAnswerProps {
  questionId: string;
  selectedKeys: OptionKey[];
}

export interface QuizProgressProps {
  quizId: string;
  currentIndex: number;
  answers: QuizProgressAnswerProps[];
  correctByQuestion: Record<string, OptionKey>;
  completed: boolean;
  scorePercent: number;
  completedAt: Date | null;
  updatedAt: Date;
}

export class QuizProgress {
  private constructor(private readonly props: QuizProgressProps) {}

  static create(props: QuizProgressProps): QuizProgress {
    return new QuizProgress(props);
  }

  get quizId(): string {
    return this.props.quizId;
  }

  get currentIndex(): number {
    return this.props.currentIndex;
  }

  get answers(): readonly QuizProgressAnswerProps[] {
    return this.props.answers;
  }

  get correctByQuestion(): Record<string, OptionKey> {
    return this.props.correctByQuestion;
  }

  get completed(): boolean {
    return this.props.completed;
  }

  get scorePercent(): number {
    return this.props.scorePercent;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get answeredCount(): number {
    return this.props.answers.length;
  }

  get inProgress(): boolean {
    return this.props.answers.length > 0 || this.props.currentIndex > 0;
  }
}
