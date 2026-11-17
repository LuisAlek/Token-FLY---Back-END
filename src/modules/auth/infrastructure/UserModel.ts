import mongoose, { Schema } from 'mongoose';
import { USER_ROLES, type UserRole } from '../../../shared/domain/roles';
import { EMAIL_REGEX } from '../domain/email.vo';

export interface UserDocument {
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  termsAcceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: [true, 'El nombre de usuario es obligatorio.'],
      trim: true,
      maxlength: [30, 'El nombre de usuario no puede superar los 30 caracteres.'],
    },
    email: {
      type: String,
      required: [true, 'El correo es obligatorio.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'El correo debe terminar en .co o .com.'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
      required: true,
    },
    termsAcceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDocument>) ??
  mongoose.model<UserDocument>('User', userSchema);
