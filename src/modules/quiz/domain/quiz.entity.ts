export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type QuizStatus = 'draft' | 'published';
export const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const satisfies readonly OptionKey[];

export interface QuizOptionProps {
  key: OptionKey;
  text: string;
  isCorrect: boolean;
}

export class QuizOption {
  constructor(private readonly props: QuizOptionProps) {}

  get key(): OptionKey {
    return this.props.key;
  }

  get text(): string {
    return this.props.text;
  }

  get isCorrect(): boolean {
    return this.props.isCorrect;
  }

  toProps(): QuizOptionProps {
    return {
      key: this.props.key,
      text: this.props.text,
      isCorrect: this.props.isCorrect,
    };
  }
}

export interface QuizQuestionProps {
  id: string;
  statement: string;
  options: QuizOptionProps[];
  explanation: string;
}

export class Question {
  private constructor(
    private readonly props: {
      id: string;
      statement: string;
      options: QuizOption[];
      explanation: string;
    },
  ) {}

  static create(props: QuizQuestionProps): Question {
    return new Question({
      id: props.id,
      statement: props.statement,
      options: props.options.map((option) => new QuizOption(option)),
      explanation: props.explanation,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get statement(): string {
    return this.props.statement;
  }

  get options(): readonly QuizOption[] {
    return this.props.options;
  }

  get explanation(): string {
    return this.props.explanation;
  }

  correctOption(): QuizOption {
    const correct = this.props.options.find((option) => option.isCorrect);
    if (!correct) {
      throw new Error(`La pregunta ${this.props.id} no tiene una opción correcta.`);
    }
    return correct;
  }

  findOption(key: OptionKey): QuizOption | undefined {
    return this.props.options.find((option) => option.key === key);
  }
}

export interface QuizProps {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestionProps[];
  status: QuizStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Quiz {
  private constructor(
    private readonly props: {
      id: string;
      title: string;
      description: string;
      questions: Question[];
      status: QuizStatus;
      createdBy: string;
      createdAt: Date;
      updatedAt: Date;
    },
  ) {}

  static create(props: QuizProps): Quiz {
    return new Quiz({
      id: props.id,
      title: props.title,
      description: props.description,
      questions: props.questions.map((question) => Question.create(question)),
      status: props.status,
      createdBy: props.createdBy,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get questions(): readonly Question[] {
    return this.props.questions;
  }

  get status(): QuizStatus {
    return this.props.status;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get questionCount(): number {
    return this.props.questions.length;
  }

  isPublished(): boolean {
    return this.props.status === 'published';
  }

  findQuestion(questionId: string): Question | undefined {
    return this.props.questions.find((question) => question.id === questionId);
  }

  published(): Quiz {
    return new Quiz({ ...this.props, status: 'published' });
  }
}

export interface QuestionDraft {
  statement: string;
  options: QuizOptionProps[];
  explanation: string;
}

export interface QuizWriteInput {
  title: string;
  description: string;
  status: QuizStatus;
  questions: QuestionDraft[];
}

export interface QuizSummary {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  status: QuizStatus;
  updatedAt: Date;
}
