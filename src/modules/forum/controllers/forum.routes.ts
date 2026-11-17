import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { container } from '../../../shared/infrastructure/container';

const controller = container.forumController;

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Estás publicando demasiado rápido. Espera un momento.',
    code: 'RATE_LIMITED',
  },
});

export const forumRouter = Router();

forumRouter.use(container.authGuard.handle);
forumRouter.get('/', controller.list);
forumRouter.post('/', writeLimiter, controller.create);
forumRouter.patch('/:commentId', writeLimiter, controller.update);
forumRouter.delete('/:commentId', controller.remove);
