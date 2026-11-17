import type { Request, Response } from 'express';
import { UnauthorizedError } from '../../../shared/domain/errors';
import { asyncHandler } from '../../../shared/infrastructure/http/asyncHandler';
import { parseWith } from '../../../shared/infrastructure/http/validate';
import type { GetCurrentUserUseCase } from '../application/getCurrentUser';
import type { LoginUserUseCase } from '../application/loginUser';
import type { RegisterUserUseCase } from '../application/registerUser';
import { loginSchema, registerSchema } from './auth.schemas';

export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly loginUser: LoginUserUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
  ) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const input = parseWith(registerSchema, req.body);
    const result = await this.registerUser.execute(input);
    res.status(201).json({ data: result });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const input = parseWith(loginSchema, req.body);
    const result = await this.loginUser.execute(input);
    res.status(200).json({ data: result });
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError('Debes iniciar sesión para continuar.');
    }
    const user = await this.getCurrentUser.execute(req.user.id);
    res.status(200).json({ data: { user } });
  });
}
