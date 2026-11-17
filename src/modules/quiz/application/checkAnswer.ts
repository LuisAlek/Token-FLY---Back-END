import { BadRequestError, NotFoundError } from '../../../shared/domain/errors';
import { UseCase } from '../../../shared/application/UseCase';
import type { OptionKey } from '../domain/quiz.entity';
import type { QuestionFactory } from '../domain/question.factory';
import type { QuizRepository } from '../domain/quiz.repository';

export interface CheckAnswerInput {
  quizId: string;
  questionId: string;
  optionKey: OptionKey;
}

export interface CheckAnswerResult {
  correct: boolean;
  correctOptionKey?: OptionKey;
  explanation?: string;
}

export class CheckAnswerUseCase extends UseCase<CheckAnswerInput, CheckAnswerResult> {
  constructor(
    private readonly quizzes: QuizRepository,
    private readonly questionFactory: QuestionFactory,
  ) {
    super();
  }

  async execute(input: CheckAnswerInput): Promise<CheckAnswerResult> {
    const quiz = await this.quizzes.findPublishedById(input.quizId);
    if (!quiz) {
      throw new NotFoundError('El cuestionario no existe o aun no esta publicado.');
    }

    const question = quiz.findQuestion(input.questionId);
    if (!question) {
      throw new BadRequestError('La pregunta no pertenece a este cuestionario.');
    }

    const option = question.findOption(input.optionKey);
    if (!option) {
      throw new BadRequestError('La opción seleccionada no existe.');
    }

    if (!option.isCorrect) {
      return { correct: false };
    }

    const correct = question.correctOption();
    return {
      correct: true,
      correctOptionKey: correct.key,
      explanation: this.questionFactory.resolveExplanation(
        question.statement,
        correct,
        question.explanation,
      ),
    };
  }
}
