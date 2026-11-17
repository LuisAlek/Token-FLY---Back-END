import { BadRequestError } from '../../../shared/domain/errors';
import type { OptionKey, Quiz } from './quiz.entity';
import type { QuestionFactory } from './question.factory';

export interface SubmittedAnswer {
  questionId: string;
  selectedKeys: OptionKey[];
}

export interface CorrectionOption {
  key: OptionKey;
  text: string;
  isCorrect: boolean;
}

export interface QuestionCorrection {
  questionId: string;
  statement: string;
  correctOption: { key: OptionKey; text: string };
  selectedOptions: CorrectionOption[];
  explanation: string;
}

export interface QuizSubmissionResult {
  totalQuestions: number;
  firstTryCorrect: number;
  questionsWithErrors: number;
  totalWrongSelections: number;
  scorePercent: number;
  corrections: QuestionCorrection[];
}

export class QuizEvaluator {
  constructor(private readonly questionFactory: QuestionFactory) {}

  evaluate(quiz: Quiz, answers: SubmittedAnswer[]): QuizSubmissionResult {
    if (answers.length === 0) {
      throw new BadRequestError('Debes responder al menos una pregunta antes de enviar.');
    }

    let firstTryCorrect = 0;
    let questionsWithErrors = 0;
    let totalWrongSelections = 0;
    const corrections: QuestionCorrection[] = [];
    const mergedAnswers = new Map<string, Set<OptionKey>>();

    for (const answer of answers) {
      const current = mergedAnswers.get(answer.questionId) ?? new Set<OptionKey>();
      answer.selectedKeys.forEach((key) => current.add(key));
      mergedAnswers.set(answer.questionId, current);
    }

    for (const [questionId, selectedKeySet] of mergedAnswers.entries()) {
      const question = quiz.findQuestion(questionId);
      if (!question) {
        throw new BadRequestError('Una de las preguntas enviadas no pertenece a este cuestionario.');
      }

      const selectedOptions = Array.from(selectedKeySet)
        .map((key) => question.findOption(key))
        .filter((option): option is NonNullable<typeof option> => Boolean(option));

      const wrongSelections = selectedOptions.filter((option) => !option.isCorrect);
      const correct = question.correctOption();
      const gotCorrect = selectedOptions.some((option) => option.isCorrect);

      if (gotCorrect && wrongSelections.length === 0) {
        firstTryCorrect += 1;
      }
      if (wrongSelections.length > 0) {
        questionsWithErrors += 1;
        totalWrongSelections += wrongSelections.length;
      }

      corrections.push({
        questionId: question.id,
        statement: question.statement,
        correctOption: { key: correct.key, text: correct.text },
        selectedOptions: selectedOptions.map((option) => ({
          key: option.key,
          text: option.text,
          isCorrect: option.isCorrect,
        })),
        explanation: this.questionFactory.resolveExplanation(
          question.statement,
          correct,
          question.explanation,
        ),
      });
    }

    return {
      totalQuestions: quiz.questionCount,
      firstTryCorrect,
      questionsWithErrors,
      totalWrongSelections,
      scorePercent:
        quiz.questionCount > 0
          ? Math.round((firstTryCorrect / quiz.questionCount) * 100)
          : 0,
      corrections,
    };
  }
}
