import path from 'node:path';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyInstance } from 'fastify';
import type { AdminRepository } from '../../application/ports/admin-repository';
import type { ImageStorage } from '../../application/ports/image-storage';
import type { PasswordHasher } from '../../application/ports/password-hasher';
import type { ProductRepository } from '../../application/ports/product-repository';
import type { SessionTokenService } from '../../application/ports/session-token';
import type { SettingsRepository } from '../../application/ports/settings-repository';
import type { Env } from '../config/env';
import { registerErrorHandler } from './error-handler';
import authPlugin from './plugins/auth.plugin';
import { registerAdminProductRoutes } from './routes/admin-products.routes';
import { registerAdminSettingsRoutes } from './routes/admin-settings.routes';
import { registerAdminUploadRoutes } from './routes/admin-uploads.routes';
import { registerAuthRoutes } from './routes/auth.routes';
import { registerPublicRoutes } from './routes/public.routes';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface ServerDependencies {
  env: Env;
  productRepository: ProductRepository;
  settingsRepository: SettingsRepository;
  adminRepository: AdminRepository;
  passwordHasher: PasswordHasher;
  sessionTokens: SessionTokenService;
  imageStorage: ImageStorage;
}

export async function buildServer(deps: ServerDependencies): Promise<FastifyInstance> {
  const fastify = Fastify({ logger: deps.env.NODE_ENV !== 'test', trustProxy: true });

  await fastify.register(cors, {
    origin: deps.env.corsOrigins.length > 0 ? deps.env.corsOrigins : false,
    credentials: true,
  });
  await fastify.register(cookie);
  await fastify.register(multipart, { limits: { fileSize: MAX_UPLOAD_BYTES } });
  await fastify.register(rateLimit, { global: false });
  await fastify.register(authPlugin, {
    sessionTokens: deps.sessionTokens,
    cookieName: deps.env.COOKIE_NAME,
  });
  await fastify.register(fastifyStatic, {
    root: path.resolve(deps.env.UPLOAD_DIR),
    prefix: '/uploads/',
  });

  registerErrorHandler(fastify);

  await fastify.register(async (instance) => {
    await registerPublicRoutes(instance, deps);
  });

  await fastify.register(async (instance) => {
    await registerAuthRoutes(instance, deps);
  });

  await fastify.register(async (instance) => {
    instance.addHook('preHandler', instance.authenticate);
    await registerAdminProductRoutes(instance, deps);
    await registerAdminUploadRoutes(instance, deps);
    await registerAdminSettingsRoutes(instance, deps);
  });

  return fastify;
}
