import type { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { SessionTokenService } from '../../../application/ports/session-token';
import { UnauthorizedError } from '../../../domain/errors/domain-error';

declare module 'fastify' {
  interface FastifyRequest {
    admin?: { id: string; email: string };
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export interface AuthPluginOptions {
  sessionTokens: SessionTokenService;
  cookieName: string;
}

export default fp<AuthPluginOptions>(async (fastify, opts) => {
  fastify.decorateRequest('admin', undefined);

  fastify.decorate('authenticate', async (request: FastifyRequest) => {
    const token = request.cookies[opts.cookieName];
    const payload = token ? opts.sessionTokens.verify(token) : null;
    if (!payload) throw new UnauthorizedError();
    request.admin = { id: payload.sub, email: payload.email };
  });
});
