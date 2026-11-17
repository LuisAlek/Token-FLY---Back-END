import type { Quiz, QuizStatus, QuizWriteInput } from './quiz.entity';

export interface QuizRepository {
  listPublished(): Promise<Quiz[]>;
  findPublishedById(id: string): Promise<Quiz | null>;
  findById(id: string): Promise<Quiz | null>;
  listByCreator(creatorId: string): Promise<Quiz[]>;
  create(creatorId: string, input: QuizWriteInput): Promise<Quiz>;
  update(id: string, input: QuizWriteInput): Promise<Quiz | null>;
  remove(id: string): Promise<boolean>;
  setStatus(id: string, status: QuizStatus): Promise<Quiz | null>;
}
