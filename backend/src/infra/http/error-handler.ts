import type { FastifyError, FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import {
  DomainError,
  InsufficientStockError,
  InvalidCredentialsError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../domain/errors/domain-error';

// biome-ignore lint/suspicious/noExplicitAny: chave do Map é o construtor da classe de erro
const STATUS_BY_ERROR = new Map<any, number>([
  [NotFoundError, 404],
  [ValidationError, 400],
  [InsufficientStockError, 409],
  [UnauthorizedError, 401],
  [InvalidCredentialsError, 401],
]);

export function registerErrorHandler(fastify: FastifyInstance): void {
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos.',
          details: error.flatten(),
        },
      });
      return;
    }

    if (error instanceof DomainError) {
      const status = STATUS_BY_ERROR.get(error.constructor) ?? 400;
      const details = error instanceof ValidationError ? error.details : undefined;
      reply.code(status).send({ error: { code: error.code, message: error.message, details } });
      return;
    }

    const fastifyError = error as FastifyError;
    const status = fastifyError.statusCode ?? 500;
    if (status < 500) {
      reply.code(status).send({
        error: { code: fastifyError.code ?? 'BAD_REQUEST', message: fastifyError.message },
      });
      return;
    }

    request.log.error(error);
    reply.code(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno.' } });
  });

  fastify.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' } });
  });
}
