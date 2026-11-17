import type { Comment } from './comment.entity';

export interface CreateCommentInput {
  authorId: string;
  authorUsername: string;
  content: string;
  isAnonymous: boolean;
}

export interface UpdateCommentInput {
  content: string;
  isAnonymous: boolean;
}

export interface CommentPage {
  items: Comment[];
  total: number;
  page: number;
  limit: number;
}

export interface CommentRepository {
  list(page: number, limit: number): Promise<CommentPage>;
  findById(id: string): Promise<Comment | null>;
  create(input: CreateCommentInput): Promise<Comment>;
  update(id: string, input: UpdateCommentInput): Promise<Comment | null>;
  remove(id: string): Promise<boolean>;
}
