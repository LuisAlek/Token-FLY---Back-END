import { ValidationError } from '../../../shared/domain/errors';
import type { QuestionFactory } from '../domain/question.factory';
import type {
  QuizOptionProps,
  QuizStatus,
  QuizWriteInput,
} from '../domain/quiz.entity';

export interface QuestionPayload {
  statement: string;
  incorrectOptions: string[];
  correctOption: string;
  explanation?: string;
}

export interface QuizPayload {
  title: string;
  description: string;
  status: QuizStatus;
  questions: QuestionPayload[];
}

const TITLE_MIN = 2;
const TITLE_MAX = 70;
const DESCRIPTION_MIN = 10;
const DESCRIPTION_MAX = 400;
const QUESTION_MIN = 2;
const QUESTION_MAX = 400;

export class QuizFactory {
  constructor(private readonly questionFactory: QuestionFactory) {}

  createWriteInput(payload: QuizPayload): QuizWriteInput {
    const errors: Record<string, string> = {};
    const title = this.validateText(
      payload.title,
      TITLE_MIN,
      TITLE_MAX,
      'title',
      'El título',
      errors,
    );
    const description = this.validateText(
      payload.description,
      DESCRIPTION_MIN,
      DESCRIPTION_MAX,
      'description',
      'La descripción',
      errors,
    );

    if (payload.questions.length === 0) {
      errors.questions = 'Agrega al menos una pregunta antes de guardar.';
    }

    const questions = payload.questions.map((question, index) => {
      const base = `questions.${index}`;
      const statement = this.validateText(
        question.statement,
        QUESTION_MIN,
        QUESTION_MAX,
        `${base}.statement`,
        'El enunciado',
        errors,
      );

      if (question.incorrectOptions.length !== 3) {
        errors[`${base}.incorrectOptions`] =
          'Debes registrar exactamente 3 opciones incorrectas.';
      }

      const incorrectOptions = question.incorrectOptions.map((option, optionIndex) =>
        this.validateText(
          option,
          QUESTION_MIN,
          QUESTION_MAX,
          `${base}.incorrectOptions.${optionIndex}`,
          `La opción incorrecta ${optionIndex + 1}`,
          errors,
        ),
      );

      const correctOption = this.validateText(
        question.correctOption,
        QUESTION_MIN,
        QUESTION_MAX,
        `${base}.correctOption`,
        'La opción correcta',
        errors,
      );

      const explanation = (question.explanation ?? '').trim();
      if (explanation.length > QUESTION_MAX) {
        errors[`${base}.explanation`] =
          `La explicación no puede superar los ${QUESTION_MAX} caracteres.`;
      }

      const normalizedOptions = [correctOption, ...incorrectOptions].map((option) =>
        option.toLowerCase(),
      );
      if (new Set(normalizedOptions).size !== normalizedOptions.length) {
        errors[`${base}.correctOption`] =
          'Las cuatro opciones de la pregunta deben ser diferentes.';
      }

      return {
        statement,
        options: this.questionFactory.createOptions(correctOption, incorrectOptions),
        explanation,
      };
    });

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors, 'Revisa la información del cuestionario.');
    }

    return {
      title,
      description,
      status: payload.status,
      questions,
    };
  }

  private validateText(
    value: string,
    min: number,
    max: number,
    field: string,
    label: string,
    errors: Record<string, string>,
  ): string {
    const trimmed = value.trim();
    if (trimmed.length < min || trimmed.length > max) {
      errors[field] = `${label} debe tener entre ${min} y ${max} caracteres.`;
    }
    return trimmed;
  }
}
