import { ForbiddenError, NotFoundError } from '../../../shared/domain/errors';
import { UseCase } from '../../../shared/application/UseCase';
import type { PublicUser } from '../../auth/domain/user.entity';
import type { Quiz } from '../domain/quiz.entity';
import type { QuizRepository } from '../domain/quiz.repository';
import { QuizFactory, type QuizPayload } from './quizFactory';
import type { AdminQuizDetailDto, PublicQuizSummaryDto, QuizPresenter } from './quiz.dto';

export interface GetAdminQuizInput {
  quizId: string;
  actor: PublicUser;
}

export interface CreateQuizInput {
  payload: QuizPayload;
  actor: PublicUser;
}

export interface UpdateQuizInput {
  quizId: string;
  payload: QuizPayload;
  actor: PublicUser;
}

export interface DeleteQuizInput {
  quizId: string;
  actor: PublicUser;
}

export interface PublishQuizInput {
  quizId: string;
  actor: PublicUser;
}

export abstract class AdminQuizUseCase<TInput, TOutput> extends UseCase<TInput, TOutput> {
  protected constructor(
    protected readonly quizzes: QuizRepository,
    protected readonly presenter: QuizPresenter,
  ) {
    super();
  }

  protected async findOwned(quizId: string, actor: PublicUser): Promise<Quiz> {
    const quiz = await this.quizzes.findById(quizId);
    if (!quiz) {
      throw new NotFoundError('El cuestionario no existe.');
    }
    if (quiz.createdBy !== actor.id) {
      throw new ForbiddenError(
        'Solo el administrador creador puede modificar este cuestionario.',
      );
    }
    return quiz;
  }
}

export class ListAdminQuizzesUseCase extends UseCase<PublicUser, PublicQuizSummaryDto[]> {
  constructor(
    private readonly quizzes: QuizRepository,
    private readonly presenter: QuizPresenter,
  ) {
    super();
  }

  async execute(actor: PublicUser): Promise<PublicQuizSummaryDto[]> {
    const owned = await this.quizzes.listByCreator(actor.id);
    return owned.map((quiz) => this.presenter.toPublicSummary(quiz));
  }
}

export class GetAdminQuizUseCase extends AdminQuizUseCase<
  GetAdminQuizInput,
  AdminQuizDetailDto
> {
  constructor(quizzes: QuizRepository, presenter: QuizPresenter) {
    super(quizzes, presenter);
  }

  async execute(input: GetAdminQuizInput): Promise<AdminQuizDetailDto> {
    const quiz = await this.findOwned(input.quizId, input.actor);
    return this.presenter.toAdminDetail(quiz);
  }
}

export class CreateQuizUseCase extends AdminQuizUseCase<CreateQuizInput, AdminQuizDetailDto> {
  constructor(
    quizzes: QuizRepository,
    presenter: QuizPresenter,
    private readonly factory: QuizFactory,
  ) {
    super(quizzes, presenter);
  }

  async execute(input: CreateQuizInput): Promise<AdminQuizDetailDto> {
    const writeInput = this.factory.createWriteInput(input.payload);
    const quiz = await this.quizzes.create(input.actor.id, writeInput);
    return this.presenter.toAdminDetail(quiz);
  }
}

export class UpdateQuizUseCase extends AdminQuizUseCase<UpdateQuizInput, AdminQuizDetailDto> {
  constructor(
    quizzes: QuizRepository,
    presenter: QuizPresenter,
    private readonly factory: QuizFactory,
  ) {
    super(quizzes, presenter);
  }

  async execute(input: UpdateQuizInput): Promise<AdminQuizDetailDto> {
    await this.findOwned(input.quizId, input.actor);
    const writeInput = this.factory.createWriteInput(input.payload);
    const updated = await this.quizzes.update(input.quizId, writeInput);
    if (!updated) {
      throw new NotFoundError('El cuestionario no existe.');
    }
    return this.presenter.toAdminDetail(updated);
  }
}

export class DeleteQuizUseCase extends AdminQuizUseCase<DeleteQuizInput, void> {
  constructor(quizzes: QuizRepository, presenter: QuizPresenter) {
    super(quizzes, presenter);
  }

  async execute(input: DeleteQuizInput): Promise<void> {
    await this.findOwned(input.quizId, input.actor);
    await this.quizzes.remove(input.quizId);
  }
}

export class PublishQuizUseCase extends AdminQuizUseCase<
  PublishQuizInput,
  AdminQuizDetailDto
> {
  constructor(quizzes: QuizRepository, presenter: QuizPresenter) {
    super(quizzes, presenter);
  }

  async execute(input: PublishQuizInput): Promise<AdminQuizDetailDto> {
    await this.findOwned(input.quizId, input.actor);
    const updated = await this.quizzes.setStatus(input.quizId, 'published');
    if (!updated) {
      throw new NotFoundError('El cuestionario no existe.');
    }
    return this.presenter.toAdminDetail(updated);
  }
}
