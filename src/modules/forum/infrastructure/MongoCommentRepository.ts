import type { HydratedDocument } from 'mongoose';
import { Comment, type CommentProps } from '../domain/comment.entity';
import type {
  CommentPage,
  CommentRepository,
  CreateCommentInput,
  UpdateCommentInput,
} from '../domain/comment.repository';
import { CommentModel, type CommentDocument } from './CommentModel';

function mapComment(doc: HydratedDocument<CommentDocument>): Comment {
  const props: CommentProps = {
    id: doc._id.toString(),
    authorId: doc.author.toString(),
    authorUsername: doc.authorUsername,
    content: doc.content,
    isAnonymous: doc.isAnonymous,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
  return Comment.create(props);
}

export class MongoCommentRepository implements CommentRepository {
  async list(page: number, limit: number): Promise<CommentPage> {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      CommentModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      CommentModel.countDocuments().exec(),
    ]);

    return {
      items: docs.map(mapComment),
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<Comment | null> {
    const doc = await CommentModel.findById(id).exec();
    return doc ? mapComment(doc) : null;
  }

  async create(input: CreateCommentInput): Promise<Comment> {
    const doc = await CommentModel.create({
      author: input.authorId,
      authorUsername: input.authorUsername,
      content: input.content,
      isAnonymous: input.isAnonymous,
    });
    return mapComment(doc);
  }

  async update(id: string, input: UpdateCommentInput): Promise<Comment | null> {
    const doc = await CommentModel.findByIdAndUpdate(
      id,
      { $set: { content: input.content, isAnonymous: input.isAnonymous } },
      { new: true, runValidators: true },
    ).exec();
    return doc ? mapComment(doc) : null;
  }

  async remove(id: string): Promise<boolean> {
    const result = await CommentModel.findByIdAndDelete(id).exec();
    return Boolean(result);
  }
}
