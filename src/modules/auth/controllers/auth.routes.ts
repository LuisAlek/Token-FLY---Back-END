import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { container } from '../../../shared/infrastructure/container';

const controller = container.authController;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    message: 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.',
    code: 'RATE_LIMITED',
  },
});

export const authRouter = Router();

authRouter.post('/register', authLimiter, controller.register);
authRouter.post('/login', authLimiter, controller.login);
authRouter.get('/me', container.authGuard.handle, controller.me);
