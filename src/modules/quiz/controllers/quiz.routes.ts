import { Router } from 'express';
import { container } from '../../../shared/infrastructure/container';

const quizController = container.quizController;
const adminController = container.adminQuizController;

export const quizRouter = Router();
quizRouter.use(container.authGuard.handle);
quizRouter.get('/', quizController.list);
quizRouter.get('/:quizId', quizController.detail);
quizRouter.get('/:quizId/progress', quizController.progress);
quizRouter.put('/:quizId/progress', quizController.saveProgress);
quizRouter.post('/:quizId/check-answer', quizController.check);
quizRouter.post('/:quizId/submit', quizController.submit);

export const adminQuizRouter = Router();
adminQuizRouter.use(container.authGuard.handle, container.roleGuard.handle);
adminQuizRouter.get('/', adminController.list);
adminQuizRouter.get('/:quizId', adminController.detail);
adminQuizRouter.post('/', adminController.create);
adminQuizRouter.put('/:quizId', adminController.update);
adminQuizRouter.delete('/:quizId', adminController.remove);
adminQuizRouter.patch('/:quizId/publish', adminController.publish);
