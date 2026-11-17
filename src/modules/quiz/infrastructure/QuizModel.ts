import mongoose, { Schema, Types } from 'mongoose';
import type { OptionKey, QuizStatus } from '../domain/quiz.entity';

export interface QuizOptionDocument {
  key: OptionKey;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionDocument {
  _id?: Types.ObjectId;
  statement: string;
  options: QuizOptionDocument[];
  explanation: string;
}

export interface QuizDocument {
  title: string;
  description: string;
  questions: QuizQuestionDocument[];
  status: QuizStatus;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const optionSchema = new Schema<QuizOptionDocument>(
  {
    key: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [400, 'Una opción no puede superar los 400 caracteres.'],
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false },
);

const questionSchema = new Schema<QuizQuestionDocument>(
  {
    statement: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'El enunciado debe tener al menos 2 caracteres.'],
      maxlength: [400, 'El enunciado no puede superar los 400 caracteres.'],
    },
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator: (options: QuizOptionDocument[]) =>
          options.length === 4 && options.filter((option) => option.isCorrect).length === 1,
        message: 'Cada pregunta debe tener 4 opciones y exactamente una correcta.',
      },
    },
    explanation: {
      type: String,
      trim: true,
      maxlength: [400, 'La explicación no puede superar los 400 caracteres.'],
      default: '',
    },
  },
  { versionKey: false },
);

const quizSchema = new Schema<QuizDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'El título debe tener al menos 2 caracteres.'],
      maxlength: [70, 'El título no puede superar los 70 caracteres.'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [10, 'La descripción debe tener al menos 10 caracteres.'],
      maxlength: [400, 'La descripción no puede superar los 400 caracteres.'],
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (questions: QuizQuestionDocument[]) => questions.length > 0,
        message: 'El cuestionario debe tener al menos una pregunta.',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

quizSchema.index({ status: 1, updatedAt: -1 });
quizSchema.index({ createdBy: 1, updatedAt: -1 });

export const QuizModel =
  (mongoose.models.Quiz as mongoose.Model<QuizDocument>) ??
  mongoose.model<QuizDocument>('Quiz', quizSchema);
