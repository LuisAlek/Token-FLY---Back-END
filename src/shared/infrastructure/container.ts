import { MongoUserRepository } from '../../modules/auth/infrastructure/MongoUserRepository';
import { MongoQuizRepository } from '../../modules/quiz/infrastructure/MongoQuizRepository';
import { MongoCommentRepository } from '../../modules/forum/infrastructure/MongoCommentRepository';
import { AuthGuard, RoleGuard } from '../../modules/auth/infrastructure/authMiddleware';
import { BcryptPasswordHasher } from './security/password';
import { JwtTokenService } from './security/jwt';
import { AuthController } from '../../modules/auth/controllers/AuthController';
import { RegisterUserUseCase } from '../../modules/auth/application/registerUser';
import { LoginUserUseCase } from '../../modules/auth/application/loginUser';
import { GetCurrentUserUseCase } from '../../modules/auth/application/getCurrentUser';
import { QuestionFactory } from '../../modules/quiz/domain/question.factory';
import { QuizEvaluator } from '../../modules/quiz/domain/quizEvaluator';
import { QuizFactory } from '../../modules/quiz/application/quizFactory';
import { QuizPresenter } from '../../modules/quiz/application/quiz.dto';
import { ListPublishedQuizzesUseCase } from '../../modules/quiz/application/listPublishedQuizzes';
import { GetPublishedQuizUseCase } from '../../modules/quiz/application/getPublishedQuiz';
import { CheckAnswerUseCase } from '../../modules/quiz/application/checkAnswer';
import { SubmitQuizUseCase } from '../../modules/quiz/application/submitQuiz';
import {
  CreateQuizUseCase,
  DeleteQuizUseCase,
  GetAdminQuizUseCase,
  ListAdminQuizzesUseCase,
  PublishQuizUseCase,
  UpdateQuizUseCase,
} from '../../modules/quiz/application/manageQuiz';
import { QuizController } from '../../modules/quiz/controllers/QuizController';
import { AdminQuizController } from '../../modules/quiz/controllers/AdminQuizController';
import { ContentPolicy } from '../../modules/forum/domain/contentPolicy';
import { CommentPresenter } from '../../modules/forum/application/comment.dto';
import {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  ListCommentsUseCase,
  UpdateCommentUseCase,
} from '../../modules/forum/application/manageComments';
import { ForumController } from '../../modules/forum/controllers/ForumController';

export class AppContainer {
  readonly authGuard: AuthGuard;
  readonly roleGuard: RoleGuard;
  readonly authController: AuthController;
  readonly quizController: QuizController;
  readonly adminQuizController: AdminQuizController;
  readonly forumController: ForumController;

  constructor() {
    const users = new MongoUserRepository();
    const quizzes = new MongoQuizRepository();
    const comments = new MongoCommentRepository();

    const hasher = new BcryptPasswordHasher();
    const tokens = new JwtTokenService();

    const questionFactory = new QuestionFactory();
    const quizFactory = new QuizFactory(questionFactory);
    const quizEvaluator = new QuizEvaluator(questionFactory);
    const quizPresenter = new QuizPresenter();

    const commentPresenter = new CommentPresenter();
    const contentPolicy = new ContentPolicy();

    this.authGuard = new AuthGuard(tokens, users);
    this.roleGuard = new RoleGuard();

    this.authController = new AuthController(
      new RegisterUserUseCase(users, hasher, tokens),
      new LoginUserUseCase(users, hasher, tokens),
      new GetCurrentUserUseCase(users),
    );

    this.quizController = new QuizController(
      new ListPublishedQuizzesUseCase(quizzes, quizPresenter),
      new GetPublishedQuizUseCase(quizzes, quizPresenter),
      new CheckAnswerUseCase(quizzes, questionFactory),
      new SubmitQuizUseCase(quizzes, quizEvaluator),
    );

    this.adminQuizController = new AdminQuizController(
      new ListAdminQuizzesUseCase(quizzes, quizPresenter),
      new GetAdminQuizUseCase(quizzes, quizPresenter),
      new CreateQuizUseCase(quizzes, quizPresenter, quizFactory),
      new UpdateQuizUseCase(quizzes, quizPresenter, quizFactory),
      new DeleteQuizUseCase(quizzes, quizPresenter),
      new PublishQuizUseCase(quizzes, quizPresenter),
    );

    this.forumController = new ForumController(
      new ListCommentsUseCase(comments, commentPresenter),
      new CreateCommentUseCase(comments, commentPresenter, contentPolicy),
      new UpdateCommentUseCase(comments, commentPresenter, contentPolicy),
      new DeleteCommentUseCase(comments, commentPresenter),
    );
  }
}

export const container = new AppContainer();
