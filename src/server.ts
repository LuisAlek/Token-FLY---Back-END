import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { corsOrigins, env } from './config/env';
import { connectMongo, disconnectMongo } from './shared/infrastructure/db/mongo';
import { errorMiddleware } from './shared/infrastructure/http/errorMiddleware';
import { notFoundHandler } from './shared/infrastructure/http/notFound';
import { authRouter } from './modules/auth/controllers/auth.routes';
import { adminQuizRouter, quizRouter } from './modules/quiz/controllers/quiz.routes';
import { forumRouter } from './modules/forum/controllers/forum.routes';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    data: {
      status: 'ok',
      service: 'tokenfly-backend',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/auth', authRouter);
app.use('/api/quizzes', quizRouter);
app.use('/api/admin/quizzes', adminQuizRouter);
app.use('/api/forum/comments', forumRouter);

app.use(notFoundHandler);
app.use(errorMiddleware);

async function bootstrap(): Promise<void> {
  await connectMongo();
  const server = app.listen(env.PORT, () => {
    console.log(`[TokenFLY] API escuchando en http://localhost:${env.PORT}/api`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[TokenFLY] Cerrando servidor por ${signal}...`);
    server.close(async () => {
      await disconnectMongo().catch(() => undefined);
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error('[TokenFLY] No fue posible iniciar la API:', error);
  process.exit(1);
});
