import type { FastifyInstance } from 'fastify';
import { LoginUseCase } from '../../../application/use-cases/auth/login';
import { LoginBodySchema } from '../schemas/auth.schemas';
import type { ServerDependencies } from '../server';

export async function registerAuthRoutes(
  fastify: FastifyInstance,
  deps: ServerDependencies,
): Promise<void> {
  const login = new LoginUseCase(deps.adminRepository, deps.passwordHasher, deps.sessionTokens);

  fastify.post(
    '/api/auth/login',
    { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const body = LoginBodySchema.parse(request.body);
      const { token, email } = await login.execute(body);
      reply.setCookie(deps.env.COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: deps.env.NODE_ENV === 'production',
        path: '/',
      });
      return { email };
    },
  );

  fastify.post('/api/auth/logout', async (_request, reply) => {
    reply.clearCookie(deps.env.COOKIE_NAME, { path: '/' });
    return reply.code(204).send();
  });

  fastify.get('/api/auth/me', { preHandler: fastify.authenticate }, async (request) => ({
    email: request.admin?.email,
  }));
}
