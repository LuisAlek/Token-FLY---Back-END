import mongoose, { Schema, Types } from 'mongoose';
import type { OptionKey } from '../domain/quiz.entity';

export interface QuizProgressAnswerDocument {
  questionId: string;
  selectedKeys: OptionKey[];
}

export interface QuizProgressCorrectAnswerDocument {
  questionId: string;
  correctKey: OptionKey;
}

export interface QuizProgressDocument {
  user: Types.ObjectId;
  quiz: Types.ObjectId;
  currentIndex: number;
  answers: QuizProgressAnswerDocument[];
  correctAnswers: QuizProgressCorrectAnswerDocument[];
  completed: boolean;
  scorePercent: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<QuizProgressAnswerDocument>(
  {
    questionId: {
      type: String,
      required: true,
    },
    selectedKeys: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { _id: false },
);

const correctAnswerSchema = new Schema<QuizProgressCorrectAnswerDocument>(
  {
    questionId: {
      type: String,
      required: true,
    },
    correctKey: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const quizProgressSchema = new Schema<QuizProgressDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    currentIndex: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    correctAnswers: {
      type: [correctAnswerSchema],
      default: [],
    },
    completed: {
      type: Boolean,
      required: true,
      default: false,
    },
    scorePercent: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

quizProgressSchema.index({ user: 1, quiz: 1 }, { unique: true });

export const QuizProgressModel =
  (mongoose.models.QuizProgress as mongoose.Model<QuizProgressDocument>) ??
  mongoose.model<QuizProgressDocument>('QuizProgress', quizProgressSchema);
