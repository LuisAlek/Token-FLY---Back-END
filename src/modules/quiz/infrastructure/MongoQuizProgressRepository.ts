import type { HydratedDocument } from 'mongoose';
import { QuizProgress } from '../domain/quizProgress.entity';
import type {
  QuizProgressDraft,
  QuizProgressRepository,
} from '../domain/quizProgress.repository';
import { QuizProgressModel, type QuizProgressDocument } from './QuizProgressModel';

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 11000
  );
}

function mapProgress(doc: HydratedDocument<QuizProgressDocument>): QuizProgress {
  return QuizProgress.create({
    quizId: doc.quiz.toString(),
    currentIndex: doc.currentIndex,
    answers: doc.answers.map((answer) => ({
      questionId: answer.questionId,
      selectedKeys: [...answer.selectedKeys],
    })),
    correctByQuestion: Object.fromEntries(
      doc.correctAnswers.map((answer) => [answer.questionId, answer.correctKey]),
    ),
    completed: doc.completed,
    scorePercent: doc.scorePercent,
    completedAt: doc.completedAt,
    updatedAt: doc.updatedAt,
  });
}

export class MongoQuizProgressRepository implements QuizProgressRepository {
  async findByUserAndQuiz(userId: string, quizId: string): Promise<QuizProgress | null> {
    const doc = await QuizProgressModel.findOne({ user: userId, quiz: quizId }).exec();
    return doc ? mapProgress(doc) : null;
  }

  async listByUser(userId: string): Promise<QuizProgress[]> {
    const docs = await QuizProgressModel.find({ user: userId }).exec();
    return docs.map(mapProgress);
  }

  async saveDraft(
    userId: string,
    quizId: string,
    draft: QuizProgressDraft,
  ): Promise<QuizProgress> {
    const filter = { user: userId, quiz: quizId };
    const update = {
      $set: {
        currentIndex: draft.currentIndex,
        answers: draft.answers,
        correctAnswers: Object.entries(draft.correctByQuestion).map(
          ([questionId, correctKey]) => ({ questionId, correctKey }),
        ),
      },
      $setOnInsert: {
        completed: false,
        scorePercent: 0,
        completedAt: null,
      },
    };

    let doc: HydratedDocument<QuizProgressDocument> | null;
    try {
      doc = await QuizProgressModel.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }).exec();
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      doc = await QuizProgressModel.findOneAndUpdate(filter, update, {
        new: true,
        runValidators: true,
      }).exec();
    }

    if (!doc) {
      throw new Error('No se pudo guardar el progreso del cuestionario.');
    }
    return mapProgress(doc);
  }

  async markCompleted(
    userId: string,
    quizId: string,
    scorePercent: number,
  ): Promise<QuizProgress> {
    const filter = { user: userId, quiz: quizId };
    const update = {
      $set: {
        completed: true,
        completedAt: new Date(),
        currentIndex: 0,
        answers: [],
        correctAnswers: [],
      },
      $max: {
        scorePercent,
      },
    };

    let doc: HydratedDocument<QuizProgressDocument> | null;
    try {
      doc = await QuizProgressModel.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }).exec();
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      doc = await QuizProgressModel.findOneAndUpdate(filter, update, {
        new: true,
        runValidators: true,
      }).exec();
    }

    if (!doc) {
      throw new Error('No se pudo registrar el cuestionario completado.');
    }
    return mapProgress(doc);
  }
}
