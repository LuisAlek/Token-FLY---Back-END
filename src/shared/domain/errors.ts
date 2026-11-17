export type FieldErrors = Record<string, string>;

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = 'APP_ERROR',
    public readonly errors?: FieldErrors,
  ) {
    super(message);
    this.name = new.target.name;
    Error.captureStackTrace(this, new.target);
  }
}

export class ValidationError extends AppError {
  constructor(errors: FieldErrors, message = 'Revisa los datos ingresados.') {
    super(422, message, 'VALIDATION_ERROR', errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Debes iniciar sesión para continuar.', errors?: FieldErrors) {
    super(401, message, 'UNAUTHORIZED', errors);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'No tienes permisos para realizar esta acción.') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'El recurso solicitado no existe.') {
    super(404, message, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errors?: FieldErrors) {
    super(409, message, 'CONFLICT', errors);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, errors?: FieldErrors) {
    super(400, message, 'BAD_REQUEST', errors);
  }
}
