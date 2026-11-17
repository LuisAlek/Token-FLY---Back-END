import type { HydratedDocument } from 'mongoose';
import {
  Quiz,
  type QuizQuestionProps,
  type QuizStatus,
  type QuizWriteInput,
} from '../domain/quiz.entity';
import type { QuizRepository } from '../domain/quiz.repository';
import { QuizModel, type QuizDocument } from './QuizModel';

function mapQuestion(question: QuizDocument['questions'][number]): QuizQuestionProps {
  return {
    id: question._id?.toString() ?? '',
    statement: question.statement,
    options: question.options.map((option) => ({
      key: option.key,
      text: option.text,
      isCorrect: option.isCorrect,
    })),
    explanation: question.explanation ?? '',
  };
}

function mapQuiz(doc: HydratedDocument<QuizDocument>): Quiz {
  return Quiz.create({
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    questions: doc.questions.map(mapQuestion),
    status: doc.status,
    createdBy: doc.createdBy.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

export class MongoQuizRepository implements QuizRepository {
  async listPublished(): Promise<Quiz[]> {
    const docs = await QuizModel.find({ status: 'published' }).sort({ updatedAt: -1 }).exec();
    return docs.map(mapQuiz);
  }

  async findPublishedById(id: string): Promise<Quiz | null> {
    const doc = await QuizModel.findOne({ _id: id, status: 'published' }).exec();
    return doc ? mapQuiz(doc) : null;
  }

  async findById(id: string): Promise<Quiz | null> {
    const doc = await QuizModel.findById(id).exec();
    return doc ? mapQuiz(doc) : null;
  }

  async listByCreator(creatorId: string): Promise<Quiz[]> {
    const docs = await QuizModel.find({ createdBy: creatorId }).sort({ updatedAt: -1 }).exec();
    return docs.map(mapQuiz);
  }

  async create(creatorId: string, input: QuizWriteInput): Promise<Quiz> {
    const doc = await QuizModel.create({
      title: input.title,
      description: input.description,
      status: input.status,
      questions: input.questions,
      createdBy: creatorId,
    });
    return mapQuiz(doc);
  }

  async update(id: string, input: QuizWriteInput): Promise<Quiz | null> {
    const doc = await QuizModel.findByIdAndUpdate(
      id,
      {
        $set: {
          title: input.title,
          description: input.description,
          status: input.status,
          questions: input.questions,
        },
      },
      { new: true, runValidators: true },
    ).exec();
    return doc ? mapQuiz(doc) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await QuizModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }

  async setStatus(id: string, status: QuizStatus): Promise<Quiz | null> {
    const doc = await QuizModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true },
    ).exec();
    return doc ? mapQuiz(doc) : null;
  }
}
