import type { FastifyInstance } from 'fastify';
import { LoginUseCase } from '../../../application/use-cases/auth/login';
import { LoginBodySchema } from '../schemas/auth.schemas';
import type { ServerDependencies } from '../server';

export async function registerAuthRoutes(
  fastify: FastifyInstance,
  deps: ServerDependencies,
): Promise<void> {
  const login = new LoginUseCase(deps.adminRepository, deps.passwordHasher, deps.sessionTokens);

  // Em produção o front (Vercel) e a API (Railway/VPS) ficam em domínios diferentes de
  // verdade — não só portas diferentes de localhost — então o cookie precisa de
  // SameSite=None (que exige Secure) pra sobreviver a um fetch cross-site. Em dev,
  // Lax já basta e evita precisar de HTTPS local.
  const isProd = deps.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    secure: isProd,
    path: '/',
  };

  fastify.post(
    '/api/auth/login',
    { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const body = LoginBodySchema.parse(request.body);
      const { token, email } = await login.execute(body);
      reply.setCookie(deps.env.COOKIE_NAME, token, cookieOptions);
      return { email };
    },
  );

  fastify.post('/api/auth/logout', async (_request, reply) => {
    reply.clearCookie(deps.env.COOKIE_NAME, cookieOptions);
    return reply.code(204).send();
  });

  fastify.get('/api/auth/me', { preHandler: fastify.authenticate }, async (request) => ({
    email: request.admin?.email,
  }));
}
