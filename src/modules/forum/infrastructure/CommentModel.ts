import mongoose, { Schema, Types } from 'mongoose';
import { COMMENT_MAX_LENGTH } from '../domain/contentPolicy';

export interface CommentDocument {
  author: Types.ObjectId;
  authorUsername: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorUsername: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'El comentario no puede estar vacío.'],
      trim: true,
      minlength: [1, 'El comentario debe tener al menos 1 caracter.'],
      maxlength: [
        COMMENT_MAX_LENGTH,
        `El comentario no puede superar los ${COMMENT_MAX_LENGTH} caracteres.`,
      ],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

commentSchema.index({ createdAt: -1 });

export const CommentModel =
  (mongoose.models.Comment as mongoose.Model<CommentDocument>) ??
  mongoose.model<CommentDocument>('Comment', commentSchema);
