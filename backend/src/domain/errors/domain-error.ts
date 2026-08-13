export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Recurso não encontrado.') {
    super('NOT_FOUND', message);
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly details?: unknown,
  ) {
    super('VALIDATION_ERROR', message);
  }
}

/** Estoque insuficiente para um decremento — rejeitamos em vez de fazer clamp silencioso. */
export class InsufficientStockError extends DomainError {
  constructor(message = 'Quantidade em estoque não pode ficar negativa.') {
    super('INSUFFICIENT_STOCK', message);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Não autenticado.') {
    super('UNAUTHORIZED', message);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor(message = 'E-mail ou senha inválidos.') {
    super('INVALID_CREDENTIALS', message);
  }
}
